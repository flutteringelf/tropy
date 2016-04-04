
CREATE TABLE archive (
  archive_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
  opened_at TIMESTAMP NOT NULL DEFAULT current_timestamp
);


CREATE TABLE objects (
  id INTEGER PRIMARY KEY,
  created_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
  modified_at TIMESTAMP NOT NULL DEFAULT current_timestamp
);


-- Metadata

CREATE TABLE metadata (
  id INTEGER,
  field_id INTEGER,
  position INTEGER NOT NULL DEFAULT 0,
  value,

  PRIMARY KEY(id, field_id),

  UNIQUE(id, position),

  FOREIGN KEY(id) REFERENCES objects(id)
    ON DELETE CASCADE,
  FOREIGN KEY(field_id) REFERENCES fields(field_id)
    ON DELETE CASCADE
);

CREATE TABLE fields (
  field_id INTEGER PRIMARY KEY,
  type_id INTEGER,
  field_name TEXT UNIQUE NOT NULL COLLATE NOCASE,

  FOREIGN KEY(type_id) REFERENCES types(type_id)
);

CREATE TABLE types (
  type_id INTEGER PRIMARY KEY,
  type_name TEXT UNIQUE NOT NULL COLLATE NOCASE
);

CREATE TABLE templates (
  id INTEGER PRIMARY KEY,
  template_name TEXT UNIQUE NOT NULL COLLATE NOCASE,

  FOREIGN KEY(id) REFERENCES objects(id)
    ON DELETE CASCADE
);


-- Items

CREATE TABLE items (
  id INTEGER PRIMARY KEY,
  cover_image_id INTEGER,

  FOREIGN KEY(id) REFERENCES objects(id)
    ON DELETE CASCADE,
  FOREIGN KEY (cover_image_id) REFERENCES images(id)
    ON DELETE SET NULL
);


-- Photos

CREATE TABLE photos (
  photo_id INTEGER PRIMARY KEY,
  item_id INTEGER NOT NULL REFERENCES items(id),
  path TEXT NOT NULL,
  width INTEGER NOT NULL DEFAULT 0,
  height INTEGER NOT NULL DEFAULT 0,
  orientation INTEGER NOT NULL DEFAULT 1,
  mimetype TEXT,
  checksum TEXT,
  exif JSON,
  created_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
  modified_at TIMESTAMP NOT NULL DEFAULT current_timestamp
);


-- Images

CREATE TABLE images (
  id INTEGER PRIMARY KEY REFERENCES objects(id) ON DELETE CASCADE,
  photo_id INTEGER NOT NULL REFERENCES photos(photo_id),
  quality TEXT NOT NULL DEFAULT 'default',

  FOREIGN KEY(quality) REFERENCES image_qualities(quality)
    ON UPDATE CASCADE
    ON DELETE SET DEFAULT
);

CREATE TABLE image_regions (
  id INTEGER PRIMARY KEY REFERENCES images(id) ON DELETE CASCADE,
  x NUMERIC NOT NULL DEFAULT 0,
  y NUMERIC NOT NULL DEFAULT 0,
  width NUMERIC NOT NULL DEFAULT 100,
  height NUMERIC NOT NULL DEFAULT 100,
  pct BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE image_scales (
  id INTEGER PRIMARY KEY REFERENCES images(id) ON DELETE CASCADE,
  x NUMERIC,
  y NUMERIC,
  factor NUMERIC,
  fit BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE image_rotations (
  id INTEGER PRIMARY KEY REFERENCES images(id) ON DELETE CASCADE,
  angle NUMERIC,
  mirror BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE image_qualities (
  quality TEXT PRIMARY KEY
) WITHOUT ROWID;

INSERT INTO image_qualities VALUES
  ('default'), ('color'), ('gray'), ('bitonal');


-- Notes

CREATE TABLE notes (
  note_id INTEGER PRIMARY KEY,
  created_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
  modified_at TIMESTAMP NOT NULL DEFAULT current_timestamp
);

CREATE TABLE object_notes (
  id INTEGER,
  note_id INTEGER,

  PRIMARY KEY(id, note_id),

  FOREIGN KEY(id) REFERENCES objects(id)
    ON DELETE CASCADE,
  FOREIGN KEY(note_id) REFERENCES notes(note_id)
    ON DELETE CASCADE
);


-- Lists

CREATE TABLE lists (
  list_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  parent_list_id INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
  modified_at TIMESTAMP NOT NULL DEFAULT current_timestamp,

  FOREIGN KEY(parent_list_id) REFERENCES lists(list_id)
    ON DELETE CASCADE
);

CREATE TABLE list_items (
  id INTEGER,
  list_id INTEGER,
  position INTEGER NOT NULL DEFAULT 0,

  PRIMARY KEY(id, list_id),

  FOREIGN KEY(id) REFERENCES items(id)
    ON DELETE CASCADE,
  FOREIGN KEY(list_id) REFERENCES lists(list_id)
    ON DELETE CASCADE,

  UNIQUE(id, list_id, position)
);


-- Tags

CREATE TABLE tags (
  tag_id INTEGER PRIMARY KEY,
  name TEXT UNIQUE NOT NULL COLLATE NOCASE,
  color,
  created_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
  modified_at TIMESTAMP NOT NULL DEFAULT current_timestamp
);

CREATE TABLE object_tags (
  id INTEGER,
  tag_id INTEGER,

  PRIMARY KEY(id, tag_id),

  FOREIGN KEY(id) REFERENCES objects(id)
    ON DELETE CASCADE,
  FOREIGN KEY(tag_id) REFERENCES tags(tag_id)
    ON DELETE CASCADE
);


-- Trash

CREATE TABLE trash (
  id INTEGER PRIMARY KEY REFERENCES objects(id) ON DELETE CASCADE,
  deleted_at TIMESTAMP NOT NULL DEFAULT current_timestamp
);
