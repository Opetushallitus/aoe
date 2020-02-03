DROP TABLE IF EXISTS link;

CREATE TABLE link(
  meta_id INTEGER NOT NULL,
  material_id INTEGER NOT NULL,
  version VARCHAR(10) NOT NULL,
  latest SMALLINT NOT NULL,
  hash CHAR(40) NOT NULL UNIQUE,
  target_url VARCHAR(2048) NOT NULL,
  CONSTRAINT link_pk PRIMARY KEY (meta_id, material_id, version)
);

INSERT INTO link VALUES (1, 1, 'latest', 1, '85e7ab0180b6b0e09a54c7a750cc91e73776b94a', 'https://aoe.fi');
INSERT INTO link VALUES (1, 2, '1.0', 0, '85e7ab0180b6b0e09a54c7a750cc91e73776b94b', 'https://aoe.fi');
