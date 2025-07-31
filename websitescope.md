MedAtlas — V1 Implementation Blueprint
Goal: Recreate the successful Nomad List interaction model for medical professionals (premeds, med students, residents), with SQLite + simple backend.

0) Product framing
Entity = “Place” (analogous to a city).

For premeds: Medical Schools

For med students: Rotation Sites (hospital/clinic)

For seniors/MS4: Residency Programs

Users: premeds, M1–M4, residents, alumni, IMGs.

Core loop: Explore → Filter → Open modal page → Check‑in / Review → Join community → Return for decisions.

1) Information Architecture & Routes
/ – Explore (grid/list with left filters, top search)

/schools – filtered view scoped to schools

/rotations – filtered view scoped to rotation sites

/residencies – filtered view scoped to residencies

/place/[slug] – Place modal (opens over explore, deep‑linkable)

/join – paywall/join flow

/login, /account

/tools/* – calculators (loan, COL on resident salary, competitiveness), “best for X” pages

/best/[slug] – SEO pages (e.g., /best/low-debt-schools)

/api/* – JSON endpoints

Modal behavior: just like Nomad List: opening a card pushes a route (/place/nyu-grossman) and shows a full‑width centered modal with tabs.

2) Visual & Interaction Parity Map (from screenshots)
A) Explore Grid (home)
Left rail filters (chips + sections), top search (“Search or filter…”), grid cards with hero photo and top metrics.

Right rail: community widgets (upcoming meetups → we’ll use “upcoming virtual Q&As”, “students here now”, ads later).

Card content (above the image):

Rank badge (#1…#N)

WIFI‑like icon → “Training intensity” or “Match strength” indicator

Bottom strip: weather → replace with “Avg workload”, “Well‑being index”, “COL”

Bottom right: $ monthly cost (school: tuition/month equivalent or total cost; residency: COL on PGY1 salary)

Filters (left rail) mirroring NL chips:

WHAT

💸 Tuition <$20K/yr, <$40K/yr, <$60K/yr

🧠 Research output (Low/Med/High)

❤️ Resident happiness (community score)

🩺 Step performance proxy (if public)

🌍 IMG‑friendly

🛏️ Workload (lighter ↔ heavier)

🧭 Urban/Suburban/Rural

🧾 Loan burden low

🧑‍🎓 “Liked by members”

WHERE (continents/countries/states; academic vs community)

WHEN (applications open, rotation seasons, match timelines)

YOU (You haven’t been / For you → personalized recommendations)

B) Place Modal with Tabs
Tabs to match your screenshots:

Scores (summary bars + small map)

Guide (What to expect: curriculum/rotations)

Pros & Cons (badges)

Reviews (anonymous, NLP summary on top)

Costs (tuition, living, loan examples)

People (now / soon / been)

Chat (link to gated Telegram/Discord channel per place)

Photos (UGC)

Weather → replace with “Schedule & Call” or “Curriculum”

Trends (interest over time, members growth)

Demographics (international %, gender balance, IMG %, specialties)

Header CTAs:

Join the community at [Place] (red button)

Next Q&A in X days (secondary red button)

C) People Tab
Replicate avatars sections:

“X members here now”

“Members who will be here soon”

“Members who have been here”

Privacy: allow private check‑ins (counts only).

D) Reviews Tab
Big textarea (“Write an anonymous review…”) + tag chips.

Below: AI‑generated summary of reviews (yellow box) + individual reviews list.

One review per user per place; edits replace previous.

E) Global Menu
General: Frontpage, Favorites, Dark mode

Community: Dating app → Mentor match, Friend finder, Members map, Host meetup → Host study group

Tools: Explore, Vote on photos → Vote on rotations info, FIRE calc → Loan payoff calc, Climate finder → Lifestyle/fit finder, Fastest internet → Best teaching hospitals, Random place, Best place now

Help: FAQ, Changelog, Ideas + bugs

Other projects: (future) “Residency List”, “Rotation List”, etc.

F) Join Flow (CTA block)
Ratings, avatar row, screenshot of chat (Telegram/Discord)

Email field + gender → replace with Training stage select (Premed/MS1…Resident)

Cloudflare Turnstile (captcha)

Stripe checkout → one‑time payment

3) Data Model (SQLite)
Tables (minimum viable):

sql
Copy
Edit
-- Places (schools/rotations/residencies unified)
CREATE TABLE places (
  id INTEGER PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK(type IN ('school','rotation','residency')) NOT NULL,
  institution TEXT,          -- owning university/health system
  city TEXT, state TEXT, country TEXT, lat REAL, lng REAL,
  photo_url TEXT,
  tags TEXT,                 -- JSON array of tags
  rank_overall REAL,         -- computed
  metrics JSON,              -- JSON: {tuition_year, col_index, workload, research, img_friendly, ...}
  scores JSON,               -- JSON: {quality_of_training, community, lifestyle, burnout, match_strength}
  created_at TEXT, updated_at TEXT
);

CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  stage TEXT,                -- premed, ms1..ms4, resident, attending
  display_name TEXT,
  avatar_url TEXT,
  is_paid INTEGER DEFAULT 0,
  created_at TEXT, updated_at TEXT
);

CREATE TABLE checkins (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  place_id INTEGER NOT NULL,
  status TEXT CHECK(status IN ('now','soon','been')) NOT NULL,
  private INTEGER DEFAULT 0,
  eta_date TEXT,             -- for 'soon'
  created_at TEXT,
  UNIQUE(user_id, place_id, status)
);

CREATE TABLE reviews (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  place_id INTEGER NOT NULL,
  rating INTEGER CHECK(rating BETWEEN 1 AND 5) NOT NULL,
  tags TEXT,                 -- JSON array of tagged topics
  body TEXT,
  is_anonymous INTEGER DEFAULT 1,
  created_at TEXT, updated_at TEXT,
  UNIQUE(user_id, place_id)  -- one review per place per user
);

CREATE TABLE photos (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  place_id INTEGER,
  url TEXT,
  created_at TEXT
);

CREATE TABLE favorites (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  place_id INTEGER,
  created_at TEXT,
  UNIQUE(user_id, place_id)
);

CREATE TABLE payments (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  stripe_session_id TEXT,
  amount_cents INTEGER,
  created_at TEXT
);

-- Precomputed search index (optional)
CREATE VIRTUAL TABLE place_search USING fts5(slug, name, city, tags);
Durability: use SQLite WAL mode; nightly encrypted backups to S3 (via Litestream or cron + rclone).

4) Ranking & Filters
Composite score (example):

makefile
Copy
Edit
overall_score = 
  0.25 * normalized(quality_of_training) +
  0.20 * normalized(community_score) +
  0.20 * normalized(lifestyle) +
  0.20 * inverse_normalized(cost_total) +
  0.15 * normalized(match_strength)
Store normalized values in scores JSON; cache rank_overall.

Filters map to fields in metrics/scores. Support ranges, tag matches, and booleans.

Search: fuzzy search across name/city/institution; also parse chip‑style filters typed in the search box (e.g., img:yes cost:<40k urban).

5) API Endpoints (REST)
GET /api/places?type=&filters=&sort=&q= → paginated explore

GET /api/places/[slug] → full place payload (scores, metrics, counts, tabs data)

GET /api/places/[slug]/people?status=now|soon|been

POST /api/checkins {place_id, status, private, eta_date} (auth, paid if gated)

POST /api/reviews {place_id, rating, tags[], body} (auth, paid if gated)

GET /api/reviews?place_id=

POST /api/favorites {place_id}

Auth: POST /api/signup, POST /api/login, POST /api/logout

Payments: POST /api/checkout (Stripe session), POST /api/webhooks/stripe

6) Paywall Rules (V1)
Free: browse explore grid; open place modal with Scores and Guide tab.

Paid: unlock Reviews, People, Pros/Cons, Costs details, and posting (review/check‑in).

If not paid and user clicks a locked tab/CTA → open /join overlay (match the red CTA pattern).

7) Admin Console (minimal)
/admin (basic auth)

CRUD for places (inline JSON editors for metrics/scores)

Review moderation (hide/delete)

Photo approvals

Recompute ranks

CSV/JSON importers (seed 50–200 places fast)

8) Content & Data Seeding
Schools (US first, 50–100): tuition, location, public stats, rough research proxy.

Residencies (IM + EM + Psych initial 30–50): program type, call structure (if public), fellowships on site.

Rotation sites (optional in V1): seed 20–30 from your network.

Cost‑of‑living: static index per city (Numbeo snapshot or your own table).

Photos: Unsplash placeholders; swap with UGC later.

9) UX Details & Components
Card: image, name, country/state, mini‑metrics row, “$ total/yr or $/mo equiv”, hover opens quick stats.

Modal: sticky header w/ title, two red CTAs, breadcrumb, photo credit text, tab bar (scrollable on mobile).

Score bars: green/yellow/red pill bars with label + small emoji (copy tone from screenshots).

People avatars: circular grid, grey placeholders for private check‑ins.

Review composer: large textarea, tag chips below, “Post review” (disabled until rating selected).

Menu drawer: grouped sections exactly like screenshot (General, Community, Tools, Help, Other projects).

Empty states: friendly microcopy (e.g., “Be the first to review [Place]”).

Design system: Tailwind, 8px spacing grid, bold red CTA buttons, rounded‑xl, subtle shadows, system fonts.

10) Security, Privacy, Compliance
No PHI; reviews are anonymous by default (store user_id but don’t display).

Rate‑limit posting; profanity/PII filter on reviews; allow flagging.

Cloudflare Turnstile on join and posting.

Backups encrypted; rotate secrets; HTTPS only.

11) Analytics & Metrics
Events: view_explore, open_place, tab_click, attempt_locked, checkout_start, checkout_success, post_review, checkin_create.

KPIs: free→paid conversion, % places with ≥3 reviews, DAU/MAU, search/filter usage, top exit tabs.

12) Delivery Plan (3–4 weeks)
Week 1

Project scaffold (Next.js/SvelteKit), Tailwind, SQLite (WAL), auth, basic seed loader.

Explore grid (static data), filters UI (nonfunctional), card modal shell, routes.

Week 2

Filters backend + search; place modal tabs with Scores/Guide/Pros&Cons.

People avatars with check‑ins; Reviews read‑only.

Week 3

Reviews posting + tags; paywall gating + Stripe; Join flow.

Admin CRUD; backups cron; basic SEO (OG tags, sitemap).

Week 4

Polish, mobile QA, accessibility pass, analytics events, seed 50+ places, beta launch.

13) Nice‑to‑Have (post‑launch)
AI summary of reviews (server‑side batch job, cached).

“For You” recommender (stage + goals + budget → ranked list).

Compare view (place A vs B).

Mentor match (lightweight directory).

Residency salary calculator vs COL.

Export JSON API (read‑only) for community builders.

14) Acceptance Criteria (V1)
Load / with left rail filters, top search, grid cards; <1.5s TTI on broadband.

Open /place/[slug] modal with Scores, Guide, Pros & Cons tabs populated.

People tab shows “now/soon/been”, including private placeholders.

Reviews tab shows composer (for paid) + list; one review per user per place.

Stripe checkout completes; user becomes is_paid=1; locked tabs unlock instantly.

Admin can add a new place and it appears in explore without deploy.

Developer Notes
Use static generation for explore and place pages with incremental revalidation; dynamic parts (people/reviews) hydrate client‑side.

Cache computed ranks; recompute nightly.

Keep metrics/scores flexible in JSON to iterate without migrations.