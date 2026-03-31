export interface CreateUserInput {
  email: string;
  password: string;
  name?: string;
  role?: "USER" | "ADMIN" | "MANAGER";
}

export interface UpdateUserInput {
  name?: string;
  role?: "USER" | "ADMIN" | "MANAGER";
}