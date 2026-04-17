import React from 'react';
import { 
  UserPlus, 
  Users, 
  Shield, 
  Mail, 
  Lock,
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronLeft
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';
import { dataService } from '@/services/dataService';
import { motion } from 'motion/react';

interface AdminMemberManagerProps {
  onBack: () => void;
}

export function AdminMemberManager({ onBack }: AdminMemberManagerProps) {
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    role: 'designer' as 'designer' | 'client'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      toast.error("Email is required");
      return;
    }

    setLoading(true);
    try {
      await dataService.addMember(formData);
      toast.success(`Successfully added ${formData.email} as a ${formData.role}`);
      setFormData({ email: '', password: '', role: 'designer' });
    } catch (error: any) {
      console.error("Error adding member:", error);
      toast.error(error.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full hover:bg-slate-100">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Member Management</h1>
          <p className="text-slate-500 text-sm">Onboard new designers and clients to the studio.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          <Card className="border-brand-border shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="bg-brand-sidebar/30 border-b border-brand-border px-8 py-6">
              <CardTitle className="text-xl font-serif text-brand-ink flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-brand-olive" />
                Add New Member
              </CardTitle>
              <CardDescription className="text-neutral-400 font-medium tracking-tight">Configure account credentials and studio role.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="mem-email" className="text-[11px] font-bold uppercase tracking-wider text-brand-clay">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input 
                      id="mem-email"
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="rounded-xl pl-11 h-12 border-brand-border bg-brand-bg/30 focus:ring-brand-olive"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mem-pass" className="text-[11px] font-bold uppercase tracking-wider text-brand-clay">Password (Optional)</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input 
                      id="mem-pass"
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="rounded-xl pl-11 h-12 border-brand-border bg-brand-bg/30 focus:ring-brand-olive"
                    />
                  </div>
                  <p className="text-[10px] text-neutral-400 font-medium pl-1 italic">Defaults to "Welcome123!" if left blank.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mem-role" className="text-[11px] font-bold uppercase tracking-wider text-brand-clay">Studio Role</Label>
                  <Select value={formData.role} onValueChange={(v: any) => setFormData({ ...formData, role: v })}>
                    <SelectTrigger id="mem-role" className="rounded-xl h-12 border-brand-border bg-brand-bg/30">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="designer">Studio Designer</SelectItem>
                      <SelectItem value="client">Premium Client</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-14 bg-brand-olive hover:bg-brand-olive/90 text-white rounded-xl font-bold text-[14px] shadow-lg shadow-brand-olive/10"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <UserPlus className="mr-2 h-5 w-5" />
                  )}
                  Initialize Member Account
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <Card className="border-brand-border shadow-sm rounded-2xl bg-white p-8">
            <h3 className="text-xl font-serif text-brand-ink italic mb-6">Permission Profiles</h3>
            <div className="space-y-4">
              <div className="flex gap-4 p-5 rounded-2xl bg-brand-bg/40 border border-brand-border group hover:bg-brand-bg transition-colors">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-brand-olive shrink-0">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-brand-ink mb-1">Studio Designer</h4>
                  <p className="text-xs text-neutral-500 leading-relaxed font-medium">Full access to AI furniture generation, BOM calculation, Excel exports, and project management dashboards.</p>
                </div>
              </div>

              <div className="flex gap-4 p-5 rounded-2xl bg-brand-bg/40 border border-brand-border group hover:bg-brand-bg transition-colors">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-brand-clay shrink-0">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-brand-ink mb-1">Premium Client</h4>
                  <p className="text-xs text-neutral-500 leading-relaxed font-medium">Access to the Design Review Portal. Can view, comment on, and approve/reject project proposals sent by designers.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-10 p-6 bg-brand-sidebar/30 rounded-2xl border border-brand-border border-dashed">
               <div className="flex items-center gap-3 text-brand-olive mb-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Global Security Protocol</span>
               </div>
               <p className="text-sm text-neutral-500 font-medium italic">All accounts are created with encrypted identity tokens and immediate database row-level security enabled.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
