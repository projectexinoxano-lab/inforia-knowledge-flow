import { supabase } from '@/integrations/supabase/client';
// Profile Service
export const profileService = {
    async get(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
        if (error)
            throw error;
        return data;
    },
    async upsert(profile) {
        const { data, error } = await supabase
            .from('profiles')
            .upsert(profile)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
};
// Patients Service
export const patientsService = {
    async getAll() {
        const { data, error } = await supabase
            .from('patients')
            .select('*')
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        return data || [];
    },
    async getById(id) {
        const { data, error } = await supabase
            .from('patients')
            .select('*')
            .eq('id', id)
            .maybeSingle();
        if (error)
            throw error;
        return data;
    },
    async create(patient) {
        const { data, error } = await supabase
            .from('patients')
            .insert(patient)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    },
    async update(id, updates) {
        const { data, error } = await supabase
            .from('patients')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    },
    async delete(id) {
        const { error } = await supabase
            .from('patients')
            .delete()
            .eq('id', id);
        if (error)
            throw error;
    },
    async search(query) {
        const { data, error } = await supabase
            .from('patients')
            .select('*')
            .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        return data || [];
    }
};
// Reports Service
export const reportsService = {
    async getAll() {
        const { data, error } = await supabase
            .from('reports')
            .select(`
        *,
        patient:patients(
          id,
          name,
          email
        )
      `)
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        return data || [];
    },
    async getByPatient(patientId) {
        const { data, error } = await supabase
            .from('reports')
            .select('*')
            .eq('patient_id', patientId)
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        return data || [];
    },
    async create(report) {
        const { data, error } = await supabase
            .from('reports')
            .insert(report)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    },
    async update(id, updates) {
        const { data, error } = await supabase
            .from('reports')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    },
    async delete(id) {
        const { error } = await supabase
            .from('reports')
            .delete()
            .eq('id', id);
        if (error)
            throw error;
    }
};
// Analytics/Stats Service
export const statsService = {
    async getDashboardStats() {
        const [patientsCount, reportsCount, recentReports] = await Promise.all([
            supabase.from('patients').select('*', { count: 'exact', head: true }),
            supabase.from('reports').select('*', { count: 'exact', head: true }),
            supabase.from('reports')
                .select(`
          *,
          patient:patients(name)
        `)
                .order('created_at', { ascending: false })
                .limit(5)
        ]);
        return {
            totalPatients: patientsCount.count || 0,
            totalReports: reportsCount.count || 0,
            recentReports: recentReports.data || []
        };
    }
};
