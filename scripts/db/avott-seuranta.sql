-- AVOTT-seuranta export without ytunnus.
-- Run via psql with -v year=YYYY (e.g. psql -v year=2025 -f avott-seuranta-no-ytunnus.sql).
-- NOTE: scripts/avott-seuranta-no-ytunnus.sh substitutes :'year' in shell before invoking
-- \copy, because psql does not expand variables inside \copy ( ... ).

WITH material_meta AS (
    SELECT
        em.id                                                       AS material_id,
        (em.publishedat AT TIME ZONE 'Europe/Helsinki')::date        AS published_at,
        COALESCE(
            MAX(mn.materialname) FILTER (WHERE mn.language = 'fi'),
            MAX(mn.materialname) FILTER (WHERE mn.language = 'sv'),
            MAX(mn.materialname) FILTER (WHERE mn.language = 'en')
        )                                                           AS material_name,
        STRING_AGG(DISTINCT au.authorname, '; ' ORDER BY au.authorname)
            FILTER (WHERE au.authorname IS NOT NULL AND au.authorname <> '') AS author_name
    FROM educationalmaterial em
    LEFT JOIN materialname mn ON mn.educationalmaterialid = em.id
    LEFT JOIN author       au ON au.educationalmaterialid = em.id
    WHERE em.publishedat IS NOT NULL
      AND em.publishedat < ((:'year' || '-12-31 23:59:59')::timestamp AT TIME ZONE 'Europe/Helsinki')
    GROUP BY em.id
),
material_orgs AS (
    SELECT DISTINCT material_id, name FROM (
        SELECT educationalmaterialid AS material_id, organization AS name
        FROM author
        WHERE organization IS NOT NULL AND organization <> ''
        UNION ALL
        SELECT educationalmaterialid, name
        FROM publisher
        WHERE name IS NOT NULL AND name <> ''
    ) org_rows
)
SELECT mm.material_id,
       mm.published_at,
       mm.material_name,
       mm.author_name,
       mo.name AS organisation_or_publisher
FROM material_meta mm
JOIN material_orgs mo ON mo.material_id = mm.material_id
ORDER BY mm.material_id, mo.name;
