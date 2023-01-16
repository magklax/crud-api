import cluster from 'node:cluster';
import http from 'node:http';
import os from 'node:os';

import { PORT } from './config';
import { getAllUsers, createUser, deleteUser, updateUser, getUser } from './controller';
import { UserWithId } from './types';
import { getServers, onError } from './utils';
import { errors } from './constants';

const db: UserWithId[] = [];

const basePort = Number(PORT) || 4000;

const cpus = os.cpus().length;

const ports = getServers(cpus, basePort);

export const startCluster = () => {
  if (cluster.isPrimary) {
    for (let i = 1; i <= cpus; i += 1) {
      const worker = cluster.fork();

      worker.on('message', (data: UserWithId[]) => {
        db.splice(0, db.length, ...data);
      });
    }

    cluster.on('exit', (worker) => {
      console.log(`Worker ${worker.process.pid} died`);
    });

    let currentIndex = 0;

    const server = http.createServer((req, res) => {
      const port = ports[currentIndex];

      const proxy = http.request({ port, path: req.url, method: req.method }, proxyRes => {
        res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
        proxyRes.pipe(res);
      });

      req.pipe(proxy);

      proxy.on('error', () => {
        res.writeHead(500);
        res.end('Error connecting to server');
      });

      currentIndex = (currentIndex + 1) % ports.length;
    });

    server.on('request', () => {
      (Object.values(cluster.workers || {})).forEach((worker) => {
        worker?.send(db);
      });
    });

    server.listen(basePort, () => {
      console.log(`Load balancer is listening to http://localhost:${basePort}`);
    });
  } else {
    if (cluster.worker) {
      const workerPort = basePort + cluster.worker.id;

      process.on('message', (data: UserWithId[]) => {
        db.splice(0, db.length, ...data);
      });

      const server = http.createServer((req, res) => {
        if (req.url === '/api/users' && req.method === 'GET') {
          getAllUsers(req, res, db);
        } else if (req.url === '/api/users' && req.method === 'POST') {
          createUser(req, res, db);
        } else if (req.url?.startsWith('/api/users/') && req.method === 'GET') {
          getUser(req, res, db);
        } else if (req.url?.startsWith('/api/users/') && req.method === 'PUT') {
          updateUser(req, res, db);
        } else if (req.url?.startsWith('/api/users/') && req.method === 'DELETE') {
          deleteUser(req, res, db);
        } else {
          onError(res, errors.WRONG_ROUTE);
        }
      });

      server.listen(workerPort, () => {
        console.log(`Worker ${cluster.worker.id} is listening to http://localhost:${workerPort}`);
      });
    }
  }
};
