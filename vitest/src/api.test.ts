import { describe, it, expect, vi, beforeEach } from 'vitest';

// Simulated API client — replace with your real module.
interface User {
  id: number;
  name: string;
  email: string;
}

async function fetchUser(id: number): Promise<User> {
  const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<User>;
}

async function createUser(data: Omit<User, 'id'>): Promise<User> {
  const res = await fetch('https://jsonplaceholder.typicode.com/users', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<User>;
}

describe('user API @integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches a user by id', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 1, name: 'Alice', email: 'alice@example.com' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    const user = await fetchUser(1);
    expect(user.name).toBe('Alice');
    expect(user.email).toBe('alice@example.com');
  });

  it('throws on 404', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response('Not Found', { status: 404 }));
    await expect(fetchUser(9999)).rejects.toThrow('HTTP 404');
  });

  it('creates a new user', async () => {
    const payload = { name: 'Bob', email: 'bob@example.com' };
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 11, ...payload }), {
        status: 201,
        headers: { 'content-type': 'application/json' },
      }),
    );
    const created = await createUser(payload);
    expect(created.id).toBeGreaterThan(0);
    expect(created.name).toBe('Bob');
  });
});
