import cluster from 'node:cluster';
import http from 'node:http';
import os from 'node:os';

import { db } from './db';
import { PORT } from './config';
import { getAllUsers, createUser, deleteUser, updateUser, getUser } from './controller';
import { UserWithId } from './types';
import { onError } from './utils';

const basePort = Number(PORT) || 4000;

const cpus = os.cpus().length;

const servers = Array.from({ length: cpus }).map((_, index) => basePort + index + 1);

if (cluster.isPrimary) {
  for (let i = 1; i <= cpus; i += 1) {
    const worker = cluster.fork();

    worker.on('message', (data: UserWithId[]) => {
      db.splice(0, db.length, ...data);
    });
  }

  cluster.on('exit', (worker) => {
    console.log(`worker ${worker.process.pid} died`);
  });

  let currentServer = 0;

  const server = http.createServer((req, res) => {
    const port = servers[currentServer];

    const proxy = http.request({ port, path: req.url, method: req.method }, proxyRes => {
      res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
      proxyRes.pipe(res);
    });
  
    req.pipe(proxy);
  
    proxy.on('error', () => {
      res.writeHead(500);
      res.end('Error connecting to server');
    });
  
    currentServer = (currentServer + 1) % servers.length;
  });

  server.on('request', () => {
    (Object.values(cluster.workers || {})).forEach((worker) => {
      worker?.send(db);
    });
  });
  
  server.listen(basePort, () => {
    console.log(`Server is running http://localhost:${PORT}`);
  });
} else {
  if (cluster.worker) {
    const workerPort = 4000 + (cluster.worker.id);

    process.on('message', (data: UserWithId[]) => {
      db.splice(0, db.length, ...data);
      console.log('from parent', db);
    });

    const server = http.createServer((req, res) => {
      if (req.url === '/api/users' && req.method === 'GET') {
        getAllUsers(req, res, db);
        return res.end(JSON.stringify(db));
      } else if (req.url === '/api/users' && req.method === 'POST') {
        createUser(req, res, db);
      } else if (req.url?.startsWith('/api/users/') && req.method === 'GET') {
        getUser(req, res, db);
      } else if (req.url?.startsWith('/api/users/') && req.method === 'PUT') {
        updateUser(req, res, db);
      } else if (req.url?.startsWith('/api/users/') && req.method === 'DELETE') {
        deleteUser(req, res, db);
      } else {
        onError(res, 404, 'Route not found: please use the api/users endpoint');
      }
    });

    server.listen(workerPort);
  }
  
}
