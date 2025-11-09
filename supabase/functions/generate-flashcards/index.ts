import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FlashcardRequest {
  source: 'document' | 'topic' | 'csv';
  documentId?: string;
  topic?: string;
  subject?: string;
  count?: number;
  csvData?: Array<{ question: string; answer: string; subject: string; topic: string }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { source, documentId, topic, subject, count = 10, csvData }: FlashcardRequest = await req.json();

    // Handle CSV import
    if (source === 'csv' && csvData) {
      const cards = csvData.map(row => ({
        user_id: user.id,
        question: row.question,
        answer: row.answer,
        subject: row.subject,
        topic: row.topic,
        difficulty: 0,
        ease_factor: 2.5,
        interval_days: 0,
        repetitions: 0,
        next_review_date: new Date().toISOString()
      }));

      const { error: insertError } = await supabase
        .from('spaced_repetition_cards')
        .insert(cards);

      if (insertError) throw insertError;

      return new Response(
        JSON.stringify({ 
          success: true, 
          count: cards.length,
          message: 'Flashcards imported from CSV'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate flashcards from document or topic using AI
    let context = '';
    let sourceDocId: string | null = null;

    if (source === 'document' && documentId) {
      // Fetch document chunks
      const { data: chunks, error: chunksError } = await supabase
        .from('document_chunks')
        .select('content')
        .eq('document_id', documentId)
        .limit(10);

      if (chunksError) throw chunksError;
      
      context = chunks?.map(c => c.content).join('\n\n') || '';
      sourceDocId = documentId;
    } else if (source === 'topic' && topic && subject) {
      context = `Generate flashcards for the topic "${topic}" in ${subject}`;
    } else {
      throw new Error('Invalid source parameters');
    }

    // Call OpenAI to generate flashcards
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert educational content creator. Generate ${count} high-quality flashcards that test understanding and recall. Each flashcard should have a clear question and a concise answer. Format your response as a JSON array of objects with "question" and "answer" fields.`
          },
          {
            role: 'user',
            content: `Create ${count} flashcards from this content:\n\n${context}`
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate flashcards');
    }

    const aiResult = await openaiResponse.json();
    const content = aiResult.choices[0].message.content;
    const parsed = JSON.parse(content);
    const flashcards = parsed.flashcards || parsed.cards || [];

    // Insert flashcards into database
    const cards = flashcards.map((card: any) => ({
      user_id: user.id,
      question: card.question,
      answer: card.answer,
      subject: subject || 'General',
      topic: topic || 'General',
      difficulty: 0,
      ease_factor: 2.5,
      interval_days: 0,
      repetitions: 0,
      next_review_date: new Date().toISOString(),
      source_document_id: sourceDocId,
      mastery_level: 0,
      total_reviews: 0
    }));

    const { error: insertError } = await supabase
      .from('spaced_repetition_cards')
      .insert(cards);

    if (insertError) throw insertError;

    console.log(`Generated ${cards.length} flashcards for user ${user.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: cards.length,
        flashcards: flashcards,
        message: `Generated ${cards.length} flashcards successfully`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating flashcards:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});