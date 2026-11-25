import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@/shared/types';

export const DEFAULT_API_URL = 'https://classmusic.duckdns.org/api/v1';

const TOKEN_KEY = '@classmusic_access_token';
const REFRESH_TOKEN_KEY = '@classmusic_refresh_token';
const USER_KEY = '@classmusic_user_email';
const API_URL_KEY = '@classmusic_api_url';

export class ApiClient {
  private static baseUrl = DEFAULT_API_URL;

  static async init(): Promise<void> {
    try {
      const savedUrl = await AsyncStorage.getItem(API_URL_KEY);
      if (savedUrl && !savedUrl.includes('onrender.com')) {
        this.baseUrl = savedUrl;
      } else {
        this.baseUrl = DEFAULT_API_URL;
        await AsyncStorage.setItem(API_URL_KEY, DEFAULT_API_URL);
      }
    } catch {
      // Ignorar error de carga de URL
    }
  }

  static getBaseUrl(): string {
    return this.baseUrl;
  }

  static async setBaseUrl(url: string): Promise<void> {
    this.baseUrl = url.trim().replace(/\/+$/, '');
    await AsyncStorage.setItem(API_URL_KEY, this.baseUrl);
  }

  static async getTokens(): Promise<{
    accessToken: string | null;
    refreshToken: string | null;
  }> {
    const [accessToken, refreshToken] = await Promise.all([
      AsyncStorage.getItem(TOKEN_KEY),
      AsyncStorage.getItem(REFRESH_TOKEN_KEY),
    ]);
    return { accessToken, refreshToken };
  }

  static async saveTokens(
    accessToken: string,
    refreshToken: string,
    email?: string,
  ): Promise<void> {
    const ops: Promise<void>[] = [
      AsyncStorage.setItem(TOKEN_KEY, accessToken),
      AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken),
    ];
    if (email) ops.push(AsyncStorage.setItem(USER_KEY, email));
    await Promise.all(ops);
  }

  static async clearAuth(): Promise<void> {
    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
  }

  static async getUser(): Promise<User | null> {
    const email = await AsyncStorage.getItem(USER_KEY);
    return email ? { email } : null;
  }

  static async login(
    email: string,
    pass: string,
  ): Promise<{ success: boolean; accessToken: string; refreshToken: string }> {
    const res = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password: pass }),
    });

    if (!res.ok) {
      const err = await res
        .json()
        .catch(() => ({ message: 'Error de conexión' }));
      throw new Error(err.message || 'Credenciales incorrectas');
    }

    const data = await res.json();
    await this.saveTokens(data.accessToken, data.refreshToken, email);
    return data;
  }

  static async refresh(): Promise<string> {
    const { refreshToken } = await this.getTokens();
    if (!refreshToken) throw new Error('No hay sesión guardada');

    const res = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      await this.clearAuth();
      throw new Error('Sesión expirada. Por favor ingresa de nuevo.');
    }

    const data = await res.json();
    await this.saveTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  }

  static async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    let { accessToken } = await this.getTokens();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    let res = await fetch(`${this.baseUrl}${cleanEndpoint}`, {
      ...options,
      headers,
    });

    if (res.status === 401 && accessToken) {
      accessToken = await this.refresh();
      headers['Authorization'] = `Bearer ${accessToken}`;
      res = await fetch(`${this.baseUrl}${cleanEndpoint}`, {
        ...options,
        headers,
      });
    }

    if (!res.ok) {
      const err = await res
        .json()
        .catch(() => ({ message: `Error HTTP ${res.status}` }));
      throw new Error(err.message || 'Ocurrió un error en la solicitud');
    }

    return res.json() as Promise<T>;
  }
}
