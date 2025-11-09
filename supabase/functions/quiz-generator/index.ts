import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[QUIZ-GENERATOR] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    const { subject, topic, examType = 'general', difficulty = 'medium', count = 5 } = await req.json();
    logStep("Request data parsed", { subject, topic, examType, difficulty, count });

    // Try to get questions from database first
    const { data: existingQuestions } = await supabaseClient
      .from('quiz_questions')
      .select('*')
      .eq('subject', subject)
      .eq('topic', topic)
      .eq('exam_type', examType)
      .eq('difficulty_level', difficulty)
      .limit(count);

    if (existingQuestions && existingQuestions.length >= count) {
      logStep("Using existing questions from database", { count: existingQuestions.length });
      
      // Shuffle and return existing questions
      const shuffledQuestions = existingQuestions
        .sort(() => Math.random() - 0.5)
        .slice(0, count);

      return new Response(JSON.stringify({
        questions: shuffledQuestions,
        source: 'database'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // If not enough questions in database, generate new ones using OpenAI
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      throw new Error('OPENAI_API_KEY is not set - cannot generate new questions');
    }

    const examContext = examType === 'jamb' ? 'JAMB (Joint Admissions and Matriculation Board)' :
                       examType === 'waec' ? 'WAEC (West African Examinations Council)' :
                       examType === 'neco' ? 'NECO (National Examinations Council)' : 'General';

    const prompt = `Generate ${count} multiple choice questions for Nigerian students preparing for ${examContext} exams.

Subject: ${subject}
Topic: ${topic}
Difficulty: ${difficulty}
Exam Type: ${examType}

Requirements:
- Questions should be appropriate for Nigerian curriculum
- Include 4 options (A, B, C, D) for each question
- Provide detailed explanations for correct answers
- Format as JSON array with this structure:
[
  {
    "question_text": "Question here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": 0,
    "explanation": "Detailed explanation here"
  }
]

Make questions challenging but fair, and ensure explanations help students understand the concept.`;

    logStep("Calling OpenAI to generate questions");

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert in Nigerian education and exam preparation. Generate high-quality multiple choice questions.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    logStep("Got AI response, parsing questions");

    // Parse the JSON response
    let generatedQuestions;
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        generatedQuestions = JSON.parse(jsonMatch[0]);
      } else {
        generatedQuestions = JSON.parse(aiResponse);
      }
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
      logStep("Failed to parse AI response as JSON", { error: errorMessage });
      throw new Error('Failed to parse generated questions');
    }

    // Save new questions to database
    const questionsToSave = generatedQuestions.map((q: any) => ({
      subject,
      topic,
      difficulty_level: difficulty,
      exam_type: examType,
      question_text: q.question_text,
      options: q.options,
      correct_answer: q.correct_answer,
      explanation: q.explanation
    }));

    const { error: saveError } = await supabaseClient
      .from('quiz_questions')
      .insert(questionsToSave);

    if (saveError) {
      logStep("Failed to save questions to database", { error: saveError.message });
      // Continue anyway - return the generated questions
    } else {
      logStep("Saved new questions to database", { count: questionsToSave.length });
    }

    return new Response(JSON.stringify({
      questions: questionsToSave,
      source: 'generated',
      tokensUsed: data.usage?.total_tokens || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in quiz-generator", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});