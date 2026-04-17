import React from 'react';
import { 
  Palette, 
  Users, 
  Lock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface AuthScreenProps {
  onLogin: (role: 'designer' | 'client') => void;
}

export function AuthScreen({ onLogin }: AuthScreenProps) {
  const [activeTab, setActiveTab] = React.useState<'designer' | 'client'>('designer');

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-brand-bg">
      {/* Visual Side */}
      <div className="hidden lg:flex relative bg-brand-olive overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[140px] -mr-64 -mt-64" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=2600')] opacity-30 bg-cover bg-center grayscale mix-blend-overlay" />
        </div>
        
        <div className="relative z-10 w-full max-w-xl">
           <div className="flex items-center gap-3 mb-16">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl shadow-black/10">
                <Palette className="h-6 w-6 text-brand-olive" />
              </div>
              <span className="text-3xl font-serif text-white tracking-tight uppercase">AuraDesign AI</span>
           </div>
 
           <motion.div 
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             className="space-y-8"
           >
             <h1 className="text-7xl font-serif text-white leading-[0.9] italic">
               The Art of <br/>
               <span className="text-brand-clay opacity-80">Living Well.</span>
             </h1>
             <p className="text-brand-bg/60 text-xl leading-relaxed max-w-lg font-medium">
               An architectural workspace for interior designers and their global clientele to collaborate in natural harmony.
             </p>
 
             <div className="grid grid-cols-2 gap-12 pt-12 border-t border-white/10">
                <div className="space-y-1">
                   <div className="text-brand-clay font-serif italic text-4xl">40ms</div>
                   <div className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">AI Generation Rate</div>
                </div>
                <div className="space-y-1">
                   <div className="text-white font-serif italic text-4xl">2.4k</div>
                   <div className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">Studios Integrated</div>
                </div>
             </div>
           </motion.div>
        </div>
      </div>
 
      {/* Auth Side */}
      <div className="flex items-center justify-center p-6 md:p-12 lg:p-32 bg-brand-bg z-10">
        <div className="w-full max-w-sm space-y-10">
           <div className="text-center lg:text-left">
              <h2 className="text-4xl font-serif text-brand-ink mb-3 italic">Portal Access</h2>
              <p className="text-neutral-400 font-medium text-sm">Experience the AI-driven workflow signature.</p>
           </div>
 
           <div className="bg-brand-sidebar/50 p-2 rounded-2xl flex gap-1 border border-brand-border backdrop-blur-sm">
              <button 
                onClick={() => setActiveTab('designer')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-500",
                  activeTab === 'designer' ? "bg-brand-olive text-white shadow-xl shadow-brand-olive/10" : "text-brand-olive/50"
                )}
              >
                <Zap className="h-4 w-4" /> Designer
              </button>
              <button 
                onClick={() => setActiveTab('client')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-500",
                  activeTab === 'client' ? "bg-brand-olive text-white shadow-xl shadow-brand-olive/10" : "text-brand-olive/50"
                )}
              >
                <Users className="h-4 w-4" /> Client
              </button>
           </div>
 
           <Card className="border-none shadow-none bg-transparent">
              <CardContent className="p-0 space-y-5">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-brand-clay uppercase tracking-[0.3em] font-sans">Business Identity</label>
                    <input 
                      type="email" 
                      defaultValue={activeTab === 'designer' ? 'alex@designer.com' : 'john@client.com'} 
                      className="w-full bg-white border border-brand-border focus:border-brand-olive focus:bg-white rounded-xl h-14 px-5 text-brand-ink font-bold transition-all outline-none text-[15px] shadow-sm"
                    />
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-brand-clay uppercase tracking-[0.3em] font-sans">Security Key</label>
                    <input 
                      type="password" 
                      defaultValue="password123" 
                      className="w-full bg-white border border-brand-border focus:border-brand-olive focus:bg-white rounded-xl h-14 px-5 text-brand-ink font-bold transition-all outline-none text-[15px] shadow-sm"
                    />
                 </div>
 
                 <Button 
                   onClick={() => onLogin(activeTab)}
                   className="w-full bg-brand-ink hover:bg-brand-ink/90 text-white h-16 rounded-2xl font-bold uppercase tracking-[0.2em] shadow-2xl shadow-brand-ink/5 mt-4"
                 >
                    Initialize Session <ArrowRight className="ml-3 h-5 w-5" />
                 </Button>
              </CardContent>
           </Card>
 
           <div className="p-6 bg-brand-sidebar/30 rounded-2xl border border-brand-border text-[12px] text-neutral-400 font-medium leading-relaxed">
             <div className="flex gap-4">
               <ShieldCheck className="h-5 w-5 text-brand-olive shrink-0 opacity-40" />
               <p>Architectural sessions are encrypted via Supabase Auth. Sync requires valid VITE_SUPABASE keys.</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
