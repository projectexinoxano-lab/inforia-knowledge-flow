import { useState, useEffect } from 'react';
import { ReportsService } from '@/services/reports';

export interface Report {
  id: string;
  title: string;
  content: string;
  report_type: string;
  input_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  patients?: {
    name: string;
    birth_date?: string;
  };
}

export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ReportsService.getUserReports();
      setReports(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (reportId: string) => {
    try {
      await ReportsService.deleteReport(reportId);
      setReports(prev => prev.filter(r => r.id !== reportId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error eliminando informe');
      return false;
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return {
    data: reports,
    reports,
    loading,
    error,
    fetchReports,
    deleteReport,
    refresh: fetchReports
  };
}

export const usePatientReports = (patientId: string) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatientReports = async () => {
      try {
        setLoading(true);
        const allReports = await ReportsService.getUserReports();
        const patientReports = allReports?.filter(r => r.patient_id === patientId) || [];
        setReports(patientReports);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatientReports();
    }
  }, [patientId]);

  return { data: reports, loading, error };
};