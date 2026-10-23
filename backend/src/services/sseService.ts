import { Response } from 'express';

interface SSEClient {
  id: string;
  res: Response;
}

class SSEService {
  private clients: Map<string, SSEClient> = new Map();
  private pingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.pingInterval = setInterval(() => {
      this.broadcast('ping', { timestamp: new Date().toISOString() });
    }, 25000);
  }

  public addClient(id: string, res: Response): void {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable proxy buffering for Nginx/Render
    res.flushHeaders?.();

    this.clients.set(id, { id, res });

    // Send initial handshake
    this.sendToClient(res, 'connected', { clientId: id, timestamp: new Date().toISOString() });

    res.on('close', () => {
      this.clients.delete(id);
    });
  }

  public broadcast(event: string, data: any): void {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const [id, client] of this.clients.entries()) {
      try {
        client.res.write(payload);
      } catch (err) {
        this.clients.delete(id);
      }
    }
  }

  private sendToClient(res: Response, event: string, data: any): void {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  }

  public getConnectedCount(): number {
    return this.clients.size;
  }
}

export const sseService = new SSEService();
