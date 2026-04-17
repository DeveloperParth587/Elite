import React from 'react';
import { 
  Palette, 
  Users, 
  Lock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Loader2,
  Diamond
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface AuthScreenProps {
  onLogin: (role: 'designer' | 'client') => void;
}

export function AuthScreen({ onLogin }: AuthScreenProps) {
  const [activeTab, setActiveTab] = React.useState<'designer' | 'client'>('designer');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleEmailLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // If user doesn't exist, try signing up
        if (error.message.includes('Invalid login credentials')) {
          const isSpecialAdmin = email === 'admin123@gmail.com';
          const assignedRole = isSpecialAdmin ? 'designer' : activeTab;

          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { role: assignedRole }
            }
          });
          
          if (signUpError) throw signUpError;
          
          // Create profile record if signup successful
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('profiles').insert([
              { id: user.id, role: assignedRole, email: user.email }
            ]);
          }
          
          toast.success("Account created successfully!");
        } else {
          throw error;
        }
      } else {
        toast.success("Welcome back!");
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      // Redirect happens automatically unless skipBrowserRedirect is used
    } catch (error: any) {
      toast.error(error.message || "Google login failed");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-brand-bg">
      {/* Visual Side */}
      <div className="hidden lg:flex relative bg-brand-olive overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[140px] -mr-64 -mt-64" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=2600')] opacity-30 bg-cover bg-center grayscale mix-blend-overlay" />
        </div>
        
        <div className="relative z-10 w-full max-w-xl">
           <div className="flex items-center gap-4 mb-20">
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.15)] transform -rotate-3 border border-brand-border">
                <Diamond className="h-8 w-8 text-brand-olive fill-brand-olive/10" />
              </div>
              <div>
                <span className="text-4xl font-serif text-white tracking-[0.1em] uppercase block">Elite Design</span>
                <span className="text-[10px] font-bold text-brand-clay uppercase tracking-[0.5em] mt-1 block">Signature Studio</span>
              </div>
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
        <div className="w-full max-w-sm space-y-12">
           <div className="text-center lg:text-left space-y-2">
              <h2 className="text-5xl font-serif text-brand-ink leading-tight italic">Portal Access</h2>
              <p className="text-neutral-500 font-medium text-sm tracking-tight">Authenticating your signature workflow.</p>
           </div>
 
           <div className="bg-brand-sidebar/40 p-1.5 rounded-[2rem] flex gap-1 border border-brand-border backdrop-blur-md shadow-inner">
              <button 
                onClick={() => setActiveTab('designer')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-4 px-4 rounded-[1.5rem] text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-700 ease-out",
                  activeTab === 'designer' ? "bg-brand-olive text-white shadow-2xl shadow-brand-olive/20" : "text-brand-olive/40 hover:text-brand-olive/60"
                )}
              >
                <Zap className={cn("h-4 w-4", activeTab === 'designer' ? "animate-pulse" : "")} /> Designer
              </button>
              <button 
                onClick={() => setActiveTab('client')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-4 px-4 rounded-[1.5rem] text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-700 ease-out",
                  activeTab === 'client' ? "bg-brand-olive text-white shadow-2xl shadow-brand-olive/20" : "text-brand-olive/40 hover:text-brand-olive/60"
                )}
              >
                <Users className={cn("h-4 w-4", activeTab === 'client' ? "animate-pulse" : "")} /> Client
              </button>
           </div>
 
           <Card className="border-none shadow-none bg-transparent">
              <CardContent className="p-2 space-y-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-bold text-brand-clay/60 uppercase tracking-[0.4em] ml-2">Email</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={activeTab === 'designer' ? 'alex@designer.com' : 'john@client.com'} 
                      className="w-full bg-white border border-brand-border focus:border-brand-olive focus:ring-8 focus:ring-brand-olive/5 rounded-[1.75rem] h-20 px-10 text-brand-ink font-semibold transition-all outline-none text-[16px] shadow-sm placeholder:text-neutral-300"
                    />
                 </div>
                 
                 <div className="space-y-3">
                    <label className="text-[10px] font-bold text-brand-clay/60 uppercase tracking-[0.4em] ml-2">Password</label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="w-full bg-white border border-brand-border focus:border-brand-olive focus:ring-8 focus:ring-brand-olive/5 rounded-[1.75rem] h-20 px-10 text-brand-ink font-semibold transition-all outline-none text-[16px] shadow-sm placeholder:text-neutral-300"
                    />
                 </div>
 
                 <div className="space-y-5 pt-4">
                   <Button 
                     onClick={handleEmailLogin}
                     disabled={loading}
                     className="w-full bg-brand-ink hover:bg-brand-ink/90 text-white h-16 rounded-[2rem] font-bold uppercase tracking-[0.25em] shadow-2xl shadow-brand-ink/10 group overflow-hidden relative"
                   >
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="flex items-center justify-center relative z-10"
                      >
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                          <>Initialize Session <ArrowRight className="ml-3 h-5 w-5 opacity-50 group-hover:opacity-100 transition-opacity" /></>
                        )}
                      </motion.div>
                   </Button>
                   
                   <div className="relative">
                      <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-brand-border/60" /></div>
                      <div className="relative flex justify-center text-[9px] uppercase tracking-[0.3em] font-bold"><span className="bg-brand-bg px-4 text-neutral-400">Authentic Sync</span></div>
                   </div>

                   <Button 
                     onClick={handleGoogleLogin}
                     variant="outline"
                     className="w-full border-brand-border text-brand-ink h-16 rounded-[2rem] font-bold uppercase tracking-[0.15em] hover:bg-white hover:border-brand-olive/30 shadow-sm transition-all bg-white"
                   >
                      <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Google Identity
                   </Button>
                 </div>
              </CardContent>
           </Card>
 
           <div className="text-center">
             <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.3em] opacity-40">
               Protected Workspace
             </p>
           </div>
        </div>
      </div>
    </div>
  );
}
