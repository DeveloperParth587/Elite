import { supabase, Project, FurnitureDesign, UserProfile } from '../lib/supabase';

export const dataService = {
  // Projects
  async getProjects(role: 'designer' | 'client', userId: string): Promise<Project[]> {
    const query = supabase.from('projects').select('*');
    
    if (role === 'designer') {
      query.eq('designer_id', userId);
    } else {
      query.eq('client_id', userId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createProject(project: Omit<Project, 'id' | 'created_at'>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Designs
  async getDesigns(projectId: string): Promise<FurnitureDesign[]> {
    const { data, error } = await supabase
      .from('furniture_designs')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async saveDesign(design: Omit<FurnitureDesign, 'id' | 'created_at'>): Promise<FurnitureDesign> {
    const { data, error } = await supabase
      .from('furniture_designs')
      .insert([design])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateDesignStatus(designId: string, status: FurnitureDesign['status']): Promise<void> {
    const { error } = await supabase
      .from('furniture_designs')
      .update({ status })
      .eq('id', designId);
    
    if (error) throw error;
  },

  // Clients (for designers)
  async getClients(): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'client');
    
    if (error) throw error;
    return data || [];
  },

  // Stats
  async getDesignerStats(designerId: string) {
    const { data: projects, error: pError } = await supabase
      .from('projects')
      .select('id')
      .eq('designer_id', designerId);
    
    if (pError) throw pError;
    const projectIds = projects?.map(p => p.id) || [];

    const { data: designs, error: dError } = await supabase
      .from('furniture_designs')
      .select('status, total_cost')
      .in('project_id', projectIds);
    
    if (dError) throw dError;

    const stats = {
      activeProjects: projects?.length || 0,
      totalRevenue: designs?.reduce((acc, curr) => acc + (curr.status === 'approved' ? curr.total_cost : 0), 0) || 0,
      pendingApprovals: designs?.filter(d => d.status === 'pending').length || 0,
      completed: designs?.filter(d => d.status === 'approved').length || 0,
    };

    return stats;
  }
};
