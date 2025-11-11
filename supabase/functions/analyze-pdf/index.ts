import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileName, filePath } = await req.json();
    
    if (!fileName || !filePath) {
      throw new Error('Missing fileName or filePath');
    }

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Get user from auth header
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('Processing PDF for user:', user.id);
    console.log('File path:', filePath);

    // Download PDF from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('pdfs')
      .download(filePath);

    if (downloadError) {
      console.error('Download error:', downloadError);
      throw new Error('Failed to download PDF');
    }

    // Convert blob to base64 using a more efficient method for large files
    const arrayBuffer = await fileData.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binaryString = '';
    const chunkSize = 1024;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      binaryString += String.fromCharCode.apply(null, Array.from(chunk));
    }
    const base64 = btoa(binaryString);

    console.log('PDF converted to base64, size:', base64.length);

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Call Lovable AI Gateway (Google Gemini 2.5 Pro for multimodal analysis)
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro', // Using Pro for better multimodal capabilities
        messages: [
          {
            role: 'system',
            content: `You are an expert study assistant. Analyze the provided PDF and break down its content for effective studying. 

            Return your analysis in the following JSON format:
            {
              "summary": "A comprehensive summary of the document content",
              "keyPoints": ["Key point 1", "Key point 2", ...],
              "concepts": ["Concept 1", "Concept 2", ...],
              "studyGuide": ["Step 1: Focus on...", "Step 2: Review...", ...],
              "questions": ["Question 1", "Question 2", ...]
            }

            Make sure to:
            - Identify the main themes and concepts
            - Create actionable study steps
            - Generate meaningful questions for self-assessment
            - Keep everything concise but comprehensive
            - Focus on educational value`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Please analyze this PDF document and provide a study breakdown. The file name is: ${fileName}`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${base64}`
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.3,
      }),
    });

    // Handle rate limiting and payment errors
    if (aiResponse.status === 429) {
      console.error('Rate limit exceeded');
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded. Please try again in a moment.' 
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (aiResponse.status === 402) {
      console.error('Payment required - out of credits');
      return new Response(JSON.stringify({ 
        error: 'AI service credits exhausted. Please contact administrator.' 
      }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', errorText);
      throw new Error('Failed to analyze PDF content');
    }

    const aiData = await aiResponse.json();
    const analysisContent = aiData.choices[0].message.content;

    console.log('Lovable AI analysis received:', analysisContent.length, 'characters');

    // Parse the JSON response from AI
    let breakdown;
    try {
      breakdown = JSON.parse(analysisContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback breakdown if JSON parsing fails
      breakdown = {
        summary: analysisContent,
        keyPoints: ['Content analysis completed'],
        concepts: ['Document concepts'],
        studyGuide: ['Review the document content', 'Take notes on key points'],
        questions: ['What are the main ideas?', 'How can this be applied?']
      };
    }

    // Save analysis to database
    const { data: savedAnalysis, error: saveError } = await supabase
      .from('pdf_analyses')
      .insert({
        user_id: user.id,
        file_name: fileName,
        file_path: filePath,
        breakdown_content: JSON.stringify(breakdown),
        analysis_type: 'study_guide'
      })
      .select()
      .single();

    if (saveError) {
      console.error('Save error:', saveError);
      throw new Error('Failed to save analysis');
    }

    console.log('Analysis saved successfully:', savedAnalysis.id);

    // Create document record for RAG search
    const { data: document, error: docError } = await supabase
      .from('user_documents')
      .insert({
        user_id: user.id,
        file_name: fileName,
        file_path: filePath,
        file_type: 'application/pdf',
        file_size: 0,
        status: 'completed'
      })
      .select()
      .single();

    if (docError) {
      console.error('Error creating document record:', docError);
    } else {
      console.log('Document record created:', document.id);

      // Generate embeddings for the document content
      const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
      if (openaiApiKey && document) {
        try {
          // Combine all breakdown content for chunking
          const fullContent = `
Summary: ${breakdown.summary}

Key Points:
${breakdown.keyPoints?.join('\n') || ''}

Concepts:
${breakdown.concepts?.join('\n') || ''}

Study Guide:
${breakdown.studyGuide?.join('\n') || ''}

Questions:
${breakdown.questions?.join('\n') || ''}`;

          // Split into chunks (roughly 500 tokens each)
          const chunkSize = 500;
          const words = fullContent.split(/\s+/);
          const chunks: string[] = [];
          
          for (let i = 0; i < words.length; i += chunkSize) {
            const chunk = words.slice(i, i + chunkSize).join(' ');
            if (chunk.trim()) {
              chunks.push(chunk);
            }
          }

          console.log(`Created ${chunks.length} chunks for embedding`);

          // Generate embeddings for each chunk
          for (let i = 0; i < chunks.length; i++) {
            const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'text-embedding-3-small',
                input: chunks[i],
                dimensions: 1536
              }),
            });

            if (embeddingResponse.ok) {
              const embeddingData = await embeddingResponse.json();
              const embedding = embeddingData.data[0].embedding;

              // Store chunk with embedding
              await supabase
                .from('document_chunks')
                .insert({
                  document_id: document.id,
                  chunk_index: i,
                  content: chunks[i],
                  embedding: embedding,
                  metadata: { source: 'pdf_analysis', file_name: fileName }
                });

              console.log(`Stored chunk ${i + 1}/${chunks.length} with embedding`);
            } else {
              console.error(`Failed to generate embedding for chunk ${i}`);
            }
          }
        } catch (embError) {
          console.error('Error generating embeddings:', embError);
          // Continue without embeddings - analysis still saved
        }
      }
    }

    return new Response(JSON.stringify({
      id: savedAnalysis.id,
      fileName: fileName,
      breakdown: breakdown,
      createdAt: savedAnalysis.created_at,
      model: 'google/gemini-2.5-pro',
      chunksCreated: document ? 'yes' : 'no'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-pdf function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
