// PEO Reporting Types

export interface Expert {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
}

export interface Activity {
  id: string;
  date: string;
  expertId: string;
  expertName?: string;
  hours: number;
  activityType: string;
  title: string;
  description?: string;
  deliverables?: Deliverable[];
  location?: string;
  grupTinta?: GrupTintaEntry[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Deliverable {
  id: string;
  activityId?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath?: string;
  uploadedAt?: string;
  fileData?: string; // Base64 encoded for localStorage fallback
}

export interface GrupTintaEntry {
  id: string;
  name: string;
  cnp?: string;
  date: string;
}

export interface VerificationData {
  id?: string;
  expertId: string;
  expertName?: string;
  month: string;
  year: string;
  status: 'pending' | 'in-progress' | 'completed' | 'issues';
  pontajRows?: PontajRow[];
  raportRows?: RaportRow[];
  livrabilRows?: LivrabilRow[];
  crossExpertRows?: CrossExpertRow[];
  neconformitati?: Neconformitate[];
  notes?: VerificationNote[];
  createdAt?: string;
  updatedAt?: string;
  // Legacy field names for backward compatibility
  pontajData?: PontajRow[];
  raportActivitateData?: RaportRow[];
  livrabileData?: LivrabilRow[];
  crossExpertData?: CrossExpertRow[];
}

export interface PontajRow {
  id: string;
  date: string;
  hours: number;
  activityCode: string;
  description?: string;
  verified?: boolean;
  issues?: string[];
}

export interface RaportRow {
  id: string;
  date: string;
  activityTitle: string;
  description?: string;
  deliverables?: string[];
  verified?: boolean;
  matchesPontaj?: boolean;
  issues?: string[];
}

export interface LivrabilRow {
  id: string;
  fileName: string;
  activityDate?: string;
  activityTitle?: string;
  fileExists?: boolean;
  titleMatch?: boolean;
  issues?: string[];
}

export interface CrossExpertRow {
  id: string;
  date: string;
  expert1Id?: string;
  expert1Name: string;
  expert2Id?: string;
  expert2Name: string;
  // Legacy field names
  expert1?: string;
  expert2?: string;
  activity1: string;
  activity2: string;
  similarity: number;
  isPotentialIssue?: boolean;
}

export interface Neconformitate {
  id: string;
  verificationId?: string;
  type: 'pontaj' | 'raport' | 'livrabil' | 'cross-expert' | 'other';
  severity: 'low' | 'medium' | 'high';
  description: string;
  affectedDate?: string;
  affectedExpertId?: string;
  affectedExpert?: string; // Legacy
  resolved: boolean;
  resolution?: string;
  resolvedAt?: string;
  createdAt?: string;
}

export interface VerificationNote {
  id: string;
  verificationId?: string;
  content: string;
  category: string;
  authorId?: string;
  authorName?: string;
  author?: string; // Legacy
  createdAt?: string;
  updatedAt?: string;
}

export interface AppSettings {
  claudeApiKey: string;
  projectCode: string;
  projectTitle: string;
  contractNumber: string;
  experts: Expert[];
}

export interface MonthData {
  month: number;
  year: number;
  activities: Activity[];
  totalHours: number;
  workDays: number;
}

export type ActivityType = 
  | 'A4.1' 
  | 'A4.2' 
  | 'A4.3' 
  | 'A4.4' 
  | 'A4.5' 
  | 'A5.1' 
  | 'A5.2' 
  | 'A6.1' 
  | 'A6.2' 
  | 'Management';

export const ACTIVITY_TYPES: { value: ActivityType; label: string }[] = [
  { value: 'A4.1', label: 'A4.1 - Elaborare metodologie' },
  { value: 'A4.2', label: 'A4.2 - Formare formatori' },
  { value: 'A4.3', label: 'A4.3 - Dezvoltare curriculum' },
  { value: 'A4.4', label: 'A4.4 - Implementare pilot' },
  { value: 'A4.5', label: 'A4.5 - Evaluare și raportare' },
  { value: 'A5.1', label: 'A5.1 - Formare cadre didactice' },
  { value: 'A5.2', label: 'A5.2 - Mentorat' },
  { value: 'A6.1', label: 'A6.1 - Diseminare rezultate' },
  { value: 'A6.2', label: 'A6.2 - Conferințe' },
  { value: 'Management', label: 'Management proiect' },
];

export const EXPERTS_LIST: Expert[] = [
  { id: '1', name: 'Expert 1', role: 'Expert metodologic' },
  { id: '2', name: 'Expert 2', role: 'Expert formare' },
  { id: '3', name: 'Expert 3', role: 'Expert curriculum' },
  { id: '4', name: 'Expert 4', role: 'Expert evaluare' },
  { id: '5', name: 'Expert 5', role: 'Expert diseminare' },
];
