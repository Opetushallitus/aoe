DROP TABLE IF EXISTS link;

CREATE TABLE link (
  meta_id INTEGER NOT NULL,
  material_id INTEGER NOT NULL,
  version VARCHAR(10) NOT NULL,
  latest SMALLINT NOT NULL,
  hash CHAR(32) NOT NULL UNIQUE,
  target_url VARCHAR(2048) NOT NULL,
  CONSTRAINT link_pk PRIMARY KEY (meta_id, material_id, version)
);
