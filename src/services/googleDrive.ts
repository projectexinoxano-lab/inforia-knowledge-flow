import { supabase } from '@/integrations/supabase/client';

export interface GoogleDriveFile {
  id: string;
  name: string;
  webViewLink: string;
  webContentLink: string;
  createdTime: string;
}

export interface DriveCreateResponse {
  fileId: string;
  webViewLink: string;
  success: boolean;
  message?: string;
}

export class GoogleDriveService {
  private static readonly FOLDER_NAME = 'INFORIA Reports';
  private static readonly SCOPES = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.folder'
  ];

  /**
   * Obtiene el token de acceso actual del usuario autenticado
   */
  private async getAccessToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.provider_token) {
      console.error('No hay token de Google disponible. El usuario debe re-autenticarse con permisos de Drive.');
      return null;
    }

    return session.provider_token;
  }

  /**
   * Verifica si el usuario tiene permisos de Google Drive
   */
  async hasPermissions(): Promise<boolean> {
    const token = await this.getAccessToken();
    if (!token) return false;

    try {
      const response = await fetch('https://www.googleapis.com/drive/v3/about?fields=user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Error verificando permisos de Drive:', error);
      return false;
    }
  }

  /**
   * Encuentra o crea la carpeta INFORIA Reports
   */
  private async getOrCreateInforiaFolder(): Promise<string | null> {
    const token = await this.getAccessToken();
    if (!token) return null;

    try {
      // Buscar carpeta existente
      const searchResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${GoogleDriveService.FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!searchResponse.ok) {
        throw new Error('Error buscando carpeta INFORIA');
      }

      const searchData = await searchResponse.json();
      
      // Si existe, devolverla
      if (searchData.files && searchData.files.length > 0) {
        return searchData.files[0].id;
      }

      // Si no existe, crearla
      const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: GoogleDriveService.FOLDER_NAME,
          mimeType: 'application/vnd.google-apps.folder'
        })
      });

      if (!createResponse.ok) {
        throw new Error('Error creando carpeta INFORIA');
      }

      const createData = await createResponse.json();
      console.log('✅ Carpeta INFORIA creada:', createData.id);
      
      return createData.id;
    } catch (error) {
      console.error('Error gestionando carpeta INFORIA:', error);
      return null;
    }
  }

  /**
   * Crea un Google Document con el contenido del informe
   */
  async createReport(
    title: string, 
    content: string, 
    patientName: string
  ): Promise<DriveCreateResponse> {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        return {
          fileId: '',
          webViewLink: '',
          success: false,
          message: 'No tienes permisos de Google Drive. Re-autentica tu cuenta.'
        };
      }

      const folderId = await this.getOrCreateInforiaFolder();
      if (!folderId) {
        return {
          fileId: '',
          webViewLink: '',
          success: false,
          message: 'Error accediendo a la carpeta de informes'
        };
      }

      // Crear metadatos del documento
      const metadata = {
        name: `${title}.gdoc`,
        parents: [folderId],
        mimeType: 'application/vnd.google-apps.document'
      };

      // Crear documento vacío primero
      const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metadata)
      });

      if (!createResponse.ok) {
        throw new Error('Error creando documento en Drive');
      }

      const fileData = await createResponse.json();

      // Ahora insertar el contenido usando Google Docs API
      const requests = [
        {
          insertText: {
            location: { index: 1 },
            text: `${title}\n\n${content}`
          }
        },
        // Formatear el título
        {
          updateTextStyle: {
            range: {
              startIndex: 1,
              endIndex: title.length + 1
            },
            textStyle: {
              bold: true,
              fontSize: { magnitude: 16, unit: 'PT' }
            },
            fields: 'bold,fontSize'
          }
        }
      ];

      const updateResponse = await fetch(
        `https://docs.googleapis.com/v1/documents/${fileData.id}:batchUpdate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ requests })
        }
      );

      if (!updateResponse.ok) {
        console.warn('Documento creado pero error al formatear contenido');
      }

      console.log('✅ Informe guardado en Google Drive:', fileData.id);

      return {
        fileId: fileData.id,
        webViewLink: `https://docs.google.com/document/d/${fileData.id}/edit`,
        success: true,
        message: 'Informe guardado exitosamente en Google Drive'
      };

    } catch (error) {
      console.error('Error creando documento en Drive:', error);
      return {
        fileId: '',
        webViewLink: '',
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Lista todos los informes de INFORIA
   */
  async listReports(): Promise<GoogleDriveFile[]> {
    try {
      const token = await this.getAccessToken();
      if (!token) return [];

      const folderId = await this.getOrCreateInforiaFolder();
      if (!folderId) return [];

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and mimeType='application/vnd.google-apps.document' and trashed=false&fields=files(id,name,webViewLink,webContentLink,createdTime)&orderBy=createdTime desc`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Error listando informes');
      }

      const data = await response.json();
      return data.files || [];
    } catch (error) {
      console.error('Error listando informes:', error);
      return [];
    }
  }

  /**
   * Verifica si un archivo específico existe
   */
  async checkFileExists(fileId: string): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      if (!token) return false;

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,trashed`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) return false;

      const data = await response.json();
      return !data.trashed;
    } catch (error) {
      console.error('Error verificando archivo:', error);
      return false;
    }
  }

  /**
   * Solicita permisos adicionales de Google Drive
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: GoogleDriveService.SCOPES.join(' '),
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        console.error('Error solicitando permisos:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error en requestPermissions:', error);
      return false;
    }
  }
}

// Singleton instance
export const googleDriveService = new GoogleDriveService();