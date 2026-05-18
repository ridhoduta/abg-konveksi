import { apiClient } from "./apiClient";

export type AuthUser = {
  userId: number;
  username: string;
  role: string;
};

export type LoginPayload = {
  username: string;
  password: string;
};

export type LoginResponse = {
  id: number;
  username: string;
  role: string;
};

export const authService = {
  async login(payload: LoginPayload) {
    return apiClient.post<LoginResponse>("/api/auth", payload);
  },

  async logout() {
    return apiClient.delete("/api/auth");
  },

  async getMe() {
    return apiClient.get<AuthUser>("/api/auth/me");
  },
};