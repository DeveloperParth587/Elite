import React from 'react';
import { Send, User, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { dataService } from '@/services/dataService';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface DesignFeedbackProps {
  parentId: string; // design_id
  currentUserId: string;
  role: 'designer' | 'client';
}

export function DesignFeedback({ parentId, currentUserId, role }: DesignFeedbackProps) {
  const [messages, setMessages] = React.useState<any[]>([]);
  const [newMessage, setNewMessage] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    async function loadMessages() {
      try {
        const msgs = await dataService.getChatMessages(parentId);
        setMessages(msgs);
      } catch (error) {
        console.error('Error loading feedback:', error);
      } finally {
        setLoading(false);
      }
    }

    loadMessages();

    // Subscribe to new messages
    const subscription = dataService.subscribeToChat(parentId, (newMsg) => {
      setMessages(prev => {
        // Prevent duplicate messages if the sender already added it locally
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [parentId]);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      await dataService.sendMessage({
        parent_id: parentId,
        sender_id: currentUserId,
        message: messageContent
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send feedback.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-brand-olive"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-3xl overflow-hidden border border-brand-border">
      <div className="p-5 border-b border-brand-border bg-brand-sidebar/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-olive/10 rounded-lg">
            <MessageSquare className="h-4 w-4 text-brand-olive" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-brand-ink uppercase tracking-wider">Design Feedback</h3>
            <p className="text-[10px] text-neutral-400 font-medium">Coordinate refinements with your {role === 'client' ? 'designer' : 'client'}.</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6" ref={scrollRef}>
        <div className="space-y-6">
          <AnimatePresence initial={false}>
            {messages.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-neutral-400 italic">No feedback published yet.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-3",
                    msg.sender_id === currentUserId ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <Avatar className="h-8 w-8 border border-brand-border">
                    <AvatarFallback className="bg-brand-bg text-[10px] font-bold">
                      {msg.sender_id === currentUserId ? 'ME' : 'TH'}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    "max-w-[80%] rounded-2xl p-4 text-sm shadow-sm",
                    msg.sender_id === currentUserId 
                      ? "bg-brand-ink text-white rounded-tr-none" 
                      : "bg-brand-sidebar/40 text-brand-ink border border-brand-border rounded-tl-none"
                  )}>
                    <div className="font-serif italic text-[11px] mb-1 opacity-70">
                      {msg.sender_id === currentUserId ? 'You' : (role === 'client' ? 'Designer' : 'Client')}
                    </div>
                    <p className="leading-relaxed font-medium">{msg.message}</p>
                    <div className="text-[9px] mt-2 opacity-50 text-right">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      <div className="p-6 border-t border-brand-border bg-brand-bg/20">
        <div className="relative">
          <Textarea 
            placeholder="Suggest an adjustment or ask a question..." 
            className="min-h-[100px] rounded-2xl border-brand-border focus:ring-brand-olive bg-white resize-none text-[14px] p-4 pr-16 font-medium placeholder:text-neutral-300 shadow-inner"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button 
            onClick={handleSend}
            size="icon"
            className="absolute bottom-4 right-4 bg-brand-olive hover:bg-brand-olive/90 text-white rounded-xl h-10 w-10 shadow-lg shadow-brand-olive/20"
            disabled={!newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
