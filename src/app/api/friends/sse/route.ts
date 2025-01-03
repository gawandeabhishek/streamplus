import { headers } from "next/headers";

const connections = new Set<ReadableStreamController<any>>();

export async function GET() {
  const headersList = headers();
  
  const response = new Response(
    new ReadableStream({
      start(controller) {
        connections.add(controller);
        const encoder = new TextEncoder();

        const send = (data: string) => {
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        };

        // Keep connection alive
        const interval = setInterval(() => {
          send('ping');
        }, 15000);

        // Clean up on close
        return () => {
          clearInterval(interval);
          connections.delete(controller);
        };
      },
    }),
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    }
  );

  return response;
}

export async function POST(req: Request) {
  const data = await req.json();
  
  // Broadcast to all connections
  const encoder = new TextEncoder();
  connections.forEach(controller => {
    controller.enqueue(
      encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
    );
  });

  return new Response('OK');
} 