# FE flow notes — jobs & transport handoff

## Transport-only handoff (`jobs.transport.handoff`)

### Required accesses (road / sea / air — same pack)

Grant these on the transporter role. **Do not** grant air/sea/road ops job-type sees or `menu_jobs_*` for handoff-only users.

| Key | Why |
|-----|-----|
| `jobs.transport.handoff` (alias `transport.handoff`) | Assignee queue + handoff-limited UI |
| `jobs.view` | Open assigned job detail (any `job_type`) |
| `jobs.update` | Containers / trucker / port token / status / docs |
| Tenant module `transport` (and/or `operations`) | FE route gate for `/jobs/*` |

**Not required** for Pass-to-Transport handoff: `operations_air_export.see`, `operations_sea_*.see`, `operations_road_freight.see`, or `menu_jobs_air_export` / sea / road. Parent job type (AIR_EXPORT, SEA_*, ROAD_FREIGHT) does not change the permission pack — BE opens by `ops_user_id = me`.

If Open job handoff returns `You do not have access to AIR_EXPORT jobs` (or SEA/ROAD), the role is missing the handoff pack above **or** BE is still gating GET `/jobs/:id` by job_type instead of assignee.

### Visibility

| Surface | Rule |
|--------|------|
| Job list / dashboard counts | Assignee only — `Job.ops_user_id = current user`. Not the whole TRANSPORT org-department queue, and not ops `job_type` grants. |
| Job detail | `view_mode: handoff_limited` (forced for handoff-only assignees). Single **Handoff** tab. |
| Open by URL | Assignee (or admin). Handoff-only users cannot open a Transport-dept job assigned to someone else. FE deep-links `/jobs/:id?tab=handoff` from Transport requests. |

### What they can do (handoff tab)

- View / update containers (incl. container status)
- Assign trucker (land / road / transport-request)
- Generate / confirm port token
- Upload documents
- Change status + create custom status (`POST /jobs/status-catalog` with `job_id` / `apply_to_job_id`)

### What they cannot do

- Costing / sale / cost / finance report
- Pass the job again / close the job
- Edit show_all / header / booking / EDI
- Normal ops tabs (organization, costing, department, …)

### Pass-to-Transport

Ops / admin still passes with required **user** (branch + assignee). That sets `ops_user_id` so the assignee’s queue populates.

### FE helpers

- `isTransportHandoffOnly(user)` — `jobs.transport.handoff` and not sees-all and no ops job-type see grants
- `isHandoffLimitedJob(job, user)` — forces limited UI for handoff-only assignees; admins stay full UI
- List scope `assigneeOnly` + `ops_user_id=me` via `staffAlignedJobListParams` / `useVisibleJobListScope`

### Tenant Admin / Branch Manager

Sees-all roles keep the **full** job UI even when a job is in Transport. They are not put into handoff-limited mode.
