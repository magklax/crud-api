import { IncomingMessage, ServerResponse } from 'http';

export const getRequestBody = (req: IncomingMessage): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        resolve(body);
      });
    } catch (error) {
      reject(error);
    }
  });
};

export const onError = (res: ServerResponse, error: { status: number, message: string }) => {
  res.writeHead(error.status, { 'Content-Type': 'application/json' });
  return res.end(error.message);
};

export const onSuccess = <T>(res: ServerResponse, status: number, data?: T) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  return res.end(JSON.stringify(data));
};


export const getServers = (length: number, basePort: number) => Array.from({ length }).map((_, index) => basePort + index + 1);