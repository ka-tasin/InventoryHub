import { userRepository } from './user.repository';

export const userService = {
  getAllUsers: async () => {
    return userRepository.getAll();
  },

  getUserById: async (id: string) => {
    return userRepository.findById(id);
  },

  updateUser: async (id: string, data: any) => {
    return userRepository.update(id, data);
  },

  deleteUser: async (id: string) => {
    return userRepository.delete(id);
  }
};