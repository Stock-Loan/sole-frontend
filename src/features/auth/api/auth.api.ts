import { apiClient } from "@/lib/apiClient";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export async function login(input: LoginRequest): Promise<TokenPair> {
  const { data } = await apiClient.post<TokenPair>('/auth/login', input);
  return data;
}

export async function me() {
  const { data } = await apiClient.get('/auth/me');
  return data;
}
