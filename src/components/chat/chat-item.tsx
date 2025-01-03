import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatItemProps {
  chat: {
    id: string;
    name: string;
    lastMessage: string;
    members: number;
    image: string;
    timestamp: string;
  };
}

export function ChatItem({ chat }: ChatItemProps) {
  return (
    <div className="flex items-center gap-3 p-4 hover:bg-accent cursor-pointer">
      <Avatar>
        <AvatarImage src={chat.image} />
        <AvatarFallback>{chat.name[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold truncate">{chat.name}</h3>
          <span className="text-xs text-muted-foreground">{chat.timestamp}</span>
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {chat.lastMessage} • {chat.members} members
        </p>
      </div>
    </div>
  );
} 