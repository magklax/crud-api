export const errors = {
  INVALID_ID: {
    status: 400,
    message: 'User id is invalid (not uuuid)',
  },
  USER_DOES_NOT_EXIST: {
    status: 404,
    message: 'User with provided id doesn`t exist',
  },
  SERVER_ERROR: {
    status: 500,
  },
  WRONG_BODY: {
    status: 400,
    message: 'Request body does not contain required fields',
  },
  WRONG_ROUTE: {
    status: 404,
    message: 'Route not found: please use the api/users endpoint',
  },
};
