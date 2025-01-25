import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";

interface MessageProps {
  content: string;
  isOwn: boolean;
  sender: {
    name: string | null;
    image: string | null;
  };
  timestamp: string;
}

export function Message({ content, isOwn, sender, timestamp }: MessageProps) {
  // Parse the ISO string timestamp with fallback
  const date = timestamp ? parseISO(timestamp) : new Date();

  return (
    <div className={cn(
      "flex gap-3",
      isOwn ? "justify-end" : "justify-start"
    )}>
      {!isOwn && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={sender.image || undefined} />
          <AvatarFallback>
            {sender.name?.[0]?.toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
      )}
      <div className={cn(
        "flex flex-col gap-1",
        isOwn ? "items-end" : "items-start"
      )}>
        <span className="text-sm text-muted-foreground">
          {sender.name}
        </span>
        <div className="flex flex-col gap-1">
          <div className={cn(
            "rounded-xl px-4 py-2 max-w-[420px]",
            isOwn ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted rounded-tl-none"
          )}>
            <p className="break-words text-sm">{content}</p>
          </div>
          <span className="text-[10px] text-muted-foreground px-2">
            {format(date, 'HH:mm')}
          </span>
        </div>
      </div>
      {isOwn && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={sender.image || undefined} />
          <AvatarFallback>
            {sender.name?.[0]?.toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
} 