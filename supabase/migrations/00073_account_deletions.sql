-- Retain a billing/audit trail when an account is erased.
--
-- Why this table exists at all: profiles.id references auth.users(id) ON DELETE
-- CASCADE, so the "keep for audit" columns on profiles (deletion_requested_at /
-- deletion_completed_at) were destroyed by auth.admin.deleteUser() one statement
-- after being written. They have never held a value. Three accounts have been
-- erased with zero recoverable trace, one of them mid-subscription.
--
-- There is deliberately NO foreign key to auth.users — that is the entire point.
-- The row must outlive the user it describes.
--
-- GDPR: this stores billing facts, not personal data. Retention for the
-- establishment/defence of legal claims is permitted under Art. 17(3)(e), and
-- Lemon Squeezy (merchant of record) holds the invoice regardless. The only
-- identifier retained is email, and only when money was actually involved —
-- see the CHECK constraint below.

CREATE TABLE IF NOT EXISTS account_deletions (
  user_id uuid PRIMARY KEY,
  user_number integer,
  signed_up_at timestamptz,
  deleted_at timestamptz NOT NULL DEFAULT now(),
  deleted_by text NOT NULL DEFAULT 'user' CHECK (deleted_by IN ('user', 'admin')),

  -- Billing state at the moment of deletion
  plan text,
  subscription_status text,
  subscription_id text,
  subscription_period text,
  current_period_end timestamptz,

  -- Did we successfully cancel the upstream subscription before erasing them?
  subscription_cancelled boolean NOT NULL DEFAULT false,
  cancel_error text,

  -- Data minimisation: retained only when a paid subscription existed, so that
  -- an orphaned payment can be reconciled and refunded. Otherwise NULL.
  email text,

  CONSTRAINT email_only_when_paid CHECK (
    email IS NULL OR subscription_id IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_account_deletions_deleted_at
  ON account_deletions(deleted_at DESC);

-- The reconciliation lookup: "this Lemon Squeezy subscription has no profile —
-- was the account deleted?"
CREATE INDEX IF NOT EXISTS idx_account_deletions_subscription_id
  ON account_deletions(subscription_id)
  WHERE subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_account_deletions_email
  ON account_deletions(email)
  WHERE email IS NOT NULL;

-- Service-role only. No user-facing policy: a deleted user has no session, and
-- this must not be readable from the client.
ALTER TABLE account_deletions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_all_account_deletions" ON account_deletions FOR ALL USING (true);
