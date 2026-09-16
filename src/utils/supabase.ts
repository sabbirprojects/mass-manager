import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserAccount, UserWorkspaceData, Session } from '../types';
import { generateId, hashPassword, verifyPassword } from './crypto';

const SUPABASE_STORAGE_KEYS = {
  URL: 'smm_supabase_url',
  ANON_KEY: 'smm_supabase_anon_key',
};

export function getSupabaseCredentials(): { url: string; anonKey: string } | null {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

  if (envUrl && envKey) {
    return { url: envUrl.trim(), anonKey: envKey.trim() };
  }

  if (typeof window !== 'undefined') {
    const localUrl = localStorage.getItem(SUPABASE_STORAGE_KEYS.URL);
    const localKey = localStorage.getItem(SUPABASE_STORAGE_KEYS.ANON_KEY);
    if (localUrl && localKey) {
      return { url: localUrl.trim(), anonKey: localKey.trim() };
    }
  }

  return null;
}

export function saveSupabaseCredentials(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SUPABASE_STORAGE_KEYS.URL, url.trim());
    localStorage.setItem(SUPABASE_STORAGE_KEYS.ANON_KEY, anonKey.trim());
  }
}

export function clearSupabaseCredentials(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SUPABASE_STORAGE_KEYS.URL);
    localStorage.removeItem(SUPABASE_STORAGE_KEYS.ANON_KEY);
  }
}

let supabaseInstance: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const creds = getSupabaseCredentials();
  if (!creds || !creds.url || !creds.anonKey) {
    supabaseInstance = null;
    return null;
  }

  if (supabaseInstance && lastUrl === creds.url && lastKey === creds.anonKey) {
    return supabaseInstance;
  }

  try {
    supabaseInstance = createClient(creds.url, creds.anonKey, {
      auth: { persistSession: false },
    });
    lastUrl = creds.url;
    lastKey = creds.anonKey;
    return supabaseInstance;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseClient() !== null;
}

// ---------------------------------------------------------------------------
// Supabase Data Operations
// ---------------------------------------------------------------------------

export async function supabaseFetchUsers(): Promise<UserAccount[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('user_accounts')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Supabase fetch user_accounts error:', error.message);
      return null;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      username: row.username,
      displayName: row.display_name || row.displayName,
      passwordHash: row.password_hash || row.passwordHash,
      phone: row.phone || undefined,
      isActive: row.is_active ?? row.isActive ?? true,
      createdAt: row.created_at || row.createdAt,
      updatedAt: row.updated_at || row.updatedAt,
      lastLoginAt: row.last_login_at || row.lastLoginAt || null,
      createdBy: row.created_by || row.createdBy || 'system',
      updatedBy: row.updated_by || row.updatedBy || 'system',
    }));
  } catch (err) {
    console.warn('Supabase fetch users exception:', err);
    return null;
  }
}

export async function supabaseCreateUser(params: {
  username: string;
  displayName: string;
  password: string;
  phone?: string;
  createdBy?: string;
}): Promise<{ success: boolean; error?: string; user?: UserAccount; userAccounts?: UserAccount[] }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase is not configured' };
  }

  try {
    const cleanUsername = params.username.trim().toLowerCase();

    // Check if username already exists
    const { data: existingUsers, error: checkError } = await supabase
      .from('user_accounts')
      .select('username')
      .ilike('username', cleanUsername);

    if (checkError) {
      return { success: false, error: checkError.message };
    }

    if (existingUsers && existingUsers.length > 0) {
      return { success: false, error: 'এই ইউজারনেম ইতিমধ্যে বিদ্যমান (Username already exists)।' };
    }

    const passwordHash = await hashPassword(params.password);
    const now = new Date().toISOString();
    const newUser: UserAccount = {
      id: generateId('usr'),
      username: cleanUsername,
      displayName: params.displayName.trim(),
      phone: params.phone?.trim() || undefined,
      passwordHash,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: null,
      createdBy: params.createdBy || 'system',
      updatedBy: params.createdBy || 'system',
    };

    const { error: insertError } = await supabase.from('user_accounts').insert([
      {
        id: newUser.id,
        username: newUser.username,
        display_name: newUser.displayName,
        password_hash: newUser.passwordHash,
        phone: newUser.phone,
        is_active: newUser.isActive,
        created_at: newUser.createdAt,
        updated_at: newUser.updatedAt,
        last_login_at: null,
        created_by: newUser.createdBy,
        updated_by: newUser.updatedBy,
      },
    ]);

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    // Fetch refreshed users list
    const allUsers = await supabaseFetchUsers();

    return {
      success: true,
      user: newUser,
      userAccounts: allUsers || [newUser],
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Supabase user creation failed';
    return { success: false, error: msg };
  }
}

export async function supabaseLogin(
  username: string,
  password: string
): Promise<{
  success: boolean;
  error?: string;
  user?: UserAccount;
  session?: Session;
  workspace?: UserWorkspaceData;
  userAccounts?: UserAccount[];
}> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase is not configured' };
  }

  try {
    const cleanUsername = username.trim().toLowerCase();

    const { data: users, error } = await supabase
      .from('user_accounts')
      .select('*')
      .ilike('username', cleanUsername);

    if (error) {
      return { success: false, error: error.message };
    }

    if (!users || users.length === 0) {
      return { success: false, error: 'ভুল ইউজারনেম বা পাসওয়ার্ড (Invalid credentials).' };
    }

    const row = users[0];
    const account: UserAccount = {
      id: row.id,
      username: row.username,
      displayName: row.display_name || row.displayName,
      passwordHash: row.password_hash || row.passwordHash,
      phone: row.phone || undefined,
      isActive: row.is_active ?? row.isActive ?? true,
      createdAt: row.created_at || row.createdAt,
      updatedAt: row.updated_at || row.updatedAt,
      lastLoginAt: row.last_login_at || row.lastLoginAt || null,
      createdBy: row.created_by || row.createdBy || 'system',
      updatedBy: row.updated_by || row.updatedBy || 'system',
    };

    if (!account.isActive) {
      return { success: false, error: 'এই অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে (Account is deactivated).' };
    }

    const isMatch = await verifyPassword(password, account.passwordHash);
    if (!isMatch) {
      return { success: false, error: 'ভুল ইউজারনেম বা পাসওয়ার্ড (Invalid credentials).' };
    }

    const now = new Date().toISOString();

    // Update lastLoginAt
    await supabase
      .from('user_accounts')
      .update({ last_login_at: now, updated_at: now })
      .eq('id', account.id);

    account.lastLoginAt = now;
    account.updatedAt = now;

    const session: Session = {
      sessionId: generateId('sess'),
      userId: account.id,
      username: account.username,
      displayName: account.displayName,
      loginAt: now,
      lastActiveAt: now,
    };

    // Load workspace
    const workspace = await supabaseLoadWorkspace(account.id);
    const userAccounts = await supabaseFetchUsers();

    return {
      success: true,
      user: account,
      session,
      workspace: workspace || undefined,
      userAccounts: userAccounts || undefined,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Supabase login failed';
    return { success: false, error: msg };
  }
}

export async function supabaseDeactivateUser(
  userId: string,
  actorUserId?: string
): Promise<{ success: boolean; error?: string; userAccounts?: UserAccount[] }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: 'Supabase is not configured' };

  try {
    if (actorUserId && actorUserId === userId) {
      return { success: false, error: 'নিজের বর্তমান লগইন করা অ্যাকাউন্ট নিষ্ক্রিয় করা যাবে না।' };
    }

    const allUsers = await supabaseFetchUsers();
    if (!allUsers) return { success: false, error: 'Failed to fetch users' };

    const activeCount = allUsers.filter((u) => u.isActive).length;
    if (activeCount <= 1) {
      return { success: false, error: 'কমপক্ষে একটি সক্রিয় অ্যাকাউন্ট থাকা বাধ্যতামূলক।' };
    }

    const { error } = await supabase
      .from('user_accounts')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    const refreshed = await supabaseFetchUsers();
    return { success: true, userAccounts: refreshed || undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to deactivate user';
    return { success: false, error: msg };
  }
}

export async function supabaseLoadWorkspace(userId: string): Promise<UserWorkspaceData | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('user_workspaces')
      .select('workspace_data')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Supabase load workspace error:', error.message);
      return null;
    }

    if (data && data.workspace_data) {
      return data.workspace_data as UserWorkspaceData;
    }

    // Try shared/global workspace as fallback
    const { data: globalData } = await supabase
      .from('user_workspaces')
      .select('workspace_data')
      .eq('user_id', 'global')
      .maybeSingle();

    if (globalData && globalData.workspace_data) {
      return globalData.workspace_data as UserWorkspaceData;
    }

    return null;
  } catch (err) {
    console.warn('Supabase load workspace exception:', err);
    return null;
  }
}

export async function supabaseSaveWorkspace(userId: string, data: Partial<UserWorkspaceData>): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    // Upsert user's workspace
    const existing = await supabaseLoadWorkspace(userId);
    const merged = {
      ...(existing || {}),
      ...data,
    };

    const { error } = await supabase.from('user_workspaces').upsert(
      {
        user_id: userId,
        workspace_data: merged,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

    if (error) {
      console.warn('Supabase save workspace error:', error.message);
      return false;
    }

    // Also update global workspace fallback
    await supabase.from('user_workspaces').upsert(
      {
        user_id: 'global',
        workspace_data: merged,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

    return true;
  } catch (err) {
    console.warn('Supabase save workspace exception:', err);
    return false;
  }
}
