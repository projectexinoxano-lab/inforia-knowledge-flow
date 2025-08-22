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

    console.log('🔄 Guardando informe en Google Drive del usuario...');

    // Intentar guardar en Google Drive usando token del usuario
    let googleDriveFileId = null;
    let googleDriveLink = null;
    let driveError = null;

    try {
      // Obtener token de Google del usuario
      const { data: { session } } = await supabaseClient.auth.getSession();
      const googleToken = session?.provider_token;

      if (googleToken) {
        // Crear carpeta INFORIA si no existe
        const folderResponse = await fetch(
          `https://www.googleapis.com/drive/v3/files?q=name='INFORIA Reports' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
          {
            headers: {
              'Authorization': `Bearer ${googleToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        let folderId = null;
        if (folderResponse.ok) {
          const folderData = await folderResponse.json();
          if (folderData.files && folderData.files.length > 0) {
            folderId = folderData.files[0].id;
          } else {
            // Crear carpeta
            const createFolderResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${googleToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                name: 'INFORIA Reports',
                mimeType: 'application/vnd.google-apps.folder'
              })
            });

            if (createFolderResponse.ok) {
              const folderResult = await createFolderResponse.json();
              folderId = folderResult.id;
              console.log('✅ Carpeta INFORIA creada:', folderId);
            }
          }
        }

        // Crear documento en Google Drive
        const metadata = {
          name: `${reportTitle}.gdoc`,
          parents: folderId ? [folderId] : [],
          mimeType: 'application/vnd.google-apps.document'
        };

        const createDocResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${googleToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(metadata)
        });

        if (createDocResponse.ok) {
          const docResult = await createDocResponse.json();
          googleDriveFileId = docResult.id;
          googleDriveLink = `https://docs.google.com/document/d/${docResult.id}/edit`;

          // Añadir contenido al documento
          const requests = [
            {
              insertText: {
                location: { index: 1 },
                text: `${reportTitle}\n\n${reportContent}`
              }
            },
            {
              updateTextStyle: {
                range: {
                  startIndex: 1,
                  endIndex: reportTitle.length + 1
                },
                textStyle: {
                  bold: true,
                  fontSize: { magnitude: 16, unit: 'PT' }
                },
                fields: 'bold,fontSize'
              }
            }
          ];

          const updateDocResponse = await fetch(
            `https://docs.googleapis.com/v1/documents/${docResult.id}:batchUpdate`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${googleToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ requests })
            }
          );

          if (updateDocResponse.ok) {
            console.log('✅ Informe guardado en Google Drive:', googleDriveFileId);
          } else {
            console.warn('⚠️ Documento creado pero error al formatear contenido');
          }
        } else {
          throw new Error('Error creando documento en Google Drive');
        }
      } else {
        console.warn('⚠️ No hay token de Google disponible - guardando solo metadata');
      }
    } catch (error) {
      console.error('❌ Error guardando en Google Drive:', error);
      driveError = error instanceof Error ? error.message : 'Error desconocido';
    }

    // Guardar metadata en base de datos (SOLO metadata, no contenido completo para zero-knowledge)
    const { data: reportData, error: insertError } = await supabaseClient
      .from('reports')
      .insert({
        user_id: user.id,
        patient_id: patient_id,
        title: reportTitle,
        content: googleDriveFileId ? null : reportContent, // Solo guardar contenido si no se pudo guardar en Drive
        google_drive_file_id: googleDriveFileId,
        report_type: report_type,
        input_type: input_type,
        status: googleDriveFileId ? 'completed' : 'completed_local'
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
        report: {
          ...reportData,
          google_drive_link: googleDriveLink
        },
        drive_status: googleDriveFileId ? 'saved_to_drive' : 'saved_locally',
        drive_error: driveError,
        message: googleDriveFileId 
          ? 'Informe generado y guardado en tu Google Drive' 
          : 'Informe generado (guardado localmente - considera re-autenticar para Google Drive)'
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