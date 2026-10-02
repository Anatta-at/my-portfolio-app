--
-- PostgreSQL database dump
--

\restrict Qn8aCGERORuOHaw1sBL4j7LGcZDa4rk9b8N758Sm1AI9Bzu8YBLIJYg1cTHqCko

-- Dumped from database version 15.17 (Debian 15.17-1.pgdg13+1)
-- Dumped by pg_dump version 18.3 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: assets; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.assets (
    ticker character varying(20) NOT NULL,
    market_cap bigint NOT NULL,
    sector character varying(100),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.assets OWNER TO admin;

--
-- Name: portfolio_assets; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.portfolio_assets (
    id integer NOT NULL,
    portfolio_id integer NOT NULL,
    ticker character varying(50) NOT NULL,
    weight numeric(5,4) NOT NULL,
    beta numeric(5,4),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.portfolio_assets OWNER TO admin;

--
-- Name: portfolio_assets_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.portfolio_assets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.portfolio_assets_id_seq OWNER TO admin;

--
-- Name: portfolio_assets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.portfolio_assets_id_seq OWNED BY public.portfolio_assets.id;


--
-- Name: portfolios; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.portfolios (
    id integer NOT NULL,
    clerk_id character varying(255) NOT NULL,
    target_beta numeric(5,2),
    budget numeric(15,2),
    target_amount numeric(15,2),
    duration_years integer,
    expected_return numeric(8,4),
    portfolio_volatility numeric(8,4),
    success_probability numeric(5,4),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    name character varying(255) DEFAULT 'My Portfolio'::character varying
);


ALTER TABLE public.portfolios OWNER TO admin;

--
-- Name: portfolios_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.portfolios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.portfolios_id_seq OWNER TO admin;

--
-- Name: portfolios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.portfolios_id_seq OWNED BY public.portfolios.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.users (
    clerk_id character varying(255) NOT NULL,
    email character varying(255),
    full_name character varying(255),
    role character varying(20) DEFAULT 'user'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_login_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO admin;

--
-- Name: portfolio_assets id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.portfolio_assets ALTER COLUMN id SET DEFAULT nextval('public.portfolio_assets_id_seq'::regclass);


--
-- Name: portfolios id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.portfolios ALTER COLUMN id SET DEFAULT nextval('public.portfolios_id_seq'::regclass);


--
-- Data for Name: assets; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.assets (ticker, market_cap, sector, is_active, created_at) FROM stdin;
AOT	900000	Industrials	t	2026-08-26 06:20:38.364924
AWC	100000	Consumer Cyclical	t	2026-08-26 06:20:38.364924
BANPU	100000	Energy	t	2026-08-26 06:20:38.364924
BBL	340000	Financial Services	t	2026-08-26 06:20:38.364924
BDMS	450000	Healthcare	t	2026-08-26 06:20:38.364924
BEM	100000	Industrials	t	2026-08-26 06:20:38.364924
BH	100000	Healthcare	t	2026-08-26 06:20:38.364924
BJC	100000	Industrials	t	2026-08-26 06:20:38.364924
BTS	100000	Industrials	t	2026-08-26 06:20:38.364924
CBG	100000	Consumer Defensive	t	2026-08-26 06:20:38.364924
CCET	45000	Technology	t	2026-08-26 06:20:38.364924
CENTEL	60000	Consumer Cyclical	t	2026-08-26 06:20:38.364924
COM7	100000	Consumer Cyclical	t	2026-08-26 06:20:38.364924
CPALL	600000	Consumer Defensive	t	2026-08-26 06:20:38.364924
CPF	100000	Consumer Defensive	t	2026-08-26 06:20:38.364924
CPN	280000	Real Estate	t	2026-08-26 06:20:38.364924
CRC	100000	Consumer Cyclical	t	2026-08-26 06:20:38.364924
DELTA	1800000	Industrials	t	2026-08-26 06:20:38.364924
EGCO	100000	Utilities	t	2026-08-26 06:20:38.364924
GPSC	100000	Utilities	t	2026-08-26 06:20:38.364924
GULF	800000	Utilities	t	2026-08-26 06:20:38.364924
HMPRO	100000	Consumer Cyclical	t	2026-08-26 06:20:38.364924
IVL	100000	Basic Materials	t	2026-08-26 06:20:38.364924
KBANK	350000	Financial Services	t	2026-08-26 06:20:38.364924
KKP	100000	Financial Services	t	2026-08-26 06:20:38.364924
KTB	100000	Financial Services	t	2026-08-26 06:20:38.364924
KTC	100000	Financial Services	t	2026-08-26 06:20:38.364924
LH	100000	Real Estate	t	2026-08-26 06:20:38.364924
MINT	180000	Consumer Cyclical	t	2026-08-26 06:20:38.364924
MTC	100000	Financial Services	t	2026-08-26 06:20:38.364924
OR	100000	Energy	t	2026-08-26 06:20:38.364924
OSP	100000	Consumer Defensive	t	2026-08-26 06:20:38.364924
PTT	1000000	Energy	t	2026-08-26 06:20:38.364924
PTTEP	500000	Energy	t	2026-08-26 06:20:38.364924
PTTGC	100000	Basic Materials	t	2026-08-26 06:20:38.364924
RATCH	100000	Utilities	t	2026-08-26 06:20:38.364924
SAWAD	50000	Financial Services	t	2026-08-26 06:20:38.364924
SCB	380000	Financial Services	t	2026-08-26 06:20:38.364924
SCC	300000	Industrials	t	2026-08-26 06:20:38.364924
SCGP	100000	Consumer Cyclical	t	2026-08-26 06:20:38.364924
TCAP	100000	Financial Services	t	2026-08-26 06:20:38.364924
TIDLOR	100000	Financial Services	t	2026-08-26 06:20:38.364924
TISCO	100000	Financial Services	t	2026-08-26 06:20:38.364924
TLI	100000	Financial Services	t	2026-08-26 06:20:38.364924
TOP	100000	Energy	t	2026-08-26 06:20:38.364924
TRUE	250000	Communication Services	t	2026-08-26 06:20:38.364924
TTB	100000	Financial Services	t	2026-08-26 06:20:38.364924
TU	100000	Consumer Defensive	t	2026-08-26 06:20:38.364924
WHA	100000	Real Estate	t	2026-08-26 06:20:38.364924
ADVANC	850000	Communication Services	t	2026-08-26 06:20:38.364924
\.


--
-- Data for Name: portfolio_assets; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.portfolio_assets (id, portfolio_id, ticker, weight, beta, created_at) FROM stdin;
1	1	AOT	0.1986	1.1200	2026-08-26 08:27:41.652984
2	1	BBL	0.1946	0.5500	2026-08-26 08:27:41.652984
3	1	HMPRO	0.2218	1.0900	2026-08-26 08:27:41.652984
4	1	TIDLOR	0.1937	0.5500	2026-08-26 08:27:41.652984
5	1	TOP	0.1914	1.3500	2026-08-26 08:27:41.652984
6	2	AOT	0.1986	1.1200	2026-08-26 08:29:05.101065
7	2	BBL	0.1946	0.5500	2026-08-26 08:29:05.101065
8	2	HMPRO	0.2218	1.0900	2026-08-26 08:29:05.101065
9	2	TIDLOR	0.1937	0.5500	2026-08-26 08:29:05.101065
10	2	TOP	0.1914	1.3500	2026-08-26 08:29:05.101065
11	3	BEM	0.1900	1.0000	2026-08-27 11:54:29.374227
12	3	CENTEL	0.1878	1.0000	2026-08-27 11:54:29.374227
13	3	SCGP	0.2005	1.0000	2026-08-27 11:54:29.374227
14	3	TCAP	0.2042	1.0000	2026-08-27 11:54:29.374227
15	3	WHA	0.2175	1.0000	2026-08-27 11:54:29.374227
16	4	AOT	0.2162	1.0000	2026-08-27 16:07:56.420056
17	4	CCET	0.1921	1.0000	2026-08-27 16:07:56.420056
18	4	TCAP	0.1978	1.0000	2026-08-27 16:07:56.420056
19	4	TISCO	0.2023	1.0000	2026-08-27 16:07:56.420056
20	4	TRUE	0.1916	1.0000	2026-08-27 16:07:56.420056
21	5	ADVANC	0.1876	1.0000	2026-08-27 16:11:12.1053
22	5	AWC	0.2120	1.0000	2026-08-27 16:11:12.1053
23	5	BH	0.2092	1.0000	2026-08-27 16:11:12.1053
24	5	CRC	0.2081	1.0000	2026-08-27 16:11:12.1053
25	5	SAWAD	0.1832	1.0000	2026-08-27 16:11:12.1053
26	6	GPSC	0.2023	1.0000	2026-08-27 16:50:53.751008
27	6	OSP	0.2199	1.0000	2026-08-27 16:50:53.751008
28	6	PTTGC	0.1918	1.0000	2026-08-27 16:50:53.751008
29	6	SAWAD	0.2005	1.0000	2026-08-27 16:50:53.751008
30	6	TRUE	0.1856	1.0000	2026-08-27 16:50:53.751008
31	7	BBL.BK	0.3000	0.7000	2026-08-27 16:51:03.696607
32	7	ADVANC.BK	0.3000	0.8000	2026-08-27 16:51:03.696607
33	7	PTT.BK	0.2000	0.9000	2026-08-27 16:51:03.696607
34	7	SCC.BK	0.2000	0.9000	2026-08-27 16:51:03.696607
35	8	BH	0.1952	1.0000	2026-08-27 16:51:27.536839
36	8	CPALL	0.2008	1.0000	2026-08-27 16:51:27.536839
37	8	KKP	0.1985	1.0000	2026-08-27 16:51:27.536839
38	8	OSP	0.1940	1.0000	2026-08-27 16:51:27.536839
39	8	TIDLOR	0.2115	1.0000	2026-08-27 16:51:27.536839
40	9	BBL.BK	0.3000	0.7000	2026-08-28 07:35:12.104261
41	9	ADVANC.BK	0.3000	0.8000	2026-08-28 07:35:12.104261
42	9	PTT.BK	0.2000	0.9000	2026-08-28 07:35:12.104261
43	9	SCC.BK	0.2000	0.9000	2026-08-28 07:35:12.104261
44	10	DELTA.BK	0.3000	1.5000	2026-08-28 15:35:37.938257
45	10	EA.BK	0.2000	1.4000	2026-08-28 15:35:37.938257
46	10	MTC.BK	0.2000	1.2000	2026-08-28 15:35:37.938257
47	10	KCE.BK	0.2000	1.3000	2026-08-28 15:35:37.938257
48	10	JMT.BK	0.1000	1.2000	2026-08-28 15:35:37.938257
49	11	BBL	0.2127	0.5500	2026-08-28 15:36:19.772316
50	11	BDMS	0.1859	0.5900	2026-08-28 15:36:19.772316
51	11	CRC	0.1891	1.1200	2026-08-28 15:36:19.772316
52	11	RATCH	0.2040	0.6700	2026-08-28 15:36:19.772316
53	11	TOP	0.2083	1.3400	2026-08-28 15:36:19.772316
54	12	BJC	0.1957	1.0500	2026-09-01 04:26:58.517478
55	12	COM7	0.1889	1.0300	2026-09-01 04:26:58.517478
56	12	DELTA	0.2345	2.3200	2026-09-01 04:26:58.517478
57	12	KTB	0.1856	0.6300	2026-09-01 04:26:58.517478
58	12	LH	0.1953	1.0300	2026-09-01 04:26:58.517478
59	13	BDMS	0.1921	0.5600	2026-09-01 04:27:32.279224
60	13	BJC	0.1954	1.0500	2026-09-01 04:27:32.279224
61	13	CPF	0.2131	0.6600	2026-09-01 04:27:32.279224
62	13	MINT	0.2028	0.7700	2026-09-01 04:27:32.279224
63	13	TLI	0.1966	0.7700	2026-09-01 04:27:32.279224
64	14	ADVANC	0.2262	0.7200	2026-09-01 05:19:31.024153
65	14	BANPU	0.1933	0.6800	2026-09-01 05:19:31.024153
66	14	BEM	0.1855	0.9000	2026-09-01 05:19:31.024153
67	14	CENTEL	0.1991	0.8500	2026-09-01 05:19:31.024153
68	14	SAWAD	0.1958	1.1200	2026-09-01 05:19:31.024153
69	15	ADVANC	0.1884	0.7200	2026-09-01 05:50:16.079707
70	15	BTS	0.2023	1.1000	2026-09-01 05:50:16.079707
71	15	CCET	0.2012	1.7400	2026-09-01 05:50:16.079707
72	15	CPF	0.2150	0.6600	2026-09-01 05:50:16.079707
73	15	TIDLOR	0.1932	0.6000	2026-09-01 05:50:16.079707
74	16	SCB	0.3322	0.3400	2026-09-01 05:51:46.767149
75	16	SCGP	0.3339	1.2200	2026-09-01 05:51:46.767149
76	16	TCAP	0.3339	0.4600	2026-09-01 05:51:46.767149
77	17	CBG	0.3527	1.0200	2026-09-01 05:54:48.183655
78	17	SAWAD	0.3217	1.1200	2026-09-01 05:54:48.183655
79	17	TIDLOR	0.3256	0.6000	2026-09-01 05:54:48.183655
80	18	SCC	0.3443	1.1400	2026-09-01 05:57:45.286663
81	18	TCAP	0.3389	0.4600	2026-09-01 05:57:45.286663
82	18	TIDLOR	0.3168	0.6000	2026-09-01 05:57:45.286663
\.


--
-- Data for Name: portfolios; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.portfolios (id, clerk_id, target_beta, budget, target_amount, duration_years, expected_return, portfolio_volatility, success_probability, created_at, name) FROM stdin;
1	user_3AQqtIiYniU0Qnz8SccIBLtjwnE	1.20	100000.00	1500000.00	20	0.0657	0.2097	0.0252	2026-08-26 08:27:41.652984	กแงทุน
2	user_3AQqtIiYniU0Qnz8SccIBLtjwnE	1.00	100000.00	2000000.00	39	0.0657	0.2097	0.1618	2026-08-26 08:29:05.101065	กองทุน
3	user_3AQqtIiYniU0Qnz8SccIBLtjwnE	1.00	100000.00	200000.00	10	0.0644	0.2193	0.3379	2026-08-27 11:54:29.374227	กองทุน
4	user_3AQqtIiYniU0Qnz8SccIBLtjwnE	1.00	100000.00	150000.00	5	0.0600	0.1877	0.3221	2026-08-27 16:07:56.420056	กองทุน
5	user_3AQqtIiYniU0Qnz8SccIBLtjwnE	1.20	100000.00	150000.00	5	0.0691	0.2575	0.3474	2026-08-27 16:11:12.1053	undefined
6	user_3AQqtIiYniU0Qnz8SccIBLtjwnE	1.00	10000.00	30000.00	10	0.0745	0.2525	0.1999	2026-08-27 16:50:53.751008	กองทุน
7	user_3AQqtIiYniU0Qnz8SccIBLtjwnE	0.80	100000.00	\N	5	0.0600	0.1000	1.0000	2026-08-27 16:51:03.696607	พอร์ตความมั่นคง
8	user_3AQqtIiYniU0Qnz8SccIBLtjwnE	0.80	100000.00	200000.00	10	0.0538	0.1975	0.2876	2026-08-27 16:51:27.536839	กองทุน
9	user_3AQqtIiYniU0Qnz8SccIBLtjwnE	0.80	100000.00	\N	5	0.0600	0.1000	1.0000	2026-08-28 07:35:12.104261	พอร์ตความมั่นคง
10	user_3AQqtIiYniU0Qnz8SccIBLtjwnE	1.20	100000.00	\N	5	0.1200	0.2200	1.0000	2026-08-28 15:35:37.938257	พอร์ตเติบโตสูง
11	user_3AQqtIiYniU0Qnz8SccIBLtjwnE	1.20	100000.00	200000.00	5	0.0570	0.1835	0.1151	2026-08-28 15:36:19.772316	พอร์ตเติบโตสูง
12	user_3AQqtIiYniU0Qnz8SccIBLtjwnE	1.00	100000.00	150000.00	5	0.0895	0.2277	0.4316	2026-09-01 04:26:58.517478	กองทุนนน
13	user_3AQqtIiYniU0Qnz8SccIBLtjwnE	1.00	100000.00	150000.00	10	0.0499	0.1934	0.4392	2026-09-01 04:27:32.279224	กองทุนนน
14	user_3AQqtIiYniU0Qnz8SccIBLtjwnE	0.80	100000.00	200000.00	10	0.0530	0.2051	0.2822	2026-09-01 05:19:31.024153	กองทุนความเสี่ยงต่ำ
15	user_3AQgStSlyVXHAzH3Syf80i9FNKB	0.80	100000.00	150000.00	10	0.0658	0.2183	0.5082	2026-09-01 05:50:16.079707	กองทุนความเสี่ยงต่ำ
16	user_3AQgStSlyVXHAzH3Syf80i9FNKB	0.80	100000.00	150000.00	10	0.0422	0.1855	0.3952	2026-09-01 05:51:46.767149	กองทุนความเสี่ยงกลาง
17	user_3AQgStSlyVXHAzH3Syf80i9FNKB	0.80	100000.00	150000.00	10	0.0565	0.2727	0.4027	2026-09-01 05:54:48.183655	กองทุน
18	user_3AQgStSlyVXHAzH3Syf80i9FNKB	1.00	100000.00	150000.00	10	0.0474	0.1986	0.4187	2026-09-01 05:57:45.286663	กองทุน
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.users (clerk_id, email, full_name, role, created_at, last_login_at) FROM stdin;
user_3EUf3GxjtzeWdYeqUvlfkqjXLPs	peerapath555@gmail.com	\N	user	2026-08-26 08:31:21.43498	2026-08-26 08:31:21.43498
user_3ARIGCTf30NTfGtGrrOEA1r4HVA	peet093665@gmail.com	\N	admin	2026-08-26 08:31:24.794777	2026-08-26 08:31:24.794777
user_3AQqtIiYniU0Qnz8SccIBLtjwnE	thanawinleepraseart@gmail.com	\N	admin	2026-08-26 08:24:32.892522	2026-09-01 05:37:13.676717
user_3AQgStSlyVXHAzH3Syf80i9FNKB	icezuza57@gmail.com	KANA	user	2026-08-26 08:31:28.242099	2026-09-01 06:08:02.133805
\.


--
-- Name: portfolio_assets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.portfolio_assets_id_seq', 82, true);


--
-- Name: portfolios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.portfolios_id_seq', 18, true);


--
-- Name: assets assets_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_pkey PRIMARY KEY (ticker);


--
-- Name: portfolio_assets portfolio_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.portfolio_assets
    ADD CONSTRAINT portfolio_assets_pkey PRIMARY KEY (id);


--
-- Name: portfolios portfolios_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.portfolios
    ADD CONSTRAINT portfolios_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (clerk_id);


--
-- Name: idx_portfolio_assets_portfolio_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_portfolio_assets_portfolio_id ON public.portfolio_assets USING btree (portfolio_id);


--
-- Name: idx_portfolios_clerk_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_portfolios_clerk_id ON public.portfolios USING btree (clerk_id);


--
-- Name: portfolio_assets portfolio_assets_portfolio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.portfolio_assets
    ADD CONSTRAINT portfolio_assets_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id) ON DELETE CASCADE;


--
-- Name: portfolios portfolios_clerk_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.portfolios
    ADD CONSTRAINT portfolios_clerk_id_fkey FOREIGN KEY (clerk_id) REFERENCES public.users(clerk_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict Qn8aCGERORuOHaw1sBL4j7LGcZDa4rk9b8N758Sm1AI9Bzu8YBLIJYg1cTHqCko

