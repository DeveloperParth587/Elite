/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { DesignerDashboard } from './components/DesignerDashboard';
import { AIDesignGenerator } from './components/AIDesignGenerator';
import { ClientDashboard } from './components/ClientDashboard';
import { AuthScreen } from './components/AuthScreen';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<'designer' | 'client' | null>(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      setUserRole(data.role);
      
      // Auto-open admin page for the specific admin user
      const user = (await supabase.auth.getUser()).data.user;
      if (user?.email === 'admin123@gmail.com') {
        setActiveSection('admin');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback or handle error
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.info("Logged out successfully");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-olive"></div>
      </div>
    );
  }

  if (!session || !userRole) {
    return (
      <>
        <AuthScreen onLogin={() => {}} />
        <Toaster position="top-center" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg flex text-brand-ink">
      <Sidebar 
        role={userRole} 
        userEmail={session.user.email}
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
        onLogout={handleLogout}
      />
      
      <main className="flex-1 lg:pl-60 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-10 lg:py-16">
          {userRole === 'designer' ? (
            <>
              {activeSection === 'dashboard' && (
                <DesignerDashboard onNewDesign={() => setActiveSection('new-design')} />
              )}
              {activeSection === 'admin' && (
                <div className="space-y-8 animate-in fade-in duration-700">
                  <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-serif text-brand-ink italic">Admin Control Center</h1>
                    <p className="text-neutral-500 font-medium">Global studio configurations and system management.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-brand-border bg-white shadow-sm rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-16 h-16 bg-brand-olive/10 rounded-full flex items-center justify-center text-brand-olive font-serif italic text-2xl">M</div>
                      <div>
                        <h3 className="font-bold text-brand-ink">Member Access</h3>
                        <p className="text-xs text-neutral-400 mt-1">Manage designer permissions</p>
                      </div>
                      <Button variant="outline" className="w-full rounded-xl border-dashed border-neutral-300">Configure</Button>
                    </Card>
                    <Card className="border-brand-border bg-white shadow-sm rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-16 h-16 bg-brand-clay/10 rounded-full flex items-center justify-center text-brand-clay font-serif italic text-2xl">S</div>
                      <div>
                        <h3 className="font-bold text-brand-ink">System Logs</h3>
                        <p className="text-xs text-neutral-400 mt-1">Audit generation activity</p>
                      </div>
                      <Button variant="outline" className="w-full rounded-xl border-dashed border-neutral-300">View Logs</Button>
                    </Card>
                    <Card className="border-brand-border bg-white shadow-sm rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 border-dashed border-2">
                      <PlusCircle className="h-10 w-10 text-neutral-200" />
                      <div className="text-neutral-400 text-sm font-medium">Add System Hook</div>
                    </Card>
                  </div>
                </div>
              )}
              {activeSection === 'new-design' && (
                <AIDesignGenerator onBack={() => setActiveSection('dashboard')} />
              )}
              {activeSection === 'projects' && (
                <div className="flex flex-col items-center justify-center h-[60vh] text-neutral-400">
                   <p className="text-3xl font-serif italic mb-2">Project Library</p>
                   <p className="text-sm font-medium tracking-wide uppercase">Workspace synchronization active</p>
                </div>
              )}
            </>
          ) : (
            <>
              {activeSection === 'dashboard' && <ClientDashboard />}
              {activeSection !== 'dashboard' && (
                <div className="flex flex-col items-center justify-center h-[60vh] text-neutral-400">
                   <p className="text-3xl font-serif italic mb-2">{activeSection}</p>
                   <p className="text-sm font-medium tracking-wide uppercase">Fetching architectural data...</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Toaster position="bottom-right" richColors />
    </div>
  );
}
