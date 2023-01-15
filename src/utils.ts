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

export const onError = <T>(res: ServerResponse, status: number, message: T) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  return res.end(JSON.stringify({ message }));
};

export const onSuccess = <T>(res: ServerResponse, status: number, data: T) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  return res.end(JSON.stringify(data));
};
