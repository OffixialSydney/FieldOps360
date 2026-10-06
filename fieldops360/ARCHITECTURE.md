# FieldOps 360: architecture

Next.js (app router) on Vercel, Supabase for the PostgreSQL database, authentication and file storage.
There is no separate server. The browser talks to Supabase, and **Postgres row level security (RLS) enforces who can see and change what**.
The only server code is `app/api/assistant/route.js`, which keeps the AI key secret.

## How the database maps to the suggested entities

| Suggested entity | Table here |
|---|---|
| organizations | `companies` (with `services`, `plan`, `status`) |
| users, roles | `profiles` (id links to Supabase `auth.users`, `role`, `company_id`) |
| customers, technicians | rows in `profiles` by role. Technician skills and availability are columns |
| service_requests and jobs | one table, `requests`. A request is open (no company) until a manager takes it |
| job_assignments | `requests.technician_id`, with every change in `audit_log` |
| job_status_history | `job_status_history` (append only) |
| job_notes | `requests.tech_notes` and `diagnoses` |
| job_photos | `attachments` (before, after, other) and the private `job-files` bucket |
| invoices, invoice_items | `invoices` (lines kept in the `items` JSON column) |
| payments | `payments` (every payment waits for the accountant) |
| inventory, inventory_items | `items` |
| inventory_transactions | `inventory_transactions` (the ledger; stock only changes through `inventory_move`) |
| assets, warranties | `assets` (serial, install date, warranty dates) |
| warranty_claims | `requests.warranty_claim`, set by the database |
| support_tickets | `tickets` |
| notifications | `notifications` |
| reviews | `ratings` (1 to 10 with feedback) |
| locations | `technician_locations` |
| audit_logs | `audit_log` (who, what, to what, when) |
| extra | `wallet_transactions`, `extra_charges`, `job_materials`, `diagnoses`, `addresses` |

Why `profiles` instead of separate customers and technicians tables: one account system keeps login, roles and company isolation simple.

## Security model

- **Organization isolation:** a restrictive RLS policy on every table. Users only reach rows of their own company, except a customer's own records and open requests.
- **Roles:** policies per role. Customers see their own data, technicians see assigned jobs, managers run their company, accountants see finance, and super admin can view but not change company data.
- **Sensitive actions run in database functions** (`claim_request`, `make_payment`, `review_payment`, `decide_extra`, `inventory_move`, wallet functions). They check the caller's role and company before changing anything.
- **Uploads:** photos, videos and PDFs only, 15 MB maximum, enforced by the storage bucket.
- **Secrets:** only the public Supabase URL and anon key reach the browser. The AI key is a server-side variable.
- **Other:** security headers in `next.config.js`, rate limiting on the AI route, audit log of important changes.

## Poor network support

Technicians can open jobs they already loaded, write notes and record status changes while offline.
Those changes are stored on the device (`lib/offline.js`) and sent in order when the connection returns.
Completing a job and uploading photos need a connection.

## Known limitations

- The code is JavaScript, not TypeScript.
- Payments are simulated (test mode). Paystack is not connected.
- Maps open in Google Maps. There is no map inside the app.
- Documents are printed or saved as PDF from the browser.
- Offline mode queues status changes and notes only. It is not a full offline database.
- The offline queue keeps changes in browser storage, so clearing browser data removes unsent changes.
- Rate limiting for the AI route is per server instance.
- The seed people cannot log in. Demo logins are created with `supabase/demo_accounts.sql`.

## Demo story

1. Customer (customer@fieldops.demo): request a "Solar inverter repair".
2. Manager (manager@fieldops.demo): open the request, check the recommended technicians, take the job and assign one.
3. Technician (technician@fieldops.demo): accept, then on the way, arrived and diagnosing. Add a before photo, save the diagnosis, add materials and complete the job with the customer's signature.
4. Manager: see the job completed, the inventory ledger reduced and the invoice generated.
5. Customer: open the invoice, pay it, then download the receipt after the accountant confirms.
6. Accountant (accountant@fieldops.demo): confirm the payment.
7. Manager: check analytics, technician performance and the activity log.
