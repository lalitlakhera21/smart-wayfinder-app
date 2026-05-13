## Smart Campus Navigation — Dynamic Routing Upgrade

Replace the current hardcoded step generator with a graph-based navigation engine backed by two new tables: `locations` (nodes) and `location_connections` (edges). Use BFS shortest-path on the graph to build routes dynamically.

### 1. Database (migration)

**`locations`** — every navigable point (gate, building, block, floor-corridor, stairs, lift, room, office)
- `id` uuid pk
- `name` text (e.g. "Main Gate", "Academic Block – Ground Floor Corridor", "HOD JMC Office")
- `type` text — `gate | building | block | floor | corridor | stairs | lift | room | office | landmark`
- `building` text nullable
- `block` text nullable
- `floor` text nullable
- `wing` text nullable
- `description` text nullable
- `photo_url` text nullable
- `is_verified` bool default true
- `room_id` uuid nullable (links to existing `rooms` when applicable)

**`location_connections`** — directed edges
- `id` uuid pk
- `from_location_id` uuid fk → locations
- `to_location_id` uuid fk → locations
- `direction` text — `Straight | Left | Right | Up | Down`
- `distance_m` int default 10
- `estimated_seconds` int default 30
- `instruction` text nullable (e.g. "Take stairs up to 4th floor")

Both edges inserted as a pair (A→B and B→A) so graph is bidirectional but each direction can carry its own instruction (e.g. "Up" vs "Down" for stairs).

RLS: public read; admin-only write. Triggers for `updated_at`.

**Seed data**: Main Gate, Parking, Library, Canteen + Academic Block / Technology Block / Administrative Block with their floors, stairs, and a handful of representative rooms (LT-204, HOD JMC Office, etc.). About 25–30 nodes, ~60 edges.

### 2. Navigation engine (`src/lib/navigation.ts`)
- `buildGraph(locations, connections)` → adjacency map
- `findShortestPath(graph, fromId, toId)` → BFS returning ordered list of `{ location, edge }` steps
- `summarizeRoute(steps)` → total distance + estimated time + step instructions

### 3. Hooks (`src/hooks/useLocations.tsx`)
- `useLocations()` — list all
- `useConnections()` — list all
- `useRoute(fromId, toId)` — memoized BFS result
- Admin CRUD for locations + connections

### 4. UI

**`src/pages/Navigate.tsx`** (route `/navigate`)
- Step 1: From dropdown (Combobox, searchable, defaults to "Main Gate")
- Step 2: To searchable combobox (rooms + offices + landmarks)
- Result card: destination header, ordered route timeline (reuses NavigationSteps visual style), total time + distance, verified badge, photo button

**`src/components/RouteCard.tsx`** — modern minimal route card

**Admin** (`/admin/locations`) — manage nodes & edges in two tabs.

### 5. Wiring
- Add `/navigate` route in `App.tsx` and a CTA button on `Index.tsx` and `Header.tsx`
- Add `locations` admin section in `AdminSidebar` + `Admin.tsx`
- Keep existing rooms/departments untouched (no breaking changes)

### Technical notes
- BFS is sufficient (graph is small, edge weights similar). If weights diverge later, swap to Dijkstra — same interface.
- Each room can optionally link to a `locations` row via `room_id` so existing room search can deep-link into `/navigate?to=<locationId>`.
- All colors via existing semantic tokens.

### Out of scope
- Map rendering / floor plans
- Realtime crowd-sourced edges
- Multi-floor lift logic beyond a single edge per stop