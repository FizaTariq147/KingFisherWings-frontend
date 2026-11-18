# FE flow notes — jobs & transport handoff

## Transport-only handoff (`jobs.transport.handoff`)

Grant **`jobs.transport.handoff`** (+ `jobs.view` / `jobs.update`) **without** `operations_*.see` / sea-fcl matrix grants. Ops job-type sees flood the list; handoff-only users must not receive them.

### Visibility

| Surface | Rule |
|--------|------|
| Job list / dashboard counts | Assignee only — `Job.ops_user_id = current user`. Not the whole TRANSPORT org-department queue, and not ops `job_type` grants. |
| Job detail | `view_mode: handoff_limited` (forced for handoff-only assignees). Single **Handoff** tab. |
| Open by URL | Assignee (or admin). Handoff-only users cannot open a Transport-dept job assigned to someone else. |

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
