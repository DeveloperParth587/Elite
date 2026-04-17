import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  ArrowUpRight,
  Maximize2,
  ListOrdered,
  ChevronRight,
  ChevronLeft,
  Send
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

import { dataService } from '@/services/dataService';
import { supabase } from '@/lib/supabase';

export function ClientDashboard() {
  const [projects, setProjects] = React.useState<any[]>([]);
  const [selectedProject, setSelectedProject] = React.useState<any>(null);
  const [comment, setComment] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadClientData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const dbProjects = await dataService.getProjects('client', user.id);
        
        // Fetch the latest active design for each project
        const projectsWithDesigns = await Promise.all(dbProjects.map(async (p) => {
          const designs = await dataService.getDesigns(p.id);
          const latestDesign = designs[0]; // Assuming latest is first
          return {
            ...p,
            latestDesign
          };
        }));

        setProjects(projectsWithDesigns);
      } catch (error) {
        console.error('Error loading client dashboard:', error);
      } finally {
        setLoading(false);
      }
    }
    loadClientData();
  }, []);

  const handleAction = async (type: 'approve' | 'reject') => {
    if (!selectedProject?.latestDesign) return;
    
    try {
      const status = type === 'approve' ? 'approved' : 'rejected';
      await dataService.updateDesignStatus(selectedProject.latestDesign.id, status);
      toast.success(`Project ${type === 'approve' ? 'approved' : 'rejected'} successfully!`);
      
      // Update local state
      setProjects(projects.map(p => 
        p.id === selectedProject.id 
          ? { ...p, latestDesign: { ...p.latestDesign, status } }
          : p
      ));
      setSelectedProject(null);
    } catch (error) {
      toast.error("Failed to update status.");
    }
  };

  const handleSendComment = () => {
    if (!comment.trim()) return;
    toast.success("Feedback sent to designer.");
    setComment('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Design Review Portal</h1>
          <p className="text-slate-500">View and approve your custom furniture designs.</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!selectedProject ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {projects.map((project) => (
              <Card 
                key={project.id} 
                className="group relative overflow-hidden border-brand-border hover:border-brand-olive/30 shadow-sm hover:shadow-2xl hover:shadow-brand-olive/5 transition-all duration-500 cursor-pointer rounded-3xl bg-white"
                onClick={() => project.latestDesign && setSelectedProject(project)}
              >
                <div className="aspect-square relative overflow-hidden">
                   <img src={project.latestDesign?.image_url || 'https://picsum.photos/seed/placeholder/800/600'} alt={project.project_name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                   <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/40 to-transparent" />
                   <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                     <Badge className={cn(
                       "border-none px-3 py-1 font-bold text-[10px] tracking-widest uppercase",
                       project.latestDesign?.status === 'pending' ? "bg-brand-clay text-white shadow-lg shadow-brand-clay/20" : "bg-neutral-500 text-white"
                     )}>
                       {project.latestDesign?.status === 'pending' ? 'Action Required' : project.latestDesign?.status || 'No Design'}
                     </Badge>
                     <span className="text-white font-bold text-xl drop-shadow-md">₹{project.budget.toLocaleString()}</span>
                   </div>
                </div>
                <CardHeader className="p-6">
                  <CardTitle className="text-xl font-serif text-brand-ink group-hover:text-brand-olive transition-colors">{project.project_name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1 font-medium text-neutral-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-clay" />
                    ID: {project.id.slice(0, 8)}
                  </CardDescription>
                </CardHeader>
                <div className="px-6 pb-6 mt-auto">
                    <Button variant="outline" className="w-full rounded-xl border-brand-border group-hover:bg-brand-bg group-hover:border-brand-olive/50 group-hover:text-brand-olive transition-all font-bold text-[11px] uppercase tracking-[0.15em] h-11">
                      {project.latestDesign ? 'Explore Design' : 'Pending Designer'}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
              </Card>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Project Details Column */}
            <div className="lg:col-span-8 space-y-8">
              <Card className="rounded-3xl border-brand-border overflow-hidden bg-white shadow-sm border-none ring-1 ring-brand-border">
                <div className="aspect-[21/10] relative">
                  <img src={selectedProject.latestDesign.image_url} alt={selectedProject.project_name} className="w-full h-full object-cover" />
                  <Button 
                    variant="ghost" 
                    onClick={() => setSelectedProject(null)}
                    className="absolute top-6 left-6 bg-white/90 backdrop-blur-md rounded-full h-12 w-12 p-0 shadow-lg text-brand-olive hover:bg-white"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                </div>
                <CardHeader className="p-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
                    <div>
                      <div className="text-[10px] font-bold text-brand-clay uppercase tracking-[0.3em] mb-2 font-sans">Project Proposal</div>
                      <CardTitle className="text-4xl font-serif text-brand-ink">{selectedProject.project_name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-4 bg-brand-sidebar/30 p-4 rounded-2xl border border-brand-border">
                       <div className="text-right">
                         <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Approved Budget</div>
                         <div className="text-3xl font-bold text-brand-olive tracking-tight leading-none">₹{selectedProject.budget.toLocaleString()}</div>
                       </div>
                    </div>
                  </div>
                  <CardDescription className="text-lg font-medium text-neutral-500 max-w-2xl leading-relaxed">
                    A thoughtfully curated furniture system tailored for your workspace environment. Please examine the architectural breakdown and materiality below.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 border-t border-brand-border bg-brand-bg/10">
                  <div className="p-10">
                     <div className="flex items-center gap-3 mb-8">
                       <div className="p-2 bg-brand-olive/10 rounded-lg">
                        <ListOrdered className="h-5 w-5 text-brand-olive" />
                       </div>
                       <h3 className="text-xl font-serif text-brand-ink italic">Material Specification</h3>
                     </div>
                     <div className="rounded-2xl border border-brand-border overflow-hidden bg-white shadow-sm">
                        <Table>
                          <TableHeader className="bg-brand-sidebar/20">
                            <TableRow className="hover:bg-transparent border-brand-border">
                              <TableHead className="font-bold text-brand-clay uppercase text-[10px] tracking-widest h-12">Component</TableHead>
                              <TableHead className="font-bold text-brand-clay uppercase text-[10px] tracking-widest h-12">Specification</TableHead>
                              <TableHead className="font-bold text-brand-clay uppercase text-[10px] tracking-widest h-12">Qty</TableHead>
                              <TableHead className="text-right font-bold text-brand-clay uppercase text-[10px] tracking-widest pr-8 h-12">Investment</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedProject.latestDesign.materials_json.map((m: any, i: number) => (
                              <TableRow key={i} className="hover:bg-brand-bg/30 transition-colors border-brand-border">
                                <TableCell className="font-bold text-brand-ink py-5 pl-6">{m.item}</TableCell>
                                <TableCell className="text-neutral-500 font-medium italic">{m.material}</TableCell>
                                <TableCell className="font-bold text-brand-ink">{m.qty} {m.unit}</TableCell>
                                <TableCell className="text-right pr-8 font-bold text-brand-olive">₹{(m.qty * (m.cost || 500)).toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                     </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Actions Column */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="rounded-3xl border-brand-border shadow-sm sticky top-8 bg-white overflow-hidden">
                <CardHeader className="bg-brand-sidebar/30 border-b border-brand-border">
                  <CardTitle className="text-xl font-serif text-brand-ink italic">Approval Console</CardTitle>
                  <CardDescription className="font-medium text-neutral-400">Decision required for timeline commitment.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-3">
                    <Button 
                      onClick={() => handleAction('approve')}
                      className="w-full bg-brand-olive hover:bg-brand-olive/90 text-white h-16 rounded-2xl font-bold text-[14px] shadow-xl shadow-brand-olive/10"
                    >
                      <CheckCircle2 className="mr-3 h-6 w-6" />
                      Accept Proposal
                    </Button>
                    <Button 
                      onClick={() => handleAction('reject')}
                      variant="outline" 
                      className="w-full border-brand-clay text-brand-clay hover:bg-brand-clay/5 h-16 rounded-2xl font-bold text-[14px]"
                    >
                      <XCircle className="mr-3 h-6 w-6" />
                      Decline & Restart
                    </Button>
                  </div>

                  <div className="h-px bg-brand-border" />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">Request Adjustment</Label>
                      <Badge className="bg-brand-bg text-brand-olive border-none text-[9px] font-black tracking-widest px-2 py-0.5">PRIORITY</Badge>
                    </div>
                    <Textarea 
                      placeholder="Share your aesthetic feedback or functional changes..." 
                      className="min-h-[140px] rounded-xl border-brand-border focus:ring-brand-olive bg-brand-bg/30 resize-none text-[14px] p-5 font-medium placeholder:text-neutral-300"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <Button 
                      onClick={handleSendComment}
                      className="w-full bg-brand-ink hover:bg-brand-ink/90 text-white h-12 rounded-xl shadow-sm font-bold tracking-tight"
                      disabled={!comment.trim()}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Publish Feedback
                    </Button>
                  </div>

                  <div className="p-5 bg-brand-sidebar/40 rounded-2xl border border-brand-border">
                    <div className="flex items-center gap-2 text-brand-olive mb-3">
                       <MessageSquare className="h-4 w-4" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Architectural Chat</span>
                    </div>
                    <div className="space-y-4">
                       <div className="text-[13px] leading-relaxed">
                          <span className="font-bold text-brand-ink block mb-0.5 font-serif italic text-sm">Designer Alex:</span>
                          <span className="text-neutral-500 font-medium">"I've optimized the layout for the mirror glass panels to enhance natural light reflection."</span>
                       </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
