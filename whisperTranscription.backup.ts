// Ruta: src/services/whisperTranscription.ts
// CREAR ARCHIVO CON ESTE CONTENIDO COMPLETO
import { supabase } from '@/integrations/supabase/client';

export interface WhisperTranscriptionResult {
  success: boolean;
  text?: string;
  duration?: number;
  segments?: Array<{
    text: string;
    start: number;
    end: number;
  }>;
  error?: string;
}

export class WhisperTranscriptionService {
  static readonly MAX_FILE_SIZE = 25 * 1024 * 1024;
  static readonly MAX_DURATION_MINUTES = 60;
  static readonly SUPPORTED_FORMATS = [
    'audio/mp3',
    'audio/mpeg', 
    'audio/wav',
    'audio/webm',
    'audio/m4a',
    'audio/ogg',
    'audio/flac'
  ];

  static validateAudioFile(file: File | Blob): { valid: boolean; error?: string } {
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `Archivo excede 25MB (actual: ${(file.size / 1024 / 1024).toFixed(2)}MB)`
      };
    }

    if (file instanceof File) {
      const isSupported = this.SUPPORTED_FORMATS.some(format => 
        file.type.includes(format.split('/')[1])
      );
      
      if (!isSupported) {
        return {
          valid: false,
          error: `Formato no soportado. Usa: MP3, WAV, WEBM, M4A, OGG, FLAC`
        };
      }
    }

    return { valid: true };
  }

  static async estimateAudioDuration(file: File | Blob): Promise<number> {
    return new Promise((resolve) => {
      const audio = new Audio();
      const url = URL.createObjectURL(file);
      
      audio.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(url);
        resolve(audio.duration);
      });
      
      audio.addEventListener('error', () => {
        URL.revokeObjectURL(url);
        resolve(0);
      });
      
      audio.src = url;
    });
  }

  static async transcribeAudio(
    audioFile: File | Blob,
    options?: {
      language?: 'es' | 'en';
      prompt?: string;
      onProgress?: (status: string) => void;
    }
  ): Promise<WhisperTranscriptionResult> {
    try {
      const validation = this.validateAudioFile(audioFile);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      if (options?.onProgress) {
        options.onProgress('Verificando duración del audio...');
      }
      
      const duration = await this.estimateAudioDuration(audioFile);
      if (duration > this.MAX_DURATION_MINUTES * 60) {
        return {
          success: false,
          error: `Audio excede 60 minutos (duración: ${Math.ceil(duration / 60)} minutos)`
        };
      }

      const formData = new FormData();
      if (audioFile instanceof Blob && !(audioFile instanceof File)) {
        formData.append('audio', new File([audioFile], 'recording.webm', { type: audioFile.type }));
      } else {
        formData.append('audio', audioFile);
      }
      
      formData.append('language', options?.language || 'es');
      if (options?.prompt) {
        formData.append('prompt', options.prompt);
      }

      if (options?.onProgress) {
        options.onProgress('Transcribiendo audio con Whisper...');
      }

      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: formData,
      });

      if (error) {
        console.error('Error en transcripción:', error);
        return { success: false, error: error.message };
      }

      if (!data?.success) {
        return { 
          success: false, 
          error: data?.error || 'Error desconocido en transcripción' 
        };
      }

      return {
        success: true,
        text: data.transcription,
        duration: data.duration,
        segments: data.segments
      };

    } catch (error) {
      console.error('Error transcribiendo audio:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}

export const whisperService = new WhisperTranscriptionService();