import http from 'http';
import { PORT } from './config';

import { createUser, deleteUser, getAllUsers, getUser, updateUser } from './controller';
import { UserWithId } from './types';
import { onError } from './utils';

const users: UserWithId[] = [];

const server = http.createServer((req, res) => {
  if (req.url === '/api/users' && req.method === 'GET') {
    getAllUsers(req, res, users);
  } else if (req.url === '/api/users' && req.method === 'POST') {
    createUser(req, res, users);
  } else if (req.url?.startsWith('/api/users/') && req.method === 'GET') {
    getUser(req, res, users);
  } else if (req.url?.startsWith('/api/users/') && req.method === 'PUT') {
    updateUser(req, res, users);
  } else if (req.url?.startsWith('/api/users/') && req.method === 'DELETE') {
    deleteUser(req, res, users);
  } else {
    onError(res, 404, 'Route not found: please use the api/users endpoint');
  }
});

server.listen(PORT, () => {
  console.log(`Server is running http://localhost:${PORT}`);
});


