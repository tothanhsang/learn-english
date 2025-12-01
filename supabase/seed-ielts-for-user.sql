-- STEP 1: First, find your user ID by running this query:
-- SELECT id, email FROM auth.users;
-- Copy your user ID (UUID) and replace it below

-- STEP 2: Replace 'YOUR_USER_ID_HERE' with your actual UUID
-- Example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

-- STEP 3: Run this entire script

-- Clean up existing data first (optional - uncomment if needed)
-- DELETE FROM ielts_milestones;
-- DELETE FROM ielts_sessions;
-- DELETE FROM ielts_plans;

-- Insert plan for YOUR user
INSERT INTO ielts_plans (
  user_id,
  name,
  exam_date,
  target_listening,
  target_reading,
  target_writing,
  target_speaking,
  target_overall,
  current_listening,
  current_reading,
  current_writing,
  current_speaking,
  current_overall,
  study_hours_per_day,
  notes,
  is_active
)
SELECT
  id as user_id,
  'IELTS 7.0 Weekly Plan',
  CURRENT_DATE + INTERVAL '3 months',
  7.0, 7.0, 6.5, 6.5, 7.0,  -- targets
  5.5, 5.5, 5.0, 5.0, 5.5,  -- current
  1,
  '📅 Weekly Structure:

Monday – Listening
• 20 min: Listen to BBC Learning English
• 20 min: Do one section of IELTS Listening
• 10 min: Review mistakes

Tuesday – Reading
• 30 min: Do 1 passage (IELTS Cambridge)
• 15 min: Review vocabulary
• 10 min: Skim + scan practice

Wednesday – Writing
• 25 min: Task 1 (charts/graphs)
• 25 min: Task 2 (essay outline)
• 10 min: Learn templates + grammar

Thursday – Speaking
• 15 min: Practice Part 1
• 15 min: Practice Part 2 (2-minute talk)
• 15 min: Record yourself

Friday – Vocabulary + Grammar
• 20 min: Learn 10–15 new IELTS words
• 20 min: Grammar practice
• 10 min: Pronunciation practice

Saturday – Full Skill Review
• 1 full Listening or Reading test
• Review all mistakes

Sunday – Relaxed Learning
• Watch English content
• Mirror speaking practice
• Light vocabulary review',
  true
FROM auth.users
WHERE email = 'YOUR_EMAIL_HERE'  -- CHANGE THIS TO YOUR EMAIL
LIMIT 1;

-- Verify
SELECT id, name, user_id, is_active FROM ielts_plans;
