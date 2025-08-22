import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportRequest {
  patient_id: string;
  patient_name: string;
  session_notes: string;
  report_type: 'primera_visita' | 'seguimiento';
  input_type: 'voice' | 'text' | 'mixed';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🚀 Edge Function iniciada - generate-report');
    
    // Verificar autenticación
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ No authorization header');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Crear cliente Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verificar usuario autenticado
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('❌ Error de autenticación:', authError);
      return new Response(
        JSON.stringify({ error: 'Usuario no autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Usuario autenticado:', user.email);

    // Parsear body request
    const requestData: ReportRequest = await req.json();
    console.log('📥 Datos recibidos:', {
      patient_id: requestData.patient_id,
      patient_name: requestData.patient_name,
      report_type: requestData.report_type,
      input_type: requestData.input_type,
      notes_length: requestData.session_notes?.length || 0
    });

    // Validar datos requeridos
    const { patient_id, patient_name, session_notes, report_type, input_type } = requestData;
    if (!patient_id || !patient_name || !session_notes || !report_type) {
      console.error('❌ Datos faltantes en request');
      return new Response(
        JSON.stringify({ error: 'Faltan datos requeridos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar API key de OpenRouter
    const openRouterKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterKey) {
      console.error('❌ OPENROUTER_API_KEY no configurada');
      return new Response(
        JSON.stringify({ error: 'Configuración de IA no disponible' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🤖 Generando informe con IA...');

    // Construir prompt para IA
    const prompt = `Genera un informe psicológico profesional basado en:

**INFORMACIÓN DEL PACIENTE:**
- Nombre: ${patient_name}

**NOTAS DE LA SESIÓN:**
${session_notes}

**TIPO DE INFORME:** ${report_type === 'primera_visita' ? 'Primera Visita' : 'Sesión de Seguimiento'}

Estructura el informe con las siguientes secciones:
1. **DATOS DE IDENTIFICACIÓN**
2. **MOTIVO DE CONSULTA**
3. **OBSERVACIONES CLÍNICAS**
4. **EVALUACIÓN PSICOLÓGICA**
5. **IMPRESIÓN DIAGNÓSTICA** (si aplica)
6. **PLAN DE TRATAMIENTO/RECOMENDACIONES**
7. **PRÓXIMOS PASOS**

Utiliza un lenguaje profesional, empático y clínicamente apropiado. El informe debe ser completo pero conciso.`;

    // Llamada a OpenRouter
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://inforia.app',
        'X-Title': 'INFORIA Clinical Assistant'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [
          {
            role: 'system',
            content: 'Eres un asistente especializado en redacción de informes psicológicos clínicos en español. Generas informes profesionales, estructurados y empáticos siguiendo las mejores prácticas clínicas.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      console.error('❌ Error OpenRouter:', openRouterResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Error al generar informe con IA' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResult = await openRouterResponse.json();
    const reportContent = aiResult.choices?.[0]?.message?.content;

    if (!reportContent) {
      console.error('❌ No se recibió contenido de IA');
      return new Response(
        JSON.stringify({ error: 'Error: no se generó contenido' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Informe generado por IA. Longitud:', reportContent.length);

    // Crear título del informe
    const reportTitle = `Informe ${report_type === 'primera_visita' ? 'Primera Visita' : 'Seguimiento'} - ${patient_name} - ${new Date().toLocaleDateString('es-ES')}`;

    // Guardar informe en base de datos
    const { data: reportData, error: insertError } = await supabaseClient
      .from('reports')
      .insert({
        user_id: user.id,
        patient_id: patient_id,
        title: reportTitle,
        content: reportContent,
        report_type: report_type,
        input_type: input_type,
        status: 'completed'
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error al guardar informe:', insertError);
      return new Response(
        JSON.stringify({ error: 'Error al guardar informe en base de datos' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Informe guardado en BD:', reportData.id);

    // Respuesta exitosa
    return new Response(
      JSON.stringify({
        success: true,
        report: reportData,
        message: 'Informe generado exitosamente'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('💥 Error general en Edge Function:', error);
    return new Response(
      JSON.stringify({
        error: 'Error interno del servidor',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});