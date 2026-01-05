/*
  # Create Islamic Meeras (Inheritance) App Schema

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text) - Category name like "Basic Inheritance", "Special Cases", etc.
      - `description` (text) - Category description
      - `order_index` (integer) - Display order
      - `created_at` (timestamp)
    
    - `questions`
      - `id` (uuid, primary key)
      - `category_id` (uuid, foreign key to categories)
      - `question_text` (text) - The MCQ question
      - `explanation` (text) - Detailed explanation for educational purpose
      - `order_index` (integer) - Order within category
      - `created_at` (timestamp)
    
    - `options`
      - `id` (uuid, primary key)
      - `question_id` (uuid, foreign key to questions)
      - `option_text` (text) - The option text
      - `is_correct` (boolean) - Whether this is the correct answer
      - `explanation` (text) - Explanation for this specific option
      - `order_index` (integer) - Display order
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for public read access (informative app, no user accounts needed)
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  explanation text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_text text NOT NULL,
  is_correct boolean NOT NULL DEFAULT false,
  explanation text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are publicly readable"
  ON categories FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Questions are publicly readable"
  ON questions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Options are publicly readable"
  ON options FOR SELECT
  TO anon
  USING (true);