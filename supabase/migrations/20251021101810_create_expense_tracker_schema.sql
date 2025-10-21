/*
  # CoinKeeper Expense Tracker Database Schema

  ## Overview
  Creates the complete database schema for the CoinKeeper mobile expense tracking app,
  including user profiles, expenses, and budgets with proper security policies.

  ## New Tables

  ### 1. profiles
  Stores user profile information linked to Supabase auth.users
  - `id` (uuid, primary key) - References auth.users
  - `name` (text) - User's display name
  - `email` (text) - User's email address
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last profile update timestamp

  ### 2. expenses
  Tracks individual expense entries
  - `id` (uuid, primary key) - Unique expense identifier
  - `user_id` (uuid, foreign key) - References profiles.id
  - `title` (text) - Expense description
  - `category` (text) - Expense category (e.g., Food, Transport)
  - `amount` (numeric) - Expense amount (positive values only)
  - `date` (date) - Date of expense
  - `budget_id` (uuid, foreign key, nullable) - Optional link to budget
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. budgets
  Manages spending limits by category
  - `id` (uuid, primary key) - Unique budget identifier
  - `user_id` (uuid, foreign key) - References profiles.id
  - `category` (text) - Budget category name
  - `budget_limit` (numeric) - Maximum spending limit (positive values only)
  - `created_at` (timestamptz) - Budget creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security

  ### Row Level Security (RLS)
  All tables have RLS enabled with the following policies:

  #### profiles table
  - Users can view only their own profile
  - Users can insert their own profile on signup
  - Users can update only their own profile
  - Users cannot delete profiles

  #### expenses table
  - Users can view only their own expenses
  - Users can create expenses for themselves
  - Users can update only their own expenses
  - Users can delete only their own expenses

  #### budgets table
  - Users can view only their own budgets
  - Users can create budgets for themselves
  - Users can update only their own budgets
  - Users can delete only their own budgets

  ## Indexes
  - Index on expenses.user_id for fast user expense queries
  - Index on expenses.category for category-based filtering
  - Index on expenses.date for date-range queries
  - Index on budgets.user_id for fast user budget queries
  - Index on budgets.category for category lookups

  ## Important Notes
  1. All monetary amounts use numeric type for precision
  2. Timestamps use timestamptz for timezone awareness
  3. Foreign keys ensure referential integrity
  4. RLS policies enforce user data isolation
  5. Each user can only access their own data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create budgets table (must be created before expenses due to foreign key)
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category text NOT NULL,
  budget_limit numeric NOT NULL CHECK (budget_limit > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  date date NOT NULL DEFAULT CURRENT_DATE,
  budget_id uuid REFERENCES budgets(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Expenses policies
CREATE POLICY "Users can view own expenses"
  ON expenses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own expenses"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
  ON expenses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON expenses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Budgets policies
CREATE POLICY "Users can view own budgets"
  ON budgets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own budgets"
  ON budgets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets"
  ON budgets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets"
  ON budgets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
