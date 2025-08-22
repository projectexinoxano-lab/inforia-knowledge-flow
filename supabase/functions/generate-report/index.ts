import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const { patientId, sessionNotes, reportType = 'seguimiento', reportId } = await req.json();
    
    if (!patientId || !sessionNotes) {
      return new Response(
        JSON.stringify({ error: 'Patient ID and session notes are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      console.error('OpenRouter API key not found');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get patient information
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();

    if (patientError || !patient) {
      console.error('Patient not found:', patientError);
      return new Response(
        JSON.stringify({ error: 'Patient not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate patient age from birth_date
    let patientAge = 'No especificada';
    if (patient.birth_date) {
      const birthDate = new Date(patient.birth_date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        patientAge = (age - 1).toString();
      } else {
        patientAge = age.toString();
      }
    }

    // Get patient's previous reports for context
    const { data: previousReports } = await supabase
      .from('reports')
      .select('content, created_at')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(3);

    // Prepare context for AI
    let contextPrompt = '';
    if (previousReports && previousReports.length > 0) {
      contextPrompt = `\n\nHistorial previo del paciente (últimos informes):\n${previousReports.map(r => 
        `- ${new Date(r.created_at).toLocaleDateString('es-ES')}: ${r.content?.substring(0, 200)}...`
      ).join('\n')}`;
    }

    const systemPrompt = `Eres un asistente especializado en generar informes clínicos para psicólogos profesionales.

INFORMACIÓN DEL PACIENTE:
- Nombre: ${patient.name}
- Edad: ${patientAge} años
- Email: ${patient.email || 'No proporcionado'}
- Teléfono: ${patient.phone || 'No proporcionado'}
- Notas del profesional: ${patient.notes || 'Sin notas adicionales'}
${contextPrompt}

INSTRUCCIONES:
1. Genera un informe clínico profesional y estructurado
2. Tipo de informe: ${reportType === 'primera_visita' ? 'Primera Visita' : 'Seguimiento'}
3. Incluye las siguientes secciones:
   - Resumen de la sesión
   - Observaciones clínicas
   - Evolución del paciente (si es seguimiento)
   - Plan de tratamiento/Recomendaciones
   - Próximos pasos

4. Mantén un tono profesional y empático
5. Basa el contenido en las notas de sesión proporcionadas
6. El informe debe tener entre 300-500 palabras
7. Usa terminología clínica apropiada pero accesible`;

    const userPrompt = `Notas de la sesión:
${sessionNotes}

Por favor genera el informe clínico basado en estas notas.`;

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://inforia.app',
        'X-Title': 'iNFORiA Clinical Assistant'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1500,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to generate report' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    const generatedReport = aiResponse.choices[0]?.message?.content;

    if (!generatedReport) {
      console.error('No content in AI response:', aiResponse);
      return new Response(
        JSON.stringify({ error: 'Failed to generate report content' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update the existing report with generated content
    const { data: savedReport, error: saveError } = await supabase
      .from('reports')
      .update({
        content: generatedReport,
        status: 'completed'
      })
      .eq('id', reportId)
      .select()
      .single();

    if (saveError) {
      console.error('Error saving report:', saveError);
      return new Response(
        JSON.stringify({ error: 'Failed to save report' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Report generated successfully for patient:', patientId);

    return new Response(
      JSON.stringify({ 
        report: savedReport,
        content: generatedReport 
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-report function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});