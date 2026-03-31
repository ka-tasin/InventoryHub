import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../users/user.repository';

const JWT_SECRET = process.env.JWT_SECRET?.toString() as string;

export const authService = {
  async register(data: { email: string; password: string; name?: string }) {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) throw new Error("User with this email already exists");

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await userRepository.create({
      email: data.email,
      password: hashedPassword,
      name: data.name,
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { user, token };
  },

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error("Invalid email or password");

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Invalid email or password");

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role, isDemo: user.isDemo },
      token
    };
  }
};