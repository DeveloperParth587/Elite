import React from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  Download, 
  TrendingDown, 
  Maximize2, 
  ShoppingBag,
  Info,
  ChevronLeft,
  Loader2,
  Check,
  Palette
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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { generateFurnitureImage, generateBOM } from '@/lib/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface AIDesignGeneratorProps {
  onBack: () => void;
}

export function AIDesignGenerator({ onBack }: AIDesignGeneratorProps) {
  const [loading, setLoading] = React.useState(false);
  const [design, setDesign] = React.useState<{
    image: string;
    bom: any[];
    inputs: any;
  } | null>(null);

  const [formData, setFormData] = React.useState({
    type: 'Wardrobe',
    dimensions: '6ft x 7ft',
    material: 'Plywood',
    finish: 'Laminate',
    style: 'Modern',
    color: 'Teak/White',
    storage: '3 Drawers, 4 Shelves',
    budget: '50000'
  });

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const [imageUrl, bomData] = await Promise.all([
        generateFurnitureImage(formData),
        generateBOM(formData)
      ]);

      // Add default cost if missing
      const enrichedBOM = bomData.map((item: any) => ({
        ...item,
        cost: item.estimated_cost_per_unit || 500,
        total: (item.qty || 1) * (item.estimated_cost_per_unit || 500)
      }));

      setDesign({
        image: imageUrl,
        bom: enrichedBOM,
        inputs: { ...formData }
      });
      toast.success("Design generated successfully!");
    } catch (error) {
       toast.error("Failed to generate design. Check your API key.");
       console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!design) return 0;
    return design.bom.reduce((acc, curr) => acc + (curr.qty * curr.cost), 0);
  };

  const handleExport = async () => {
    if (!design) return;
    try {
      const response = await fetch('/api/generate-excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: `${formData.type} Design`,
          materials: design.bom,
          clientName: 'Sample Client'
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${formData.type}_BOM.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast.success("Excel exported successfully!");
      }
    } catch (error) {
      toast.error("Failed to export Excel.");
    }
  };

  const totalCost = calculateTotal();
  const overBudget = totalCost > parseInt(formData.budget);

  return (
    <div className="space-y-8 pb-12 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full hover:bg-slate-100">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AI Furniture Generator</h1>
          <p className="text-slate-500 text-sm">Design custom furniture in seconds using advanced AI models.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Input Form Column */}
        <div className="xl:col-span-4 space-y-6">
          <Card className="border-brand-border shadow-sm sticky top-8 rounded-2xl bg-white overflow-hidden">
            <CardHeader className="border-b border-brand-border bg-brand-sidebar/30">
              <CardTitle className="text-xl font-serif flex items-center gap-2 text-brand-olive">
                <Sparkles className="h-5 w-5" />
                Configuration
              </CardTitle>
              <CardDescription className="text-neutral-400 font-medium">Define your design parameters.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-[11px] font-bold uppercase tracking-wider text-brand-clay">Furniture Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                  <SelectTrigger id="type" className="rounded-lg bg-brand-bg/50 border-brand-border h-11">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Wardrobe">Wardrobe</SelectItem>
                    <SelectItem value="Kitchen Cabinet">Kitchen Cabinet</SelectItem>
                    <SelectItem value="TV Unit">TV Unit</SelectItem>
                    <SelectItem value="Bed Frame">Bed Frame</SelectItem>
                    <SelectItem value="Dining Table">Dining Table</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dim" className="text-[11px] font-bold uppercase tracking-wider text-brand-clay">Dimensions</Label>
                  <Input 
                    id="dim" 
                    value={formData.dimensions} 
                    onChange={e => setFormData({...formData, dimensions: e.target.value})}
                    placeholder="e.g. 6x7 ft" 
                    className="rounded-lg border-brand-border bg-brand-bg/50 h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget" className="text-[11px] font-bold uppercase tracking-wider text-brand-clay">Budget (₹)</Label>
                  <Input 
                    id="budget" 
                    type="number"
                    value={formData.budget} 
                    onChange={e => setFormData({...formData, budget: e.target.value})}
                    placeholder="50000" 
                    className="rounded-lg border-brand-border bg-brand-bg/50 h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="material" className="text-[11px] font-bold uppercase tracking-wider text-brand-clay">Primary Material</Label>
                <Select value={formData.material} onValueChange={(v) => setFormData({...formData, material: v})}>
                  <SelectTrigger id="material" className="rounded-lg bg-brand-bg/50 border-brand-border h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Plywood">Plywood</SelectItem>
                    <SelectItem value="MDF">MDF</SelectItem>
                    <SelectItem value="Solid Wood">Solid Wood</SelectItem>
                    <SelectItem value="HDF">HDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                 <Label htmlFor="style" className="text-[11px] font-bold uppercase tracking-wider text-brand-clay">Aesthetic Style</Label>
                 <div className="grid grid-cols-2 gap-2">
                    {['Modern', 'Minimalist', 'Industrial', 'Luxury'].map(s => (
                      <button 
                        key={s}
                        onClick={() => setFormData({...formData, style: s})}
                        className={cn(
                          "px-3 py-2.5 text-[13px] rounded-lg border transition-all font-medium",
                          formData.style === s 
                            ? "bg-brand-olive border-brand-olive text-white shadow-lg shadow-brand-olive/10" 
                            : "border-brand-border text-neutral-500 hover:bg-brand-bg"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="storage" className="text-[11px] font-bold uppercase tracking-wider text-brand-clay">Storage & Features</Label>
                <Input 
                  id="storage" 
                  value={formData.storage} 
                  onChange={e => setFormData({...formData, storage: e.target.value})}
                  placeholder="e.g. Soft-close drawers" 
                  className="rounded-lg border-brand-border bg-brand-bg/50 h-11"
                />
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={loading}
                className="w-full bg-brand-olive hover:bg-brand-olive/90 text-white h-12 rounded-xl mt-4 font-bold tracking-tight shadow-xl shadow-brand-olive/5"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Calculating Design...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate AI Visualization
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Output Column */}
        <div className="xl:col-span-8 space-y-8">
          <AnimatePresence mode="wait">
            {!design && !loading ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[600px] border border-dashed border-brand-border rounded-3xl flex flex-col items-center justify-center text-center p-8 bg-brand-sidebar/20"
              >
                <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6">
                  <Palette className="h-10 w-10 text-brand-olive opacity-30" />
                </div>
                <h3 className="text-2xl font-serif text-brand-ink mb-2">Ready to Visualize?</h3>
                <p className="max-w-xs text-neutral-400 font-medium">Configure your requirements on the left to generate an olive-toned AI interior design draft.</p>
              </motion.div>
            ) : loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[600px] bg-brand-sidebar rounded-3xl relative overflow-hidden flex flex-col items-center justify-center text-brand-ink"
              >
                 <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_#5A5A40_1px,_transparent_1px)] bg-[size:40px_40px]" />
                 </div>
                 <div className="relative z-10 text-center space-y-6">
                    <div className="relative w-24 h-24 mx-auto">
                       <div className="absolute inset-0 border-4 border-brand-olive/5 rounded-full" />
                       <div className="absolute inset-0 border-4 border-brand-clay rounded-full border-t-transparent animate-spin" />
                       <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-brand-olive animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-serif mb-2">Crafting Design...</h3>
                      <p className="text-neutral-500 font-medium max-w-sm mx-auto">Rendering textures, calculation volumes, and sourcing materials for your {formData.type}.</p>
                    </div>
                 </div>
              </motion.div>
            ) : (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="rounded-3xl border-brand-border overflow-hidden shadow-sm bg-white group">
                    <div className="aspect-square relative overflow-hidden bg-brand-bg">
                      <img 
                        src={design.image} 
                        alt="AI Design" 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                      <div className="absolute top-4 right-4 flex gap-2">
                        <Badge className="bg-white/90 backdrop-blur-md text-brand-olive border-none font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 shadow-sm">AI Generated Perspective</Badge>
                      </div>
                    </div>
                    <div className="p-6">
                       <h4 className="font-serif italic text-2xl text-brand-ink mb-1">{design.inputs.type}</h4>
                       <p className="text-sm font-medium text-neutral-400 tracking-tight">Rendered in {design.inputs.material} using a {design.inputs.style} approach.</p>
                    </div>
                  </Card>

                  <div className="space-y-6">
                    <Card className={cn(
                      "rounded-3xl border-brand-border bg-white shadow-sm p-2",
                      overBudget && "ring-2 ring-red-100 border-red-200"
                    )}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-[11px] font-bold text-brand-clay uppercase tracking-[0.2em]">Estimate Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-baseline justify-between mb-6">
                           <div className={cn("text-5xl font-bold tracking-tighter", overBudget ? "text-red-700" : "text-brand-olive")}>
                             ₹{totalCost.toLocaleString()}
                           </div>
                           <div className="text-[11px] font-bold text-neutral-300 uppercase underline decoration-brand-border decoration-2 underline-offset-4">Goal: ₹{formData.budget}</div>
                        </div>
                        
                        {overBudget && (
                          <div className="bg-red-50 text-red-700 p-4 rounded-xl flex gap-3 text-[13px] items-center border border-red-100 font-medium">
                             <TrendingDown className="h-5 w-5 shrink-0" />
                             <p>Above budget by <span className="font-bold">₹{(totalCost - parseInt(formData.budget)).toLocaleString()}</span>. Consider alternate finishes.</p>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-3 mt-8">
                          <Button variant="outline" className="rounded-lg border-brand-border h-12 text-[12px] font-bold uppercase tracking-wider text-brand-olive hover:bg-brand-bg transition-colors border-dashed">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refine Design
                          </Button>
                          <Button 
                            onClick={handleExport}
                            className="rounded-lg bg-brand-olive hover:bg-brand-olive/90 text-white h-12 text-[12px] font-bold uppercase tracking-wider shadow-lg shadow-brand-olive/10"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Export Excel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-brand-border bg-white shadow-sm">
                      <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-[11px] font-bold text-brand-clay uppercase tracking-[0.2em]">Status</CardTitle>
                        <Badge className="bg-brand-sidebar text-brand-olive border-none px-3 font-bold text-[10px] tracking-widest">DRAFT_01</Badge>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-2">
                         <Button variant="outline" className="w-full rounded-xl h-14 bg-brand-bg/50 hover:bg-brand-bg text-brand-olive font-bold text-[14px] border-none shadow-inner">
                           <ShoppingBag className="mr-3 h-5 w-5" />
                           Send to Client Dashboard
                         </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Card className="rounded-3xl border-brand-border shadow-sm overflow-hidden bg-white">
                  <CardHeader className="bg-brand-sidebar/30 border-b border-brand-border flex flex-row items-center justify-between px-8 py-6">
                    <div>
                      <CardTitle className="text-2xl font-serif text-brand-ink">Bill of Materials</CardTitle>
                      <CardDescription className="text-neutral-400 font-medium">Architectural technical breakdown.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-brand-clay bg-white px-4 py-2 rounded-full shadow-sm">
                       <Info className="h-3 w-3" />
                       REAL-TIME PRICING
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="max-h-[400px]">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-white/95 backdrop-blur-md sticky top-0 z-10 border-b border-brand-border hover:bg-white/95">
                            <TableHead className="pl-8 h-12 font-bold text-brand-clay text-[10px] uppercase tracking-[0.15em]">Component</TableHead>
                            <TableHead className="h-12 font-bold text-brand-clay text-[10px] uppercase tracking-[0.15em]">Specification</TableHead>
                            <TableHead className="h-12 font-bold text-brand-clay text-[10px] uppercase tracking-[0.15em]">Qty</TableHead>
                            <TableHead className="h-12 font-bold text-brand-clay text-[10px] uppercase tracking-[0.15em]">Rate (₹)</TableHead>
                            <TableHead className="text-right pr-8 h-12 font-bold text-brand-clay text-[10px] uppercase tracking-[0.15em]">Total (₹)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {design.bom.map((item, idx) => (
                            <TableRow key={idx} className="hover:bg-brand-bg/50 transition-colors border-brand-border group">
                              <TableCell className="pl-8 py-5 font-bold text-brand-ink border-none">{item.item}</TableCell>
                              <TableCell className="text-neutral-500 font-medium border-none">{item.material}</TableCell>
                              <TableCell className="font-bold text-brand-ink border-none">{item.qty} {item.unit}</TableCell>
                              <TableCell className="font-medium text-brand-ink border-none">
                                <span className="text-brand-clay/40 font-bold mr-1 italic">₹</span>
                                {item.cost.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right pr-8 font-bold text-brand-olive border-none">
                                <span className="text-brand-clay/40 font-bold mr-1 italic text-[10px]">₹</span>
                                {(item.qty * item.cost).toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                    <div className="bg-brand-sidebar/30 p-8 flex items-center justify-between border-t border-brand-border">
                       <span className="font-serif italic text-2xl text-brand-ink">Project Estimate</span>
                       <span className="text-3xl font-bold text-brand-olive tracking-tight">₹{totalCost.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
