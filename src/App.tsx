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
