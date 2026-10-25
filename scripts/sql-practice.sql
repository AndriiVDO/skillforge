-- SkillForge SQL practice.
-- Read-only queries: no application data is changed.

-- 1. List topics alphabetically.
SELECT "Id", "Title", "Category"
FROM topics
ORDER BY "Title";

-- 2. List Linux tasks in learning order.
SELECT
    t."Title" AS topic,
    l."Title" AS lesson,
    l."Position" AS position
FROM topics AS t
INNER JOIN lessons AS l ON l."TopicId" = t."Id"
WHERE t."Slug" = 'linux'
ORDER BY l."Position";

-- 3. Find Systems and Operations topics with at least three tasks.
SELECT
    t."Title" AS topic,
    COUNT(l."Id") AS lesson_count
FROM topics AS t
LEFT JOIN lessons AS l ON l."TopicId" = t."Id"
WHERE t."Category" IN ('Systems', 'Operations')
GROUP BY t."Id", t."Title"
HAVING COUNT(l."Id") >= 3
ORDER BY t."Title", t."Id";

-- 4. Count tasks and resources without double-counting joined rows.
SELECT
    t."Title" AS topic,
    COUNT(DISTINCT l."Id") AS lesson_count,
    COUNT(DISTINCT r."Id") AS resource_count
FROM topics AS t
LEFT JOIN lessons AS l ON l."TopicId" = t."Id"
LEFT JOIN resources AS r ON r."TopicId" = t."Id"
GROUP BY t."Id", t."Title"
ORDER BY t."Id";