import { IncomingMessage, ServerResponse } from 'http';

import { onError, getRequestBody, onSuccess } from './utils';
import { User, UserWithId } from './types';
import { errors } from './constants';

import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

export const getAllUsers = async (
  _: IncomingMessage,
  res: ServerResponse,
  users: UserWithId[],
) => {
  try {
    return onSuccess(res, 200, users);
  } catch ({ message }) {
    return onError(res, { ...errors.SERVER_ERROR, message: JSON.stringify(message) });
  }
};

export const getUser = async (
  req: IncomingMessage,
  res: ServerResponse,
  users: UserWithId[],
) => {
  try {
    const userId = req.url?.split('/')[3];

    if (!userId || !uuidValidate(userId)) {
      return onError(res, errors.INVALID_ID);
    }

    const user = users.find(({ id }) => id === userId);

    if (!user) {
      return onError(res, errors.USER_DOES_NOT_EXIST);
    }

    return onSuccess(res, 200, user);
  } catch ({ message }) {
    return onError(res, { ...errors.SERVER_ERROR, message: JSON.stringify(message) });
  }
};

export const createUser = async (
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage>,
  users: UserWithId[],
) => {
  try {
    const { username, age, hobbies } = JSON.parse(await getRequestBody(req));

    if (!username || !age || !hobbies) {
      return onError(res, errors.WRONG_BODY);
    }
    const newUser = { id: uuidv4(), username, age, hobbies };

    users.push(newUser);

    res.on('close', () => {
      process.send?.(users);
    });

    return onSuccess(res, 201, newUser);
  } catch ({ message }) {
    return onError(res, { ...errors.SERVER_ERROR, message: JSON.stringify(message)  });
  }
};

export const updateUser = async (
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage>,
  users: UserWithId[],
) => {
  try {
    const userId = req.url?.split('/')[3];

    if (!userId || !uuidValidate(userId)) {
      return onError(res, errors.INVALID_ID);
    }

    const userIndex = users.findIndex(({ id }) => id === userId);

    if (userIndex < 0) {
      return onError(res, errors.USER_DOES_NOT_EXIST);
    }

    const { username, age, hobbies } = JSON.parse(await getRequestBody(req)) as Partial<User>;

    const updatedUser = {
      ...users[userIndex],
      ...(!!username && { username }),
      ...(!!age && { age }),
      ...(!!hobbies && { hobbies }),
    };

    users[userIndex]  = updatedUser;

    res.on('close', () => {
      process.send?.(users);
    });

    return onSuccess(res, 200, updatedUser);
  } catch ({ message }) {
    return onError(res, { ...errors.SERVER_ERROR, message: JSON.stringify(message) });
  }
};

export const deleteUser = async (
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage>,
  users: UserWithId[],
) => {
  try {
    const userId = req.url?.split('/')[3];

    if (!userId || !uuidValidate(userId)) {
      return onError(res, errors.INVALID_ID);
    }

    const userIndex = users.findIndex(({ id }) => id === userId);

    if (userIndex < 0) {
      return onError(res, errors.USER_DOES_NOT_EXIST);
    }

    users.splice(userIndex, 1);

    res.on('close', () => {
      process.send?.(users);
    });

    return onSuccess(res, 204);
  } catch ({ message }) {
    return onError(res, { ...errors.SERVER_ERROR, message: JSON.stringify(message) });
  }
};
