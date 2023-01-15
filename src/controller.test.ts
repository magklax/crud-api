import { IncomingMessage, ServerResponse } from 'http';
import { Socket } from 'node:net';

import * as utils from './utils';
import { createUser, deleteUser, getAllUsers, getUser, updateUser } from '../src/controller';
import { UserWithId } from './types';

jest.mock( 'uuid', () => ({
  ...jest.requireActual('uuid'),
  v4: jest.fn(() => 'e91f749b-8f78-4f1f-9eea-cfba537fcf6a' ),
}));

const UUID = 'e91f749b-8f78-4f1f-9eea-cfba537fcf6a';
const WRONG_UUID = 'a1a7b8a8-80aa-4eaa-a551-62a428c3278c';

describe('controller', () => {
  let req: IncomingMessage;
  let res: ServerResponse<IncomingMessage>;
  let users: UserWithId[];

  beforeEach(() => {
    const socket = new Socket();

    req = new IncomingMessage(socket);
    res = new ServerResponse(req);
    users = [{ id: UUID, username: 'user1', age: 20, hobbies: ['sport'] }];
  });

  describe('getAllUsers', () => {
    it('should return all users and status 200', async () => {
      users = [];

      res.end = jest.fn();
      res.writeHead = jest.fn();

      await getAllUsers(req, res, users);

      expect(res.end).toHaveBeenCalledWith(JSON.stringify(users));
      expect(res.end).toHaveBeenCalledTimes(1);

      expect(res.writeHead).toHaveBeenCalledWith(200, { 'Content-Type': 'application/json' });
      expect(res.writeHead).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUser', () => {
    it('should return user and status 200', async () => {
      res.end = jest.fn();
      res.writeHead = jest.fn();
      req.url = `/api/users/${users[0].id}`;

      await getUser(req, res, users);

      expect(res.end).toHaveBeenCalledWith(JSON.stringify(users[0]));
      expect(res.end).toHaveBeenCalledTimes(1);

      expect(res.writeHead).toHaveBeenCalledWith(200, { 'Content-Type': 'application/json' });
      expect(res.writeHead).toHaveBeenCalledTimes(1);
    });

    it('should return error message and status 400 when user id is invalid', async () => {
      res.end = jest.fn();
      res.writeHead = jest.fn();
      req.url = '/api/users/wrong-id';

      await getUser(req, res, users);

      expect(res.end).toHaveBeenCalledWith('User id is invalid (not uuuid)');
      expect(res.end).toHaveBeenCalledTimes(1);

      expect(res.writeHead).toHaveBeenCalledWith(400, { 'Content-Type': 'application/json' });
      expect(res.writeHead).toHaveBeenCalledTimes(1);
    });

    it('should return error message and status 404 when user doesn`t exist', async () => {
      res.end = jest.fn();
      res.writeHead = jest.fn();
      req.url = `/api/users/${WRONG_UUID}`;

      await getUser(req, res, users);

      expect(res.end).toHaveBeenCalledWith('User with provided id doesn`t exist');
      expect(res.end).toHaveBeenCalledTimes(1);

      expect(res.writeHead).toHaveBeenCalledWith(404, { 'Content-Type': 'application/json' });
      expect(res.writeHead).toHaveBeenCalledTimes(1);
    });
  });

  describe('createUser', () => {
    it('should create new user and return it with status 201', async () => {
      jest.spyOn(utils, 'getRequestBody').mockResolvedValue('{ "username": "Mike", "age": 55, "hobbies": ["soccer"] }');
      
      res.end = jest.fn();
      res.writeHead = jest.fn();
      res.on = jest.fn().mockImplementation((_event, cb) => cb());

      req.url = '/api/users/e91f749b-8f78-4f1f-9eea-cfba537fcf6a';

      await createUser(req, res, users);

      const expectedNewUser = {
        id: 'e91f749b-8f78-4f1f-9eea-cfba537fcf6a',
        username: 'Mike',
        age: 55,
        hobbies: ['soccer'],
      };

      expect(res.end).toHaveBeenCalledWith(JSON.stringify(expectedNewUser));
      expect(res.end).toHaveBeenCalledTimes(1);

      expect(res.writeHead).toHaveBeenCalledWith(201, { 'Content-Type': 'application/json' });
      expect(res.writeHead).toHaveBeenCalledTimes(1);
    });

    it('should return error message and status 400 when request body doesn`t contain required fields', async () => {
      jest.spyOn(utils, 'getRequestBody').mockResolvedValue('{ "username": "Mike", "age": 55 }');
      
      res.end = jest.fn();
      res.writeHead = jest.fn();
      res.on = jest.fn().mockImplementation((_event, cb) => cb());

      req.url = '/api/users/e91f749b-8f78-4f1f-9eea-cfba537fcf6a';

      await createUser(req, res, users);

      expect(res.end).toHaveBeenCalledWith('Request body does not contain required fields');
      expect(res.end).toHaveBeenCalledTimes(1);

      expect(res.writeHead).toHaveBeenCalledWith(400, { 'Content-Type': 'application/json' });
      expect(res.writeHead).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateUser', () => {
    it('should update user and return it with status 200', async () => {
      jest.spyOn(utils, 'getRequestBody').mockResolvedValue('{ "age": 25, "hobbies": ["traveling"] }');

      req.url = `/api/users/${users[0].id}`;
      res.on = jest.fn().mockImplementation((_event, cb) => cb());
      res.end = jest.fn();
      res.writeHead = jest.fn();

      await updateUser(req, res, users);

      const expectedUpdatedUser = { ...users[0], age: 25, hobbies: ['traveling'] };

      expect(res.end).toHaveBeenCalledWith(JSON.stringify(expectedUpdatedUser));
      expect(res.end).toHaveBeenCalledTimes(1);

      expect(res.writeHead).toHaveBeenCalledWith(200, { 'Content-Type': 'application/json' });
      expect(res.writeHead).toHaveBeenCalledTimes(1);
    });

    it('should return error message and status 400 when user id is invalid', async () => {
      req.url = '/api/users/wrong-id';
      res.end = jest.fn();
      res.writeHead = jest.fn();

      await updateUser(req, res, users);

      expect(res.end).toHaveBeenCalledWith('User id is invalid (not uuuid)');
      expect(res.end).toHaveBeenCalledTimes(1);

      expect(res.writeHead).toHaveBeenCalledWith(400, { 'Content-Type': 'application/json' });
      expect(res.writeHead).toHaveBeenCalledTimes(1);
    });

    it('should return error message and status 404 when user doesn`t exist', async () => {
      req.url = `/api/users/${WRONG_UUID}`;
      res.end = jest.fn();
      res.writeHead = jest.fn();

      await updateUser(req, res, users);
      
      expect(res.end).toHaveBeenCalledWith('User with provided id doesn`t exist');
      expect(res.end).toHaveBeenCalledTimes(1);

      expect(res.writeHead).toHaveBeenCalledWith(404, { 'Content-Type': 'application/json' });
      expect(res.writeHead).toHaveBeenCalledTimes(1);
    });

  });

  describe('deleteUser', () => {
    it('should delete user and return it with status 204', async () => {
      req.url = `/api/users/${users[0].id}`;
      res.end = jest.fn();
      res.writeHead = jest.fn();

      await deleteUser(req, res, users);

      expect(res.end).toHaveBeenCalledTimes(1);

      expect(res.writeHead).toHaveBeenCalledWith(204, { 'Content-Type': 'application/json' });
      expect(res.writeHead).toHaveBeenCalledTimes(1);
    });

    it('should return error message and status 400 when user id is invalid', async () => {
      req.url = '/api/users/wrong-id';
      res.end = jest.fn();
      res.writeHead = jest.fn();

      await deleteUser(req, res, users);
   
      expect(res.end).toHaveBeenCalledWith('User id is invalid (not uuuid)');
      expect(res.end).toHaveBeenCalledTimes(1);

      expect(res.writeHead).toHaveBeenCalledWith(400, { 'Content-Type': 'application/json' });
      expect(res.writeHead).toHaveBeenCalledTimes(1);
    });

    it('should return error message and status 404 when user doesn`t exist', async () => {
      req.url = `/api/users/${WRONG_UUID}`;
      res.end = jest.fn();
      res.writeHead = jest.fn();

      await deleteUser(req, res, users);
   
      expect(res.end).toHaveBeenCalledWith('User with provided id doesn`t exist');
      expect(res.end).toHaveBeenCalledTimes(1);

      expect(res.writeHead).toHaveBeenCalledWith(404, { 'Content-Type': 'application/json' });
      expect(res.writeHead).toHaveBeenCalledTimes(1);
    });
  });
});
