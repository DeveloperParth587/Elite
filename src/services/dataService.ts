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
  },

  async addMember(member: { email: string; password?: string; role: 'designer' | 'client'; full_name?: string; phone?: string }) {
    const response = await fetch('/api/admin/add-member', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...member,
        password: member.password || 'Welcome123!' // Default password
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data.user;
  },

  async updateClientProfile(userId: string, updates: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Client Queries
  async getClientQueries(role: 'designer' | 'client', userId: string) {
    const query = supabase.from('client_queries').select('*');
    if (role === 'designer') {
      // In a real app, we might filter by assigned designer or show all pending for all designers
      // For this SaaS, let's show all for now since designers might pick them up
    } else {
      query.eq('client_id', userId);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createClientQuery(query: { title: string; description: string; budget: number; client_id: string }) {
    const { data, error } = await supabase
      .from('client_queries')
      .insert([query])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateQueryStatus(queryId: string, status: 'approved' | 'rejected', designerId?: string) {
    const update: any = { status };
    if (designerId) update.designer_id = designerId;

    const { error } = await supabase
      .from('client_queries')
      .update(update)
      .eq('id', queryId);
    if (error) throw error;
  },

  // Chat/Messaging
  async getChatMessages(parentId: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('parent_id', parentId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async sendMessage(message: { parent_id: string; sender_id: string; message?: string; image_url?: string }) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([message])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  subscribeToChat(parentId: string, onMessage: (message: any) => void) {
    return supabase
      .channel(`chat:${parentId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages',
        filter: `parent_id=eq.${parentId}`
      }, (payload) => {
        onMessage(payload.new);
      })
      .subscribe();
  }
};
