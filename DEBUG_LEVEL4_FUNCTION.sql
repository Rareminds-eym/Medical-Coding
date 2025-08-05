-- =====================================================
-- DEBUG AND WORKING LEVEL 4 SOLUTION
-- =====================================================

-- First, let's see what the current function looks like
-- Run this to see what function currently exists:
SELECT 
    prosrc as function_definition
FROM pg_proc 
WHERE proname = 'upsert_level4_game_data_with_history';

-- =====================================================
-- DROP THE OLD FUNCTION AND CREATE NEW ONE
-- =====================================================

-- Drop the existing function completely
DROP FUNCTION IF EXISTS upsert_level4_game_data_with_history;

-- Create the new working function
CREATE OR REPLACE FUNCTION upsert_level4_game_data_with_history(
    p_user_id UUID,
    p_module INTEGER,
    p_new_score INTEGER,
    p_is_completed BOOLEAN,
    p_new_time INTEGER,
    p_cases JSONB
)
RETURNS TEXT AS $$
DECLARE
    result_id UUID;
    current_scores INTEGER[] := '{}';
    current_times INTEGER[] := '{}';
    new_scores INTEGER[] := '{}';
    new_times INTEGER[] := '{}';
BEGIN
    -- Get existing data
    SELECT 
        COALESCE(score_history, '{}'), 
        COALESCE(time_history, '{}')
    INTO current_scores, current_times
    FROM level_4 
    WHERE user_id = p_user_id AND module = p_module;
    
    -- Add new score to arrays
    new_scores := current_scores || p_new_score;
    new_times := current_times || p_new_time;
    
    -- Sort and keep only top 3 scores while maintaining score-time pairs
    IF array_length(new_scores, 1) > 3 THEN
        WITH score_time_pairs AS (
            SELECT 
                unnest(new_scores) as score,
                unnest(new_times) as time_val,
                row_number() OVER () as rn
        ),
        top_3_pairs AS (
            SELECT score, time_val 
            FROM score_time_pairs 
            ORDER BY score DESC, rn ASC
            LIMIT 3
        )
        SELECT 
            array_agg(score ORDER BY score DESC),
            array_agg(time_val ORDER BY score DESC)
        INTO new_scores, new_times
        FROM top_3_pairs;
    END IF;

    -- Insert or update
    INSERT INTO level_4 (
        user_id, module, level, score, is_completed, time, 
        time_history, score_history, cases, created_at, updated_at
    )
    VALUES (
        p_user_id, p_module, 4, 
        new_scores[1], p_is_completed, new_times[1],
        new_times, new_scores, p_cases, NOW(), NOW()
    )
    ON CONFLICT (user_id, module)
    DO UPDATE SET
        score = new_scores[1],
        is_completed = EXCLUDED.is_completed OR level_4.is_completed,
        time = new_times[1],
        time_history = new_times,
        score_history = new_scores,
        cases = p_cases,
        updated_at = NOW()
    RETURNING id INTO result_id;

    RETURN result_id::TEXT;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TEST THE FUNCTION MANUALLY
-- =====================================================

-- Test 1: First score
SELECT upsert_level4_game_data_with_history(
    '12345678-1234-1234-1234-123456789012'::uuid,
    1,
    50,
    true,
    120,
    '{"test": 1}'::jsonb
);

-- Check result
SELECT score_history, time_history FROM level_4 
WHERE user_id = '12345678-1234-1234-1234-123456789012'::uuid AND module = 1;

-- Test 2: Second score  
SELECT upsert_level4_game_data_with_history(
    '12345678-1234-1234-1234-123456789012'::uuid,
    1,
    75,
    true,
    130,
    '{"test": 2}'::jsonb
);

-- Check result (should have both scores)
SELECT score_history, time_history FROM level_4 
WHERE user_id = '12345678-1234-1234-1234-123456789012'::uuid AND module = 1;

-- Test 3: Third score
SELECT upsert_level4_game_data_with_history(
    '12345678-1234-1234-1234-123456789012'::uuid,
    1,
    60,
    true,
    140,
    '{"test": 3}'::jsonb
);

-- Check result (should have 3 scores: [75, 60, 50])
SELECT score_history, time_history FROM level_4 
WHERE user_id = '12345678-1234-1234-1234-123456789012'::uuid AND module = 1;

-- Test 4: Fourth score (should remove lowest)
SELECT upsert_level4_game_data_with_history(
    '12345678-1234-1234-1234-123456789012'::uuid,
    1,
    85,
    true,
    150,
    '{"test": 4}'::jsonb
);

-- Check result (should have 3 scores: [85, 75, 60] - removed 50)
SELECT score_history, time_history FROM level_4 
WHERE user_id = '12345678-1234-1234-1234-123456789012'::uuid AND module = 1;
