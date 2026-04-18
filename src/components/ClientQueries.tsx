import React from 'react';
import { 
  Send, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Plus,
  MessageSquare,
  Search,
  Filter,
  ChevronRight,
  ArrowRight
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { dataService } from '@/services/dataService';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { ChatSystem } from './ChatSystem';

export function ClientQueries() {
  const [queries, setQueries] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [selectedQuery, setSelectedQuery] = React.useState<any>(null);
  
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    budget: ''
  });

  const loadQueries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const data = await dataService.getClientQueries('client', user.id);
      setQueries(data);
    } catch (error) {
      console.error('Error loading queries:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadQueries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      await dataService.createClientQuery({
        title: formData.title,
        description: formData.description,
        budget: parseInt(formData.budget) || 0,
        client_id: user.id
      });

      toast.success("Query submitted successfully!");
      setFormData({ title: '', description: '', budget: '' });
      setShowForm(false);
      loadQueries();
    } catch (error) {
      toast.error("Failed to submit query.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold px-3 py-1 rounded-lg">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-50 text-red-700 border-red-100 font-bold px-3 py-1 rounded-lg">Declined</Badge>;
      default:
        return <Badge className="bg-amber-50 text-amber-700 border-amber-100 font-bold px-3 py-1 rounded-lg">Pending Review</Badge>;
    }
  };

  if (selectedQuery) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setSelectedQuery(null)} className="rounded-full h-10 w-10 p-0 hover:bg-white border border-brand-border">
            <ChevronRight className="h-5 w-5 rotate-180" />
          </Button>
          <div>
            <h1 className="text-3xl font-serif text-brand-ink">{selectedQuery.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge(selectedQuery.status)}
              <span className="text-neutral-400 text-xs font-medium uppercase tracking-widest">• Submitted {new Date(selectedQuery.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <Card className="rounded-3xl border-brand-border bg-white shadow-sm overflow-hidden">
               <CardHeader className="bg-brand-sidebar/20 border-b border-brand-border">
                 <CardTitle className="text-lg font-serif italic text-brand-ink">Objective Details</CardTitle>
               </CardHeader>
               <CardContent className="p-6 space-y-6">
                 <div>
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-clay mb-2 block">Description</Label>
                    <p className="text-neutral-500 font-medium text-sm leading-relaxed">{selectedQuery.description}</p>
                 </div>
                 <div className="h-px bg-brand-border" />
                 <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-clay mb-1 block">Expected Budget</Label>
                      <div className="text-2xl font-bold text-brand-olive tracking-tight">₹{selectedQuery.budget.toLocaleString()}</div>
                    </div>
                 </div>
               </CardContent>
            </Card>

            <Card className="rounded-3xl border-brand-border bg-brand-olive text-white p-8 shadow-xl shadow-brand-olive/10">
               <h3 className="font-serif italic text-xl mb-2">Architectural Support</h3>
               <p className="text-white/70 text-sm font-medium leading-relaxed mb-6">Our senior designers will review your query and provide a preliminary concept visualization shortly.</p>
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/50">Response Time: ~24 Hours</div>
               </div>
            </Card>
          </div>

          <div className="lg:col-span-8">
             <ChatSystem parentId={selectedQuery.id} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-brand-ink tracking-tight">Design Concierge</h1>
          <p className="text-neutral-500 font-medium">Connect with elite designers for your custom interior requirements.</p>
        </div>
        {!showForm && (
          <Button 
            onClick={() => setShowForm(true)}
            className="rounded-2xl bg-brand-olive hover:bg-brand-olive/90 text-white h-14 px-8 font-bold text-[14px] shadow-xl shadow-brand-olive/10"
          >
            <Plus className="mr-3 h-5 w-5" />
            Initialize New Query
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
            <Card className="rounded-3xl border-brand-border bg-white shadow-xl overflow-hidden max-w-2xl mx-auto border-none ring-1 ring-brand-border">
              <CardHeader className="bg-brand-sidebar/20 border-b border-brand-border p-8 text-center">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-brand-border">
                   <MessageSquare className="h-8 w-8 text-brand-olive" />
                </div>
                <CardTitle className="text-3xl font-serif text-brand-ink italic">Conceptual Brief</CardTitle>
                <CardDescription className="font-medium text-neutral-400">Share your vision with our architectural team.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-[11px] font-bold uppercase tracking-wider text-brand-clay">Project Title</Label>
                  <Input 
                    id="title"
                    placeholder="e.g. Minimalist Bedroom Transformation"
                    className="rounded-xl h-12 border-brand-border bg-brand-bg/30 focus:ring-brand-olive"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <Label htmlFor="budget" className="text-[11px] font-bold uppercase tracking-wider text-brand-clay">Estimated Budget (₹)</Label>
                      <Input 
                        id="budget"
                        type="number"
                        placeholder="50000"
                        className="rounded-xl h-12 border-brand-border bg-brand-bg/30 focus:ring-brand-olive"
                        value={formData.budget}
                        onChange={e => setFormData({...formData, budget: e.target.value})}
                      />
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-brand-clay">Priority Level</Label>
                      <div className="h-12 flex items-center px-4 bg-brand-bg/30 rounded-xl border border-brand-border text-brand-olive text-sm font-bold">Standard Delivery</div>
                   </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc" className="text-[11px] font-bold uppercase tracking-wider text-brand-clay">Requirement Breakdown</Label>
                  <Textarea 
                    id="desc"
                    placeholder="Describe your space, style preferences, and specific furniture needs..."
                    className="min-h-[160px] rounded-xl border-brand-border bg-brand-bg/30 focus:ring-brand-olive resize-none p-5 text-sm leading-relaxed"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                
                <div className="flex flex-col gap-3 pt-4">
                  <Button 
                    onClick={handleSubmit}
                    className="w-full h-14 bg-brand-olive hover:bg-brand-olive/90 text-white rounded-2xl font-bold text-[14px] shadow-xl shadow-brand-olive/10"
                  >
                    <Send className="mr-3 h-5 w-5" />
                    Publish Brief to Studio
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowForm(false)}
                    className="w-full h-12 rounded-xl text-brand-clay font-bold text-[12px] uppercase tracking-widest hover:bg-brand-bg"
                  >
                    Discard Draft
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* List side */}
            <div className="lg:col-span-12 space-y-4">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl border border-brand-border shadow-sm">
                    <div className="flex items-center gap-2 text-brand-olive">
                       <Filter className="h-4 w-4" />
                       <span className="text-[10px] font-black tracking-widest uppercase">All Active Queries</span>
                    </div>
                 </div>
                 <div className="text-neutral-400 text-[10px] font-bold tracking-[0.2em] uppercase">{queries.length} Total Projects</div>
              </div>

              {queries.length === 0 ? (
                <div className="h-[400px] rounded-[32px] border-2 border-dashed border-brand-border flex flex-col items-center justify-center text-center p-8 bg-brand-sidebar/10">
                   <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6">
                      <Search className="h-8 w-8 text-brand-olive opacity-20" />
                   </div>
                   <h3 className="text-xl font-serif text-brand-ink mb-2">No Active Queries</h3>
                   <p className="max-w-xs text-neutral-400 font-medium text-sm">Submit your first query to our elite design pool to start your visualization journey.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {queries.map((q) => (
                    <Card 
                      key={q.id} 
                      onClick={() => setSelectedQuery(q)}
                      className="group rounded-[32px] border-brand-border bg-white p-2 hover:shadow-2xl hover:shadow-brand-olive/10 hover:border-brand-olive/30 transition-all duration-500 cursor-pointer overflow-hidden ring-1 ring-brand-border/10"
                    >
                      <div className="aspect-[16/10] bg-brand-sidebar/30 rounded-[24px] p-6 flex flex-col justify-between relative overflow-hidden group-hover:bg-brand-sidebar/50 transition-colors">
                         <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
                            <MessageSquare className="w-24 h-24 text-brand-olive" />
                         </div>
                         <div className="relative z-10 flex items-start justify-between">
                            <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                               <Plus className="h-5 w-5 text-brand-olive" />
                            </div>
                            {getStatusBadge(q.status)}
                         </div>
                         <div className="relative z-10">
                            <div className="text-[10px] font-black text-brand-clay uppercase tracking-[0.3em] mb-1">Architecture</div>
                            <h3 className="text-xl font-serif text-brand-ink italic group-hover:translate-x-1 transition-transform">{q.title}</h3>
                         </div>
                      </div>
                      <div className="p-6">
                         <div className="flex items-center justify-between">
                            <div className="flex -space-x-2">
                               <div className="w-8 h-8 rounded-full border-2 border-white bg-brand-olive/10 flex items-center justify-center shadow-sm">
                                  <Badge className="bg-transparent text-brand-olive p-0 hover:bg-transparent">
                                     <ArrowRight className="h-3 w-3" />
                                  </Badge>
                               </div>
                            </div>
                            <div className="text-right">
                               <div className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest mb-0.5">Investment</div>
                               <div className="font-bold text-brand-ink">₹{q.budget.toLocaleString()}</div>
                            </div>
                         </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
