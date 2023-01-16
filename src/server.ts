import http from 'http';
import { PORT } from './config';
import { errors } from './constants';

import { createUser, deleteUser, getAllUsers, getUser, updateUser } from './controller';
import { db } from './db';
import { onError } from './utils';

const basePort = Number(PORT) || 4000;

export const startServer = () => {
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
  
  server.listen(basePort, () => {
    console.log(`Server is running http://localhost:${basePort}`);
  });
};
