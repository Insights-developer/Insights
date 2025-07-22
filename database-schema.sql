-- Database Schema DDL Export

-- Table: access_group_features
CREATE TABLE access_group_features (
  group_id integer NOT NULL,
  feature character varying NOT NULL,
  PRIMARY KEY (group_id, feature)
);
ALTER TABLE access_group_features ADD FOREIGN KEY (feature) REFERENCES features(key);
ALTER TABLE access_group_features ADD FOREIGN KEY (group_id) REFERENCES access_groups(id);
CREATE UNIQUE INDEX access_group_features_pkey ON public.access_group_features USING btree (group_id, feature);

-- Table: access_groups
CREATE TABLE access_groups (
  id integer NOT NULL DEFAULT nextval('access_groups_id_seq'::regclass),
  name character varying NOT NULL,
  description text,
  PRIMARY KEY (id)
);
CREATE UNIQUE INDEX access_groups_pkey ON public.access_groups USING btree (id);

-- Table: draws
CREATE TABLE draws (
  id integer NOT NULL DEFAULT nextval('draws_id_seq'::regclass),
  game_id integer,
  draw_date date NOT NULL,
  results ARRAY NOT NULL,
  bonus ARRAY,
  uploaded_by uuid,
  created_at timestamp without time zone DEFAULT now(),
  PRIMARY KEY (id)
);
ALTER TABLE draws ADD FOREIGN KEY (game_id) REFERENCES games(id);
ALTER TABLE draws ADD FOREIGN KEY (uploaded_by) REFERENCES users(id);
CREATE UNIQUE INDEX draws_pkey ON public.draws USING btree (id);

-- Table: features
CREATE TABLE features (
  id integer NOT NULL DEFAULT nextval('features_id_seq'::regclass),
  key character varying NOT NULL,
  name character varying NOT NULL,
  description text,
  type character varying DEFAULT 'feature'::character varying,
  nav_name character varying,
  icon_url text,
  order integer DEFAULT 0,
  url character varying,
  active boolean DEFAULT true,
  created_by uuid,
  PRIMARY KEY (id)
);
CREATE UNIQUE INDEX features_pkey ON public.features USING btree (id);
CREATE UNIQUE INDEX features_key_key ON public.features USING btree (key);

-- Table: games
CREATE TABLE games (
  id integer NOT NULL DEFAULT nextval('games_id_seq'::regclass),
  name character varying NOT NULL,
  config jsonb,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  PRIMARY KEY (id)
);
CREATE UNIQUE INDEX games_pkey ON public.games USING btree (id);

-- Table: insight_templates
CREATE TABLE insight_templates (
  id integer NOT NULL DEFAULT nextval('insight_templates_id_seq'::regclass),
  template_name character varying NOT NULL,
  description text,
  config jsonb,
  created_at timestamp without time zone DEFAULT now(),
  PRIMARY KEY (id)
);
CREATE UNIQUE INDEX insight_templates_pkey ON public.insight_templates USING btree (id);

-- Table: notifications
CREATE TABLE notifications (
  id integer NOT NULL DEFAULT nextval('notifications_id_seq'::regclass),
  user_id uuid,
  notif_type character varying,
  data jsonb,
  created_at timestamp without time zone DEFAULT now(),
  read_at timestamp without time zone,
  PRIMARY KEY (id)
);
ALTER TABLE notifications ADD FOREIGN KEY (user_id) REFERENCES users(id);
CREATE UNIQUE INDEX notifications_pkey ON public.notifications USING btree (id);

-- Table: uploads
CREATE TABLE uploads (
  id integer NOT NULL DEFAULT nextval('uploads_id_seq'::regclass),
  user_id uuid,
  filename character varying,
  blob_url text,
  uploaded_at timestamp without time zone DEFAULT now(),
  PRIMARY KEY (id)
);
ALTER TABLE uploads ADD FOREIGN KEY (user_id) REFERENCES users(id);
CREATE UNIQUE INDEX uploads_pkey ON public.uploads USING btree (id);

-- Table: user_access_groups
CREATE TABLE user_access_groups (
  user_id uuid NOT NULL,
  group_id integer NOT NULL,
  PRIMARY KEY (user_id, group_id)
);
ALTER TABLE user_access_groups ADD FOREIGN KEY (group_id) REFERENCES access_groups(id);
ALTER TABLE user_access_groups ADD FOREIGN KEY (user_id) REFERENCES users(id);
CREATE UNIQUE INDEX user_access_groups_pkey ON public.user_access_groups USING btree (user_id, group_id);

-- Table: users
CREATE TABLE users (
  id uuid NOT NULL,
  email character varying NOT NULL,
  role character varying DEFAULT 'member'::character varying,
  created_at timestamp without time zone DEFAULT now(),
  username text,
  phone text,
  PRIMARY KEY (id)
);
CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);
CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

