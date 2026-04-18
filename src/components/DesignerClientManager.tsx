import React from 'react';
import { 
  UserPlus, 
  Mail, 
  Lock, 
  Shield, 
  Loader2, 
  ChevronRight,
  User,
  Search,
  Plus,
  Phone,
  Edit2,
  X
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
import { toast } from 'sonner';
import { dataService } from '@/services/dataService';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export function DesignerClientManager() {
  const [clients, setClients] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [showForm, setShowForm] = React.useState(false);
  const [editingClient, setEditingClient] = React.useState<any>(null);
  
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    full_name: '',
    phone: ''
  });

  const loadClients = async () => {
    try {
      const data = await dataService.getClients();
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadClients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      toast.error("Please provide an email address.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingClient) {
        await dataService.updateClientProfile(editingClient.id, {
          full_name: formData.full_name,
          phone: formData.phone
        });
        toast.success("Client profile updated successfully!");
      } else {
        await dataService.addMember({
          email: formData.email,
          password: formData.password || 'Client123!',
          role: 'client',
          full_name: formData.full_name,
          phone: formData.phone
        });
        toast.success("Client account initialized successfully!");
      }
      
      setFormData({ email: '', password: '', full_name: '', phone: '' });
      setShowForm(false);
      setEditingClient(null);
      loadClients();
    } catch (error: any) {
      toast.error(error.message || "Operation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (client: any) => {
    setEditingClient(client);
    setFormData({
      email: client.email,
      password: '',
      full_name: client.full_name || '',
      phone: client.phone || ''
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-brand-ink tracking-tight">Client Directory</h1>
          <p className="text-neutral-500 font-medium">Manage and onboard premium clients to your design workspace.</p>
        </div>
        {!showForm && (
          <Button 
            onClick={() => setShowForm(true)}
            className="rounded-2xl bg-brand-olive hover:bg-brand-olive/90 text-white h-14 px-8 font-bold text-[14px] shadow-xl shadow-brand-olive/10"
          >
            <Plus className="mr-3 h-5 w-5" />
            Register New Client
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {showForm ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="rounded-[40px] border-brand-border bg-white shadow-2xl overflow-hidden max-w-xl mx-auto border-none ring-1 ring-brand-border">
              <CardHeader className="bg-brand-sidebar/20 border-b border-brand-border p-10 text-center relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-4 right-4 text-neutral-400"
                  onClick={() => {
                    setShowForm(false);
                    setEditingClient(null);
                  }}
                >
                  <X className="h-5 w-5" />
                </Button>
                <div className="w-20 h-20 bg-white rounded-[28px] shadow-sm flex items-center justify-center mx-auto mb-6 border border-brand-border">
                   {editingClient ? <Edit2 className="h-10 w-10 text-brand-olive" /> : <UserPlus className="h-10 w-10 text-brand-olive" />}
                </div>
                <CardTitle className="text-3xl font-serif text-brand-ink italic">
                  {editingClient ? 'Modifier Client' : 'Client Onboarding'}
                </CardTitle>
                <CardDescription className="font-medium text-neutral-400 mt-2 text-base">
                  {editingClient ? `Updating profile for ${editingClient.email}` : 'Initialize a secure portal for your new client.'}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="p-10 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-clay ml-1">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-300" />
                        <Input 
                          placeholder="John Doe"
                          className="pl-12 rounded-2xl h-14 border-brand-border bg-brand-bg/30 focus:ring-brand-olive text-brand-ink font-medium"
                          value={formData.full_name}
                          onChange={e => setFormData({...formData, full_name: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-clay ml-1">Contact Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-300" />
                        <Input 
                          placeholder="+91 98765 43210"
                          className="pl-12 rounded-2xl h-14 border-brand-border bg-brand-bg/30 focus:ring-brand-olive text-brand-ink font-medium"
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-clay ml-1">Client Business Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-300" />
                      <Input 
                        type="email"
                        disabled={!!editingClient}
                        placeholder="client@example.com"
                        className="pl-12 rounded-2xl h-14 border-brand-border bg-brand-bg/30 focus:ring-brand-olive text-brand-ink font-medium disabled:opacity-50"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>

                  {!editingClient && (
                    <div className="space-y-3">
                      <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-clay ml-1">Secure Password (Optional)</Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-300" />
                        <Input 
                          type="password"
                          placeholder="Leave blank for 'Client123!'"
                          className="pl-12 rounded-2xl h-14 border-brand-border bg-brand-bg/30 focus:ring-brand-olive text-brand-ink font-medium"
                          value={formData.password}
                          onChange={e => setFormData({...formData, password: e.target.value})}
                        />
                      </div>
                      <p className="text-[10px] text-neutral-400 italic px-2">Passwords must be at least 6 characters long.</p>
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-4 pt-4">
                    <Button 
                      type="submit"
                      disabled={submitting}
                      className="w-full h-16 bg-brand-olive hover:bg-brand-olive/90 text-white rounded-[24px] font-bold text-base shadow-xl shadow-brand-olive/10 transition-all hover:scale-[1.02]"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        editingClient ? "Update Client Data" : "Activate Client Access"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </form>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
               [1, 2, 3].map(i => (
                 <div key={i} className="h-48 rounded-[32px] bg-white animate-pulse border border-brand-border" />
               ))
            ) : clients.length === 0 ? (
              <div className="col-span-full h-64 rounded-[32px] border-2 border-dashed border-brand-border flex flex-col items-center justify-center text-center p-8 bg-brand-sidebar/10">
                 <Search className="h-10 w-10 text-brand-olive opacity-20 mb-4" />
                 <h3 className="text-xl font-serif text-brand-ink italic">No clients registered yet</h3>
                 <p className="text-neutral-400 font-medium text-sm mt-1">Start by adding your first client to the studio.</p>
              </div>
            ) : (
              clients.map((client) => (
                <Card key={client.id} className="group rounded-[32px] border-brand-border bg-white p-6 hover:shadow-2xl hover:shadow-brand-olive/10 hover:border-brand-olive/30 transition-all duration-500 overflow-hidden ring-1 ring-brand-border/10">
                   <div className="flex items-start justify-between mb-8">
                      <div className="w-14 h-14 bg-brand-sidebar/50 rounded-2xl flex items-center justify-center text-brand-olive group-hover:bg-brand-olive group-hover:text-white transition-all duration-300">
                         <User className="h-7 w-7" />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => startEdit(client)}
                          className="rounded-full h-8 w-8 text-neutral-300 hover:text-brand-olive hover:bg-brand-bg transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1">Active</Badge>
                      </div>
                   </div>
                   <div className="space-y-1">
                      <h3 className="text-lg font-bold text-brand-ink truncate">{client.full_name || client.email.split('@')[0]}</h3>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-clay leading-none">{client.email}</p>
                   </div>
                   <div className="mt-8 pt-6 border-t border-brand-border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                           <span className="text-[9px] font-bold text-neutral-300 uppercase tracking-widest leading-none mb-1">Contact</span>
                           <span className="text-xs font-bold text-neutral-500">{client.phone || 'No phone set'}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-neutral-300 hover:text-brand-olive hover:bg-brand-bg transition-colors">
                         <ChevronRight className="h-5 w-5" />
                      </Button>
                   </div>
                </Card>
              ))
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Badge({ children, className, ...props }: any) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", className)} {...props}>
      {children}
    </span>
  );
}
