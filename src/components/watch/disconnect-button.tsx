"use client";

import { Button } from "@/components/ui/button";
import { useSupabase } from "@/providers/supabase-provider";
import { useSession } from "next-auth/react";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function DisconnectButton({ videoId }: { videoId: string }) {
  const { supabase } = useSupabase();
  const { data: session } = useSession();
  const router = useRouter();
  const [isInSession, setIsInSession] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      if (!session?.user?.id) return;
      
      const { data } = await supabase
        .from('watch_session_participants')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      setIsInSession(!!data);
    };

    checkSession();
  }, [session, supabase]);

  const handleDisconnect = async () => {
    if (!session?.user?.id) return;

    try {
      const { error } = await supabase
        .from('watch_session_participants')
        .delete()
        .eq('user_id', session.user.id);

      if (error) throw error;

      setIsInSession(false);
      toast.success("Left watch session");
      router.push(`/watch/${videoId}`);
    } catch (error) {
      console.error("Error leaving session:", error);
      toast.error("Failed to leave session");
    }
  };

  if (!isInSession) return null;

  return (
    <Button
      onClick={handleDisconnect}
      variant="outline"
      size="sm"
      className="gap-2 bg-white/10 hover:bg-white/20"
    >
      <LogOut className="h-4 w-4" />
      Leave Session
    </Button>
  );
} 