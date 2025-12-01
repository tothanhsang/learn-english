-- Seed script for IELTS Weekly Study Plan
-- Run this AFTER the migration (005_add_ielts_plans.sql)
-- Replace 'YOUR_USER_ID' with your actual user ID from auth.users table

-- First, get your user ID by running:
-- SELECT id, email FROM auth.users;

-- Then replace the UUID below with your user ID
DO $$
DECLARE
  v_user_id UUID;
  v_plan_id BIGINT;
BEGIN
  -- Get the first user (or specify your user email)
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found. Please create an account first.';
  END IF;

  -- Create the IELTS Plan
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
  ) VALUES (
    v_user_id,
    'IELTS 7.0 Weekly Plan',
    CURRENT_DATE + INTERVAL '3 months',  -- Exam in 3 months
    7.0,  -- target_listening
    7.0,  -- target_reading
    6.5,  -- target_writing
    6.5,  -- target_speaking
    7.0,  -- target_overall
    5.5,  -- current_listening (adjust to your level)
    5.5,  -- current_reading
    5.0,  -- current_writing
    5.0,  -- current_speaking
    5.5,  -- current_overall
    1,    -- 1 hour per day (50 min sessions)
    E'📅 Weekly Structure:\n\n' ||
    E'Monday – Listening\n' ||
    E'• 20 min: Listen to BBC Learning English / IELTS Listening test\n' ||
    E'• 20 min: Do one section of IELTS Listening\n' ||
    E'• 10 min: Review mistakes\n\n' ||
    E'Tuesday – Reading\n' ||
    E'• 30 min: Do 1 passage (IELTS Cambridge)\n' ||
    E'• 15 min: Review vocabulary\n' ||
    E'• 10 min: Skim + scan practice\n\n' ||
    E'Wednesday – Writing\n' ||
    E'• 25 min: Task 1 (charts/graphs)\n' ||
    E'• 25 min: Task 2 (essay outline)\n' ||
    E'• 10 min: Learn templates + grammar\n\n' ||
    E'Thursday – Speaking\n' ||
    E'• 15 min: Practice Part 1\n' ||
    E'• 15 min: Practice Part 2 (2-minute talk)\n' ||
    E'• 15 min: Record yourself\n\n' ||
    E'Friday – Vocabulary + Grammar\n' ||
    E'• 20 min: Learn 10–15 new IELTS words\n' ||
    E'• 20 min: Grammar practice\n' ||
    E'• 10 min: Pronunciation practice\n\n' ||
    E'Saturday – Full Skill Review\n' ||
    E'• 1 full Listening or Reading test\n' ||
    E'• Review all mistakes\n\n' ||
    E'Sunday – Relaxed Learning\n' ||
    E'• Watch English content\n' ||
    E'• Mirror speaking practice\n' ||
    E'• Light vocabulary review',
    true
  ) RETURNING id INTO v_plan_id;

  RAISE NOTICE 'Created IELTS plan with ID: %', v_plan_id;

  -- Add sample sessions for this week (as examples)
  -- Monday - Listening
  INSERT INTO ielts_sessions (plan_id, user_id, skill, duration_minutes, activity, notes, session_date)
  VALUES
    (v_plan_id, v_user_id, 'listening', 50, 'BBC Learning English + IELTS Listening Section 1-2', 'Focus on number dictation and map labeling', CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE)::INT + 1);

  -- Tuesday - Reading
  INSERT INTO ielts_sessions (plan_id, user_id, skill, duration_minutes, activity, notes, session_date)
  VALUES
    (v_plan_id, v_user_id, 'reading', 55, 'Cambridge 18 Test 1 - Passage 1', 'Practice TRUE/FALSE/NOT GIVEN', CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE)::INT + 2);

  -- Wednesday - Writing
  INSERT INTO ielts_sessions (plan_id, user_id, skill, duration_minutes, activity, notes, session_date)
  VALUES
    (v_plan_id, v_user_id, 'writing', 60, 'Task 1: Bar chart + Task 2: Education essay outline', 'Learn comparison phrases', CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE)::INT + 3);

  -- Thursday - Speaking
  INSERT INTO ielts_sessions (plan_id, user_id, skill, duration_minutes, activity, notes, session_date)
  VALUES
    (v_plan_id, v_user_id, 'speaking', 45, 'Part 1: Hometown, Work + Part 2: Describe a book', 'Record and listen back', CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE)::INT + 4);

  -- Friday - Vocabulary
  INSERT INTO ielts_sessions (plan_id, user_id, skill, duration_minutes, activity, notes, session_date)
  VALUES
    (v_plan_id, v_user_id, 'reading', 50, 'IELTS Vocabulary: Environment topic + Collocations', 'Added 15 new words to flashcards', CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE)::INT + 5);

  -- Add a sample milestone
  INSERT INTO ielts_milestones (plan_id, user_id, milestone_type, listening_score, reading_score, writing_score, speaking_score, overall_score, title, notes, milestone_date)
  VALUES
    (v_plan_id, v_user_id, 'practice_test', 5.5, 5.5, 5.0, 5.0, 5.5, 'Initial Assessment', 'Starting point - need to improve writing coherence and speaking fluency', CURRENT_DATE - 7);

  RAISE NOTICE 'Added sample sessions and milestone';
  RAISE NOTICE 'Setup complete! Your IELTS plan is ready.';

END $$;

-- Verify the data
SELECT 'Plans:' as info;
SELECT id, name, target_overall, current_overall, exam_date FROM ielts_plans;

SELECT 'Sessions:' as info;
SELECT id, skill, duration_minutes, activity, session_date FROM ielts_sessions ORDER BY session_date;

SELECT 'Milestones:' as info;
SELECT id, milestone_type, overall_score, title, milestone_date FROM ielts_milestones;
