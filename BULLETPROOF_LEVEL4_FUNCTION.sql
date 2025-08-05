-- =====================================================
-- BULLETPROOF LEVEL 4 SCORE HISTORY SOLUTION
-- This version properly maintains score-time pairs and doesn't delete data
-- =====================================================

-- Drop and recreate the function with proper score-time pairing
DROP FUNCTION IF EXISTS upsert_level4_game_data_with_history;

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
    final_scores INTEGER[] := '{}';
    final_times INTEGER[] := '{}';
    i INTEGER;
    j INTEGER;
    temp_score INTEGER;
    temp_time INTEGER;
BEGIN
    -- Get existing data
    SELECT 
        COALESCE(score_history, '{}'), 
        COALESCE(time_history, '{}')
    INTO current_scores, current_times
    FROM level_4 
    WHERE user_id = p_user_id AND module = p_module;
    
    -- Add new score and time to the arrays
    current_scores := current_scores || p_new_score;
    current_times := current_times || p_new_time;
    
    -- Manual bubble sort to keep score-time pairs together (simple but reliable)
    -- Sort by score DESC while keeping pairs aligned
    FOR i IN 1..array_length(current_scores, 1) LOOP
        FOR j IN 1..(array_length(current_scores, 1) - i) LOOP
            IF current_scores[j] < current_scores[j + 1] THEN
                -- Swap scores
                temp_score := current_scores[j];
                current_scores[j] := current_scores[j + 1];
                current_scores[j + 1] := temp_score;
                
                -- Swap corresponding times
                temp_time := current_times[j];
                current_times[j] := current_times[j + 1];
                current_times[j + 1] := temp_time;
            END IF;
        END LOOP;
    END LOOP;
    
    -- Keep only top 3 scores (if more than 3)
    IF array_length(current_scores, 1) > 3 THEN
        final_scores := current_scores[1:3];
        final_times := current_times[1:3];
    ELSE
        final_scores := current_scores;
        final_times := current_times;
    END IF;

    -- Insert or update
    INSERT INTO level_4 (
        user_id, module, level, score, is_completed, time, 
        time_history, score_history, cases, created_at, updated_at
    )
    VALUES (
        p_user_id, p_module, 4, 
        final_scores[1], p_is_completed, final_times[1],
        final_times, final_scores, p_cases, NOW(), NOW()
    )
    ON CONFLICT (user_id, module)
    DO UPDATE SET
        score = final_scores[1],
        is_completed = EXCLUDED.is_completed OR level_4.is_completed,
        time = final_times[1],
        time_history = final_times,
        score_history = final_scores,
        cases = p_cases,
        updated_at = NOW()
    RETURNING id INTO result_id;

    RETURN result_id::TEXT;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TEST THE BULLETPROOF FUNCTION
-- =====================================================

-- Clear test data first
DELETE FROM level_4 WHERE user_id = '12345678-1234-1234-1234-123456789012'::uuid AND module = 1;

-- Test 1: First score (50, time 120)
SELECT upsert_level4_game_data_with_history(
    '12345678-1234-1234-1234-123456789012'::uuid,
    1,
    50,
    true,
    120,
    '{"test": 1}'::jsonb
);

SELECT 'After Test 1:' as step, score_history, time_history FROM level_4 
WHERE user_id = '12345678-1234-1234-1234-123456789012'::uuid AND module = 1;

-- Test 2: Second score (75, time 130) - should be [75, 50], [130, 120]
SELECT upsert_level4_game_data_with_history(
    '12345678-1234-1234-1234-123456789012'::uuid,
    1,
    75,
    true,
    130,
    '{"test": 2}'::jsonb
);

SELECT 'After Test 2:' as step, score_history, time_history FROM level_4 
WHERE user_id = '12345678-1234-1234-1234-123456789012'::uuid AND module = 1;

-- Test 3: Third score (60, time 140) - should be [75, 60, 50], [130, 140, 120]  
SELECT upsert_level4_game_data_with_history(
    '12345678-1234-1234-1234-123456789012'::uuid,
    1,
    60,
    true,
    140,
    '{"test": 3}'::jsonb
);

SELECT 'After Test 3:' as step, score_history, time_history FROM level_4 
WHERE user_id = '12345678-1234-1234-1234-123456789012'::uuid AND module = 1;

-- Test 4: Fourth score (85, time 150) - should be [85, 75, 60], [150, 130, 140]
SELECT upsert_level4_game_data_with_history(
    '12345678-1234-1234-1234-123456789012'::uuid,
    1,
    85,
    true,
    150,
    '{"test": 4}'::jsonb
);

SELECT 'After Test 4:' as step, score_history, time_history FROM level_4 
WHERE user_id = '12345678-1234-1234-1234-123456789012'::uuid AND module = 1;

-- Test 5: Fifth score (70, time 160) - should be [85, 75, 70], [150, 130, 160]
SELECT upsert_level4_game_data_with_history(
    '12345678-1234-1234-1234-123456789012'::uuid,
    1,
    70,
    true,
    160,
    '{"test": 5}'::jsonb
);

SELECT 'After Test 5:' as step, score_history, time_history FROM level_4 
WHERE user_id = '12345678-1234-1234-1234-123456789012'::uuid AND module = 1;
