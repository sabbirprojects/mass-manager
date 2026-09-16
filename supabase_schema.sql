-- ===========================================================================
-- Smart Meal Manager — Supabase Database Schema & Initial Seed
-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ===========================================================================

-- 1. Create table for User Accounts
CREATE TABLE IF NOT EXISTS public.user_accounts (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  phone TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  last_login_at TIMESTAMPTZ,
  created_by TEXT DEFAULT 'system' NOT NULL,
  updated_by TEXT DEFAULT 'system' NOT NULL
);

-- 2. Create table for User Workspaces (Months, Members, Meals, Expenses, Deposits)
CREATE TABLE IF NOT EXISTS public.user_workspaces (
  user_id TEXT PRIMARY KEY,
  workspace_data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Enable Row Level Security (RLS) and grant public access via Anon key
ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_workspaces ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access to user_accounts" ON public.user_accounts;
CREATE POLICY "Public access to user_accounts"
  ON public.user_accounts FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public access to user_workspaces" ON public.user_workspaces;
CREATE POLICY "Public access to user_workspaces"
  ON public.user_workspaces FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. Initial Seed Users (Password: mess1234)
-- Hash generated using SHA-256 with salt 'smm_salt_v1_:mess1234'
INSERT INTO public.user_accounts (id, username, display_name, password_hash, is_active, created_at, updated_at, created_by, updated_by)
VALUES
  ('usr_sabbir_01', 'sabbir', 'Sabbir Hossain (সাব্বির)', 'd8280243e87b7c3a373bd157dd9bd0da59134047d0adf0f577e427edd4fade96', true, now(), now(), 'system', 'system'),
  ('usr_tanvir_02', 'tanvir', 'Tanvir Ahmed (তানভীর)', 'd8280243e87b7c3a373bd157dd9bd0da59134047d0adf0f577e427edd4fade96', true, now(), now(), 'system', 'system')
ON CONFLICT (id) DO NOTHING;

-- 5. Initial Seed Workspace (September 2026, 5 members, bazaar, universal bills)
INSERT INTO public.user_workspaces (user_id, workspace_data, updated_at)
VALUES (
  'global',
  '{
    "months": [{
      "id": "month_sep_2026",
      "name": "September 2026 (সেপ্টেম্বর ২০২৬)",
      "startDate": "2026-09-01",
      "endDate": "2026-09-30",
      "totalDays": 30,
      "status": "active",
      "calculationMode": "auto",
      "fixedMealRate": 65,
      "avgMealAdjustmentEnabled": false,
      "lockedAt": null,
      "unlockedAt": null,
      "lockedBy": null,
      "lockReason": null,
      "createdAt": "2026-09-01T00:00:00.000Z",
      "updatedAt": "2026-09-01T00:00:00.000Z",
      "createdBy": "sabbir",
      "updatedBy": "sabbir"
    }],
    "activeMonthId": "month_sep_2026",
    "members": [
      {"id": "mem_1", "monthId": "month_sep_2026", "name": "Sabbir Hossain (সাব্বির)", "previousBalance": 450, "initialDeposit": 3000, "isRemoved": false, "createdAt": "2026-09-01T00:00:00.000Z", "updatedAt": "2026-09-01T00:00:00.000Z", "createdBy": "sabbir", "updatedBy": "sabbir"},
      {"id": "mem_2", "monthId": "month_sep_2026", "name": "Tanvir Ahmed (তানভীর)", "previousBalance": -200, "initialDeposit": 3500, "isRemoved": false, "createdAt": "2026-09-01T00:00:00.000Z", "updatedAt": "2026-09-01T00:00:00.000Z", "createdBy": "sabbir", "updatedBy": "sabbir"},
      {"id": "mem_3", "monthId": "month_sep_2026", "name": "Rakib Hasan (রাকিব)", "previousBalance": 120, "initialDeposit": 3000, "isRemoved": false, "createdAt": "2026-09-01T00:00:00.000Z", "updatedAt": "2026-09-01T00:00:00.000Z", "createdBy": "sabbir", "updatedBy": "sabbir"},
      {"id": "mem_4", "monthId": "month_sep_2026", "name": "Faisal Mahmud (ফয়সাল)", "previousBalance": -500, "initialDeposit": 4000, "isRemoved": false, "createdAt": "2026-09-01T00:00:00.000Z", "updatedAt": "2026-09-01T00:00:00.000Z", "createdBy": "sabbir", "updatedBy": "sabbir"},
      {"id": "mem_5", "monthId": "month_sep_2026", "name": "Naimur Rahman (নাঈমুর)", "previousBalance": 0, "initialDeposit": 2500, "isRemoved": false, "createdAt": "2026-09-01T00:00:00.000Z", "updatedAt": "2026-09-01T00:00:00.000Z", "createdBy": "sabbir", "updatedBy": "sabbir"}
    ],
    "dailyMeals": [
      {"id": "dm_1_1", "monthId": "month_sep_2026", "memberId": "mem_1", "date": "2026-09-01", "mealCount": 2, "createdAt": "2026-09-01T00:00:00.000Z", "updatedAt": "2026-09-01T00:00:00.000Z", "createdBy": "sabbir", "updatedBy": "sabbir"},
      {"id": "dm_2_1", "monthId": "month_sep_2026", "memberId": "mem_2", "date": "2026-09-01", "mealCount": 3, "createdAt": "2026-09-01T00:00:00.000Z", "updatedAt": "2026-09-01T00:00:00.000Z", "createdBy": "sabbir", "updatedBy": "sabbir"},
      {"id": "dm_3_1", "monthId": "month_sep_2026", "memberId": "mem_3", "date": "2026-09-01", "mealCount": 2, "createdAt": "2026-09-01T00:00:00.000Z", "updatedAt": "2026-09-01T00:00:00.000Z", "createdBy": "sabbir", "updatedBy": "sabbir"},
      {"id": "dm_4_1", "monthId": "month_sep_2026", "memberId": "mem_4", "date": "2026-09-01", "mealCount": 2.5, "createdAt": "2026-09-01T00:00:00.000Z", "updatedAt": "2026-09-01T00:00:00.000Z", "createdBy": "sabbir", "updatedBy": "sabbir"},
      {"id": "dm_5_1", "monthId": "month_sep_2026", "memberId": "mem_5", "date": "2026-09-01", "mealCount": 1.5, "createdAt": "2026-09-01T00:00:00.000Z", "updatedAt": "2026-09-01T00:00:00.000Z", "createdBy": "sabbir", "updatedBy": "sabbir"}
    ],
    "mealUpdateHistory": [],
    "bazaarExpenses": [
      {"id": "baz_1", "monthId": "month_sep_2026", "memberId": "mem_1", "date": "2026-09-02", "description": "Rice, Lentils, Oil (চাল, ডাল, তেল)", "amount": 2850, "type": "groceries", "createdAt": "2026-09-02T00:00:00.000Z", "updatedAt": "2026-09-02T00:00:00.000Z", "createdBy": "sabbir", "updatedBy": "sabbir"},
      {"id": "baz_2", "monthId": "month_sep_2026", "memberId": "mem_2", "date": "2026-09-06", "description": "Fish & Chicken (মাছ ও মুরগি)", "amount": 2400, "type": "fish_meat", "createdAt": "2026-09-06T00:00:00.000Z", "updatedAt": "2026-09-06T00:00:00.000Z", "createdBy": "tanvir", "updatedBy": "tanvir"}
    ],
    "universalExpenses": [
      {"id": "uni_1", "monthId": "month_sep_2026", "date": "2026-09-05", "description": "WiFi Bill", "amount": 1000, "applicableMemberIds": ["mem_1", "mem_2", "mem_3", "mem_4", "mem_5"], "perMemberShare": 200, "createdAt": "2026-09-05T00:00:00.000Z", "updatedAt": "2026-09-05T00:00:00.000Z", "createdBy": "sabbir", "updatedBy": "sabbir"}
    ],
    "deposits": [
      {"id": "dep_1", "monthId": "month_sep_2026", "memberId": "mem_1", "date": "2026-09-07", "amount": 1000, "note": "Cash", "createdAt": "2026-09-07T00:00:00.000Z", "updatedAt": "2026-09-07T00:00:00.000Z", "createdBy": "sabbir", "updatedBy": "sabbir"}
    ],
    "auditEvents": [
      {"id": "aud_1", "timestamp": "2026-09-01T00:00:00.000Z", "action": "CREATE_MONTH", "entityType": "Month", "entityId": "month_sep_2026", "userId": "usr_sabbir_01", "username": "sabbir", "details": "Initial month created"}
    ]
  }'::jsonb,
  now()
)
ON CONFLICT (user_id) DO NOTHING;

-- Also seed for usr_sabbir_01
INSERT INTO public.user_workspaces (user_id, workspace_data, updated_at)
SELECT 'usr_sabbir_01', workspace_data, now()
FROM public.user_workspaces WHERE user_id = 'global'
ON CONFLICT (user_id) DO NOTHING;
