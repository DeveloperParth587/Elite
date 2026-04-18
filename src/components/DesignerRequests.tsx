import React from 'react';
import { 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  Clock,
  ExternalLink,
  ChevronRight,
  Filter,
  Search,
  ArrowUpRight
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { dataService } from '@/services/dataService';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { ChatSystem } from './ChatSystem';

export function DesignerRequests() {
  const [queries, setQueries] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedQuery, setSelectedQuery] = React.useState<any>(null);

  const loadQueries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const data = await dataService.getClientQueries('designer', user.id);
      setQueries(data);
    } catch (error) {
      console.error('Error loading designer queries:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadQueries();
  }, []);

  const handleAction = async (queryId: string, status: 'approved' | 'rejected') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await dataService.updateQueryStatus(queryId, status, user.id);
      toast.success(`Query ${status === 'approved' ? 'approved' : 'rejected'} successfully!`);
      loadQueries();
      if (selectedQuery?.id === queryId) {
        setSelectedQuery({ ...selectedQuery, status });
      }
    } catch (error) {
      toast.error("Failed to update status.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold px-3 py-1 rounded-lg">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-50 text-red-700 border-red-100 font-bold px-3 py-1 rounded-lg">Rejected</Badge>;
      default:
        return <Badge className="bg-amber-50 text-amber-700 border-amber-100 font-bold px-3 py-1 rounded-lg">Pending</Badge>;
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
              <span className="text-neutral-400 text-xs font-medium uppercase tracking-widest">• Internal ID: {selectedQuery.id.slice(0, 8)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-4 space-y-6">
              <Card className="rounded-3xl border-brand-border bg-white shadow-sm overflow-hidden">
                 <CardHeader className="bg-brand-sidebar/20 border-b border-brand-border">
                    <CardTitle className="text-lg font-serif italic text-brand-ink">Client Brief</CardTitle>
                 </CardHeader>
                 <CardContent className="p-6 space-y-6">
                    <div>
                       <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-clay mb-2 block">Instruction Breakdown</Label>
                       <p className="text-neutral-500 font-medium text-sm leading-relaxed">{selectedQuery.description}</p>
                    </div>
                    <div className="h-px bg-brand-border" />
                    <div>
                       <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-clay mb-1 block">Expected Revenue Goal</Label>
                       <div className="text-2xl font-bold text-brand-olive tracking-tight">₹{selectedQuery.budget.toLocaleString()}</div>
                    </div>

                    {selectedQuery.status === 'pending' && (
                       <div className="grid grid-cols-2 gap-3 pt-4 border-t border-brand-border">
                          <Button 
                            onClick={() => handleAction(selectedQuery.id, 'approved')}
                            className="bg-brand-olive text-white rounded-xl shadow-lg shadow-brand-olive/10 font-bold"
                          >
                            Approve
                          </Button>
                          <Button 
                            onClick={() => handleAction(selectedQuery.id, 'rejected')}
                            variant="outline" 
                            className="border-neutral-200 text-neutral-400 rounded-xl font-bold"
                          >
                            Ignore
                          </Button>
                       </div>
                    )}
                 </CardContent>
              </Card>

              <Card className="rounded-3xl border-brand-border bg-brand-bg/50 p-6 border-dashed">
                 <div className="flex items-center gap-2 text-brand-olive mb-3">
                    <ExternalLink className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">Global Studio Action</span>
                 </div>
                 <p className="text-[13px] text-neutral-400 font-medium leading-relaxed mb-6">Upon approval, this will be promoted to an active project. You can then begin generating AI visualizations.</p>
                 <Button disabled={selectedQuery.status !== 'approved'} className="w-full bg-brand-ink text-white rounded-xl font-bold h-12 shadow-sm">
                    Convert to Project Proposal
                 </Button>
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
      <div>
        <h1 className="text-3xl font-bold text-brand-ink tracking-tight">Incoming Opportunities</h1>
        <p className="text-neutral-500 font-medium">Review architectural briefs submitted via the Design Concierge.</p>
      </div>

      <div className="flex items-center justify-between">
         <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl border border-brand-border shadow-sm">
            <div className="flex items-center gap-2 text-brand-olive">
               <Filter className="h-4 w-4" />
               <span className="text-[10px] font-black tracking-widest uppercase">Open Requests</span>
            </div>
         </div>
      </div>

      {queries.length === 0 ? (
        <div className="h-[400px] rounded-[32px] border-2 border-dashed border-brand-border flex flex-col items-center justify-center text-center p-8 bg-brand-sidebar/10">
           <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6">
              <Clock className="h-8 w-8 text-brand-olive opacity-20" />
           </div>
           <h3 className="text-xl font-serif text-brand-ink mb-2">Workspace Quiet</h3>
           <p className="max-w-xs text-neutral-400 font-medium text-sm">No new architectural queries have been published to the studio concierge yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {queries.map((q) => (
            <Card 
              key={q.id} 
              onClick={() => setSelectedQuery(q)}
              className="group rounded-[32px] border-brand-border bg-white p-2 hover:shadow-2xl hover:shadow-brand-olive/10 hover:border-brand-olive/30 transition-all duration-500 cursor-pointer overflow-hidden ring-1 ring-brand-border/10"
            >
              <div className="aspect-[16/10] bg-brand-sidebar/30 rounded-[24px] p-6 flex flex-col justify-between relative overflow-hidden group-hover:bg-brand-sidebar/50 transition-colors">
                 <div className="relative z-10 flex items-start justify-between">
                    <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                       <ArrowUpRight className="h-5 w-5 text-brand-olive" />
                    </div>
                    {getStatusBadge(q.status)}
                 </div>
                 <div className="relative z-10">
                    <div className="text-[10px] font-black text-brand-clay uppercase tracking-[0.3em] mb-1">New Prospect</div>
                    <h3 className="text-xl font-serif text-brand-ink italic">{q.title}</h3>
                 </div>
              </div>
              <div className="p-6">
                 <div className="flex items-center justify-between">
                    <div className="text-neutral-400 text-[10px] font-bold uppercase tracking-widest">{new Date(q.created_at).toLocaleDateString()}</div>
                    <div className="font-bold text-brand-ink">₹{q.budget.toLocaleString()}</div>
                 </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Label({ children, className, ...props }: any) {
  return (
    <label className={cn("text-xs font-medium text-neutral-700", className)} {...props}>
      {children}
    </label>
  );
}
