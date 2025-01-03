import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import ReactLinkify from 'react-linkify';

export function ChatInput({ onSend }: { onSend: (content: string) => void }) {
  const [message, setMessage] = useState("");
  const [videoPreview, setVideoPreview] = useState<any>(null);

  useEffect(() => {
    const checkForVideo = async () => {
        try {
        const response = await fetch('/api/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: message })
        });
        
          if (!response.ok) throw new Error('Preview failed');
          const data = await response.json();
        setVideoPreview(data.preview);
        } catch (error) {
          console.error('Error getting preview:', error);
          setVideoPreview(null);
        }
    };

    const debounce = setTimeout(checkForVideo, 500);
    return () => clearTimeout(debounce);
  }, [message]);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage("");
      setVideoPreview(null);
    }
  };

  const componentDecorator = (href: string, text: string, key: number) => (
    <a href={href} key={key} className="text-blue-500 hover:underline">
      {text}
    </a>
  );

  return (
    <div className="p-4 space-y-4">
      {videoPreview && (
        <Card className="p-2 flex items-center gap-2">
          <img 
            src={videoPreview.thumbnail} 
            alt={videoPreview.title}
            className="w-20 h-20 object-cover rounded"
          />
          <div className="flex-1">
            <p className="font-medium text-sm line-clamp-1">{videoPreview.title}</p>
            <p className="text-xs text-muted-foreground">
              {videoPreview.channelTitle} • {videoPreview.viewCount} views
            </p>
          </div>
        </Card>
      )}
      <div className="flex gap-2">
        <ReactLinkify componentDecorator={componentDecorator}>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="[&>a]:text-blue-500 [&>a]:hover:underline"
          />
        </ReactLinkify>
        <Button onClick={handleSend} size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 