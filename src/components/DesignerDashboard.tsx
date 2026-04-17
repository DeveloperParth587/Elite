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
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-emerald-100 text-emerald-800 border-none font-bold text-[10px] uppercase tracking-wider">Approved</Badge>;
      case 'pending': return <Badge className="bg-brand-sidebar text-brand-olive border-none font-bold text-[10px] uppercase tracking-wider">Pending</Badge>;
      case 'rejected': return <Badge className="bg-red-50 text-red-700 border-none font-bold text-[10px] uppercase tracking-wider">Rejected</Badge>;
      case 'revision': return <Badge className="bg-brand-clay/10 text-brand-clay border-none font-bold text-[10px] uppercase tracking-wider">In Revision</Badge>;
      default: return <Badge className="font-bold text-[10px] uppercase tracking-wider">{status}</Badge>;
    }
  };

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
                   <TableRow key={project.id} className="hover:bg-brand-sidebar/30 border-brand-border transition-colors">
                    <TableCell className="font-medium text-brand-ink">{project.project_name}</TableCell>
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
