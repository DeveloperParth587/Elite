import React from 'react';
import { 
  Plus, 
  Search, 
  ArrowUpRight, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  MoreHorizontal,
  PlusCircle,
  BarChart3,
  Users
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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { DesignFeedback } from './DesignFeedback';
import { 
  ArrowLeft,
  ChevronRight,
  ListOrdered
} from 'lucide-react';
import { 
  Table as UITable, 
  TableBody as UITableBody, 
  TableCell as UITableCell, 
  TableHead as UITableHead, 
  TableHeader as UITableHeader, 
  TableRow as UITableRow 
} from '@/components/ui/table';

import { dataService } from '@/services/dataService';
import { supabase } from '@/lib/supabase';

interface DesignerDashboardProps {
  onNewDesign: () => void;
}

export function DesignerDashboard({ onNewDesign }: DesignerDashboardProps) {
  const [stats, setStats] = React.useState([
    { label: 'Active Projects', value: '0', icon: Clock, color: 'text-brand-olive', bg: 'bg-brand-olive/10' },
    { label: 'Total Revenue', value: '₹0', icon: DollarSign, color: 'text-brand-clay', bg: 'bg-brand-clay/10' },
    { label: 'Pending Approvals', value: '0', icon: ArrowUpRight, color: 'text-brand-olive', bg: 'bg-brand-olive/10' },
    { label: 'Completed', value: '0', icon: CheckCircle2, color: 'text-brand-clay', bg: 'bg-brand-clay/10' },
  ]);
  const [recentProjects, setRecentProjects] = React.useState<any[]>([]);
  const [selectedProject, setSelectedProject] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [userId, setUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);

        const [dbStats, dbProjects] = await Promise.all([
          dataService.getDesignerStats(user.id),
          dataService.getProjects('designer', user.id)
        ]);

        setStats([
          { label: 'Active Projects', value: dbStats.activeProjects.toString(), icon: Clock, color: 'text-brand-olive', bg: 'bg-brand-olive/10' },
          { label: 'Total Revenue', value: `₹${(dbStats.totalRevenue / 100000).toFixed(1)}L`, icon: DollarSign, color: 'text-brand-clay', bg: 'bg-brand-clay/10' },
          { label: 'Pending Approvals', value: dbStats.pendingApprovals.toString(), icon: ArrowUpRight, color: 'text-brand-olive', bg: 'bg-brand-olive/10' },
          { label: 'Completed', value: dbStats.completed.toString(), icon: CheckCircle2, color: 'text-brand-clay', bg: 'bg-brand-clay/10' },
        ]);
        setRecentProjects(dbProjects.slice(0, 5));
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleProjectSelect = async (project: any) => {
    setLoading(true);
    try {
      const designs = await dataService.getDesigns(project.id);
      setSelectedProject({
        ...project,
        latestDesign: designs[0]
      });
    } catch (error) {
      console.error('Error loading project details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-emerald-100 text-emerald-800 border-none font-bold text-[10px] uppercase tracking-wider">Approved</Badge>;
      case 'pending': return <Badge className="bg-brand-sidebar text-brand-olive border-none font-bold text-[10px] uppercase tracking-wider">Pending</Badge>;
      case 'rejected': return <Badge className="bg-red-50 text-red-700 border-none font-bold text-[10px] uppercase tracking-wider">Rejected</Badge>;
      case 'revision': return <Badge className="bg-brand-clay/10 text-brand-clay border-none font-bold text-[10px] uppercase tracking-wider">In Revision</Badge>;
      default: return <Badge className="font-bold text-[10px] uppercase tracking-wider">{status}</Badge>;
    }
  };

  if (loading && !selectedProject) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-olive"></div>
      </div>
    );
  }

  if (selectedProject) {
    return (
      <div className="space-y-8 animate-in slide-in-from-right duration-500 pb-20">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedProject(null)}
            className="rounded-xl font-bold text-[11px] uppercase tracking-widest text-brand-clay"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Project ID:</span>
            <code className="bg-brand-sidebar/40 px-2 py-1 rounded text-[10px] font-bold border border-brand-border">{selectedProject.id.slice(0, 8)}</code>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <Card className="rounded-3xl border-brand-border overflow-hidden bg-white shadow-sm ring-1 ring-brand-border/10">
              {selectedProject.latestDesign ? (
                <>
                  <div className="aspect-[21/9] relative">
                    <img src={selectedProject.latestDesign.image_url} alt={selectedProject.project_name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/20 to-transparent" />
                  </div>
                  <div className="p-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                      <div>
                        <div className="text-[10px] font-bold text-brand-clay uppercase tracking-[0.3em] mb-2">Proposal Detail</div>
                        <h2 className="text-4xl font-serif text-brand-ink">{selectedProject.project_name}</h2>
                        <div className="mt-2 flex items-center gap-2">
                           {getStatusBadge(selectedProject.latestDesign.status)}
                           <span className="text-neutral-400 text-sm font-medium">Synced with client view</span>
                        </div>
                      </div>
                      <div className="bg-brand-sidebar/30 p-5 rounded-2xl border border-brand-border">
                        <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1 text-right">Budget Utilization</div>
                        <div className="text-2xl font-bold text-brand-olive">₹{selectedProject.budget.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="h-px bg-brand-border mb-10" />

                    <div className="space-y-8">
                       <div className="flex items-center gap-3">
                         <div className="p-2 bg-brand-olive/5 rounded-lg">
                           <ListOrdered className="h-5 w-5 text-brand-olive" />
                         </div>
                         <h3 className="text-xl font-serif text-brand-ink italic">BOM Manifest</h3>
                       </div>

                       <div className="rounded-2xl border border-brand-border overflow-hidden bg-white shadow-sm">
                          <UITable>
                            <UITableHeader className="bg-brand-bg/50">
                              <UITableRow className="hover:bg-transparent border-brand-border">
                                <UITableHead className="font-bold text-brand-clay uppercase text-[10px] tracking-widest h-12">Component</UITableHead>
                                <UITableHead className="font-bold text-brand-clay uppercase text-[10px] tracking-widest h-12">Material</UITableHead>
                                <UITableHead className="font-bold text-brand-clay uppercase text-[10px] tracking-widest h-12">Qty</UITableHead>
                                <UITableHead className="text-right font-bold text-brand-clay uppercase text-[10px] tracking-widest pr-8 h-12">Unit Cost</UITableHead>
                              </UITableRow>
                            </UITableHeader>
                            <UITableBody>
                               {selectedProject.latestDesign.materials_json.map((m: any, i: number) => (
                                <UITableRow key={i} className="hover:bg-brand-bg/30 transition-colors border-brand-border">
                                  <UITableCell className="font-bold text-brand-ink py-5 pl-6">{m.item}</UITableCell>
                                  <UITableCell className="text-neutral-500 font-medium italic">{m.material}</UITableCell>
                                  <UITableCell className="font-bold text-brand-ink">{m.qty} {m.unit}</UITableCell>
                                  <UITableCell className="text-right pr-8 font-bold text-brand-olive">₹{(m.estimated_cost_per_unit || 500).toLocaleString()}</UITableCell>
                                </UITableRow>
                              ))}
                            </UITableBody>
                          </UITable>
                       </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-20 text-center">
                   <p className="text-neutral-400 font-serif italic text-xl">No design proposals found for this project.</p>
                   <Button onClick={onNewDesign} variant="outline" className="mt-6 rounded-xl border-dashed">Start AI Generation</Button>
                </div>
              )}
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-8 space-y-6">
              {userId && selectedProject.latestDesign && (
                <div className="shadow-2xl shadow-brand-olive/5 rounded-3xl overflow-hidden">
                  <DesignFeedback 
                    parentId={selectedProject.latestDesign.id} 
                    currentUserId={userId} 
                    role="designer" 
                  />
                </div>
              )}

              <Card className="rounded-3xl border-brand-border bg-brand-sidebar/20 p-8 space-y-4">
                <h4 className="text-sm font-bold text-brand-ink uppercase tracking-wider">Client Context</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-brand-clay/10 flex items-center justify-center font-bold text-brand-clay">
                      {selectedProject.client_name?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-brand-ink">{selectedProject.client_name}</div>
                      <div className="text-[11px] text-neutral-400 font-medium tracking-tight">Active collaborator</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-serif text-brand-ink mb-1">Designer Console</h1>
          <p className="text-neutral-500 font-medium">Welcome back, Alex Thorne. Here's your workspace overview.</p>
        </div>
        <Button onClick={onNewDesign} className="bg-brand-olive hover:bg-brand-olive/90 text-white h-12 px-8 rounded-xl shadow-lg shadow-brand-olive/10 transition-all hover:-translate-y-0.5">
          <PlusCircle className="mr-2 h-5 w-5" />
          Create New Design
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-brand-border bg-white shadow-sm rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={cn("p-3 rounded-xl", stat.bg)}>
                    <stat.icon className={cn("h-6 w-6", stat.color)} />
                  </div>
                  <span className="text-2xl font-bold tracking-tight text-brand-ink">{stat.value}</span>
                </div>
                <div className="mt-4 text-[11px] font-bold uppercase tracking-wider text-brand-clay">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-brand-border bg-white shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
            <div>
              <CardTitle className="text-xl font-serif text-brand-ink">Recent Projects</CardTitle>
              <CardDescription className="text-neutral-400">Track latest furniture designs.</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input placeholder="Search projects..." className="pl-10 w-64 bg-brand-bg/50 border-brand-border rounded-lg" />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-brand-border">
                  <TableHead className="text-neutral-400 font-semibold uppercase text-[10px] tracking-widest">Project Name</TableHead>
                  <TableHead className="text-neutral-400 font-semibold uppercase text-[10px] tracking-widest">Client</TableHead>
                  <TableHead className="text-neutral-400 font-semibold uppercase text-[10px] tracking-widest">Budget</TableHead>
                  <TableHead className="text-neutral-400 font-semibold uppercase text-[10px] tracking-widest">Status</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentProjects.map((project) => (
                   <TableRow 
                    key={project.id} 
                    className="hover:bg-brand-sidebar/30 border-brand-border transition-colors cursor-pointer"
                    onClick={() => handleProjectSelect(project)}
                  >
                    <TableCell className="font-medium text-brand-ink flex items-center group">
                      {project.project_name}
                      <ChevronRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </TableCell>
                    <TableCell className="text-neutral-500">{project.client_name}</TableCell>
                    <TableCell className="font-semibold text-brand-ink">₹{project.budget.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(project.status || 'pending')}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="rounded-lg hover:bg-brand-sidebar hover:text-brand-olive text-neutral-400">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-brand-border bg-white shadow-sm rounded-2xl overflow-hidden flex flex-col">
          <CardHeader>
            <CardTitle className="text-xl font-serif text-brand-ink">Quick Tools</CardTitle>
            <CardDescription className="text-neutral-400">Common designer actions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <Button variant="outline" className="w-full justify-start h-16 rounded-xl px-4 border-brand-border hover:bg-brand-bg transition-all group border-dashed">
              <div className="w-10 h-10 rounded-lg bg-brand-olive/10 flex items-center justify-center mr-4 group-hover:bg-brand-olive/20 italic font-serif text-brand-olive font-bold text-lg transition-colors">A</div>
              <div className="text-left">
                <div className="text-sm font-bold text-brand-ink">AI Optimizer</div>
                <div className="text-[11px] text-neutral-400 font-medium tracking-tight">Optimize material consumption</div>
              </div>
            </Button>
            <Button variant="outline" className="w-full justify-start h-16 rounded-xl px-4 border-brand-border hover:bg-brand-bg transition-all group border-dashed">
              <div className="w-10 h-10 rounded-lg bg-brand-clay/10 flex items-center justify-center mr-4 group-hover:bg-brand-clay/20 transition-colors"><BarChart3 className="h-5 w-5 text-brand-clay" /></div>
              <div className="text-left">
                <div className="text-sm font-bold text-brand-ink">Export BOM</div>
                <div className="text-[11px] text-neutral-400 font-medium tracking-tight">Generate Excel inventory</div>
              </div>
            </Button>
            <Button variant="outline" className="w-full justify-start h-16 rounded-xl px-4 border-brand-border hover:bg-brand-bg transition-all group border-dashed">
              <div className="w-10 h-10 rounded-lg bg-brand-olive/10 flex items-center justify-center mr-4 group-hover:bg-brand-olive/20 transition-colors"><Users className="h-5 w-5 text-brand-olive" /></div>
              <div className="text-left">
                <div className="text-sm font-bold text-brand-ink">Consultations</div>
                <div className="text-[11px] text-neutral-400 font-medium tracking-tight">Review feedback with clients</div>
              </div>
            </Button>
          </CardContent>
          <div className="p-6 bg-brand-sidebar/50 border-t border-brand-border">
             <div className="bg-brand-olive rounded-2xl p-6 text-white relative overflow-hidden shadow-xl shadow-brand-olive/10">
                <div className="relative z-10">
                  <h4 className="font-serif italic text-xl mb-1">AuraDesign Pro</h4>
                  <p className="text-white/70 text-[11px] font-medium leading-relaxed mb-4">Unlimited AI visualization & architectural renders.</p>
                  <Button variant="secondary" size="sm" className="w-full bg-white text-brand-olive hover:bg-neutral-100 font-bold rounded-lg border-none">Upgrade Now</Button>
                </div>
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
