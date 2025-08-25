import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create Supabase client with service role key for server-side operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication token');
    }

    console.log('Report generation request from user:', user.id);

    const { patientId, reportType, inputType, audioTranscription, textNotes } = await req.json();

    // Verificar límites de créditos
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits_used, credits_limit, subscription_status')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      throw new Error('Error checking user credits');
    }

    if (!profile || profile.subscription_status !== 'active' || profile.credits_used >= profile.credits_limit) {
      return new Response(
        JSON.stringify({ 
          error: 'Credit limit exceeded or inactive subscription',
          credits_used: profile?.credits_used || 0,
          credits_limit: profile?.credits_limit || 0
        }), 
        { 
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Obtener datos del paciente
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('name, birth_date, notes')
      .eq('id', patientId)
      .eq('user_id', user.id)
      .single();

    if (patientError || !patient) {
      console.error('Error fetching patient:', patientError);
      throw new Error('Patient not found or access denied');
    }

    // Preparar el contenido de entrada
    const inputContent = inputType === 'audio' ? audioTranscription : textNotes;
    if (!inputContent) {
      throw new Error('No input content provided');
    }

    // Determinar el tipo de informe y el prompt apropiado
    let systemPrompt = '';
    let reportTitle = '';

    if (reportType === 'primera_visita') {
      systemPrompt = `Eres un psicólogo clínico experto. Genera un informe de primera visita profesional basado en la información proporcionada.
      
ESTRUCTURA REQUERIDA:
1. DATOS DEL PACIENTE
2. MOTIVO DE CONSULTA
3. HISTORIA CLÍNICA Y ANTECEDENTES
4. EXPLORACIÓN PSICOLÓGICA
5. IMPRESIÓN DIAGNÓSTICA PRELIMINAR
6. PLAN DE TRATAMIENTO PROPUESTO
7. RECOMENDACIONES INICIALES

El informe debe ser profesional, preciso y seguir estándares clínicos. Usa terminología psicológica apropiada y mantén la confidencialidad.`;
      
      reportTitle = `Informe Primera Visita - ${patient.name}`;
      
    } else if (reportType === 'seguimiento') {
      systemPrompt = `Eres un psicólogo clínico experto. Genera un informe de seguimiento profesional basado en la sesión terapéutica.

ESTRUCTURA REQUERIDA:
1. DATOS DE LA SESIÓN
2. ESTADO ACTUAL DEL PACIENTE
3. OBJETIVOS TRABAJADOS EN LA SESIÓN
4. TÉCNICAS E INTERVENCIONES APLICADAS
5. RESPUESTA DEL PACIENTE
6. PROGRESO OBSERVADO
7. PLAN PARA PRÓXIMAS SESIONES

El informe debe documentar claramente el proceso terapéutico y la evolución del paciente.`;
      
      reportTitle = `Informe Seguimiento - ${patient.name}`;
    }

    const userPrompt = `
INFORMACIÓN DEL PACIENTE:
- Nombre: ${patient.name}
- Fecha de nacimiento: ${patient.birth_date || 'No especificada'}
- Notas previas: ${patient.notes || 'Ninguna'}

CONTENIDO DE LA SESIÓN:
${inputContent}

TIPO DE INFORME: ${reportType}

Por favor, genera un informe profesional completo siguiendo la estructura indicada.`;

    console.log('Generating report with OpenAI...');

    // Llamar a OpenAI para generar el informe
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
    const generatedContent = openAIData.choices[0].message.content;

    console.log('Report generated successfully');

    // Crear el registro del informe en la base de datos
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .insert({
        user_id: user.id,
        patient_id: patientId,
        title: reportTitle,
        content: generatedContent,
        report_type: reportType,
        input_type: inputType,
        audio_transcription: inputType === 'audio' ? audioTranscription : null,
        status: 'completed'
      })
      .select()
      .single();

    if (reportError) {
      console.error('Error saving report:', reportError);
      throw new Error('Error saving report to database');
    }

    // Actualizar contador de créditos
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        credits_used: profile.credits_used + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating credits:', updateError);
      // No lanzar error aquí para no bloquear la respuesta exitosa
    }

    console.log('Report creation completed for user:', user.id);

    return new Response(
      JSON.stringify({
        success: true,
        report: {
          id: report.id,
          title: report.title,
          content: report.content,
          created_at: report.created_at,
          status: report.status
        },
        credits_used: profile.credits_used + 1,
        credits_remaining: profile.credits_limit - (profile.credits_used + 1)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in generate-report function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Internal server error' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});