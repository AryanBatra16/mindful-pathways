-- Seed sample demo user
INSERT OR IGNORE INTO users (id, email, name, password_hash, points, level, theme) 
VALUES ('user_demo_123', 'demo@mind2care.com', 'Demo User', 'demo_hash_placeholder', 150, 'Explorer', 'light');

-- Seed sample mood history
INSERT OR IGNORE INTO mood_history (id, user_id, emoji, label, value, intensity, tags, note) 
VALUES ('mood_1', 'user_demo_123', '😄', 'Joyful', 5, 4, 'grateful,peaceful', 'Had a great start to the morning walk!');

INSERT OR IGNORE INTO mood_history (id, user_id, emoji, label, value, intensity, tags, note) 
VALUES ('mood_2', 'user_demo_123', '🙂', 'Good', 4, 3, 'work,productive', 'Completed key tasks for the day.');

-- Seed sample tasks
INSERT OR IGNORE INTO tasks (id, user_id, title, priority, status, due) 
VALUES ('task_1', 'user_demo_123', 'Morning meditation', 'high', 'today', 'Today');

INSERT OR IGNORE INTO tasks (id, user_id, title, priority, status, due) 
VALUES ('task_2', 'user_demo_123', 'Journal entry', 'medium', 'today', 'Today');

-- Seed sample community post
INSERT OR IGNORE INTO community_posts (id, user_id, author_name, anon, category, content, color) 
VALUES ('post_1', 'user_demo_123', 'Aria', 0, 'Gratitude', 'Today I noticed how the morning light came through my window. Small wins. 💛', 'coral');
