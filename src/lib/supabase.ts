import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bgpvhpilyxyqavpkxqzn.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your secrets.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

export type UserRole = 'designer' | 'client';

export interface UserProfile {
  id: string;
  role: UserRole;
  email: string;
}

export interface Project {
  id: string;
  designer_id: string;
  client_id: string;
  project_name: string;
  budget: number;
  client_name: string;
  created_at: string;
}

export interface FurnitureDesign {
  id: string;
  project_id: string;
  inputs_json: any;
  image_url: string;
  materials_json: any[];
  total_cost: number;
  excel_url?: string;
  status: 'pending' | 'approved' | 'rejected' | 'revision';
  created_at: string;
}

export interface Comment {
  id: string;
  project_id: string;
  user_id: string;
  message: string;
  created_at: string;
}
