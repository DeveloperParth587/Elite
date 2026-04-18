import React from 'react';
import { 
  Send, 
  Image as ImageIcon, 
  User, 
  Loader2,
  MoreVertical,
  Paperclip,
  Smile
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { dataService } from '@/services/dataService';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface ChatSystemProps {
  parentId: string;
}

export function ChatSystem({ parentId }: ChatSystemProps) {
  const [messages, setMessages] = React.useState<any[]>([]);
  const [newMessage, setNewMessage] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [sending, setSending] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    async function initChat() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      const history = await dataService.getChatMessages(parentId);
      setMessages(history);
      setLoading(false);
      
      // Subscribe to real-time updates
      const subscription = dataService.subscribeToChat(parentId, (msg) => {
        setMessages(prev => {
          // Check for duplication (optimistic update guard)
          if (prev.find(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      });

      return () => {
        subscription.unsubscribe();
      };
    }
    initChat();
  }, [parentId]);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    const messageContent = newMessage;
    setNewMessage('');
    setSending(true);

    try {
      await dataService.sendMessage({
        parent_id: parentId,
        sender_id: currentUser.id,
        message: messageContent
      });
      // Real-time listener will pick it up
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-brand-bg/20 rounded-3xl border border-brand-border border-dashed">
        <Loader2 className="h-8 w-8 text-brand-olive animate-spin" />
      </div>
    );
  }

  return (
    <Card className="rounded-[32px] border-brand-border bg-white shadow-xl flex flex-col h-[600px] overflow-hidden border-none ring-1 ring-brand-border">
      <CardHeader className="bg-brand-sidebar/20 border-b border-brand-border py-4 px-8 flex flex-row items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
           <div className="relative">
              <div className="w-10 h-10 rounded-full bg-brand-olive flex items-center justify-center text-white shadow-lg shadow-brand-olive/10">
                 <User className="h-5 w-5" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
           </div>
           <div>
              <CardTitle className="text-lg font-serif italic text-brand-ink">Studio Briefing</CardTitle>
              <div className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Secure Live Channel</div>
           </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full text-neutral-400 hover:text-brand-ink hover:bg-white">
           <MoreVertical className="h-5 w-5" />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 flex flex-col h-full min-h-0 overflow-hidden bg-brand-bg/10">
        <ScrollArea className="flex-1 p-8">
          <div className="space-y-6">
            <AnimatePresence>
              {messages.map((msg, idx) => {
                const isMe = msg.sender_id === currentUser?.id;
                return (
                  <motion.div
                    key={msg.id || idx}
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className={cn(
                      "flex items-end gap-3 max-w-[85%]",
                      isMe ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                  >
                    {!isMe && (
                      <Avatar className="w-8 h-8 shrink-0 border-2 border-white shadow-sm">
                        <AvatarFallback className="bg-brand-sidebar text-brand-olive text-[10px] font-bold">DS</AvatarFallback>
                      </Avatar>
                    )}
                    <div className="space-y-1">
                       <div className={cn(
                        "p-4 text-sm leading-relaxed",
                        isMe 
                          ? "bg-brand-olive text-white rounded-[24px] rounded-br-[4px] shadow-lg shadow-brand-olive/5" 
                          : "bg-white text-brand-ink rounded-[24px] rounded-bl-[4px] border border-brand-border shadow-sm"
                      )}>
                        {msg.message}
                        {msg.image_url && (
                          <div className="mt-3 rounded-xl overflow-hidden shadow-inner">
                            <img src={msg.image_url} alt="Shared Design" className="w-full h-auto object-cover" />
                          </div>
                        )}
                      </div>
                      <div className={cn(
                        "text-[9px] font-bold text-neutral-400 uppercase tracking-widest px-2",
                        isMe ? "text-right" : "text-left"
                      )}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="p-6 bg-white border-t border-brand-border shrink-0">
           <form 
            onSubmit={handleSend}
            className="flex items-center gap-3 bg-brand-bg/50 p-2 rounded-2xl border border-brand-border focus-within:ring-2 focus-within:ring-brand-olive/20 transition-all"
           >
              <div className="flex gap-1 pl-2">
                 <Button type="button" variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-neutral-400 hover:text-brand-olive hover:bg-white transition-colors">
                    <Paperclip className="h-5 w-5" />
                 </Button>
                 <Button type="button" variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-neutral-400 hover:text-brand-olive hover:bg-white transition-colors">
                    <Smile className="h-5 w-5" />
                 </Button>
              </div>
              <Input 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Share your interior vision..."
                className="flex-1 border-none bg-transparent focus-visible:ring-0 text-[14px] font-medium h-12 shadow-none"
              />
              <Button 
                type="submit" 
                disabled={!newMessage.trim() || sending}
                className="rounded-xl bg-brand-olive hover:bg-brand-olive/90 text-white h-12 w-12 p-0 shadow-lg shadow-brand-olive/10 group"
              >
                {sending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                )}
              </Button>
           </form>
           <div className="mt-3 flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-bold text-neutral-400 tracking-wider">Studio Active</span>
              </div>
              <div className="flex items-center gap-4">
                 <button className="text-[10px] font-black uppercase tracking-widest text-brand-olive hover:underline">Guidelines</button>
                 <button className="text-[10px] font-black uppercase tracking-widest text-brand-olive hover:underline">Privacy</button>
              </div>
           </div>
        </div>
      </CardContent>
    </Card>
  );
}
