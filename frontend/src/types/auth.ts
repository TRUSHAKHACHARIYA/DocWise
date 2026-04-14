// Types for authentication

export interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  plan: "FREE" | "STARTER" | "PRO" | "ENTERPRISE";
  verifiedAt: string | null;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}
