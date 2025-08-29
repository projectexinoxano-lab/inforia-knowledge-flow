// Ruta: src/services/openrouter.ts
interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

interface WhisperResponse {
  text: string;
  segments?: Array<{
    text: string;
    start: number;
    end: number;
  }>;
}

export type ReportType = 'nuevo_paciente' | 'seguimiento' | 'alta_paciente';
export type AIModel = 'openai/gpt-4o-mini' | 'meta-llama/llama-3.1-8b-instruct' | 'anthropic/claude-3-sonnet' | 'google/gemini-pro';

export class OpenRouterService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!this.apiKey) {
      throw new Error('OPENROUTER_API_KEY no configurada en variables de entorno');
    }
  }

  // Transcripción con Whisper via OpenRouter
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append('file', audioBlob, 'session_audio.wav');
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'verbose_json');
    formData.append('language', 'es');
    formData.append('prompt', 'Esta es una sesión terapéutica en español. Incluye términos psicológicos y médicos.');

    const response = await fetch(`${this.baseUrl}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'INFORIA Clinical Assistant'
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Whisper transcription error: ${response.status} ${response.statusText} - ${errorData}`);
    }

    const data: WhisperResponse = await response.json();
    return data.text;
  }

  // Compilador de información para diferentes tipos de informes
  async compileReportInfo(data: {
    reportType: ReportType;
    patientData: {
      name: string;
      age?: number;
      previousReports?: string[];
      firstVisitDate?: string;
    };
    sessionData: {
      audioTranscription?: string;
      clinicalNotes: string;
      sessionDate: string;
    };
  }): Promise<string> {
    
    const compilationPrompts = {
      nuevo_paciente: `
TIPO: PRIMER INFORME - PACIENTE NUEVO
Paciente: ${data.patientData.name}
Edad: ${data.patientData.age || 'No especificada'}
Fecha de consulta: ${data.sessionData.sessionDate}

TRANSCRIPCIÓN DE AUDIO:
${data.sessionData.audioTranscription || 'No disponible'}

NOTAS CLÍNICAS:
${data.sessionData.clinicalNotes}

INSTRUCCIONES:
Genera un primer informe completo que incluya:
1. Anamnesis inicial completa
2. Motivo de consulta principal
3. Historia clínica relevante
4. Exploración psicopatológica
5. Impresión diagnóstica inicial
6. Plan de tratamiento propuesto
7. Objetivos terapéuticos

Formato: Informe clínico profesional en markdown
`,

      seguimiento: `
TIPO: INFORME DE SEGUIMIENTO
Paciente: ${data.patientData.name}
Fecha actual: ${data.sessionData.sessionDate}
Primera visita: ${data.patientData.firstVisitDate || 'No registrada'}

TRANSCRIPCIÓN SESIÓN ACTUAL:
${data.sessionData.audioTranscription || 'No disponible'}

NOTAS SESIÓN ACTUAL:
${data.sessionData.clinicalNotes}

INFORMES PREVIOS:
${data.patientData.previousReports?.join('\n---\n') || 'No disponibles'}

INSTRUCCIONES:
Genera un informe de seguimiento que incluya:
1. Evolución desde la última sesión
2. Progreso en objetivos terapéuticos
3. Nuevas observaciones clínicas
4. Cambios en el estado mental
5. Adherencia al tratamiento
6. Ajustes al plan terapéutico
7. Próximos pasos y recomendaciones

Compara con informes previos y destaca cambios significativos.
Formato: Informe evolutivo en markdown
`,

      alta_paciente: `
TIPO: DOSSIER DE ALTA - INFORME FINAL
Paciente: ${data.patientData.name}
Inicio tratamiento: ${data.patientData.firstVisitDate || 'No registrado'}
Fecha de alta: ${data.sessionData.sessionDate}

TRANSCRIPCIÓN SESIÓN FINAL:
${data.sessionData.audioTranscription || 'No disponible'}

NOTAS FINALES:
${data.sessionData.clinicalNotes}

HISTORIAL COMPLETO:
${data.patientData.previousReports?.join('\n---\n') || 'No disponible'}

INSTRUCCIONES:
Genera un dossier completo de alta que incluya:
1. RESUMEN EJECUTIVO del caso completo
2. EVOLUCIÓN CRONOLÓGICA del tratamiento
3. OBJETIVOS ALCANZADOS y pendientes
4. DIAGNÓSTICO FINAL y pronóstico
5. HERRAMIENTAS Y TÉCNICAS utilizadas
6. RECOMENDACIONES POST-ALTA
7. PLAN DE SEGUIMIENTO (si aplica)
8. RECURSOS Y DERIVACIONES sugeridas

Este debe ser un informe integral y definitivo.
Formato: Dossier profesional completo en markdown
`
    };

    return compilationPrompts[data.reportType];
  }

  // Generar informe con IA seleccionada
  async generateReport(
    compiledInfo: string,
    selectedModel: AIModel = 'openai/gpt-4o-mini'
  ): Promise<string> {

    const systemPrompts = {
      'openai/gpt-4o-mini': 'Eres un psicólogo clínico experto con 20+ años de experiencia. Generas informes profesionales, precisos y empáticos.',
      'meta-llama/llama-3.1-8b-instruct': 'Eres un especialista en salud mental. Redactas informes clínicos estructurados siguiendo estándares profesionales.',
      'anthropic/claude-3-sonnet': 'Eres un profesional de la psicología clínica. Tu enfoque es riguroso, empático y centrado en el bienestar del paciente.',
      'google/gemini-pro': 'Eres un psicólogo clínico con expertise en documentación profesional. Generas informes completos y clínicamente relevantes.'
    };

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'INFORIA Clinical Assistant'
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          {
            role: 'system',
            content: systemPrompts[selectedModel]
          },
          {
            role: 'user',
            content: compiledInfo
          }
        ],
        max_tokens: 3000,
        temperature: 0.7,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Report generation error: ${response.status} ${response.statusText} - ${errorData}`);
    }

    const data: OpenRouterResponse = await response.json();
    return data.choices[0]?.message?.content || 'Error al generar el informe';
  }

  // Función principal para proceso completo
  async processFullReport(data: {
    reportType: ReportType;
    patientData: any;
    sessionData: any;
    selectedModel: AIModel;
  }): Promise<string> {
    
    // 1. Compilar información
    const compiledInfo = await this.compileReportInfo(data);
    
    // 2. Generar informe con IA seleccionada
    const finalReport = await this.generateReport(compiledInfo, data.selectedModel);
    
    return finalReport;
  }
}

// Instancia singleton para uso global
export const openRouterService = new OpenRouterService();