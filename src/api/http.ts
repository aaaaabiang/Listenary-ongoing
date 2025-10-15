import { getIdTokenSafe } from './authClient';

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getIdTokenSafe();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as any || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, { ...init, headers });

  if (res.status === 401) {
    const msg = await res.text().catch(()=>''); 
    throw new Error(msg || 'Unauthorized');
  }
  if (!res.ok) {
    const msg = await res.text().catch(()=>''); 
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return res.status === 204 ? (undefined as T) : await res.json();
}