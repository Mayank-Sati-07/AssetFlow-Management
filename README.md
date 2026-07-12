# AssetFlow backend — beginner's guide

This is a real, runnable backend. Nothing here is pseudocode. Read this top to bottom before touching the code — it explains *why* the folders are shaped this way, not just what's in them.

---

## 1. The one idea to understand before anything else

Every request to this backend flows through the same four stops, in the same order, every time:

```
Route  →  Middleware  →  Controller  →  Service  →  Database
(URL)     (guards)       (traffic cop)  (the rules)  (Prisma)
```

- **Route** (`*.routes.js`) — just says "this URL + this HTTP method goes to that function." No logic.
- **Middleware** (`auth.middleware.js`, `rbac.middleware.js`) — runs *before* your controller, and can stop the request early ("you're not logged in", "you're not allowed to do this").
- **Controller** (`*.controller.js`) — reads the incoming request (`req.body`, `req.params`), calls the service, sends back the response. It never talks to the database directly.
- **Service** (`*.service.js`) — this is where the actual thinking happens: "is this allocation allowed?", "does this booking overlap?". This is the layer you'll spend the most time in.

Why bother splitting these up instead of writing it all in one function? Because it means you can change *how* something is triggered (HTTP route today, a scheduled job tomorrow) without rewriting the rule itself. It also means each layer is small enough to actually understand.

---

## 2. Folder structure

```
assetflow-backend/
├── prisma/
│   └── schema.prisma        ← defines every database table (read this first)
├── src/
│   ├── config/
│   │   └── prisma.js        ← the one shared database connection
│   ├── middleware/
│   │   ├── auth.middleware.js    ← "are you logged in?"
│   │   ├── rbac.middleware.js    ← "are you allowed to do THIS?"
│   │   └── errorHandler.js       ← catches every error, returns clean JSON
│   ├── utils/
│   │   ├── ApiError.js      ← lets services throw errors with a status code
│   │   └── asyncHandler.js  ← boilerplate-killer for async route handlers
│   ├── modules/              ← one folder per business capability
│   │   ├── auth/             ← login + account creation
│   │   ├── assets/           ← the asset state machine
│   │   ├── allocations/      ← assign assets, prevents double-allocation
│   │   ├── bookings/         ← time-slot booking, prevents overlaps
│   │   └── maintenance/      ← approval workflow
│   ├── app.js                ← wires everything together
│   └── server.js             ← actually starts the server
├── .env.example               ← copy this to .env
└── package.json
```

Each module folder has exactly the same three files (`routes`, `controller`, `service`). Once you understand one module, you understand the shape of all of them — that repetition is deliberate, it's what "reusable module pattern" means in practice.

---

## 3. Setting it up on your machine (step by step)

### Step 1 — Install the tools
- Install **Node.js** (v18 or newer): https://nodejs.org
- Install **PostgreSQL**: https://www.postgresql.org/download/ (or use a free hosted one like [Neon](https://neon.tech) or [Supabase](https://supabase.com) if you don't want to install it locally — much easier for a first project)

### Step 2 — Install the project's packages
Open a terminal inside the `assetflow-backend` folder and run:
```
npm install
```
This reads `package.json` and downloads every library the project needs (Express, Prisma, etc.) into a `node_modules` folder.

### Step 3 — Configure your database connection
```
cp .env.example .env
```
Open `.env` and replace `DATABASE_URL` with your real Postgres connection string. If you used a hosted service like Neon, they give you this string directly — just paste it in. Also change `JWT_SECRET` to any random long string (this is what signs your login tokens).

### Step 4 — Create the actual database tables
```
npx prisma migrate dev --name init
```
This reads `prisma/schema.prisma` and creates every table in your real database. You should see it print out the tables it created. If this fails, it's almost always the `DATABASE_URL` in `.env` being wrong — double check it.

### Step 5 — Start the server
```
npm run dev
```
You should see: `AssetFlow backend running on http://localhost:4000`

Visit `http://localhost:4000/health` in your browser — you should see `{"status":"ok"}`. If you see that, everything is wired up correctly.

---

## 4. Trying it out (there's no UI yet — use Postman or `curl`)

**Problem:** every route except login requires a token, but you can't create a token without an admin account, and there's no public "become admin" route (on purpose — see the account creation rule). So the very first user has to be inserted directly.

Open Prisma Studio (a visual database browser) to do this by hand once:
```
npm run prisma:studio
```
This opens a browser tab where you can manually add:
1. One row in **Department** (e.g. "IT")
2. One row in **Employee**, linked to that department
3. One row in **User**, linked to that employee, with `role = ADMIN`. For the password, you'll need a bcrypt hash — for testing, you can temporarily log the hash by running a quick one-off script, or just use an online bcrypt generator for the word "password123" and paste the hash in.

Once that one admin row exists, everything else happens through the API:

**Log in:**
```
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```
This returns a `token`. Copy it — every request below needs it in the `Authorization` header.

**Create an asset category and an asset** (needs the token):
```
curl -X POST http://localhost:4000/api/assets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"assetTag":"AF-0114","categoryId":1}'
```

**Allocate it to an employee:**
```
curl -X POST http://localhost:4000/api/allocations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"assetId":1,"employeeId":1}'
```

**Try allocating the same asset again** — you should get back a `409 Conflict` with the message "This asset already has an active allocation." That's the double-allocation rule working.

**Try booking a resource with an overlapping time** — you'll get a `409` naming the conflicting booking's time window.

---

## 5. How the "prevent double-allocation" rule actually works

This trips people up, so it's worth walking through slowly. Look at `src/modules/allocations/allocation.service.js`.

There are actually **three layers of protection**, from loosest to strictest:
1. **The state machine** (`asset.service.js`) — an asset must be `AVAILABLE` before it can become `ALLOCATED`. If it's already `ALLOCATED`, this step alone would already reject it.
2. **The database transaction** (`prisma.$transaction`) — everything inside happens as one atomic unit. If any step fails, all of it is rolled back, so you never end up with "asset says allocated but there's no allocation row."
3. **The database constraint** (`@@unique([assetId, status])` in `schema.prisma`) — this is the final safety net. Even if there were a bug in the JavaScript logic above, Postgres itself physically refuses to store two `ACTIVE` allocation rows for the same asset. This is what makes it safe even if two people click "allocate" at the exact same millisecond.

The booking overlap check (`booking.service.js`) works the same way conceptually, just comparing time ranges instead of a status flag.

---

## 6. What to build next, in order

1. **Employee & Department CRUD** — you'll need simple create/list routes for these before anything else is testable end-to-end. Copy the shape of `assets` module.
2. **Notifications module** — a scheduled job (look up `node-cron`) that scans for overdue allocations/bookings nightly and inserts `Notification` rows.
3. **Audit module** — `AuditCycle` creation, assigning auditors, and a route where an auditor submits the "found state" for an asset, which auto-creates a `DiscrepancyReport` if it doesn't match.
4. **Dashboard/KPI endpoint** — a route that just runs `count()` queries grouped by state — e.g. `prisma.asset.groupBy({ by: ['state'], _count: true })` gives you the "Available: 128, Allocated: 76" numbers directly.
5. Only once the API works end-to-end, connect a frontend (your Excalidraw screens) to these endpoints.

## 7. Common beginner mistakes to avoid

- **Don't** put database queries in controllers. If you find yourself writing `prisma.something` in a `*.controller.js` file, move it into the matching `*.service.js`.
- **Don't** trust `req.body.role` or `req.body.userId` for who's making a request — always use `req.user` (set by `auth.middleware.js` from the verified token). Anything from `req.body` can be faked by the client.
- **Don't** skip the transaction when a rule involves more than one table write (asset state + allocation row, request status + asset state, etc.) — that's exactly when partial failures create corrupted data.
- **Do** re-read section 5 whenever you add a new "prevent X" rule elsewhere in the app (e.g. preventing an audit from closing with unresolved discrepancies) — the same three-layer pattern applies.
