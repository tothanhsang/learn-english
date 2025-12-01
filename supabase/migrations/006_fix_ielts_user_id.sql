-- Fix IELTS data user_id
-- Change from: a1da5eb3-905b-4dab-bc8a-a4398554df75 (wrong user)
-- Change to:   b36ce0ad-f530-47c2-874d-b9c646384b73 (correct user)

-- Update ielts_plans
UPDATE ielts_plans
SET user_id = 'b36ce0ad-f530-47c2-874d-b9c646384b73'
WHERE user_id = 'a1da5eb3-905b-4dab-bc8a-a4398554df75';

-- Update ielts_sessions
UPDATE ielts_sessions
SET user_id = 'b36ce0ad-f530-47c2-874d-b9c646384b73'
WHERE user_id = 'a1da5eb3-905b-4dab-bc8a-a4398554df75';

-- Update ielts_milestones
UPDATE ielts_milestones
SET user_id = 'b36ce0ad-f530-47c2-874d-b9c646384b73'
WHERE user_id = 'a1da5eb3-905b-4dab-bc8a-a4398554df75';

-- Verify the fix
SELECT 'Plans updated:' as info;
SELECT id, name, user_id, is_active FROM ielts_plans;

SELECT 'Sessions updated:' as info;
SELECT id, skill, user_id FROM ielts_sessions;

SELECT 'Milestones updated:' as info;
SELECT id, milestone_type, user_id FROM ielts_milestones;
