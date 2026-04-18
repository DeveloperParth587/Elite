import React from 'react';
import { 
  BarChart3, 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  Settings, 
  Users, 
  LogOut,
  ChevronRight,
  Menu,
  X,
  Palette,
  Diamond,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarProps {
  role: 'designer' | 'client';
  userEmail?: string;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
}

export function Sidebar({ role, userEmail, activeSection, onSectionChange, onLogout }: SidebarProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const isAdmin = userEmail === 'admin123@gmail.com';

  const designerItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin', label: 'Admin Portal', icon: ShieldCheck, show: isAdmin },
    { id: 'requests', label: 'Service Requests', icon: MessageSquare },
    { id: 'projects', label: 'Projects', icon: Package },
    { id: 'new-design', label: 'New AI Design', icon: PlusCircle },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'analytics', label: 'Reports', icon: BarChart3 },
  ].filter(item => item.show !== false);

  const clientItems = [
    { id: 'dashboard', label: 'My Projects', icon: LayoutDashboard },
    { id: 'queries', label: 'Send Query', icon: MessageSquare },
    { id: 'feedback', label: 'Feedback', icon: Package },
  ];

  const items = role === 'designer' ? designerItems : clientItems;

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 bg-brand-sidebar border-r border-brand-border transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-60",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="h-24 flex items-center px-6 border-b border-brand-border/50 mb-4 bg-white/30 backdrop-blur-md">
            {!collapsed && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-olive rounded-xl flex items-center justify-center shadow-lg shadow-brand-olive/20">
                  <Diamond className="h-5 w-5 text-white fill-white/10" />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif italic text-lg leading-tight text-brand-olive">Elite Design</span>
                  <span className="text-[7px] font-bold uppercase tracking-[0.3em] text-brand-clay -mt-0.5">Studio</span>
                </div>
              </div>
            )}
            {collapsed && (
              <Diamond className="h-6 w-6 text-brand-olive mx-auto" />
            )}
          </div>

          <ScrollArea className="flex-1 px-4 py-6">
            <nav className="space-y-1">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSectionChange(item.id);
                    setMobileOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-[14px] font-medium group",
                    activeSection === item.id 
                      ? "text-brand-ink font-semibold" 
                      : "text-neutral-500 hover:text-brand-ink"
                  )}
                >
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full bg-brand-olive transition-opacity duration-200",
                    activeSection === item.id ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                  )} />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              ))}
            </nav>
          </ScrollArea>

          <div className="p-4 space-y-2 mt-auto">
            {!collapsed && (
              <div className="mb-4 bg-brand-olive p-4 rounded-xl text-white">
                <p className="text-[10px] uppercase tracking-wider opacity-70 mb-1">Plan</p>
                <p className="text-sm font-semibold tracking-tight">Studio Pro</p>
              </div>
            )}
            <button
              onClick={onLogout}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium text-red-600/70 hover:text-red-600 hover:bg-red-50",
                collapsed && "justify-center"
              )}
            >
              <LogOut className="h-5 w-5" />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
