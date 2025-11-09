import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AI-TUTOR-CHAT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Create Supabase client with service role key for database operations
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not set');
    }
    logStep("Lovable AI key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { message, tutorId, subject, conversationContext, useDocuments = false } = await req.json();
    logStep("Request data parsed", { tutorId, subject, messageLength: message?.length, useDocuments });

    // Get conversation history for context
    const { data: conversationHistory } = await supabaseClient
      .from('conversation_history')
      .select('*')
      .eq('user_id', user.id)
      .eq('session_id', `${user.id}-${tutorId}`)
      .order('created_at', { ascending: true })
      .limit(10);

    logStep("Retrieved conversation history", { historyCount: conversationHistory?.length });

    // RAG: Search user's documents if enabled
    let documentContext = '';
    let sources: any[] = [];
    
    if (useDocuments) {
      try {
        logStep("Generating embedding for document search");
        const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
        
        if (openaiApiKey) {
          // Generate embedding for the question
          const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'text-embedding-3-small',
              input: message,
              dimensions: 1536
            }),
          });

          if (embeddingResponse.ok) {
            const embeddingData = await embeddingResponse.json();
            const queryEmbedding = embeddingData.data[0].embedding;
            logStep("Generated query embedding");

            // Search document chunks using vector similarity
            const { data: chunks, error: searchError } = await supabaseClient.rpc('search_document_chunks', {
              p_user_id: user.id,
              p_query_embedding: queryEmbedding,
              p_limit: 5
            });

            if (!searchError && chunks && chunks.length > 0) {
              logStep("Found relevant document chunks", { count: chunks.length });
              
              // Get document names
              const docIds = [...new Set(chunks.map((c: any) => c.document_id))];
              const { data: docs } = await supabaseClient
                .from('user_documents')
                .select('id, file_name')
                .in('id', docIds);

              const docMap = new Map(docs?.map(d => [d.id, d.file_name]) || []);

              // Build context from chunks
              documentContext = '\n\n--- CONTEXT FROM YOUR DOCUMENTS ---\n';
              chunks.forEach((chunk: any, idx: number) => {
                const docName = docMap.get(chunk.document_id) || 'Unknown Document';
                const similarity = Math.round(chunk.similarity * 100);
                documentContext += `\n[Source ${idx + 1}: ${docName} - ${similarity}% relevant]\n${chunk.content}\n`;
                
                sources.push({
                  documentName: docName,
                  similarity: similarity,
                  chunkIndex: chunk.chunk_index,
                  content: chunk.content.substring(0, 200) + '...'
                });
              });
              documentContext += '\n--- END OF DOCUMENT CONTEXT ---\n';
            } else {
              logStep("No relevant documents found");
              documentContext = '\n\n--- NO RELEVANT DOCUMENTS FOUND ---\nNo information found in uploaded documents. Use your general knowledge to answer.\n';
            }
          }
        }
      } catch (error) {
        logStep("Document search error", { error: error instanceof Error ? error.message : String(error) });
        // Continue without document context
      }
    }

    // Build context for AI
    const contextMessages = [];
    
    // System prompt based on tutor personality and subject with RAG instructions
    let systemPrompt = `You are ${tutorId}, an AI tutor specializing in ${subject} for Nigerian students. 
You help with WAEC, JAMB, and NECO exam preparation. 
${conversationContext?.personality || 'You are helpful, encouraging, and culturally aware.'}

Focus on:
- Nigerian curriculum and exam standards
- Step-by-step explanations
- Encouraging learning mindset
- Cultural context when relevant
- Practical examples from Nigerian context

Keep responses concise but thorough. Always encourage the student and relate to their academic goals.`;

    if (useDocuments && documentContext) {
      systemPrompt += `\n\nIMPORTANT: The student has uploaded documents. Answer using ONLY information from the provided document context. If the context doesn't contain enough information to answer the question, clearly state this and suggest what additional information would be helpful. Always cite which source you're using (e.g., "According to Source 1..." or "Based on your Biology textbook...").`;
    }

    contextMessages.push({ role: 'system', content: systemPrompt });

    // Add conversation history
    if (conversationHistory) {
      conversationHistory.forEach(msg => {
        contextMessages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      });
    }

    // Add current user message with document context if available
    const userMessageContent = documentContext 
      ? `${documentContext}\n\nQUESTION: ${message}`
      : message;
    
    contextMessages.push({ role: 'user', content: userMessageContent });

    logStep("Built context for Lovable AI", { 
      messageCount: contextMessages.length,
      hasDocumentContext: !!documentContext,
      sourcesCount: sources.length
    });

    // Call Lovable AI Gateway (Google Gemini 2.5 Flash)
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: contextMessages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    // Handle rate limiting and payment errors
    if (response.status === 429) {
      logStep("Rate limit exceeded");
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded. Please try again in a moment.' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 429,
      });
    }

    if (response.status === 402) {
      logStep("Payment required - out of credits");
      return new Response(JSON.stringify({ 
        error: 'AI service credits exhausted. Please contact administrator.' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 402,
      });
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Lovable AI error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    logStep("Got AI response", { responseLength: aiResponse?.length });

    // Save conversation to database
    const sessionId = `${user.id}-${tutorId}`;
    await supabaseClient.from('conversation_history').insert([
      {
        user_id: user.id,
        session_id: sessionId,
        role: 'user',
        content: message,
        tokens_used: 0
      },
      {
        user_id: user.id,
        session_id: sessionId,
        role: 'assistant',
        content: aiResponse,
        tokens_used: data.usage?.total_tokens || 0,
        model: 'google/gemini-2.5-flash'
      }
    ]);

    logStep("Saved conversation to database");

    return new Response(JSON.stringify({
      response: aiResponse,
      conversationId: `${user.id}-${tutorId}-${subject}`,
      tokensUsed: data.usage?.total_tokens || 0,
      model: 'google/gemini-2.5-flash',
      sources: sources.length > 0 ? sources : undefined,
      usedDocuments: useDocuments && sources.length > 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in ai-tutor-chat", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
