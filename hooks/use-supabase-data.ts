'use client';

import useSWR, { mutate } from 'swr';
import {
  expertsService,
  activitiesService,
  verificationsService,
  neconformitatiService,
  notesService,
  settingsService,
  isSupabaseAvailable,
} from '@/lib/supabase-store';
import type { Activity, Expert, VerificationData, Neconformitate, VerificationNote, AppSettings } from '@/lib/types';

// Safe fetcher that returns null if Supabase is not available
const safeFetcher = <T>(fetcher: () => Promise<T>) => async (): Promise<T | null> => {
  if (!isSupabaseAvailable()) {
    return null;
  }
  return fetcher();
};

// ============================================
// EXPERTS HOOKS
// ============================================
export function useExperts() {
  const { data, error, isLoading } = useSWR(
    isSupabaseAvailable() ? 'experts' : null,
    safeFetcher(expertsService.getAll)
  );
  
  return {
    experts: data || [],
    isLoading,
    error,
    mutate: () => mutate('experts'),
  };
}

export function useExpert(id: string | null) {
  const { data, error, isLoading } = useSWR(
    id && isSupabaseAvailable() ? `expert-${id}` : null,
    safeFetcher(() => expertsService.getById(id!))
  );
  
  return {
    expert: data,
    isLoading,
    error,
  };
}

export function useExpertMutations() {
  const create = async (expert: Omit<Expert, 'id'>) => {
    const created = await expertsService.create(expert);
    mutate('experts');
    return created;
  };

  const update = async (id: string, updates: Partial<Expert>) => {
    await expertsService.update(id, updates);
    mutate('experts');
    mutate(`expert-${id}`);
  };

  const remove = async (id: string) => {
    await expertsService.delete(id);
    mutate('experts');
  };

  return { create, update, remove };
}

// ============================================
// ACTIVITIES HOOKS
// ============================================
export function useActivities(expertId?: string) {
  const key = expertId ? `activities-expert-${expertId}` : 'activities';
  const fetcher = expertId 
    ? () => activitiesService.getByExpert(expertId)
    : activitiesService.getAll;
    
  const { data, error, isLoading } = useSWR(
    isSupabaseAvailable() ? key : null,
    safeFetcher(fetcher)
  );
  
  return {
    activities: data || [],
    isLoading,
    error,
    mutate: () => mutate(key),
  };
}

export function useActivitiesByMonth(month: number, year: number) {
  const key = `activities-month-${month}-${year}`;
  const { data, error, isLoading } = useSWR(
    isSupabaseAvailable() ? key : null,
    safeFetcher(() => activitiesService.getByMonth(month, year))
  );
  
  return {
    activities: data || [],
    isLoading,
    error,
    mutate: () => mutate(key),
  };
}

export function useActivitiesByDateRange(startDate: string, endDate: string) {
  const key = `activities-range-${startDate}-${endDate}`;
  const { data, error, isLoading } = useSWR(
    isSupabaseAvailable() ? key : null,
    safeFetcher(() => activitiesService.getByDateRange(startDate, endDate))
  );
  
  return {
    activities: data || [],
    isLoading,
    error,
    mutate: () => mutate(key),
  };
}

export function useActivityMutations() {
  const create = async (activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created = await activitiesService.create(activity);
    // Mutate all activity-related keys
    mutate((key: string) => typeof key === 'string' && key.startsWith('activities'), undefined, { revalidate: true });
    return created;
  };

  const createBatch = async (activities: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    const created = await activitiesService.createBatch(activities);
    mutate((key: string) => typeof key === 'string' && key.startsWith('activities'), undefined, { revalidate: true });
    return created;
  };

  const update = async (id: string, updates: Partial<Activity>) => {
    await activitiesService.update(id, updates);
    mutate((key: string) => typeof key === 'string' && key.startsWith('activities'), undefined, { revalidate: true });
  };

  const remove = async (id: string) => {
    await activitiesService.delete(id);
    mutate((key: string) => typeof key === 'string' && key.startsWith('activities'), undefined, { revalidate: true });
  };

  const removeByDates = async (expertId: string, dates: string[]) => {
    await activitiesService.deleteByDates(expertId, dates);
    mutate((key: string) => typeof key === 'string' && key.startsWith('activities'), undefined, { revalidate: true });
  };

  return { create, createBatch, update, remove, removeByDates };
}

// ============================================
// VERIFICATIONS HOOKS
// ============================================
export function useVerifications() {
  const { data, error, isLoading } = useSWR(
    isSupabaseAvailable() ? 'verifications' : null,
    safeFetcher(verificationsService.getAll)
  );
  
  return {
    verifications: data || [],
    isLoading,
    error,
    mutate: () => mutate('verifications'),
  };
}

export function useVerification(expertId: string | null, month: string | null, year: string | null) {
  const key = expertId && month && year ? `verification-${expertId}-${month}-${year}` : null;
  const { data, error, isLoading } = useSWR(
    key && isSupabaseAvailable() ? key : null,
    safeFetcher(() => verificationsService.getByExpertAndMonth(expertId!, month!, year!))
  );
  
  return {
    verification: data,
    isLoading,
    error,
    mutate: () => key && mutate(key),
  };
}

export function useVerificationMutations() {
  const create = async (verification: Omit<VerificationData, 'id'>) => {
    const created = await verificationsService.create(verification);
    mutate('verifications');
    mutate(`verification-${verification.expertId}-${verification.month}-${verification.year}`);
    return created;
  };

  const update = async (id: string, updates: Partial<VerificationData>) => {
    await verificationsService.update(id, updates);
    mutate('verifications');
  };

  const remove = async (id: string) => {
    await verificationsService.delete(id);
    mutate('verifications');
  };

  return { create, update, remove };
}

// ============================================
// NECONFORMITATI HOOKS
// ============================================
export function useNeconformitati(verificationId: string | null) {
  const key = verificationId ? `neconformitati-${verificationId}` : null;
  const { data, error, isLoading } = useSWR(
    key && isSupabaseAvailable() ? key : null,
    safeFetcher(() => neconformitatiService.getByVerification(verificationId!))
  );
  
  return {
    neconformitati: data || [],
    isLoading,
    error,
    mutate: () => key && mutate(key),
  };
}

export function useNeconformitateMutations() {
  const create = async (neconformitate: Omit<Neconformitate, 'id' | 'createdAt'>) => {
    const created = await neconformitatiService.create(neconformitate);
    mutate(`neconformitati-${neconformitate.verificationId}`);
    return created;
  };

  const resolve = async (id: string, verificationId: string, resolution: string) => {
    await neconformitatiService.resolve(id, resolution);
    mutate(`neconformitati-${verificationId}`);
  };

  const remove = async (id: string, verificationId: string) => {
    await neconformitatiService.delete(id);
    mutate(`neconformitati-${verificationId}`);
  };

  return { create, resolve, remove };
}

// ============================================
// NOTES HOOKS
// ============================================
export function useNotes(verificationId: string | null) {
  const key = verificationId ? `notes-${verificationId}` : null;
  const { data, error, isLoading } = useSWR(
    key && isSupabaseAvailable() ? key : null,
    safeFetcher(() => notesService.getByVerification(verificationId!))
  );
  
  return {
    notes: data || [],
    isLoading,
    error,
    mutate: () => key && mutate(key),
  };
}

export function useNoteMutations() {
  const create = async (note: Omit<VerificationNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created = await notesService.create(note);
    mutate(`notes-${note.verificationId}`);
    return created;
  };

  const update = async (id: string, verificationId: string, content: string) => {
    await notesService.update(id, content);
    mutate(`notes-${verificationId}`);
  };

  const remove = async (id: string, verificationId: string) => {
    await notesService.delete(id);
    mutate(`notes-${verificationId}`);
  };

  return { create, update, remove };
}

// ============================================
// SETTINGS HOOKS
// ============================================
export function useSettings() {
  const { data, error, isLoading } = useSWR(
    isSupabaseAvailable() ? 'settings' : null,
    safeFetcher(settingsService.get)
  );
  
  return {
    settings: data || {
      claudeApiKey: '',
      projectCode: '302141',
      projectTitle: 'Proiect PEO',
      contractNumber: '',
      experts: [],
    },
    isLoading,
    error,
    mutate: () => mutate('settings'),
  };
}

export function useApiKey() {
  const { data, error, isLoading } = useSWR(
    isSupabaseAvailable() ? 'api-key' : null,
    safeFetcher(settingsService.getApiKey)
  );
  
  const setApiKey = async (apiKey: string) => {
    await settingsService.setApiKey(apiKey);
    mutate('api-key');
    mutate('settings');
  };
  
  return {
    apiKey: data || '',
    isLoading,
    error,
    setApiKey,
  };
}

export function useSettingsMutations() {
  const save = async (key: string, value: string) => {
    await settingsService.save(key, value);
    mutate('settings');
  };

  const setApiKey = async (apiKey: string) => {
    await settingsService.setApiKey(apiKey);
    mutate('api-key');
    mutate('settings');
  };

  return { save, setApiKey };
}
