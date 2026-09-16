import express, { Request, Response } from 'express';
import {
  readDatabase,
  writeDatabase,
  createDefaultUserWorkspace,
} from './db';
import { generateId, hashPassword, verifyPassword } from '../src/utils/crypto';
import { UserAccount, UserWorkspaceData, Session } from '../src/types';

export const apiRouter = express.Router();

// Parse JSON bodies
apiRouter.use(express.json({ limit: '10mb' }));

// Health Check
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 1. Initial State for App
apiRouter.get('/init', async (req: Request, res: Response) => {
  try {
    const db = await readDatabase();
    const userId = (req.query.userId as string) || undefined;

    let workspace: UserWorkspaceData;
    if (userId && db.workspaces[userId]) {
      workspace = db.workspaces[userId];
    } else if (userId === 'usr_sabbir_01' || !userId) {
      workspace = db.globalWorkspace;
    } else {
      const user = db.userAccounts.find((u) => u.id === userId);
      workspace = createDefaultUserWorkspace(userId, user?.username || 'user');
      db.workspaces[userId] = workspace;
      await writeDatabase(db);
    }

    res.json({
      success: true,
      userAccounts: db.userAccounts,
      workspace,
      globalWorkspace: db.globalWorkspace,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to load initial data';
    res.status(500).json({ success: false, error: msg });
  }
});

// 2. Fetch User Accounts List (Internal User List)
apiRouter.get('/users', async (_req: Request, res: Response) => {
  try {
    const db = await readDatabase();
    res.json({
      success: true,
      userAccounts: db.userAccounts,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch users';
    res.status(500).json({ success: false, error: msg });
  }
});

// 3. Register New User Account
apiRouter.post('/users', async (req: Request, res: Response) => {
  try {
    const { username, displayName, password, phone, createdBy } = req.body;

    const cleanUsername = (username || '').trim().toLowerCase();
    if (!cleanUsername || cleanUsername.length < 3) {
      res.status(400).json({ success: false, error: 'ইউজারনেম কমপক্ষে ৩ অক্ষরের হতে হবে।' });
      return;
    }

    if (!/^[a-z0-9_]+$/.test(cleanUsername)) {
      res.status(400).json({
        success: false,
        error: 'ইউজারনেমে শুধুমাত্র ইংরেজি ছোট অক্ষর (a-z), সংখ্যা (0-9) এবং আন্ডারস্কোর (_) ব্যবহার করা যাবে।',
      });
      return;
    }

    if (!displayName || !displayName.trim()) {
      res.status(400).json({ success: false, error: 'ডিসপ্লে নাম দিন।' });
      return;
    }

    if (!password || password.length < 4) {
      res.status(400).json({ success: false, error: 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' });
      return;
    }

    const db = await readDatabase();
    const exists = db.userAccounts.some((u) => u.username.toLowerCase() === cleanUsername);
    if (exists) {
      res.status(400).json({ success: false, error: 'এই ইউজারনেম ইতিমধ্যে বিদ্যমান (Username already exists)।' });
      return;
    }

    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();
    const newUser: UserAccount = {
      id: generateId('usr'),
      username: cleanUsername,
      displayName: displayName.trim(),
      phone: phone?.trim() || undefined,
      passwordHash,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: null,
      createdBy: createdBy || 'system',
      updatedBy: createdBy || 'system',
    };

    // Pre-initialize workspace for the new user
    const newWorkspace = createDefaultUserWorkspace(newUser.id, newUser.username);
    db.workspaces[newUser.id] = newWorkspace;
    db.userAccounts.push(newUser);

    await writeDatabase(db);

    res.json({
      success: true,
      user: newUser,
      userAccounts: db.userAccounts,
      workspace: newWorkspace,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create user account';
    res.status(500).json({ success: false, error: msg });
  }
});

// 4. Authenticate User (Login)
apiRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const trimmedUsername = (username || '').trim().toLowerCase();

    if (!trimmedUsername || !password) {
      res.status(400).json({ success: false, error: 'ইউজারনেম ও পাসওয়ার্ড আবশ্যক।' });
      return;
    }

    const db = await readDatabase();
    const account = db.userAccounts.find((u) => u.username.toLowerCase() === trimmedUsername);
    if (!account) {
      res.status(401).json({ success: false, error: 'ভুল ইউজারনেম বা পাসওয়ার্ড (Invalid credentials).' });
      return;
    }

    if (!account.isActive) {
      res.status(403).json({ success: false, error: 'এই অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে (Account is deactivated).' });
      return;
    }

    const isMatch = await verifyPassword(password, account.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, error: 'ভুল ইউজারনেম বা পাসওয়ার্ড (Invalid credentials).' });
      return;
    }

    const now = new Date().toISOString();
    account.lastLoginAt = now;
    account.updatedAt = now;

    // Load or create workspace
    let workspace = db.workspaces[account.id];
    if (!workspace) {
      if (account.id === 'usr_sabbir_01') {
        workspace = db.globalWorkspace;
      } else {
        workspace = createDefaultUserWorkspace(account.id, account.username);
      }
      db.workspaces[account.id] = workspace;
    }

    await writeDatabase(db);

    const session: Session = {
      sessionId: generateId('sess'),
      userId: account.id,
      username: account.username,
      displayName: account.displayName,
      loginAt: now,
      lastActiveAt: now,
    };

    res.json({
      success: true,
      user: account,
      session,
      workspace,
      userAccounts: db.userAccounts,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Login failed';
    res.status(500).json({ success: false, error: msg });
  }
});

// 5. Deactivate User Account
apiRouter.post('/users/:id/deactivate', async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const { actorUserId } = req.body;

    const db = await readDatabase();
    const activeCount = db.userAccounts.filter((u) => u.isActive).length;
    if (activeCount <= 1) {
      res.status(400).json({ success: false, error: 'কমপক্ষে একটি সক্রিয় অ্যাকাউন্ট থাকা বাধ্যতামূলক।' });
      return;
    }

    if (actorUserId && actorUserId === userId) {
      res.status(400).json({ success: false, error: 'নিজের বর্তমান লগইন করা অ্যাকাউন্ট নিষ্ক্রিয় করা যাবে না।' });
      return;
    }

    const user = db.userAccounts.find((u) => u.id === userId);
    if (!user) {
      res.status(404).json({ success: false, error: 'ব্যবহারকারী খুঁজে পাওয়া যায়নি।' });
      return;
    }

    user.isActive = false;
    user.updatedAt = new Date().toISOString();

    await writeDatabase(db);

    res.json({
      success: true,
      userAccounts: db.userAccounts,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to deactivate user';
    res.status(500).json({ success: false, error: msg });
  }
});

// 6. Save Workspace & App Data
apiRouter.post('/save', async (req: Request, res: Response) => {
  try {
    const { userId, workspace, userAccounts } = req.body;
    const db = await readDatabase();

    if (userAccounts && Array.isArray(userAccounts)) {
      db.userAccounts = userAccounts;
    }

    if (workspace) {
      if (userId) {
        db.workspaces[userId] = {
          ...(db.workspaces[userId] || {}),
          ...workspace,
        };
      }
      db.globalWorkspace = {
        ...db.globalWorkspace,
        ...workspace,
      };
    }

    await writeDatabase(db);
    res.json({ success: true, userAccounts: db.userAccounts });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save data';
    res.status(500).json({ success: false, error: msg });
  }
});

// 7. Restore Database from Backup
apiRouter.post('/backup/restore', async (req: Request, res: Response) => {
  try {
    const { payload, userId } = req.body;
    if (!payload || !Array.isArray(payload.userAccounts)) {
      res.status(400).json({ success: false, error: 'অকার্যকর ব্যাকআপ ফাইল।' });
      return;
    }

    const db = await readDatabase();
    db.userAccounts = payload.userAccounts;

    const restoredWorkspace: UserWorkspaceData = {
      months: payload.months || [],
      activeMonthId: payload.activeMonthId || payload.months?.[0]?.id || null,
      members: payload.members || [],
      dailyMeals: payload.dailyMeals || [],
      mealUpdateHistory: payload.mealUpdateHistory || [],
      bazaarExpenses: payload.bazaarExpenses || [],
      universalExpenses: payload.universalExpenses || [],
      deposits: payload.deposits || [],
      auditEvents: payload.auditEvents || [],
    };

    const targetUserId = userId || payload.userAccounts[0]?.id;
    if (targetUserId) {
      db.workspaces[targetUserId] = restoredWorkspace;
    }
    db.globalWorkspace = restoredWorkspace;

    await writeDatabase(db);

    res.json({
      success: true,
      userAccounts: db.userAccounts,
      workspace: restoredWorkspace,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to restore backup';
    res.status(500).json({ success: false, error: msg });
  }
});
