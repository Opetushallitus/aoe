--
-- PostgreSQL database dump
--

-- Dumped from database version 14.13
-- Dumped by pg_dump version 14.15 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: lang; Type: TYPE; Schema: public; Owner: aoe_admin
--

CREATE TYPE public.lang AS ENUM (
    'fi',
    'en',
    'sv'
);


ALTER TYPE public.lang OWNER TO aoe_admin;

--
-- Name: notificationtype; Type: TYPE; Schema: public; Owner: aoe_admin
--

CREATE TYPE public.notificationtype AS ENUM (
    'ERROR',
    'INFO'
);


ALTER TYPE public.notificationtype OWNER TO aoe_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accessibilityfeature; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.accessibilityfeature (
    id bigint NOT NULL,
    value text NOT NULL,
    educationalmaterialid bigint NOT NULL,
    accessibilityfeaturekey text NOT NULL
);


ALTER TABLE public.accessibilityfeature OWNER TO aoe_admin;

--
-- Name: accessibilityfeature_id_seq; Type: SEQUENCE; Schema: public; Owner: aoe_admin
--

CREATE SEQUENCE public.accessibilityfeature_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.accessibilityfeature_id_seq OWNER TO aoe_admin;

--
-- Name: accessibilityfeature_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aoe_admin
--

ALTER SEQUENCE public.accessibilityfeature_id_seq OWNED BY public.accessibilityfeature.id;


--
-- Name: accessibilityfeatureextension; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.accessibilityfeatureextension (
    id bigint NOT NULL,
    value text NOT NULL,
    accessibilityfeaturekey text NOT NULL,
    educationalmaterialid bigint NOT NULL,
    usersusername text NOT NULL
);


ALTER TABLE public.accessibilityfeatureextension OWNER TO aoe_admin;

--
-- Name: accessibilityfeatureextension_id_seq; Type: SEQUENCE; Schema: public; Owner: aoe_admin
--

CREATE SEQUENCE public.accessibilityfeatureextension_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.accessibilityfeatureextension_id_seq OWNER TO aoe_admin;

--
-- Name: accessibilityfeatureextension_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aoe_admin
--

ALTER SEQUENCE public.accessibilityfeatureextension_id_seq OWNED BY public.accessibilityfeatureextension.id;


--
-- Name: accessibilityhazard; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.accessibilityhazard (
    id bigint NOT NULL,
    value text NOT NULL,
    educationalmaterialid bigint NOT NULL,
    accessibilityhazardkey text NOT NULL
);


ALTER TABLE public.accessibilityhazard OWNER TO aoe_admin;

--
-- Name: accessibilityhazard_id_seq; Type: SEQUENCE; Schema: public; Owner: aoe_admin
--

CREATE SEQUENCE public.accessibilityhazard_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.accessibilityhazard_id_seq OWNER TO aoe_admin;

--
-- Name: accessibilityhazard_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aoe_admin
--

ALTER SEQUENCE public.accessibilityhazard_id_seq OWNED BY public.accessibilityhazard.id;


--
-- Name: accessibilityhazardextension; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.accessibilityhazardextension (
    id bigint NOT NULL,
    value text NOT NULL,
    accessibilityhazardkey text NOT NULL,
    educationalmaterialid bigint NOT NULL,
    usersusername text NOT NULL
);


ALTER TABLE public.accessibilityhazardextension OWNER TO aoe_admin;

--
-- Name: accessibilityhazardextension_id_seq; Type: SEQUENCE; Schema: public; Owner: aoe_admin
--

CREATE SEQUENCE public.accessibilityhazardextension_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.accessibilityhazardextension_id_seq OWNER TO aoe_admin;

--
-- Name: accessibilityhazardextension_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aoe_admin
--

ALTER SEQUENCE public.accessibilityhazardextension_id_seq OWNED BY public.accessibilityhazardextension.id;


--
-- Name: alignmentobject; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.alignmentobject (
    id bigint NOT NULL,
    educationalmaterialid bigint NOT NULL,
    alignmenttype text NOT NULL,
    targetname text NOT NULL,
    source text NOT NULL,
    educationalframework text DEFAULT ''::text NOT NULL,
    objectkey text NOT NULL,
    targeturl text
);


ALTER TABLE public.alignmentobject OWNER TO aoe_admin;

--
-- Name: alignmentobject_id_seq; Type: SEQUENCE; Schema: public; Owner: aoe_admin
--

CREATE SEQUENCE public.alignmentobject_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.alignmentobject_id_seq OWNER TO aoe_admin;

--
-- Name: alignmentobject_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aoe_admin
--

ALTER SEQUENCE public.alignmentobject_id_seq OWNED BY public.alignmentobject.id;


--
-- Name: aoeuser; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.aoeuser (
    username character varying(255) NOT NULL
);


ALTER TABLE public.aoeuser OWNER TO aoe_admin;

--
-- Name: attachment; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.attachment (
    id bigint NOT NULL,
    filepath text,
    originalfilename text NOT NULL,
    filesize integer NOT NULL,
    mimetype text NOT NULL,
    format text,
    filekey text,
    filebucket text,
    defaultfile boolean NOT NULL,
    kind text NOT NULL,
    label text NOT NULL,
    srclang text NOT NULL,
    materialid bigint NOT NULL,
    obsoleted integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.attachment OWNER TO aoe_admin;

--
-- Name: attachment_id_seq; Type: SEQUENCE; Schema: public; Owner: aoe_admin
--

CREATE SEQUENCE public.attachment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.attachment_id_seq OWNER TO aoe_admin;

--
-- Name: attachment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aoe_admin
--

ALTER SEQUENCE public.attachment_id_seq OWNED BY public.attachment.id;


--
-- Name: attachmentversioncomposition; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.attachmentversioncomposition (
    versioneducationalmaterialid bigint NOT NULL,
    versionmaterialid bigint NOT NULL,
    versionpublishedat timestamp without time zone NOT NULL,
    attachmentid bigint NOT NULL
);


ALTER TABLE public.attachmentversioncomposition OWNER TO aoe_admin;

--
-- Name: author; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.author (
    id bigint NOT NULL,
    authorname text NOT NULL,
    organization text NOT NULL,
    educationalmaterialid bigint NOT NULL,
    organizationkey text NOT NULL
);


ALTER TABLE public.author OWNER TO aoe_admin;

--
-- Name: author_id_seq; Type: SEQUENCE; Schema: public; Owner: aoe_admin
--

CREATE SEQUENCE public.author_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.author_id_seq OWNER TO aoe_admin;

--
-- Name: author_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aoe_admin
--

ALTER SEQUENCE public.author_id_seq OWNED BY public.author.id;


--
-- Name: collection; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.collection (
    id bigint NOT NULL,
    createdat timestamp with time zone NOT NULL,
    updatedat timestamp with time zone,
    publishedat timestamp with time zone,
    createdby text NOT NULL,
    agerangemin integer,
    agerangemax integer,
    collectionname character varying(255) NOT NULL,
    description character varying(2000)
);


ALTER TABLE public.collection OWNER TO aoe_admin;

--
-- Name: collection_id_seq; Type: SEQUENCE; Schema: public; Owner: aoe_admin
--

CREATE SEQUENCE public.collection_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.collection_id_seq OWNER TO aoe_admin;

--
-- Name: collection_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aoe_admin
--

ALTER SEQUENCE public.collection_id_seq OWNED BY public.collection.id;


--
-- Name: collectionaccessibilityfeature; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.collectionaccessibilityfeature (
    id integer NOT NULL,
    value text NOT NULL,
    accessibilityfeaturekey text NOT NULL,
    collectionid bigint NOT NULL
);


ALTER TABLE public.collectionaccessibilityfeature OWNER TO aoe_admin;

--
-- Name: collectionaccessibilityfeature_id_seq; Type: SEQUENCE; Schema: public; Owner: aoe_admin
--

CREATE SEQUENCE public.collectionaccessibilityfeature_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.collectionaccessibilityfeature_id_seq OWNER TO aoe_admin;

--
-- Name: collectionaccessibilityfeature_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aoe_admin
--

ALTER SEQUENCE public.collectionaccessibilityfeature_id_seq OWNED BY public.collectionaccessibilityfeature.id;


--
-- Name: collectionaccessibilityhazard; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.collectionaccessibilityhazard (
    id bigint NOT NULL,
    value text NOT NULL,
    accessibilityhazardkey text NOT NULL,
    collectionid bigint NOT NULL
);


ALTER TABLE public.collectionaccessibilityhazard OWNER TO aoe_admin;

--
-- Name: collectionaccessibilityhazard_id_seq; Type: SEQUENCE; Schema: public; Owner: aoe_admin
--

CREATE SEQUENCE public.collectionaccessibilityhazard_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.collectionaccessibilityhazard_id_seq OWNER TO aoe_admin;

--
-- Name: collectionaccessibilityhazard_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aoe_admin
--

ALTER SEQUENCE public.collectionaccessibilityhazard_id_seq OWNED BY public.collectionaccessibilityhazard.id;


--
-- Name: collectionalignmentobject; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.collectionalignmentobject (
    id bigint NOT NULL,
    alignmenttype text NOT NULL,
    collectionid bigint NOT NULL,
    targetname text NOT NULL,
    source text NOT NULL,
    educationalframework text,
    objectkey text NOT NULL,
    targeturl text
);


ALTER TABLE public.collectionalignmentobject OWNER TO aoe_admin;

--
-- Name: collectionalignmentobject_id_seq; Type: SEQUENCE; Schema: public; Owner: aoe_admin
--

CREATE SEQUENCE public.collectionalignmentobject_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.collectionalignmentobject_id_seq OWNER TO aoe_admin;

--
-- Name: collectionalignmentobject_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aoe_admin
--

ALTER SEQUENCE public.collectionalignmentobject_id_seq OWNED BY public.collectionalignmentobject.id;


--
-- Name: collectioneducationalaudience; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.collectioneducationalaudience (
    id bigint NOT NULL,
    educationalrole text NOT NULL,
    collectionid bigint NOT NULL,
    educationalrolekey text NOT NULL
);


ALTER TABLE public.collectioneducationalaudience OWNER TO aoe_admin;

--
-- Name: collectioneducationalaudience_id_seq; Type: SEQUENCE; Schema: public; Owner: aoe_admin
--

CREATE SEQUENCE public.collectioneducationalaudience_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.collectioneducationalaudience_id_seq OWNER TO aoe_admin;

--
-- Name: collectioneducationalaudience_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aoe_admin
--

ALTER SEQUENCE public.collectioneducationalaudience_id_seq OWNED BY public.collectioneducationalaudience.id;


--
-- Name: collectioneducationallevel; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.collectioneducationallevel (
    id bigint NOT NULL,
    educationallevelkey text NOT NULL,
    collectionid bigint NOT NULL,
    value text NOT NULL
);


ALTER TABLE public.collectioneducationallevel OWNER TO aoe_admin;

--
-- Name: collectioneducationallevel_id_seq; Type: SEQUENCE; Schema: public; Owner: aoe_admin
--

CREATE SEQUENCE public.collectioneducationallevel_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.collectioneducationallevel_id_seq OWNER TO aoe_admin;

--
-- Name: collectioneducationallevel_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aoe_admin
--

ALTER SEQUENCE public.collectioneducationallevel_id_seq OWNED BY public.collectioneducationallevel.id;


--
-- Name: collectioneducationalmaterial; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.collectioneducationalmaterial (
    collectionid bigint NOT NULL,
    educationalmaterialid bigint NOT NULL,
    priority integer DEFAULT 999 NOT NULL
);


ALTER TABLE public.collectioneducationalmaterial OWNER TO aoe_admin;

--
-- Name: collectioneducationaluse; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.collectioneducationaluse (
    id bigint NOT NULL,
    educationalusekey text NOT NULL,
    collectionid bigint NOT NULL,
    value text NOT NULL
);


ALTER TABLE public.collectioneducationaluse OWNER TO aoe_admin;

--
-- Name: collectioneducationaluse_id_seq; Type: SEQUENCE; Schema: public; Owner: aoe_admin
--

CREATE SEQUENCE public.collectioneducationaluse_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.collectioneducationaluse_id_seq OWNER TO aoe_admin;

--
-- Name: collectioneducationaluse_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aoe_admin
--

ALTER SEQUENCE public.collectioneducationaluse_id_seq OWNED BY public.collectioneducationaluse.id;


--
-- Name: collectionheading; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.collectionheading (
    id bigint NOT NULL,
    heading character varying(255) NOT NULL,
    description character varying(2000),
    priority integer DEFAULT 999 NOT NULL,
    collectionid bigint NOT NULL
);


ALTER TABLE public.collectionheading OWNER TO aoe_admin;

--
-- Name: collectionheading_id_seq; Type: SEQUENCE; Schema: public; Owner: aoe_admin
--

CREATE SEQUENCE public.collectionheading_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.collectionheading_id_seq OWNER TO aoe_admin;

--
-- Name: collectionheading_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aoe_admin
--

ALTER SEQUENCE public.collectionheading_id_seq OWNED BY public.collectionheading.id;


--
-- Name: collectionkeyword; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.collectionkeyword (
    id bigint NOT NULL,
    value text NOT NULL,
    collectionid bigint NOT NULL,
    keywordkey text NOT NULL
);


ALTER TABLE public.collectionkeyword OWNER TO aoe_admin;

--
-- Name: collectionkeyword_id_seq; Type: SEQUENCE; Schema: public; Owner: aoe_admin
--

CREATE SEQUENCE public.collectionkeyword_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.collectionkeyword_id_seq OWNER TO aoe_admin;

--
-- Name: collectionkeyword_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aoe_admin
--

ALTER SEQUENCE public.collectionkeyword_id_seq OWNED BY public.collectionkeyword.id;


--
-- Name: collectionlanguage; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.collectionlanguage (
    id bigint NOT NULL,
    language text NOT NULL,
    collectionid bigint NOT NULL
);


ALTER TABLE public.collectionlanguage OWNER TO aoe_admin;

--
-- Name: collectionlanguage_id_seq; Type: SEQUENCE; Schema: public; Owner: aoe_admin
--

CREATE SEQUENCE public.collectionlanguage_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.collectionlanguage_id_seq OWNER TO aoe_admin;

--
-- Name: collectionlanguage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aoe_admin
--

ALTER SEQUENCE public.collectionlanguage_id_seq OWNED BY public.collectionlanguage.id;


--
-- Name: collectionthumbnail; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.collectionthumbnail (
    id bigint NOT NULL,
    filepath text NOT NULL,
    mimetype text NOT NULL,
    filename text NOT NULL,
    obsoleted integer DEFAULT 0 NOT NULL,
    filekey text NOT NULL,
    filebucket text NOT NULL,
    collectionid bigint NOT NULL
);


ALTER TABLE public.collectionthumbnail OWNER TO aoe_admin;

--
-- Name: collectionthumbnail_id_seq; Type: SEQUENCE; Schema: public; Owner: aoe_admin
--

CREATE SEQUENCE public.collectionthumbnail_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.collectionthumbnail_id_seq OWNER TO aoe_admin;

--
-- Name: collectionthumbnail_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aoe_admin
--

ALTER SEQUENCE public.collectionthumbnail_id_seq OWNED BY public.collectionthumbnail.id;


--
-- Name: educationalaudience; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.educationalaudience (
    id bigint NOT NULL,
    educationalrole text NOT NULL,
    educationalmaterialid bigint NOT NULL,
    educationalrolekey text NOT NULL
);


ALTER TABLE public.educationalaudience OWNER TO aoe_admin;

--
-- Name: educationalaudience_id_seq; Type: SEQUENCE; Schema: public; Owner: aoe_admin
--

CREATE SEQUENCE public.educationalaudience_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.educationalaudience_id_seq OWNER TO aoe_admin;

--
-- Name: educationalaudience_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aoe_admin
--

ALTER SEQUENCE public.educationalaudience_id_seq OWNED BY public.educationalaudience.id;


--
-- Name: educationallevel; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.educationallevel (
    id bigint NOT NULL,
    value text NOT NULL,
    educationalmaterialid bigint NOT NULL,
    educationallevelkey text NOT NULL
);


ALTER TABLE public.educationallevel OWNER TO aoe_admin;

--
-- Name: educationallevel_id_seq; Type: SEQUENCE; Schema: public; Owner: aoe_admin
--

CREATE SEQUENCE public.educationallevel_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.educationallevel_id_seq OWNER TO aoe_admin;

--
-- Name: educationallevel_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aoe_admin
--

ALTER SEQUENCE public.educationallevel_id_seq OWNED BY public.educationallevel.id;


--
-- Name: educationallevelextension; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.educationallevelextension (
    id bigint NOT NULL,
    value text NOT NULL,
    educationallevelkey text NOT NULL,
    educationalmaterialid bigint NOT NULL,
    usersusername text NOT NULL
);


ALTER TABLE public.educationallevelextension OWNER TO aoe_admin;

--
-- Name: educationallevelextension_id_seq; Type: SEQUENCE; Schema: public; Owner: aoe_admin
--

CREATE SEQUENCE public.educationallevelextension_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.educationallevelextension_id_seq OWNER TO aoe_admin;

--
-- Name: educationallevelextension_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aoe_admin
--

ALTER SEQUENCE public.educationallevelextension_id_seq OWNED BY public.educationallevelextension.id;


--
-- Name: educationalmaterial; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.educationalmaterial (
    id bigint NOT NULL,
    createdat timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    publishedat timestamp with time zone,
    updatedat timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    archivedat timestamp with time zone,
    timerequired text DEFAULT ''::text NOT NULL,
    agerangemin integer,
    agerangemax integer,
    licensecode text DEFAULT ''::text NOT NULL,
    obsoleted integer DEFAULT 0 NOT NULL,
    originalpublishedat timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usersusername text NOT NULL,
    expires timestamp with time zone,
    suitsallearlychildhoodsubjects boolean DEFAULT false NOT NULL,
    suitsallpreprimarysubjects boolean DEFAULT false NOT NULL,
    suitsallbasicstudysubjects boolean DEFAULT false NOT NULL,
    suitsalluppersecondarysubjects boolean DEFAULT false NOT NULL,
    suitsallvocationaldegrees boolean DEFAULT false NOT NULL,
    suitsallselfmotivatedsubjects boolean DEFAULT false NOT NULL,
    suitsallbranches boolean DEFAULT false NOT NULL,
    suitsalluppersecondarysubjectsnew boolean DEFAULT false NOT NULL,
    ratingcontentaverage numeric(2,1),
    ratingvisualaverage numeric(2,1),
    viewcounter bigint DEFAULT 0,
    downloadcounter bigint DEFAULT 0,
    counterupdatedat timestamp with time zone
);


ALTER TABLE public.educationalmaterial OWNER TO aoe_admin;

--
-- Name: educationalmaterial_id_seq; Type: SEQUENCE; Schema: public; Owner: aoe_admin
--

CREATE SEQUENCE public.educationalmaterial_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.educationalmaterial_id_seq OWNER TO aoe_admin;

--
-- Name: educationalmaterial_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aoe_admin
--

ALTER SEQUENCE public.educationalmaterial_id_seq OWNED BY public.educationalmaterial.id;


--
-- Name: educationalmaterialversion; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.educationalmaterialversion (
    educationalmaterialid bigint NOT NULL,
    publishedat timestamp without time zone NOT NULL,
    urn text
);


ALTER TABLE public.educationalmaterialversion OWNER TO aoe_admin;

--
-- Name: educationaluse; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.educationaluse (
    id bigint NOT NULL,
    value text NOT NULL,
    educationalmaterialid bigint NOT NULL,
    educationalusekey text NOT NULL
);


ALTER TABLE public.educationaluse OWNER TO aoe_admin;

--
-- Name: educationaluse_id_seq; Type: SEQUENCE; Schema: public; Owner: aoe_admin
--

CREATE SEQUENCE public.educationaluse_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.educationaluse_id_seq OWNER TO aoe_admin;

--
-- Name: educationaluse_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aoe_admin
--

ALTER SEQUENCE public.educationaluse_id_seq OWNED BY public.educationaluse.id;


--
-- Name: inlanguage; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.inlanguage (
    id bigint NOT NULL,
    inlanguage text NOT NULL,
    url text NOT NULL,
    educationalmaterialid bigint NOT NULL
);


ALTER TABLE public.inlanguage OWNER TO aoe_admin;

--
-- Name: inlanguage_id_seq; Type: SEQUENCE; Schema: public; Owner: aoe_admin
--

CREATE SEQUENCE public.inlanguage_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.inlanguage_id_seq OWNER TO aoe_admin;

--
-- Name: inlanguage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aoe_admin
--

ALTER SEQUENCE public.inlanguage_id_seq OWNED BY public.inlanguage.id;


--
-- Name: isbasedon; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.isbasedon (
    id bigint NOT NULL,
    author text,
    url text NOT NULL,
    materialname text NOT NULL,
    educationalmaterialid bigint NOT NULL
);


ALTER TABLE public.isbasedon OWNER TO aoe_admin;

--
-- Name: isbasedon_id_seq; Type: SEQUENCE; Schema: public; Owner: aoe_admin
--

CREATE SEQUENCE public.isbasedon_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.isbasedon_id_seq OWNER TO aoe_admin;

--
-- Name: isbasedon_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aoe_admin
--

ALTER SEQUENCE public.isbasedon_id_seq OWNED BY public.isbasedon.id;


--
-- Name: isbasedonauthor; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.isbasedonauthor (
    id bigint NOT NULL,
    authorname text NOT NULL,
    isbasedonid bigint NOT NULL
);


ALTER TABLE public.isbasedonauthor OWNER TO aoe_admin;

--
-- Name: isbasedonauthor_id_seq; Type: SEQUENCE; Schema: public; Owner: aoe_admin
--

CREATE SEQUENCE public.isbasedonauthor_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.isbasedonauthor_id_seq OWNER TO aoe_admin;

--
-- Name: isbasedonauthor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aoe_admin
--

ALTER SEQUENCE public.isbasedonauthor_id_seq OWNED BY public.isbasedonauthor.id;


--
-- Name: keyword; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.keyword (
    id bigint NOT NULL,
    value text NOT NULL,
    educationalmaterialid bigint NOT NULL,
    keywordkey text NOT NULL
);


ALTER TABLE public.keyword OWNER TO aoe_admin;

--
-- Name: keyword_id_seq; Type: SEQUENCE; Schema: public; Owner: aoe_admin
--

CREATE SEQUENCE public.keyword_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.keyword_id_seq OWNER TO aoe_admin;

--
-- Name: keyword_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aoe_admin
--

ALTER SEQUENCE public.keyword_id_seq OWNED BY public.keyword.id;


--
-- Name: keywordextension; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.keywordextension (
    id bigint NOT NULL,
    value text NOT NULL,
    educationalmaterialid bigint NOT NULL,
    keywordkey text NOT NULL,
    usersusername text NOT NULL
);


ALTER TABLE public.keywordextension OWNER TO aoe_admin;

--
-- Name: keywordextension_id_seq; Type: SEQUENCE; Schema: public; Owner: aoe_admin
--

CREATE SEQUENCE public.keywordextension_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.keywordextension_id_seq OWNER TO aoe_admin;

--
-- Name: keywordextension_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aoe_admin
--

ALTER SEQUENCE public.keywordextension_id_seq OWNED BY public.keywordextension.id;


--
-- Name: learningresourcetype; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.learningresourcetype (
    id bigint NOT NULL,
    value text NOT NULL,
    educationalmaterialid bigint NOT NULL,
    learningresourcetypekey text
);


ALTER TABLE public.learningresourcetype OWNER TO aoe_admin;

--
-- Name: learningresourcetype_id_seq; Type: SEQUENCE; Schema: public; Owner: aoe_admin
--

CREATE SEQUENCE public.learningresourcetype_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.learningresourcetype_id_seq OWNER TO aoe_admin;

--
-- Name: learningresourcetype_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aoe_admin
--

ALTER SEQUENCE public.learningresourcetype_id_seq OWNED BY public.learningresourcetype.id;


--
-- Name: licensecode; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.licensecode (
    code text NOT NULL,
    license text NOT NULL
);


ALTER TABLE public.licensecode OWNER TO aoe_admin;

--
-- Name: material; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.material (
    id bigint NOT NULL,
    link text NOT NULL,
    educationalmaterialid bigint NOT NULL,
    obsoleted integer DEFAULT 0 NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    materiallanguagekey text DEFAULT 'fi'::public.lang NOT NULL
);


ALTER TABLE public.material OWNER TO aoe_admin;

--
-- Name: material_id_seq; Type: SEQUENCE; Schema: public; Owner: aoe_admin
--

CREATE SEQUENCE public.material_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.material_id_seq OWNER TO aoe_admin;

--
-- Name: material_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aoe_admin
--

ALTER SEQUENCE public.material_id_seq OWNED BY public.material.id;


--
-- Name: materialdescription; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.materialdescription (
    id bigint NOT NULL,
    description text NOT NULL,
    language public.lang NOT NULL,
    educationalmaterialid bigint NOT NULL
);


ALTER TABLE public.materialdescription OWNER TO aoe_admin;

--
-- Name: materialdescription_id_seq; Type: SEQUENCE; Schema: public; Owner: aoe_admin
--

CREATE SEQUENCE public.materialdescription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.materialdescription_id_seq OWNER TO aoe_admin;

--
-- Name: materialdescription_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aoe_admin
--

ALTER SEQUENCE public.materialdescription_id_seq OWNED BY public.materialdescription.id;


--
-- Name: materialdisplayname; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.materialdisplayname (
    id bigint NOT NULL,
    displayname text NOT NULL,
    language public.lang NOT NULL,
    materialid bigint NOT NULL
);


ALTER TABLE public.materialdisplayname OWNER TO aoe_admin;

--
-- Name: materialdisplayname_id_seq; Type: SEQUENCE; Schema: public; Owner: aoe_admin
--

CREATE SEQUENCE public.materialdisplayname_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.materialdisplayname_id_seq OWNER TO aoe_admin;

--
-- Name: materialdisplayname_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aoe_admin
--

ALTER SEQUENCE public.materialdisplayname_id_seq OWNED BY public.materialdisplayname.id;


--
-- Name: materialname; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.materialname (
    id bigint NOT NULL,
    materialname text DEFAULT ''::text NOT NULL,
    language public.lang NOT NULL,
    slug text DEFAULT ''::text NOT NULL,
    educationalmaterialid bigint NOT NULL
);


ALTER TABLE public.materialname OWNER TO aoe_admin;

--
-- Name: materialname_id_seq; Type: SEQUENCE; Schema: public; Owner: aoe_admin
--

CREATE SEQUENCE public.materialname_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.materialname_id_seq OWNER TO aoe_admin;

--
-- Name: materialname_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aoe_admin
--

ALTER SEQUENCE public.materialname_id_seq OWNED BY public.materialname.id;


--
-- Name: notification; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.notification (
    nf_id bigint NOT NULL,
    nf_text character varying(1500) NOT NULL,
    nf_type public.notificationtype NOT NULL,
    nf_created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    nf_show_since timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    nf_show_until timestamp with time zone,
    nf_disabled boolean DEFAULT false,
    nf_username character varying(255) NOT NULL
);


ALTER TABLE public.notification OWNER TO aoe_admin;

--
-- Name: notification_nf_id_seq; Type: SEQUENCE; Schema: public; Owner: aoe_admin
--

CREATE SEQUENCE public.notification_nf_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notification_nf_id_seq OWNER TO aoe_admin;

--
-- Name: notification_nf_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aoe_admin
--

ALTER SEQUENCE public.notification_nf_id_seq OWNED BY public.notification.nf_id;


--
-- Name: publisher; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.publisher (
    id bigint NOT NULL,
    name text NOT NULL,
    educationalmaterialid bigint NOT NULL,
    publisherkey text NOT NULL
);


ALTER TABLE public.publisher OWNER TO aoe_admin;

--
-- Name: publisher_id_seq; Type: SEQUENCE; Schema: public; Owner: aoe_admin
--

CREATE SEQUENCE public.publisher_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.publisher_id_seq OWNER TO aoe_admin;

--
-- Name: publisher_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aoe_admin
--

ALTER SEQUENCE public.publisher_id_seq OWNED BY public.publisher.id;


--
-- Name: rating; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.rating (
    id bigint NOT NULL,
    ratingcontent integer,
    ratingvisual integer,
    feedbackpositive character varying(1000),
    feedbacksuggest character varying(1000),
    feedbackpurpose character varying(1000),
    educationalmaterialid bigint NOT NULL,
    usersusername text NOT NULL,
    updatedat timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.rating OWNER TO aoe_admin;

--
-- Name: rating_id_seq; Type: SEQUENCE; Schema: public; Owner: aoe_admin
--

CREATE SEQUENCE public.rating_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.rating_id_seq OWNER TO aoe_admin;

--
-- Name: rating_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aoe_admin
--

ALTER SEQUENCE public.rating_id_seq OWNED BY public.rating.id;


--
-- Name: record; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.record (
    id bigint NOT NULL,
    filepath text,
    originalfilename text NOT NULL,
    filesize bigint NOT NULL,
    mimetype text NOT NULL,
    format text,
    materialid bigint NOT NULL,
    filekey text,
    filebucket text,
    pdfkey text
);


ALTER TABLE public.record OWNER TO aoe_admin;

--
-- Name: record_id_seq; Type: SEQUENCE; Schema: public; Owner: aoe_admin
--

CREATE SEQUENCE public.record_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.record_id_seq OWNER TO aoe_admin;

--
-- Name: record_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aoe_admin
--

ALTER SEQUENCE public.record_id_seq OWNED BY public.record.id;


--
-- Name: temporaryattachment; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.temporaryattachment (
    id bigint NOT NULL,
    filepath text NOT NULL,
    originalfilename text NOT NULL,
    filesize integer NOT NULL,
    mimetype text NOT NULL,
    format text,
    filename text NOT NULL,
    createdat timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    defaultfile boolean NOT NULL,
    kind text NOT NULL,
    label text NOT NULL,
    srclang text NOT NULL,
    attachmentid bigint NOT NULL
);


ALTER TABLE public.temporaryattachment OWNER TO aoe_admin;

--
-- Name: temporaryattachment_id_seq; Type: SEQUENCE; Schema: public; Owner: aoe_admin
--

CREATE SEQUENCE public.temporaryattachment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.temporaryattachment_id_seq OWNER TO aoe_admin;

--
-- Name: temporaryattachment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aoe_admin
--

ALTER SEQUENCE public.temporaryattachment_id_seq OWNED BY public.temporaryattachment.id;


--
-- Name: temporaryrecord; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.temporaryrecord (
    id bigint NOT NULL,
    filepath text NOT NULL,
    originalfilename text NOT NULL,
    filesize integer NOT NULL,
    mimetype text NOT NULL,
    format text NOT NULL,
    filename text NOT NULL,
    materialid bigint NOT NULL,
    createdat timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.temporaryrecord OWNER TO aoe_admin;

--
-- Name: temporaryrecord_id_seq; Type: SEQUENCE; Schema: public; Owner: aoe_admin
--

CREATE SEQUENCE public.temporaryrecord_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.temporaryrecord_id_seq OWNER TO aoe_admin;

--
-- Name: temporaryrecord_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aoe_admin
--

ALTER SEQUENCE public.temporaryrecord_id_seq OWNED BY public.temporaryrecord.id;


--
-- Name: thumbnail; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.thumbnail (
    id bigint NOT NULL,
    filepath text NOT NULL,
    mimetype text NOT NULL,
    educationalmaterialid bigint NOT NULL,
    filename text NOT NULL,
    obsoleted integer DEFAULT 0 NOT NULL,
    filekey text NOT NULL,
    filebucket text NOT NULL
);


ALTER TABLE public.thumbnail OWNER TO aoe_admin;

--
-- Name: thumbnail_id_seq; Type: SEQUENCE; Schema: public; Owner: aoe_admin
--

CREATE SEQUENCE public.thumbnail_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.thumbnail_id_seq OWNER TO aoe_admin;

--
-- Name: thumbnail_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aoe_admin
--

ALTER SEQUENCE public.thumbnail_id_seq OWNED BY public.thumbnail.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    firstname text NOT NULL,
    lastname text NOT NULL,
    username text NOT NULL,
    preferredlanguage public.lang DEFAULT 'fi'::public.lang NOT NULL,
    preferredtargetname text NOT NULL,
    preferredalignmenttype text NOT NULL,
    termsofusage boolean DEFAULT false NOT NULL,
    email text,
    verifiedemail boolean DEFAULT false,
    newratings boolean DEFAULT false,
    almostexpired boolean DEFAULT false,
    termsupdated boolean DEFAULT false,
    allowtransfer boolean DEFAULT false
);


ALTER TABLE public.users OWNER TO aoe_admin;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: aoe_admin
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO aoe_admin;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aoe_admin
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: userscollection; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.userscollection (
    collectionid bigint NOT NULL,
    usersusername text NOT NULL
);


ALTER TABLE public.userscollection OWNER TO aoe_admin;

--
-- Name: versioncomposition; Type: TABLE; Schema: public; Owner: aoe_admin
--

CREATE TABLE public.versioncomposition (
    educationalmaterialid bigint NOT NULL,
    materialid bigint NOT NULL,
    publishedat timestamp without time zone NOT NULL,
    priority integer
);


ALTER TABLE public.versioncomposition OWNER TO aoe_admin;

--
-- Name: accessibilityfeature id; Type: DEFAULT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.accessibilityfeature ALTER COLUMN id SET DEFAULT nextval('public.accessibilityfeature_id_seq'::regclass);


--
-- Name: accessibilityfeatureextension id; Type: DEFAULT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.accessibilityfeatureextension ALTER COLUMN id SET DEFAULT nextval('public.accessibilityfeatureextension_id_seq'::regclass);


--
-- Name: accessibilityhazard id; Type: DEFAULT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.accessibilityhazard ALTER COLUMN id SET DEFAULT nextval('public.accessibilityhazard_id_seq'::regclass);


--
-- Name: accessibilityhazardextension id; Type: DEFAULT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.accessibilityhazardextension ALTER COLUMN id SET DEFAULT nextval('public.accessibilityhazardextension_id_seq'::regclass);


--
-- Name: alignmentobject id; Type: DEFAULT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.alignmentobject ALTER COLUMN id SET DEFAULT nextval('public.alignmentobject_id_seq'::regclass);


--
-- Name: attachment id; Type: DEFAULT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.attachment ALTER COLUMN id SET DEFAULT nextval('public.attachment_id_seq'::regclass);


--
-- Name: author id; Type: DEFAULT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.author ALTER COLUMN id SET DEFAULT nextval('public.author_id_seq'::regclass);


--
-- Name: collection id; Type: DEFAULT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.collection ALTER COLUMN id SET DEFAULT nextval('public.collection_id_seq'::regclass);


--
-- Name: collectionaccessibilityfeature id; Type: DEFAULT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.collectionaccessibilityfeature ALTER COLUMN id SET DEFAULT nextval('public.collectionaccessibilityfeature_id_seq'::regclass);


--
-- Name: collectionaccessibilityhazard id; Type: DEFAULT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.collectionaccessibilityhazard ALTER COLUMN id SET DEFAULT nextval('public.collectionaccessibilityhazard_id_seq'::regclass);


--
-- Name: collectionalignmentobject id; Type: DEFAULT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.collectionalignmentobject ALTER COLUMN id SET DEFAULT nextval('public.collectionalignmentobject_id_seq'::regclass);


--
-- Name: collectioneducationalaudience id; Type: DEFAULT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.collectioneducationalaudience ALTER COLUMN id SET DEFAULT nextval('public.collectioneducationalaudience_id_seq'::regclass);


--
-- Name: collectioneducationallevel id; Type: DEFAULT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.collectioneducationallevel ALTER COLUMN id SET DEFAULT nextval('public.collectioneducationallevel_id_seq'::regclass);


--
-- Name: collectioneducationaluse id; Type: DEFAULT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.collectioneducationaluse ALTER COLUMN id SET DEFAULT nextval('public.collectioneducationaluse_id_seq'::regclass);


--
-- Name: collectionheading id; Type: DEFAULT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.collectionheading ALTER COLUMN id SET DEFAULT nextval('public.collectionheading_id_seq'::regclass);


--
-- Name: collectionkeyword id; Type: DEFAULT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.collectionkeyword ALTER COLUMN id SET DEFAULT nextval('public.collectionkeyword_id_seq'::regclass);


--
-- Name: collectionlanguage id; Type: DEFAULT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.collectionlanguage ALTER COLUMN id SET DEFAULT nextval('public.collectionlanguage_id_seq'::regclass);


--
-- Name: collectionthumbnail id; Type: DEFAULT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.collectionthumbnail ALTER COLUMN id SET DEFAULT nextval('public.collectionthumbnail_id_seq'::regclass);


--
-- Name: educationalaudience id; Type: DEFAULT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.educationalaudience ALTER COLUMN id SET DEFAULT nextval('public.educationalaudience_id_seq'::regclass);


--
-- Name: educationallevel id; Type: DEFAULT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.educationallevel ALTER COLUMN id SET DEFAULT nextval('public.educationallevel_id_seq'::regclass);


--
-- Name: educationallevelextension id; Type: DEFAULT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.educationallevelextension ALTER COLUMN id SET DEFAULT nextval('public.educationallevelextension_id_seq'::regclass);


--
-- Name: educationalmaterial id; Type: DEFAULT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.educationalmaterial ALTER COLUMN id SET DEFAULT nextval('public.educationalmaterial_id_seq'::regclass);


--
-- Name: educationaluse id; Type: DEFAULT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.educationaluse ALTER COLUMN id SET DEFAULT nextval('public.educationaluse_id_seq'::regclass);


--
-- Name: inlanguage id; Type: DEFAULT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.inlanguage ALTER COLUMN id SET DEFAULT nextval('public.inlanguage_id_seq'::regclass);


--
-- Name: isbasedon id; Type: DEFAULT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.isbasedon ALTER COLUMN id SET DEFAULT nextval('public.isbasedon_id_seq'::regclass);


--
-- Name: isbasedonauthor id; Type: DEFAULT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.isbasedonauthor ALTER COLUMN id SET DEFAULT nextval('public.isbasedonauthor_id_seq'::regclass);


--
-- Name: keyword id; Type: DEFAULT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.keyword ALTER COLUMN id SET DEFAULT nextval('public.keyword_id_seq'::regclass);


--
-- Name: keywordextension id; Type: DEFAULT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.keywordextension ALTER COLUMN id SET DEFAULT nextval('public.keywordextension_id_seq'::regclass);


--
-- Name: learningresourcetype id; Type: DEFAULT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.learningresourcetype ALTER COLUMN id SET DEFAULT nextval('public.learningresourcetype_id_seq'::regclass);


--
-- Name: material id; Type: DEFAULT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.material ALTER COLUMN id SET DEFAULT nextval('public.material_id_seq'::regclass);


--
-- Name: materialdescription id; Type: DEFAULT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.materialdescription ALTER COLUMN id SET DEFAULT nextval('public.materialdescription_id_seq'::regclass);


--
-- Name: materialdisplayname id; Type: DEFAULT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.materialdisplayname ALTER COLUMN id SET DEFAULT nextval('public.materialdisplayname_id_seq'::regclass);


--
-- Name: materialname id; Type: DEFAULT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.materialname ALTER COLUMN id SET DEFAULT nextval('public.materialname_id_seq'::regclass);


--
-- Name: notification nf_id; Type: DEFAULT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.notification ALTER COLUMN nf_id SET DEFAULT nextval('public.notification_nf_id_seq'::regclass);


--
-- Name: publisher id; Type: DEFAULT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.publisher ALTER COLUMN id SET DEFAULT nextval('public.publisher_id_seq'::regclass);


--
-- Name: rating id; Type: DEFAULT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.rating ALTER COLUMN id SET DEFAULT nextval('public.rating_id_seq'::regclass);


--
-- Name: record id; Type: DEFAULT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.record ALTER COLUMN id SET DEFAULT nextval('public.record_id_seq'::regclass);


--
-- Name: temporaryattachment id; Type: DEFAULT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.temporaryattachment ALTER COLUMN id SET DEFAULT nextval('public.temporaryattachment_id_seq'::regclass);


--
-- Name: temporaryrecord id; Type: DEFAULT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.temporaryrecord ALTER COLUMN id SET DEFAULT nextval('public.temporaryrecord_id_seq'::regclass);


--
-- Name: thumbnail id; Type: DEFAULT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.thumbnail ALTER COLUMN id SET DEFAULT nextval('public.thumbnail_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: accessibilityfeature accessibilityfeature_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.accessibilityfeature
    ADD CONSTRAINT accessibilityfeature_pkey PRIMARY KEY (id);


--
-- Name: accessibilityfeatureextension accessibilityfeatureextension_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.accessibilityfeatureextension
    ADD CONSTRAINT accessibilityfeatureextension_pkey PRIMARY KEY (id);


--
-- Name: accessibilityhazard accessibilityhazard_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.accessibilityhazard
    ADD CONSTRAINT accessibilityhazard_pkey PRIMARY KEY (id);


--
-- Name: accessibilityhazardextension accessibilityhazardextension_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.accessibilityhazardextension
    ADD CONSTRAINT accessibilityhazardextension_pkey PRIMARY KEY (id);


--
-- Name: alignmentobject alignmentobject_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.alignmentobject
    ADD CONSTRAINT alignmentobject_pkey PRIMARY KEY (id);


--
-- Name: aoeuser aoeuser_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.aoeuser
    ADD CONSTRAINT aoeuser_pkey PRIMARY KEY (username);


--
-- Name: attachment attachment_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.attachment
    ADD CONSTRAINT attachment_pkey PRIMARY KEY (id);


--
-- Name: attachmentversioncomposition attachmentversioncomposition_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.attachmentversioncomposition
    ADD CONSTRAINT attachmentversioncomposition_pkey PRIMARY KEY (versioneducationalmaterialid, versionmaterialid, versionpublishedat, attachmentid);


--
-- Name: author author_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.author
    ADD CONSTRAINT author_pkey PRIMARY KEY (id);


--
-- Name: collection collection_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.collection
    ADD CONSTRAINT collection_pkey PRIMARY KEY (id);


--
-- Name: collectionaccessibilityfeature collectionaccessibilityfeature_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.collectionaccessibilityfeature
    ADD CONSTRAINT collectionaccessibilityfeature_pkey PRIMARY KEY (id);


--
-- Name: collectionaccessibilityhazard collectionaccessibilityhazard_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.collectionaccessibilityhazard
    ADD CONSTRAINT collectionaccessibilityhazard_pkey PRIMARY KEY (id);


--
-- Name: collectionalignmentobject collectionalignmentobject_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.collectionalignmentobject
    ADD CONSTRAINT collectionalignmentobject_pkey PRIMARY KEY (id);


--
-- Name: collectioneducationalaudience collectioneducationalaudience_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.collectioneducationalaudience
    ADD CONSTRAINT collectioneducationalaudience_pkey PRIMARY KEY (id);


--
-- Name: collectioneducationallevel collectioneducationallevel_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.collectioneducationallevel
    ADD CONSTRAINT collectioneducationallevel_pkey PRIMARY KEY (id);


--
-- Name: collectioneducationalmaterial collectioneducationalmaterial_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.collectioneducationalmaterial
    ADD CONSTRAINT collectioneducationalmaterial_pkey PRIMARY KEY (collectionid, educationalmaterialid);


--
-- Name: collectioneducationaluse collectioneducationaluse_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.collectioneducationaluse
    ADD CONSTRAINT collectioneducationaluse_pkey PRIMARY KEY (id);


--
-- Name: collectionheading collectionheading_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.collectionheading
    ADD CONSTRAINT collectionheading_pkey PRIMARY KEY (id);


--
-- Name: collectionkeyword collectionkeyword_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.collectionkeyword
    ADD CONSTRAINT collectionkeyword_pkey PRIMARY KEY (id);


--
-- Name: collectionlanguage collectionlanguage_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.collectionlanguage
    ADD CONSTRAINT collectionlanguage_pkey PRIMARY KEY (id);


--
-- Name: collectionthumbnail collectionthumbnail_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.collectionthumbnail
    ADD CONSTRAINT collectionthumbnail_pkey PRIMARY KEY (id);


--
-- Name: accessibilityfeature constraint_accessibilityfeature; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.accessibilityfeature
    ADD CONSTRAINT constraint_accessibilityfeature UNIQUE (accessibilityfeaturekey, educationalmaterialid);


--
-- Name: accessibilityfeatureextension constraint_accessibilityfeatureextension; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.accessibilityfeatureextension
    ADD CONSTRAINT constraint_accessibilityfeatureextension UNIQUE (accessibilityfeaturekey, educationalmaterialid);


--
-- Name: accessibilityhazard constraint_accessibilityhazard; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.accessibilityhazard
    ADD CONSTRAINT constraint_accessibilityhazard UNIQUE (accessibilityhazardkey, educationalmaterialid);


--
-- Name: accessibilityhazardextension constraint_accessibilityhazardextension; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.accessibilityhazardextension
    ADD CONSTRAINT constraint_accessibilityhazardextension UNIQUE (accessibilityhazardkey, educationalmaterialid);


--
-- Name: alignmentobject constraint_alignmentobject; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.alignmentobject
    ADD CONSTRAINT constraint_alignmentobject UNIQUE (alignmenttype, objectkey, source, educationalmaterialid);


--
-- Name: educationalaudience constraint_educationalaudience; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.educationalaudience
    ADD CONSTRAINT constraint_educationalaudience UNIQUE (educationalrolekey, educationalmaterialid);


--
-- Name: educationallevel constraint_educationallevel; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.educationallevel
    ADD CONSTRAINT constraint_educationallevel UNIQUE (educationallevelkey, educationalmaterialid);


--
-- Name: educationallevelextension constraint_educationallevelextension; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.educationallevelextension
    ADD CONSTRAINT constraint_educationallevelextension UNIQUE (educationallevelkey, educationalmaterialid);


--
-- Name: educationaluse constraint_educationaluse; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.educationaluse
    ADD CONSTRAINT constraint_educationaluse UNIQUE (educationalusekey, educationalmaterialid);


--
-- Name: inlanguage constraint_inlanguage; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.inlanguage
    ADD CONSTRAINT constraint_inlanguage UNIQUE (inlanguage, educationalmaterialid);


--
-- Name: isbasedon constraint_isbasedon; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.isbasedon
    ADD CONSTRAINT constraint_isbasedon UNIQUE (materialname, educationalmaterialid);


--
-- Name: keyword constraint_keyword; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.keyword
    ADD CONSTRAINT constraint_keyword UNIQUE (keywordkey, educationalmaterialid);


--
-- Name: keywordextension constraint_keywordextension; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.keywordextension
    ADD CONSTRAINT constraint_keywordextension UNIQUE (keywordkey, educationalmaterialid);


--
-- Name: materialname constraint_lang_id; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.materialname
    ADD CONSTRAINT constraint_lang_id UNIQUE (language, educationalmaterialid);


--
-- Name: learningresourcetype constraint_learningresourcetype; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.learningresourcetype
    ADD CONSTRAINT constraint_learningresourcetype UNIQUE (learningresourcetypekey, educationalmaterialid);


--
-- Name: materialdescription constraint_materialdescription_lang_id; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.materialdescription
    ADD CONSTRAINT constraint_materialdescription_lang_id UNIQUE (language, educationalmaterialid);


--
-- Name: materialdisplayname constraint_materialdisplayname; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.materialdisplayname
    ADD CONSTRAINT constraint_materialdisplayname UNIQUE (language, materialid);


--
-- Name: publisher constraint_publisher; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.publisher
    ADD CONSTRAINT constraint_publisher UNIQUE (publisherkey, educationalmaterialid);


--
-- Name: rating constraint_rating; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.rating
    ADD CONSTRAINT constraint_rating UNIQUE (usersusername, educationalmaterialid);


--
-- Name: educationalaudience educationalaudience_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.educationalaudience
    ADD CONSTRAINT educationalaudience_pkey PRIMARY KEY (id);


--
-- Name: educationallevel educationallevel_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.educationallevel
    ADD CONSTRAINT educationallevel_pkey PRIMARY KEY (id);


--
-- Name: educationallevelextension educationallevelextension_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.educationallevelextension
    ADD CONSTRAINT educationallevelextension_pkey PRIMARY KEY (id);


--
-- Name: educationalmaterial educationalmaterial_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.educationalmaterial
    ADD CONSTRAINT educationalmaterial_pkey PRIMARY KEY (id);


--
-- Name: educationalmaterialversion educationalmaterialversion_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.educationalmaterialversion
    ADD CONSTRAINT educationalmaterialversion_pkey PRIMARY KEY (educationalmaterialid, publishedat);


--
-- Name: educationaluse educationaluse_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.educationaluse
    ADD CONSTRAINT educationaluse_pkey PRIMARY KEY (id);


--
-- Name: inlanguage inlanguage_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.inlanguage
    ADD CONSTRAINT inlanguage_pkey PRIMARY KEY (id);


--
-- Name: isbasedon isbasedon_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.isbasedon
    ADD CONSTRAINT isbasedon_pkey PRIMARY KEY (id);


--
-- Name: isbasedonauthor isbasedonauthor_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.isbasedonauthor
    ADD CONSTRAINT isbasedonauthor_pkey PRIMARY KEY (id);


--
-- Name: keyword keyword_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.keyword
    ADD CONSTRAINT keyword_pkey PRIMARY KEY (id);


--
-- Name: keywordextension keywordextension_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.keywordextension
    ADD CONSTRAINT keywordextension_pkey PRIMARY KEY (id);


--
-- Name: learningresourcetype learningresourcetype_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.learningresourcetype
    ADD CONSTRAINT learningresourcetype_pkey PRIMARY KEY (id);


--
-- Name: licensecode licensecode_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.licensecode
    ADD CONSTRAINT licensecode_pkey PRIMARY KEY (code);


--
-- Name: material material_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.material
    ADD CONSTRAINT material_pkey PRIMARY KEY (id);


--
-- Name: materialdescription materialdescription_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.materialdescription
    ADD CONSTRAINT materialdescription_pkey PRIMARY KEY (id);


--
-- Name: materialdisplayname materialdisplayname_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.materialdisplayname
    ADD CONSTRAINT materialdisplayname_pkey PRIMARY KEY (id);


--
-- Name: materialname materialname_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.materialname
    ADD CONSTRAINT materialname_pkey PRIMARY KEY (id);


--
-- Name: notification notification_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_pkey PRIMARY KEY (nf_id);


--
-- Name: publisher publisher_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.publisher
    ADD CONSTRAINT publisher_pkey PRIMARY KEY (id);


--
-- Name: rating rating_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.rating
    ADD CONSTRAINT rating_pkey PRIMARY KEY (id);


--
-- Name: record record_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.record
    ADD CONSTRAINT record_pkey PRIMARY KEY (id);


--
-- Name: temporaryattachment temporaryattachment_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.temporaryattachment
    ADD CONSTRAINT temporaryattachment_pkey PRIMARY KEY (id);


--
-- Name: temporaryrecord temporaryrecord_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.temporaryrecord
    ADD CONSTRAINT temporaryrecord_pkey PRIMARY KEY (id);


--
-- Name: thumbnail thumbnail_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.thumbnail
    ADD CONSTRAINT thumbnail_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (username);


--
-- Name: userscollection userscollection_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.userscollection
    ADD CONSTRAINT userscollection_pkey PRIMARY KEY (collectionid, usersusername);


--
-- Name: versioncomposition versioncomposition_pkey; Type: CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.versioncomposition
    ADD CONSTRAINT versioncomposition_pkey PRIMARY KEY (educationalmaterialid, materialid, publishedat);


--
-- Name: accessibilityfeature fk_accessibilityfeature; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.accessibilityfeature
    ADD CONSTRAINT fk_accessibilityfeature FOREIGN KEY (educationalmaterialid) REFERENCES public.educationalmaterial(id) ON DELETE CASCADE;


--
-- Name: accessibilityhazard fk_accessibilityhazard; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.accessibilityhazard
    ADD CONSTRAINT fk_accessibilityhazard FOREIGN KEY (educationalmaterialid) REFERENCES public.educationalmaterial(id) ON DELETE CASCADE;


--
-- Name: author fk_author; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.author
    ADD CONSTRAINT fk_author FOREIGN KEY (educationalmaterialid) REFERENCES public.educationalmaterial(id) ON DELETE CASCADE;


--
-- Name: materialdescription fk_description; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.materialdescription
    ADD CONSTRAINT fk_description FOREIGN KEY (educationalmaterialid) REFERENCES public.educationalmaterial(id) ON DELETE CASCADE;


--
-- Name: educationallevel fk_educationallevel; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.educationallevel
    ADD CONSTRAINT fk_educationallevel FOREIGN KEY (educationalmaterialid) REFERENCES public.educationalmaterial(id) ON DELETE CASCADE;


--
-- Name: materialdisplayname fk_materialdisplayname; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.materialdisplayname
    ADD CONSTRAINT fk_materialdisplayname FOREIGN KEY (materialid) REFERENCES public.material(id) ON DELETE CASCADE;


--
-- Name: materialname fk_materialname; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.materialname
    ADD CONSTRAINT fk_materialname FOREIGN KEY (educationalmaterialid) REFERENCES public.educationalmaterial(id) ON DELETE CASCADE;


--
-- Name: notification fk_notification_aoeuser; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT fk_notification_aoeuser FOREIGN KEY (nf_username) REFERENCES public.aoeuser(username) ON UPDATE CASCADE;


--
-- Name: publisher fk_publisher; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.publisher
    ADD CONSTRAINT fk_publisher FOREIGN KEY (educationalmaterialid) REFERENCES public.educationalmaterial(id) ON DELETE CASCADE;


--
-- Name: temporaryrecord fk_temporaryrecord; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.temporaryrecord
    ADD CONSTRAINT fk_temporaryrecord FOREIGN KEY (materialid) REFERENCES public.material(id) ON DELETE RESTRICT;


--
-- Name: thumbnail fk_thumbnail; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.thumbnail
    ADD CONSTRAINT fk_thumbnail FOREIGN KEY (educationalmaterialid) REFERENCES public.educationalmaterial(id) ON DELETE RESTRICT;


--
-- Name: accessibilityfeatureextension fkaccessibilityfeatureextension; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.accessibilityfeatureextension
    ADD CONSTRAINT fkaccessibilityfeatureextension FOREIGN KEY (educationalmaterialid) REFERENCES public.educationalmaterial(id);


--
-- Name: accessibilityhazardextension fkaccessibilityhazardextension; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.accessibilityhazardextension
    ADD CONSTRAINT fkaccessibilityhazardextension FOREIGN KEY (educationalmaterialid) REFERENCES public.educationalmaterial(id);


--
-- Name: alignmentobject fkalignmentobject; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.alignmentobject
    ADD CONSTRAINT fkalignmentobject FOREIGN KEY (educationalmaterialid) REFERENCES public.educationalmaterial(id) ON DELETE CASCADE;


--
-- Name: attachmentversioncomposition fkattachmentversion; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.attachmentversioncomposition
    ADD CONSTRAINT fkattachmentversion FOREIGN KEY (attachmentid) REFERENCES public.attachment(id);


--
-- Name: collectionaccessibilityfeature fkcollectionaccessibilityfeature; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.collectionaccessibilityfeature
    ADD CONSTRAINT fkcollectionaccessibilityfeature FOREIGN KEY (collectionid) REFERENCES public.collection(id);


--
-- Name: collectionaccessibilityhazard fkcollectionaccessibilityhazard; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.collectionaccessibilityhazard
    ADD CONSTRAINT fkcollectionaccessibilityhazard FOREIGN KEY (collectionid) REFERENCES public.collection(id);


--
-- Name: collectionalignmentobject fkcollectionaligmentobject; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.collectionalignmentobject
    ADD CONSTRAINT fkcollectionaligmentobject FOREIGN KEY (collectionid) REFERENCES public.collection(id) ON DELETE CASCADE;


--
-- Name: collectioneducationalaudience fkcollectioneducationalaudience; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.collectioneducationalaudience
    ADD CONSTRAINT fkcollectioneducationalaudience FOREIGN KEY (collectionid) REFERENCES public.collection(id) ON DELETE CASCADE;


--
-- Name: collectioneducationallevel fkcollectioneducationallevel; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.collectioneducationallevel
    ADD CONSTRAINT fkcollectioneducationallevel FOREIGN KEY (collectionid) REFERENCES public.collection(id) ON DELETE CASCADE;


--
-- Name: collectioneducationaluse fkcollectioneducationaluse; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.collectioneducationaluse
    ADD CONSTRAINT fkcollectioneducationaluse FOREIGN KEY (collectionid) REFERENCES public.collection(id) ON DELETE CASCADE;


--
-- Name: collectionheading fkcollectionheading; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.collectionheading
    ADD CONSTRAINT fkcollectionheading FOREIGN KEY (collectionid) REFERENCES public.collection(id);


--
-- Name: collectionkeyword fkcollectionkeywords; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.collectionkeyword
    ADD CONSTRAINT fkcollectionkeywords FOREIGN KEY (collectionid) REFERENCES public.collection(id) ON DELETE CASCADE;


--
-- Name: collectionlanguage fkcollectionlanguage; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.collectionlanguage
    ADD CONSTRAINT fkcollectionlanguage FOREIGN KEY (collectionid) REFERENCES public.collection(id) ON DELETE CASCADE;


--
-- Name: collectioneducationalmaterial fkcollectionmaterial; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.collectioneducationalmaterial
    ADD CONSTRAINT fkcollectionmaterial FOREIGN KEY (collectionid) REFERENCES public.collection(id) ON DELETE CASCADE;


--
-- Name: collectionthumbnail fkcollectionthumbnail; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.collectionthumbnail
    ADD CONSTRAINT fkcollectionthumbnail FOREIGN KEY (collectionid) REFERENCES public.collection(id);


--
-- Name: userscollection fkcollectionusers; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.userscollection
    ADD CONSTRAINT fkcollectionusers FOREIGN KEY (collectionid) REFERENCES public.collection(id) ON DELETE CASCADE;


--
-- Name: educationalaudience fkeducationalaudience; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.educationalaudience
    ADD CONSTRAINT fkeducationalaudience FOREIGN KEY (educationalmaterialid) REFERENCES public.educationalmaterial(id) ON DELETE CASCADE;


--
-- Name: educationallevelextension fkeducationallevelextension; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.educationallevelextension
    ADD CONSTRAINT fkeducationallevelextension FOREIGN KEY (educationalmaterialid) REFERENCES public.educationalmaterial(id);


--
-- Name: educationalmaterial fkeducationalmaterial; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.educationalmaterial
    ADD CONSTRAINT fkeducationalmaterial FOREIGN KEY (usersusername) REFERENCES public.users(username) ON DELETE RESTRICT;


--
-- Name: versioncomposition fkeducationalmaterialversion; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.versioncomposition
    ADD CONSTRAINT fkeducationalmaterialversion FOREIGN KEY (educationalmaterialid) REFERENCES public.educationalmaterial(id);


--
-- Name: educationaluse fkeducationaluse; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.educationaluse
    ADD CONSTRAINT fkeducationaluse FOREIGN KEY (educationalmaterialid) REFERENCES public.educationalmaterial(id) ON DELETE CASCADE;


--
-- Name: educationalmaterialversion fkemversion; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.educationalmaterialversion
    ADD CONSTRAINT fkemversion FOREIGN KEY (educationalmaterialid) REFERENCES public.educationalmaterial(id);


--
-- Name: inlanguage fkinlanguage; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.inlanguage
    ADD CONSTRAINT fkinlanguage FOREIGN KEY (educationalmaterialid) REFERENCES public.educationalmaterial(id) ON DELETE CASCADE;


--
-- Name: isbasedon fkisbasedon; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.isbasedon
    ADD CONSTRAINT fkisbasedon FOREIGN KEY (educationalmaterialid) REFERENCES public.educationalmaterial(id) ON DELETE CASCADE;


--
-- Name: isbasedonauthor fkisbasedonauthor; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.isbasedonauthor
    ADD CONSTRAINT fkisbasedonauthor FOREIGN KEY (isbasedonid) REFERENCES public.isbasedon(id) ON DELETE CASCADE;


--
-- Name: keyword fkkeyword; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.keyword
    ADD CONSTRAINT fkkeyword FOREIGN KEY (educationalmaterialid) REFERENCES public.educationalmaterial(id) ON DELETE CASCADE;


--
-- Name: keywordextension fkkeywordextension; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.keywordextension
    ADD CONSTRAINT fkkeywordextension FOREIGN KEY (usersusername) REFERENCES public.users(username);


--
-- Name: learningresourcetype fklearningresourcetype; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.learningresourcetype
    ADD CONSTRAINT fklearningresourcetype FOREIGN KEY (educationalmaterialid) REFERENCES public.educationalmaterial(id) ON DELETE CASCADE;


--
-- Name: material fkmaterial; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.material
    ADD CONSTRAINT fkmaterial FOREIGN KEY (educationalmaterialid) REFERENCES public.educationalmaterial(id) ON DELETE RESTRICT;


--
-- Name: collectioneducationalmaterial fkmaterialcollection; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.collectioneducationalmaterial
    ADD CONSTRAINT fkmaterialcollection FOREIGN KEY (educationalmaterialid) REFERENCES public.educationalmaterial(id) ON DELETE RESTRICT;


--
-- Name: versioncomposition fkmaterialversion; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.versioncomposition
    ADD CONSTRAINT fkmaterialversion FOREIGN KEY (materialid) REFERENCES public.material(id);


--
-- Name: rating fkratingeducationalmaterial; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.rating
    ADD CONSTRAINT fkratingeducationalmaterial FOREIGN KEY (educationalmaterialid) REFERENCES public.educationalmaterial(id);


--
-- Name: rating fkratingusers; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.rating
    ADD CONSTRAINT fkratingusers FOREIGN KEY (usersusername) REFERENCES public.users(username);


--
-- Name: record fkrecord; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.record
    ADD CONSTRAINT fkrecord FOREIGN KEY (materialid) REFERENCES public.material(id) ON DELETE RESTRICT;


--
-- Name: temporaryattachment fktempattachment; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.temporaryattachment
    ADD CONSTRAINT fktempattachment FOREIGN KEY (attachmentid) REFERENCES public.attachment(id);


--
-- Name: accessibilityfeatureextension fkuseraccessibilityfeatureextension; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.accessibilityfeatureextension
    ADD CONSTRAINT fkuseraccessibilityfeatureextension FOREIGN KEY (usersusername) REFERENCES public.users(username);


--
-- Name: accessibilityhazardextension fkusersaccessibiltyhazardextension; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.accessibilityhazardextension
    ADD CONSTRAINT fkusersaccessibiltyhazardextension FOREIGN KEY (usersusername) REFERENCES public.users(username);


--
-- Name: userscollection fkuserscollection; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.userscollection
    ADD CONSTRAINT fkuserscollection FOREIGN KEY (usersusername) REFERENCES public.users(username);


--
-- Name: educationallevelextension fkuserseducationallevelextension; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.educationallevelextension
    ADD CONSTRAINT fkuserseducationallevelextension FOREIGN KEY (usersusername) REFERENCES public.users(username);


--
-- Name: keywordextension fkuserskeywordextension; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.keywordextension
    ADD CONSTRAINT fkuserskeywordextension FOREIGN KEY (educationalmaterialid) REFERENCES public.educationalmaterial(id);


--
-- Name: versioncomposition fkversioncomposition; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.versioncomposition
    ADD CONSTRAINT fkversioncomposition FOREIGN KEY (educationalmaterialid, publishedat) REFERENCES public.educationalmaterialversion(educationalmaterialid, publishedat);


--
-- Name: attachmentversioncomposition fkversioncompositionattachment; Type: FK CONSTRAINT; Schema: public; Owner: aoe_admin
--

ALTER TABLE ONLY public.attachmentversioncomposition
    ADD CONSTRAINT fkversioncompositionattachment FOREIGN KEY (versioneducationalmaterialid, versionmaterialid, versionpublishedat) REFERENCES public.versioncomposition(educationalmaterialid, materialid, publishedat);


--
-- Name: TABLE accessibilityfeature; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.accessibilityfeature TO reporter;


--
-- Name: SEQUENCE accessibilityfeature_id_seq; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON SEQUENCE public.accessibilityfeature_id_seq TO reporter;


--
-- Name: TABLE accessibilityfeatureextension; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.accessibilityfeatureextension TO reporter;


--
-- Name: SEQUENCE accessibilityfeatureextension_id_seq; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON SEQUENCE public.accessibilityfeatureextension_id_seq TO reporter;


--
-- Name: TABLE accessibilityhazard; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.accessibilityhazard TO reporter;


--
-- Name: SEQUENCE accessibilityhazard_id_seq; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON SEQUENCE public.accessibilityhazard_id_seq TO reporter;


--
-- Name: TABLE accessibilityhazardextension; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.accessibilityhazardextension TO reporter;


--
-- Name: SEQUENCE accessibilityhazardextension_id_seq; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON SEQUENCE public.accessibilityhazardextension_id_seq TO reporter;


--
-- Name: TABLE alignmentobject; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.alignmentobject TO reporter;


--
-- Name: SEQUENCE alignmentobject_id_seq; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON SEQUENCE public.alignmentobject_id_seq TO reporter;


--
-- Name: TABLE aoeuser; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.aoeuser TO reporter;


--
-- Name: TABLE attachment; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.attachment TO reporter;


--
-- Name: SEQUENCE attachment_id_seq; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON SEQUENCE public.attachment_id_seq TO reporter;


--
-- Name: TABLE attachmentversioncomposition; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.attachmentversioncomposition TO reporter;


--
-- Name: TABLE author; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.author TO reporter;


--
-- Name: SEQUENCE author_id_seq; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON SEQUENCE public.author_id_seq TO reporter;


--
-- Name: TABLE collection; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.collection TO reporter;


--
-- Name: SEQUENCE collection_id_seq; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON SEQUENCE public.collection_id_seq TO reporter;


--
-- Name: TABLE collectionaccessibilityfeature; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.collectionaccessibilityfeature TO reporter;


--
-- Name: SEQUENCE collectionaccessibilityfeature_id_seq; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON SEQUENCE public.collectionaccessibilityfeature_id_seq TO reporter;


--
-- Name: TABLE collectionaccessibilityhazard; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.collectionaccessibilityhazard TO reporter;


--
-- Name: SEQUENCE collectionaccessibilityhazard_id_seq; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON SEQUENCE public.collectionaccessibilityhazard_id_seq TO reporter;


--
-- Name: TABLE collectionalignmentobject; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.collectionalignmentobject TO reporter;


--
-- Name: SEQUENCE collectionalignmentobject_id_seq; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON SEQUENCE public.collectionalignmentobject_id_seq TO reporter;


--
-- Name: TABLE collectioneducationalaudience; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.collectioneducationalaudience TO reporter;


--
-- Name: SEQUENCE collectioneducationalaudience_id_seq; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON SEQUENCE public.collectioneducationalaudience_id_seq TO reporter;


--
-- Name: TABLE collectioneducationallevel; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.collectioneducationallevel TO reporter;


--
-- Name: SEQUENCE collectioneducationallevel_id_seq; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON SEQUENCE public.collectioneducationallevel_id_seq TO reporter;


--
-- Name: TABLE collectioneducationalmaterial; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.collectioneducationalmaterial TO reporter;


--
-- Name: TABLE collectioneducationaluse; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.collectioneducationaluse TO reporter;


--
-- Name: SEQUENCE collectioneducationaluse_id_seq; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON SEQUENCE public.collectioneducationaluse_id_seq TO reporter;


--
-- Name: TABLE collectionheading; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.collectionheading TO reporter;


--
-- Name: SEQUENCE collectionheading_id_seq; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON SEQUENCE public.collectionheading_id_seq TO reporter;


--
-- Name: TABLE collectionkeyword; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.collectionkeyword TO reporter;


--
-- Name: SEQUENCE collectionkeyword_id_seq; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON SEQUENCE public.collectionkeyword_id_seq TO reporter;


--
-- Name: TABLE collectionlanguage; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.collectionlanguage TO reporter;


--
-- Name: SEQUENCE collectionlanguage_id_seq; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON SEQUENCE public.collectionlanguage_id_seq TO reporter;


--
-- Name: TABLE collectionthumbnail; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.collectionthumbnail TO reporter;


--
-- Name: SEQUENCE collectionthumbnail_id_seq; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON SEQUENCE public.collectionthumbnail_id_seq TO reporter;


--
-- Name: TABLE educationalaudience; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.educationalaudience TO reporter;


--
-- Name: SEQUENCE educationalaudience_id_seq; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON SEQUENCE public.educationalaudience_id_seq TO reporter;


--
-- Name: TABLE educationallevel; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.educationallevel TO reporter;


--
-- Name: SEQUENCE educationallevel_id_seq; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON SEQUENCE public.educationallevel_id_seq TO reporter;


--
-- Name: TABLE educationallevelextension; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.educationallevelextension TO reporter;


--
-- Name: SEQUENCE educationallevelextension_id_seq; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON SEQUENCE public.educationallevelextension_id_seq TO reporter;


--
-- Name: TABLE educationalmaterial; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.educationalmaterial TO reporter;


--
-- Name: SEQUENCE educationalmaterial_id_seq; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON SEQUENCE public.educationalmaterial_id_seq TO reporter;


--
-- Name: TABLE educationalmaterialversion; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.educationalmaterialversion TO reporter;


--
-- Name: TABLE educationaluse; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.educationaluse TO reporter;


--
-- Name: SEQUENCE educationaluse_id_seq; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON SEQUENCE public.educationaluse_id_seq TO reporter;


--
-- Name: TABLE inlanguage; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.inlanguage TO reporter;


--
-- Name: SEQUENCE inlanguage_id_seq; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON SEQUENCE public.inlanguage_id_seq TO reporter;


--
-- Name: TABLE isbasedon; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.isbasedon TO reporter;


--
-- Name: SEQUENCE isbasedon_id_seq; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON SEQUENCE public.isbasedon_id_seq TO reporter;


--
-- Name: TABLE isbasedonauthor; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.isbasedonauthor TO reporter;


--
-- Name: SEQUENCE isbasedonauthor_id_seq; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON SEQUENCE public.isbasedonauthor_id_seq TO reporter;


--
-- Name: TABLE keyword; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.keyword TO reporter;


--
-- Name: SEQUENCE keyword_id_seq; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON SEQUENCE public.keyword_id_seq TO reporter;


--
-- Name: TABLE keywordextension; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.keywordextension TO reporter;


--
-- Name: SEQUENCE keywordextension_id_seq; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON SEQUENCE public.keywordextension_id_seq TO reporter;


--
-- Name: TABLE learningresourcetype; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.learningresourcetype TO reporter;


--
-- Name: SEQUENCE learningresourcetype_id_seq; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON SEQUENCE public.learningresourcetype_id_seq TO reporter;


--
-- Name: TABLE licensecode; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.licensecode TO reporter;


--
-- Name: TABLE material; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.material TO reporter;


--
-- Name: SEQUENCE material_id_seq; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON SEQUENCE public.material_id_seq TO reporter;


--
-- Name: TABLE materialdescription; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.materialdescription TO reporter;


--
-- Name: SEQUENCE materialdescription_id_seq; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON SEQUENCE public.materialdescription_id_seq TO reporter;


--
-- Name: TABLE materialdisplayname; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.materialdisplayname TO reporter;


--
-- Name: SEQUENCE materialdisplayname_id_seq; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON SEQUENCE public.materialdisplayname_id_seq TO reporter;


--
-- Name: TABLE materialname; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.materialname TO reporter;


--
-- Name: SEQUENCE materialname_id_seq; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON SEQUENCE public.materialname_id_seq TO reporter;


--
-- Name: TABLE notification; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.notification TO reporter;


--
-- Name: TABLE publisher; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.publisher TO reporter;


--
-- Name: SEQUENCE publisher_id_seq; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON SEQUENCE public.publisher_id_seq TO reporter;


--
-- Name: TABLE rating; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.rating TO reporter;


--
-- Name: SEQUENCE rating_id_seq; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON SEQUENCE public.rating_id_seq TO reporter;


--
-- Name: TABLE record; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.record TO reporter;


--
-- Name: SEQUENCE record_id_seq; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON SEQUENCE public.record_id_seq TO reporter;


--
-- Name: TABLE temporaryattachment; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.temporaryattachment TO reporter;


--
-- Name: SEQUENCE temporaryattachment_id_seq; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON SEQUENCE public.temporaryattachment_id_seq TO reporter;


--
-- Name: TABLE temporaryrecord; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.temporaryrecord TO reporter;


--
-- Name: SEQUENCE temporaryrecord_id_seq; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON SEQUENCE public.temporaryrecord_id_seq TO reporter;


--
-- Name: TABLE thumbnail; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.thumbnail TO reporter;


--
-- Name: SEQUENCE thumbnail_id_seq; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON SEQUENCE public.thumbnail_id_seq TO reporter;


--
-- Name: TABLE users; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.users TO reporter;


--
-- Name: SEQUENCE users_id_seq; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON SEQUENCE public.users_id_seq TO reporter;


--
-- Name: TABLE userscollection; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.userscollection TO reporter;


--
-- Name: TABLE versioncomposition; Type: ACL; Schema: public; Owner: aoe_admin
--

GRANT SELECT ON TABLE public.versioncomposition TO reporter;


--
-- PostgreSQL database dump complete
--

