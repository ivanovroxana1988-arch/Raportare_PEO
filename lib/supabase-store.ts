'use client';

import { createClient } from '@/lib/supabase/client';
import type { Activity, Expert, VerificationData, AppSettings, Deliverable, GrupTintaEntry, Neconformitate, VerificationNote, ActivityCatalog, WorkingGroup, ReportStatus, ConcurrentProject } from './types';

// Supabase client singleton for client-side
const getSupabase = () => {
  const client = createClient();
  if (!client) {
    throw new Error('Supabase client not available - environment variables may be missing');
  }
  return client;
};

// Check if Supabase is available (for build-time safety)
export const isSupabaseAvailable = () => {
  return createClient() !== null;
};

// ============================================
// EXPERTS
// ============================================
export const expertsService = {
  async getAll(): Promise<Expert[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('experts')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data.map(e => ({
      id: e.id,
      name: e.name,
      role: e.role,
      email: e.email || undefined,
      phone: e.phone || undefined,
      category: e.category || undefined,
      norma: e.norma || 8,
      saCodes: e.sa_codes || [],
      hasPmAccess: e.has_pm_access || false,
    }));
  },

  async getById(id: string): Promise<Expert | null> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('experts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return {
      id: data.id,
      name: data.name,
      role: data.role,
      email: data.email || undefined,
      phone: data.phone || undefined,
      category: data.category || undefined,
      norma: data.norma || 8,
      saCodes: data.sa_codes || [],
      hasPmAccess: data.has_pm_access || false,
    };
  },

  async create(expert: Omit<Expert, 'id'>): Promise<Expert> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('experts')
      .insert({
        name: expert.name,
        role: expert.role,
        email: expert.email || null,
        phone: expert.phone || null,
      })
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      role: data.role,
      email: data.email || undefined,
      phone: data.phone || undefined,
    };
  },

  async update(id: string, updates: Partial<Expert>): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('experts')
      .update({
        name: updates.name,
        role: updates.role,
        email: updates.email || null,
        phone: updates.phone || null,
      })
      .eq('id', id);
    
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('experts')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) throw error;
  },
};

// ============================================
// ACTIVITIES
// ============================================
export const activitiesService = {
  async getAll(): Promise<Activity[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        deliverables (*),
        grup_tinta (*)
      `)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data.map(mapActivityFromDb);
  },

  async getByExpert(expertId: string): Promise<Activity[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        deliverables (*),
        grup_tinta (*)
      `)
      .eq('expert_id', expertId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data.map(mapActivityFromDb);
  },

  async getByMonth(month: number, year: number): Promise<Activity[]> {
    const supabase = getSupabase();
    const startDate = new Date(year, month, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        deliverables (*),
        grup_tinta (*)
      `)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date');
    
    if (error) throw error;
    return data.map(mapActivityFromDb);
  },

  async getByDateRange(startDate: string, endDate: string): Promise<Activity[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        deliverables (*),
        grup_tinta (*)
      `)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date');
    
    if (error) throw error;
    return data.map(mapActivityFromDb);
  },

  async create(activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>): Promise<Activity> {
    const supabase = getSupabase();
    
    // Insert activity
    const { data, error } = await supabase
      .from('activities')
      .insert({
        expert_id: activity.expertId,
        date: activity.date,
        hours: activity.hours,
        activity_type: activity.activityType,
        title: activity.title,
        description: activity.description || null,
        location: activity.location || null,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Insert deliverables if any
    if (activity.deliverables && activity.deliverables.length > 0) {
      const { error: delError } = await supabase
        .from('deliverables')
        .insert(
          activity.deliverables.map(d => ({
            activity_id: data.id,
            file_name: d.fileName,
            file_type: d.fileType,
            file_size: d.fileSize,
            file_path: d.filePath || '',
          }))
        );
      if (delError) console.error('Error inserting deliverables:', delError);
    }
    
    // Insert grup tinta if any
    if (activity.grupTinta && activity.grupTinta.length > 0) {
      const { error: gtError } = await supabase
        .from('grup_tinta')
        .insert(
          activity.grupTinta.map(gt => ({
            activity_id: data.id,
            name: gt.name,
            cnp: gt.cnp || null,
            date: activity.date,
          }))
        );
      if (gtError) console.error('Error inserting grup tinta:', gtError);
    }
    
    return mapActivityFromDb(data);
  },

  async createBatch(activities: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Activity[]> {
    const results: Activity[] = [];
    for (const activity of activities) {
      const created = await activitiesService.create(activity);
      results.push(created);
    }
    return results;
  },

  async update(id: string, updates: Partial<Activity>): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('activities')
      .update({
        hours: updates.hours,
        activity_type: updates.activityType,
        title: updates.title,
        description: updates.description,
        location: updates.location,
      })
      .eq('id', id);
    
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async deleteByDates(expertId: string, dates: string[]): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('expert_id', expertId)
      .in('date', dates);
    
    if (error) throw error;
  },
};

// ============================================
// VERIFICATIONS
// ============================================
export const verificationsService = {
  async getAll(): Promise<VerificationData[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('verifications')
      .select(`
        *,
        experts (name, role),
        pontaj_rows (*),
        raport_rows (*),
        livrabil_rows (*),
        cross_expert_rows (*),
        neconformitati (*),
        verification_notes (*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data.map(mapVerificationFromDb);
  },

  async getByExpertAndMonth(expertId: string, month: string, year: string): Promise<VerificationData | null> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('verifications')
      .select(`
        *,
        experts (name, role),
        pontaj_rows (*),
        raport_rows (*),
        livrabil_rows (*),
        cross_expert_rows (*),
        neconformitati (*),
        verification_notes (*)
      `)
      .eq('expert_id', expertId)
      .eq('month', parseInt(month))
      .eq('year', parseInt(year))
      .single();
    
    if (error) return null;
    return mapVerificationFromDb(data);
  },

  async create(verification: Omit<VerificationData, 'id'>): Promise<VerificationData> {
    const supabase = getSupabase();
    
    // Create verification
    const { data, error } = await supabase
      .from('verifications')
      .insert({
        expert_id: verification.expertId,
        month: parseInt(verification.month),
        year: parseInt(verification.year),
        status: verification.status || 'pending',
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Insert pontaj rows if any
    if (verification.pontajRows && verification.pontajRows.length > 0) {
      await supabase.from('pontaj_rows').insert(
        verification.pontajRows.map(r => ({
          verification_id: data.id,
          date: r.date,
          hours: r.hours,
          activity_code: r.activityCode,
          description: r.description || null,
          verified: r.verified || false,
          issues: r.issues || [],
        }))
      );
    }
    
    // Insert raport rows if any
    if (verification.raportRows && verification.raportRows.length > 0) {
      await supabase.from('raport_rows').insert(
        verification.raportRows.map(r => ({
          verification_id: data.id,
          date: r.date,
          activity_title: r.activityTitle,
          description: r.description || null,
          deliverables: r.deliverables || [],
          verified: r.verified || false,
          matches_pontaj: r.matchesPontaj || false,
          issues: r.issues || [],
        }))
      );
    }
    
    return { ...verification, id: data.id };
  },

  async update(id: string, updates: Partial<VerificationData>): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('verifications')
      .update({
        status: updates.status,
        completed_at: updates.status === 'completed' ? new Date().toISOString() : null,
      })
      .eq('id', id);
    
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('verifications')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// ============================================
// NECONFORMITATI
// ============================================
export const neconformitatiService = {
  async getByVerification(verificationId: string): Promise<Neconformitate[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('neconformitati')
      .select('*')
      .eq('verification_id', verificationId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data.map(n => ({
      id: n.id,
      verificationId: n.verification_id,
      type: n.type,
      severity: n.severity,
      description: n.description,
      affectedDate: n.affected_date || undefined,
      affectedExpertId: n.affected_expert_id || undefined,
      resolved: n.resolved,
      resolution: n.resolution || undefined,
      resolvedAt: n.resolved_at || undefined,
      createdAt: n.created_at,
    }));
  },

  async create(neconformitate: Omit<Neconformitate, 'id' | 'createdAt'>): Promise<Neconformitate> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('neconformitati')
      .insert({
        verification_id: neconformitate.verificationId,
        type: neconformitate.type,
        severity: neconformitate.severity,
        description: neconformitate.description,
        affected_date: neconformitate.affectedDate || null,
        affected_expert_id: neconformitate.affectedExpertId || null,
        resolved: false,
      })
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      verificationId: data.verification_id,
      type: data.type,
      severity: data.severity,
      description: data.description,
      affectedDate: data.affected_date || undefined,
      affectedExpertId: data.affected_expert_id || undefined,
      resolved: data.resolved,
      createdAt: data.created_at,
    };
  },

  async resolve(id: string, resolution: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('neconformitati')
      .update({
        resolved: true,
        resolution,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', id);
    
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('neconformitati')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// ============================================
// VERIFICATION NOTES
// ============================================
export const notesService = {
  async getByVerification(verificationId: string): Promise<VerificationNote[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('verification_notes')
      .select('*')
      .eq('verification_id', verificationId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data.map(n => ({
      id: n.id,
      verificationId: n.verification_id,
      content: n.content,
      category: n.category,
      authorId: n.author_id || undefined,
      authorName: n.author_name || undefined,
      createdAt: n.created_at,
      updatedAt: n.updated_at,
    }));
  },

  async create(note: Omit<VerificationNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<VerificationNote> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('verification_notes')
      .insert({
        verification_id: note.verificationId,
        content: note.content,
        category: note.category,
        author_name: note.authorName || null,
      })
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      verificationId: data.verification_id,
      content: data.content,
      category: data.category,
      authorName: data.author_name || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async update(id: string, content: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('verification_notes')
      .update({ content })
      .eq('id', id);
    
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('verification_notes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// ============================================
// APP SETTINGS
// ============================================
export const settingsService = {
  async get(): Promise<AppSettings> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('app_settings')
      .select('*');
    
    if (error) throw error;
    
    const settings: AppSettings = {
      claudeApiKey: '',
      projectCode: '302141',
      projectTitle: 'Proiect PEO',
      contractNumber: '',
      experts: [],
    };
    
    data.forEach(row => {
      if (row.key === 'claude_api_key') settings.claudeApiKey = JSON.parse(row.value);
      if (row.key === 'project_code') settings.projectCode = JSON.parse(row.value);
      if (row.key === 'project_title') settings.projectTitle = JSON.parse(row.value);
      if (row.key === 'contract_number') settings.contractNumber = JSON.parse(row.value);
    });
    
    return settings;
  },

  async save(key: string, value: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('app_settings')
      .upsert({
        key,
        value: JSON.stringify(value),
        description: `Setting: ${key}`,
      }, { onConflict: 'key' });
    
    if (error) throw error;
  },

  async setApiKey(apiKey: string): Promise<void> {
    await settingsService.save('claude_api_key', apiKey);
  },

  async getApiKey(): Promise<string> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'claude_api_key')
      .single();
    
    if (error || !data) return '';
    return JSON.parse(data.value);
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================
function mapActivityFromDb(data: any): Activity {
  return {
    id: data.id,
    expertId: data.expert_id,
    date: data.date,
    hours: parseFloat(data.hours),
    activityType: data.activity_type,
    title: data.title,
    description: data.description || undefined,
    location: data.location || undefined,
    deliverables: data.deliverables?.map((d: any) => ({
      id: d.id,
      fileName: d.file_name,
      fileType: d.file_type,
      fileSize: d.file_size,
      filePath: d.file_path,
      uploadedAt: d.uploaded_at,
    })) || [],
    grupTinta: data.grup_tinta?.map((gt: any) => ({
      id: gt.id,
      name: gt.name,
      cnp: gt.cnp || undefined,
      date: gt.date,
    })) || [],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

function mapVerificationFromDb(data: any): VerificationData {
  return {
    id: data.id,
    expertId: data.expert_id,
    expertName: data.experts?.name || '',
    month: String(data.month).padStart(2, '0'),
    year: String(data.year),
    status: data.status,
    pontajRows: data.pontaj_rows?.map((r: any) => ({
      id: r.id,
      date: r.date,
      hours: parseFloat(r.hours),
      activityCode: r.activity_code,
      description: r.description,
      verified: r.verified,
      issues: r.issues || [],
    })) || [],
    raportRows: data.raport_rows?.map((r: any) => ({
      id: r.id,
      date: r.date,
      activityTitle: r.activity_title,
      description: r.description,
      deliverables: r.deliverables || [],
      verified: r.verified,
      matchesPontaj: r.matches_pontaj,
      issues: r.issues || [],
    })) || [],
    livrabilRows: data.livrabil_rows?.map((r: any) => ({
      id: r.id,
      fileName: r.file_name,
      activityDate: r.activity_date,
      activityTitle: r.activity_title,
      fileExists: r.file_exists,
      titleMatch: r.title_match,
      issues: r.issues || [],
    })) || [],
    crossExpertRows: data.cross_expert_rows?.map((r: any) => ({
      id: r.id,
      date: r.date,
      expert1Id: r.expert1_id,
      expert1Name: r.expert1_name,
      expert2Id: r.expert2_id,
      expert2Name: r.expert2_name,
      activity1: r.activity1,
      activity2: r.activity2,
      similarity: parseFloat(r.similarity),
      isPotentialIssue: r.is_potential_issue,
    })) || [],
    neconformitati: data.neconformitati?.map((n: any) => ({
      id: n.id,
      type: n.type,
      severity: n.severity,
      description: n.description,
      affectedDate: n.affected_date,
      resolved: n.resolved,
      resolution: n.resolution,
    })) || [],
    notes: data.verification_notes?.map((n: any) => ({
      id: n.id,
      content: n.content,
      category: n.category,
      authorName: n.author_name,
      createdAt: n.created_at,
    })) || [],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// ============================================
// UTILITY FUNCTIONS (kept from original store)
// ============================================
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
};

export const formatDateRo = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ro-RO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const getMonthName = (month: number): string => {
  const months = [
    'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
    'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
  ];
  return months[month];
};

export const calculateWorkingDays = (month: number, year: number): number => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let workingDays = 0;
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
  }
  
  return workingDays;
};

// ============================================
// ACTIVITY CATALOG
// ============================================
export const activityCatalogService = {
  async getAll(): Promise<ActivityCatalog[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('activity_catalog')
      .select('*')
      .order('sa_code, activity_number');
    
    if (error) throw error;
    return data.map(a => ({
      id: a.id,
      category: a.category,
      saCode: a.sa_code,
      serviceCategory: a.service_category,
      activityNumber: a.activity_number,
      activityName: a.activity_name,
      description: a.description,
      objectives: a.objectives,
      serviceComponent: a.service_component,
      beneficiaries: a.beneficiaries,
      expectedResults: a.expected_results,
      deliverables: a.deliverables,
      indicators: a.indicators,
    }));
  },

  async getBySaCode(saCode: string): Promise<ActivityCatalog[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('activity_catalog')
      .select('*')
      .eq('sa_code', saCode)
      .order('activity_number');
    
    if (error) throw error;
    return data.map(a => ({
      id: a.id,
      category: a.category,
      saCode: a.sa_code,
      serviceCategory: a.service_category,
      activityNumber: a.activity_number,
      activityName: a.activity_name,
      description: a.description,
      objectives: a.objectives,
      serviceComponent: a.service_component,
      beneficiaries: a.beneficiaries,
      expectedResults: a.expected_results,
      deliverables: a.deliverables,
      indicators: a.indicators,
    }));
  },
};

// ============================================
// WORKING GROUPS
// ============================================
export const workingGroupsService = {
  async getAll(): Promise<WorkingGroup[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('working_groups')
      .select('*')
      .eq('is_active', true)
      .order('type, name');
    
    if (error) throw error;
    return data.map(g => ({
      id: g.id,
      name: g.name,
      type: g.type,
      email: g.email,
      saCode: g.sa_code,
      isActive: g.is_active,
      notes: g.notes,
    }));
  },

  async getByType(type: string): Promise<WorkingGroup[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('working_groups')
      .select('*')
      .eq('type', type)
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data.map(g => ({
      id: g.id,
      name: g.name,
      type: g.type,
      email: g.email,
      saCode: g.sa_code,
      isActive: g.is_active,
      notes: g.notes,
    }));
  },
};

// ============================================
// CONCURRENT PROJECTS
// ============================================
export const concurrentProjectsService = {
  async getByExpert(expertId: string): Promise<ConcurrentProject[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('concurrent_projects')
      .select('*')
      .eq('expert_id', expertId)
      .eq('is_active', true)
      .order('start_date');
    
    if (error) throw error;
    return data.map(p => ({
      id: p.id,
      expertId: p.expert_id,
      projectName: p.project_name,
      projectCode: p.project_code,
      fundingSource: p.funding_source,
      dailyHours: p.daily_hours,
      startDate: p.start_date,
      endDate: p.end_date,
      isActive: p.is_active,
      notes: p.notes,
    }));
  },

  async create(project: Omit<ConcurrentProject, 'id'>): Promise<ConcurrentProject> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('concurrent_projects')
      .insert({
        expert_id: project.expertId,
        project_name: project.projectName,
        project_code: project.projectCode,
        funding_source: project.fundingSource,
        daily_hours: project.dailyHours,
        start_date: project.startDate,
        end_date: project.endDate,
        is_active: project.isActive ?? true,
        notes: project.notes,
      })
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      expertId: data.expert_id,
      projectName: data.project_name,
      projectCode: data.project_code,
      fundingSource: data.funding_source,
      dailyHours: data.daily_hours,
      startDate: data.start_date,
      endDate: data.end_date,
      isActive: data.is_active,
      notes: data.notes,
    };
  },

  async delete(id: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('concurrent_projects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// ============================================
// REPORT STATUS
// ============================================
export const reportStatusService = {
  async getByExpertAndMonth(expertId: string, month: number, year: number): Promise<ReportStatus | null> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('report_status')
      .select('*')
      .eq('expert_id', expertId)
      .eq('month', month)
      .eq('year', year)
      .single();
    
    if (error) return null;
    return {
      id: data.id,
      expertId: data.expert_id,
      year: data.year,
      month: data.month,
      status: data.status,
      sentDate: data.sent_date,
      approvalDate: data.approval_date,
      pmNotes: data.pm_notes,
    };
  },

  async getAllByMonth(month: number, year: number): Promise<ReportStatus[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('report_status')
      .select('*')
      .eq('month', month)
      .eq('year', year);
    
    if (error) throw error;
    return data.map(r => ({
      id: r.id,
      expertId: r.expert_id,
      year: r.year,
      month: r.month,
      status: r.status,
      sentDate: r.sent_date,
      approvalDate: r.approval_date,
      pmNotes: r.pm_notes,
    }));
  },

  async upsert(status: Omit<ReportStatus, 'id'>): Promise<ReportStatus> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('report_status')
      .upsert({
        expert_id: status.expertId,
        year: status.year,
        month: status.month,
        status: status.status,
        sent_date: status.sentDate,
        approval_date: status.approvalDate,
        pm_notes: status.pmNotes,
      }, {
        onConflict: 'expert_id,year,month',
      })
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      expertId: data.expert_id,
      year: data.year,
      month: data.month,
      status: data.status,
      sentDate: data.sent_date,
      approvalDate: data.approval_date,
      pmNotes: data.pm_notes,
    };
  },
};

// ============================================
// GRUP TINTA (enhanced)
// ============================================
export const grupTintaService = {
  async getByExpertAndMonth(expertId: string, month: number, year: number): Promise<GrupTintaEntry[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('grup_tinta')
      .select('*')
      .eq('expert_id', expertId)
      .eq('month', month)
      .eq('year', year)
      .order('date');
    
    if (error) throw error;
    return data.map(g => ({
      id: g.id,
      expertId: g.expert_id,
      activityId: g.activity_id,
      date: g.date,
      type: g.activity_type,
      organizations: g.organizations || [],
      participants: g.participants_count,
      notes: g.notes,
      month: g.month,
      year: g.year,
    }));
  },

  async create(entry: Omit<GrupTintaEntry, 'id'>): Promise<GrupTintaEntry> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('grup_tinta')
      .insert({
        expert_id: entry.expertId,
        activity_id: entry.activityId,
        date: entry.date,
        activity_type: entry.type,
        organizations: entry.organizations,
        participants_count: entry.participants,
        notes: entry.notes,
        month: entry.month,
        year: entry.year,
      })
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      expertId: data.expert_id,
      activityId: data.activity_id,
      date: data.date,
      type: data.activity_type,
      organizations: data.organizations || [],
      participants: data.participants_count,
      notes: data.notes,
      month: data.month,
      year: data.year,
    };
  },

  async delete(id: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('grup_tinta')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getMonthlyStats(month: number, year: number): Promise<{ expertId: string; totalParticipants: number; sessionsCount: number }[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('grup_tinta')
      .select('expert_id, participants_count')
      .eq('month', month)
      .eq('year', year);
    
    if (error) throw error;
    
    const stats = new Map<string, { totalParticipants: number; sessionsCount: number }>();
    data.forEach(g => {
      const existing = stats.get(g.expert_id) || { totalParticipants: 0, sessionsCount: 0 };
      existing.totalParticipants += g.participants_count;
      existing.sessionsCount += 1;
      stats.set(g.expert_id, existing);
    });
    
    return Array.from(stats.entries()).map(([expertId, stat]) => ({
      expertId,
      ...stat,
    }));
  },
};
