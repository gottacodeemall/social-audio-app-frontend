import { User } from './contracts';
import { http } from './http';

export const fetchUsers = async (): Promise<User[]> => {
  const { data } = await http.get<User[]>('/users');
  return data;
};
