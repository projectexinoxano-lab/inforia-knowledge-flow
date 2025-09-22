import { supabase } from '@/integrations/supabase/client';
export class GoogleSheetsPatientCRMService {
    async getAccessToken() {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error || !session?.provider_token) {
                console.error('No hay token de Google disponible:', error);
                return null;
            }
            return session.provider_token;
        }
        catch (error) {
            console.error('Error obteniendo token:', error);
            return null;
        }
    }
    async getOrCreateCRMSheet() {
        try {
            const token = await this.getAccessToken();
            if (!token)
                return null;
            const searchResponse = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${GoogleSheetsPatientCRMService.CRM_SHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!searchResponse.ok) {
                throw new Error('Error buscando CRM Sheet');
            }
            const searchData = await searchResponse.json();
            if (searchData.files && searchData.files.length > 0) {
                return searchData.files[0].id;
            }
            const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    properties: {
                        title: GoogleSheetsPatientCRMService.CRM_SHEET_NAME
                    },
                    sheets: [
                        {
                            properties: {
                                title: 'Pacientes'
                            }
                        },
                        {
                            properties: {
                                title: 'Pagos'
                            }
                        },
                        {
                            properties: {
                                title: 'Informes'
                            }
                        }
                    ]
                })
            });
            if (!createResponse.ok) {
                throw new Error('Error creando CRM Sheet');
            }
            const sheetData = await createResponse.json();
            const sheetId = sheetData.spreadsheetId;
            await this.setupPatientsSheet(sheetId);
            await this.setupPaymentsSheet(sheetId);
            await this.setupReportsSheet(sheetId);
            console.log('✅ CRM Sheet creado:', sheetId);
            return sheetId;
        }
        catch (error) {
            console.error('Error gestionando CRM Sheet:', error);
            return null;
        }
    }
    async setupPatientsSheet(sheetId) {
        const token = await this.getAccessToken();
        if (!token)
            return;
        const headers = [
            'ID', 'Nombre Completo', 'Email', 'Teléfono', 'Fecha Nacimiento',
            'Fecha Alta', 'Total Informes', 'Último Informe', 'Estado Pago',
            'Total Pagado €', 'Próximo Pago', 'Estado Paciente', 'Notas', 'Carpeta Drive'
        ];
        try {
            await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Pacientes!A1:N1?valueInputOption=RAW`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    values: [headers]
                })
            });
            await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}:batchUpdate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    requests: [
                        {
                            repeatCell: {
                                range: {
                                    sheetId: 0,
                                    startRowIndex: 0,
                                    endRowIndex: 1,
                                    startColumnIndex: 0,
                                    endColumnIndex: 14
                                },
                                cell: {
                                    userEnteredFormat: {
                                        backgroundColor: {
                                            red: 0.18,
                                            green: 0.25,
                                            blue: 0.23
                                        },
                                        textFormat: {
                                            foregroundColor: {
                                                red: 1.0,
                                                green: 1.0,
                                                blue: 1.0
                                            },
                                            bold: true
                                        }
                                    }
                                },
                                fields: 'userEnteredFormat'
                            }
                        }
                    ]
                })
            });
        }
        catch (error) {
            console.error('Error configurando hoja Pacientes:', error);
        }
    }
    async setupPaymentsSheet(sheetId) {
        const token = await this.getAccessToken();
        if (!token)
            return;
        const headers = [
            'Fecha', 'ID Paciente', 'Nombre Paciente', 'Concepto',
            'Cantidad €', 'Método Pago', 'Estado', 'Notas'
        ];
        try {
            await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Pagos!A1:H1?valueInputOption=RAW`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    values: [headers]
                })
            });
            await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}:batchUpdate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    requests: [
                        {
                            repeatCell: {
                                range: {
                                    sheetId: 1,
                                    startRowIndex: 0,
                                    endRowIndex: 1,
                                    startColumnIndex: 0,
                                    endColumnIndex: 8
                                },
                                cell: {
                                    userEnteredFormat: {
                                        backgroundColor: {
                                            red: 0.5,
                                            green: 0.0,
                                            blue: 0.125
                                        },
                                        textFormat: {
                                            foregroundColor: {
                                                red: 1.0,
                                                green: 1.0,
                                                blue: 1.0
                                            },
                                            bold: true
                                        }
                                    }
                                },
                                fields: 'userEnteredFormat'
                            }
                        }
                    ]
                })
            });
        }
        catch (error) {
            console.error('Error configurando hoja Pagos:', error);
        }
    }
    async setupReportsSheet(sheetId) {
        const token = await this.getAccessToken();
        if (!token)
            return;
        const headers = [
            'Fecha', 'ID Paciente', 'Nombre Paciente', 'Tipo Informe',
            'Título', 'Estado', 'Link Google Docs', 'Método Input'
        ];
        try {
            await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Informes!A1:H1?valueInputOption=RAW`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    values: [headers]
                })
            });
        }
        catch (error) {
            console.error('Error configurando hoja Informes:', error);
        }
    }
    async upsertPatientInCRM(patientData, sheetId) {
        try {
            const token = await this.getAccessToken();
            if (!token)
                return false;
            const crmSheetId = sheetId || await this.getOrCreateCRMSheet();
            if (!crmSheetId)
                return false;
            const searchResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${crmSheetId}/values/Pacientes!A:A`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!searchResponse.ok) {
                throw new Error('Error buscando pacientes en CRM');
            }
            const searchData = await searchResponse.json();
            const existingRows = searchData.values || [];
            let targetRow = -1;
            for (let i = 1; i < existingRows.length; i++) {
                if (existingRows[i][0] === patientData.id) {
                    targetRow = i + 1;
                    break;
                }
            }
            const rowData = [
                patientData.id,
                patientData.name,
                patientData.email || '',
                patientData.phone || '',
                patientData.birth_date || '',
                patientData.created_at,
                patientData.total_reports.toString(),
                patientData.last_report_date || '',
                patientData.payment_status,
                patientData.total_paid.toString(),
                patientData.next_payment_due || '',
                patientData.status,
                patientData.notes || '',
                patientData.drive_folder_url || ''
            ];
            if (targetRow > 0) {
                await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${crmSheetId}/values/Pacientes!A${targetRow}:N${targetRow}?valueInputOption=RAW`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        values: [rowData]
                    })
                });
            }
            else {
                const nextRow = existingRows.length + 1;
                await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${crmSheetId}/values/Pacientes!A${nextRow}:N${nextRow}?valueInputOption=RAW`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        values: [rowData]
                    })
                });
            }
            console.log('✅ Paciente actualizado en CRM:', patientData.name);
            return true;
        }
        catch (error) {
            console.error('Error actualizando paciente en CRM:', error);
            return false;
        }
    }
    async addReportToCRM(reportData, sheetId) {
        try {
            const token = await this.getAccessToken();
            if (!token)
                return false;
            const crmSheetId = sheetId || await this.getOrCreateCRMSheet();
            if (!crmSheetId)
                return false;
            const getResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${crmSheetId}/values/Informes!A:A`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!getResponse.ok) {
                throw new Error('Error obteniendo datos de informes');
            }
            const getData = await getResponse.json();
            const nextRow = (getData.values?.length || 0) + 1;
            const rowData = [
                reportData.date,
                reportData.patientId,
                reportData.patientName,
                reportData.reportType,
                reportData.title,
                reportData.status,
                reportData.driveLink,
                reportData.inputMethod
            ];
            await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${crmSheetId}/values/Informes!A${nextRow}:H${nextRow}?valueInputOption=RAW`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    values: [rowData]
                })
            });
            console.log('✅ Informe agregado al CRM');
            return true;
        }
        catch (error) {
            console.error('Error agregando informe al CRM:', error);
            return false;
        }
    }
    async addPaymentToCRM(paymentData, sheetId) {
        try {
            const token = await this.getAccessToken();
            if (!token)
                return false;
            const crmSheetId = sheetId || await this.getOrCreateCRMSheet();
            if (!crmSheetId)
                return false;
            const getResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${crmSheetId}/values/Pagos!A:A`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!getResponse.ok) {
                throw new Error('Error obteniendo datos de pagos');
            }
            const getData = await getResponse.json();
            const nextRow = (getData.values?.length || 0) + 1;
            const rowData = [
                paymentData.date,
                paymentData.patientId,
                paymentData.patientName,
                paymentData.concept,
                paymentData.amount.toString(),
                paymentData.paymentMethod,
                paymentData.status,
                paymentData.notes || ''
            ];
            await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${crmSheetId}/values/Pagos!A${nextRow}:H${nextRow}?valueInputOption=RAW`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    values: [rowData]
                })
            });
            console.log('✅ Pago agregado al CRM');
            return true;
        }
        catch (error) {
            console.error('Error agregando pago al CRM:', error);
            return false;
        }
    }
    getCRMViewUrl(sheetId) {
        return `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;
    }
}
Object.defineProperty(GoogleSheetsPatientCRMService, "CRM_SHEET_NAME", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 'iNFORiA_CRM_PACIENTES'
});
export const googleSheetsPatientCRM = new GoogleSheetsPatientCRMService();
