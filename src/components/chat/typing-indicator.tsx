import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TypingUser {
  id: string;
  name: string | null;
  image: string | null;
}

interface TypingIndicatorProps {
  users: TypingUser[];
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 p-4"
    >
      <div className="flex -space-x-3">
        {users.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ scale: 0, x: -20 }}
            animate={{ scale: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Avatar 
              className="h-8 w-8 border-2 border-background"
              style={{ zIndex: users.length - index }}
            >
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback>
                {user.name?.[0]?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
          </motion.div>
        ))}
      </div>
      <div className="flex items-center gap-2 ml-2">
        <div className="flex space-x-1">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 0.5, delay: 0 }}
            className="h-2 w-2 rounded-full bg-muted-foreground/30"
          />
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }}
            className="h-2 w-2 rounded-full bg-muted-foreground/30"
          />
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 0.5, delay: 0.4 }}
            className="h-2 w-2 rounded-full bg-muted-foreground/30"
          />
        </div>
        <span className="text-sm text-muted-foreground">typing...</span>
      </div>
    </motion.div>
  );
} 