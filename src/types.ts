export interface User {
  username: string;
  age: number;
  hobbies: string[];
}

export interface UserWithId extends User {
  id: string;
}