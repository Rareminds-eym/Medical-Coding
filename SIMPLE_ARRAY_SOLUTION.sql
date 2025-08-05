-- =====================================================
-- SIMPLE ARRAY-BASED LEVEL 4 SCORE HISTORY MANAGEMENT
-- This version uses only array operations - NO temp tables, NO complex logic
-- Copy and paste this ENTIRE file into Supabase SQL Editor
-- =====================================================

-- Drop and recreate with simple array approach
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
    current_scores INTEGER[];
    current_times INTEGER[];
    final_scores INTEGER[];
    final_times INTEGER[];
BEGIN
    -- Get existing arrays
    SELECT score_history, time_history
    INTO current_scores, current_times
    FROM level_4
    WHERE user_id = p_user_id AND module = p_module;

    -- If no existing record, start with just the new score
    IF current_scores IS NULL THEN
        final_scores := ARRAY[p_new_score];
        final_times := ARRAY[p_new_time];
    ELSE
        -- Add new score to existing arrays
        current_scores := current_scores || p_new_score;
        current_times := current_times || p_new_time;
        
        -- Sort and get top 3 scores with corresponding times
        WITH sorted_data AS (
            SELECT 
                unnest(current_scores) as score,
                unnest(current_times) as time_val,
                ROW_NUMBER() OVER (ORDER BY unnest(current_scores) DESC) as rn
        )
        SELECT 
            array_agg(score ORDER BY score DESC) FILTER (WHERE rn <= 3),
            array_agg(time_val ORDER BY score DESC) FILTER (WHERE rn <= 3)
        INTO final_scores, final_times
        FROM sorted_data;
    END IF;

    -- Insert or update the record
    INSERT INTO level_4 (
        user_id, module, level,
        score, is_completed, time, 
        time_history, score_history, cases
    )
    VALUES (
        p_user_id, p_module, 4,
        final_scores[1], p_is_completed, final_times[1],
        final_times, final_scores, p_cases
    )
    ON CONFLICT (user_id, module)
    DO UPDATE SET
        score = final_scores[1],
        is_completed = EXCLUDED.is_completed OR level_4.is_completed,
        time = final_times[1],
        time_history = final_times,
        score_history = final_scores,
        cases = CASE
            WHEN final_scores[1] > level_4.score THEN EXCLUDED.cases
            ELSE level_4.cases
        END,
        updated_at = NOW()
    RETURNING id INTO result_id;

    RETURN result_id::TEXT;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TEST FUNCTION - SIMPLE VERSION
-- =====================================================

CREATE OR REPLACE FUNCTION test_simple_score_history(
    p_user_id UUID,
    p_module INTEGER
)
RETURNS TABLE(
    step_info TEXT,
    scores INTEGER[],
    times INTEGER[]
) AS $$
BEGIN
    -- Clear existing data
    DELETE FROM level_4 WHERE user_id = p_user_id AND module = p_module;
    
    -- Test score 1: 50
    PERFORM upsert_level4_game_data_with_history(p_user_id, p_module, 50, true, 120, '{"test": 1}'::jsonb);
    RETURN QUERY SELECT 'After score 50'::TEXT, score_history, time_history FROM level_4 WHERE user_id = p_user_id AND module = p_module;
    
    -- Test score 2: 75
    PERFORM upsert_level4_game_data_with_history(p_user_id, p_module, 75, true, 130, '{"test": 2}'::jsonb);
    RETURN QUERY SELECT 'After score 75'::TEXT, score_history, time_history FROM level_4 WHERE user_id = p_user_id AND module = p_module;
    
    -- Test score 3: 60
    PERFORM upsert_level4_game_data_with_history(p_user_id, p_module, 60, true, 140, '{"test": 3}'::jsonb);
    RETURN QUERY SELECT 'After score 60'::TEXT, score_history, time_history FROM level_4 WHERE user_id = p_user_id AND module = p_module;
    
    -- Test score 4: 85 (should remove 50)
    PERFORM upsert_level4_game_data_with_history(p_user_id, p_module, 85, true, 150, '{"test": 4}'::jsonb);
    RETURN QUERY SELECT 'After score 85'::TEXT, score_history, time_history FROM level_4 WHERE user_id = p_user_id AND module = p_module;
    
    -- Test score 5: 70 (should remove 60)
    PERFORM upsert_level4_game_data_with_history(p_user_id, p_module, 70, true, 160, '{"test": 5}'::jsonb);
    RETURN QUERY SELECT 'After score 70'::TEXT, score_history, time_history FROM level_4 WHERE user_id = p_user_id AND module = p_module;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- QUICK TEST COMMAND
-- =====================================================

/*
-- Run this test after creating the functions:
SELECT * FROM test_simple_score_history(
    '12345678-1234-1234-1234-123456789012'::uuid, 
    1
);

-- Expected results:
-- After score 50: [50], [120]
-- After score 75: [75, 50], [130, 120] 
-- After score 60: [75, 60, 50], [130, 140, 120]
-- After score 85: [85, 75, 60], [150, 130, 140]
-- After score 70: [85, 75, 70], [150, 130, 160]
*/
