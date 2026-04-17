/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sidebar } from './components/Sidebar';
import { DesignerDashboard } from './components/DesignerDashboard';
import { AIDesignGenerator } from './components/AIDesignGenerator';
import { ClientDashboard } from './components/ClientDashboard';
import { AuthScreen } from './components/AuthScreen';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

export default function App() {
  const [user, setUser] = React.useState<{ role: 'designer' | 'client' } | null>(null);
  const [activeSection, setActiveSection] = React.useState('dashboard');

  const handleLogin = (role: 'designer' | 'client') => {
    setUser({ role });
    setActiveSection('dashboard');
    toast.success(`Logged in as ${role === 'designer' ? 'Designer' : 'Client'}`);
  };

  const handleLogout = () => {
    setUser(null);
    toast.info("Logged out successfully");
  };

  if (!user) {
    return (
      <>
        <AuthScreen onLogin={handleLogin} />
        <Toaster position="top-center" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg flex text-brand-ink">
      <Sidebar 
        role={user.role} 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
        onLogout={handleLogout}
      />
      
      <main className="flex-1 lg:pl-60 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-10 lg:py-16">
          {user.role === 'designer' ? (
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
