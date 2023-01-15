import { v4 as uuidv4, validate } from 'uuid';
import { IncomingMessage, ServerResponse } from 'http';

import { onError, getRequestBody, onSuccess } from './utils';
import { User, UserWithId } from './types';

export const getAllUsers = async (_: IncomingMessage, res: ServerResponse, users: UserWithId[]) => {
  try {
    return onSuccess(res, 200, users);
  } catch ({ message }) {
    return onError(res, 500, JSON.stringify(message));
  }
};

export const getUser = async (req: IncomingMessage, res: ServerResponse, users: UserWithId[]) => {
  try {
    const userId = req.url?.split('/')[3];

    if (!userId || !validate(userId)) {
      return onError(res, 400, 'Provided id is invalid (not uuuid)');
    }

    const user = users.find(({ id }) => id === userId);

    if (!user) {
      return onError(res, 404, 'User doesn`t exist');
    }

    return onSuccess(res, 200, user);
  } catch ({ message }) {
    return onError(res, 500, JSON.stringify(message));
  }
};

export const createUser = async (req: IncomingMessage, res: ServerResponse<IncomingMessage>, users: UserWithId[]) => {
  try {
    const { username, age, hobbies } = JSON.parse(await getRequestBody(req));

    if (!username || !age || !hobbies) {
      return onError(res, 400, 'Request body does not contain required fields');
    }

    const newUser = { id: uuidv4(), username, age, hobbies };

    const updatedUser = [...users, newUser];

    res.on('close', () => {
      process.send?.(updatedUser);
    });
    
    return onSuccess(res, 201, newUser);
  } catch ({ message }) {
    return onError(res, 500, JSON.stringify(message));
  }
};

export const updateUser = async (req: IncomingMessage, res: ServerResponse<IncomingMessage>, users: UserWithId[]) => {
  try {
    const userId = req.url?.split('/')[3];

    if (!userId || !validate(userId)) {
      return onError(res, 400, 'Provided id is invalid (not uuuid)');
    }

    const userIndex = users.findIndex(({ id }) => id === userId);

    if (userIndex < 0) {
      return onError(res, 404, 'User doesn`t exist');
    }

    const { username, age, hobbies } = JSON.parse(await getRequestBody(req)) as Partial<User>;

    const updatedUser = {
      ...users[userIndex],
      ...(!!username && { username }),
      ...(!!age && { age }),
      ...(!!hobbies && { hobbies }),
    };

    const updatedUsers = users.map((user) => user.id === userId ? updatedUser : user);

    res.on('close', () => {
      process.send?.(updatedUsers);
    });

    return onSuccess(res, 200, updatedUser);
  } catch ({ message }) {
    return onError(res, 500, JSON.stringify(message));
  }
};

export const deleteUser = async (req: IncomingMessage, res: ServerResponse<IncomingMessage>, users: UserWithId[]) => {
  try {
    const userId = req.url?.split('/')[3];

    if (!userId || !validate(userId)) {
      return onError(res, 400, 'Provided id is invalid (not uuuid)');
    }

    const userIndex = users.findIndex(({ id }) => id === userId);

    if (userIndex < 0) {
      return onError(res, 404, 'User doesn`t exist');
    }

    const updatedUsers = users.filter(({ id }) => id !== userId);

    res.on('close', () => {
      process.send?.(updatedUsers);
    });

    return onSuccess(res, 204, userId);
  } catch ({ message }) {
    return onError(res, 500, JSON.stringify(message));
  }
};
