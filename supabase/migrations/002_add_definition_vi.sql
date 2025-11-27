-- Add Vietnamese definition column to words table
-- Run this if you already have the database set up

ALTER TABLE words ADD COLUMN IF NOT EXISTS definition_vi TEXT;
