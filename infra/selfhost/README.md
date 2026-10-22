# SAR portable infrastructure reference

The current applications use managed Vercel and Supabase. These Dockerfiles define a migration path to SAR- or Possent-controlled compute **without** pretending that a PostgreSQL container alone replaces Supabase Auth, RLS, Storage, Realtime and Edge Functions.

## Scope
- DealScope: separate external application, its own subscriber identity and future database, no cross-tenant data sharing.
- SAR ResourceOS: separate internal application, authenticated employee/operator roles, capital and transaction authority.
- SAR corporate website is a **separate repository** and remains corporate-only.
- Shared domain code is compiled into each application. No business core is tied to a particular cloud SDK.
- No GitHub Actions. Build and release using a controlled runner/CLI and explicit promotion approval.

## Prepare a local isolated preview
1. Provide adequate disk/memory and a trusted container registry.
2. Create a local `resourceos.env` from the example, injecting verified SAR-only credentials from an approved secret manager.
3. Run `docker compose -f infra/selfhost/compose.yaml build` from the repository root.
4. Run `docker compose -f infra/selfhost/compose.yaml up -d` and validate routes, identity, database errors and audit events.
5. Do not expose the containers on the Internet without TLS termination, secret rotation, log retention, backups, network segmentation, vulnerability scanning and penetration checks.
6. Do not use this reference as production deployment approval. DealScope subscriptions and Exchange remain gated.

## Future migration out of Supabase
- Verify exact original project refs, legal data ownership and credentials.
- Freeze a PostgreSQL schema / RLS / auth / storage baseline; export database with tested backup, not just a SQL schema.
- Implement and test provider-independent authentication with stable user IDs, tenant separation and role permissions.
- Move objects with checksums and legal retention, then migrate signed URLs and policies.
- Replace Realtime, scheduled functions, queues and outbound mail with documented adapters and observable workers.
- Reconcile control totals, foreign keys, ledger balances, business events and approval decisions.
- Run dual-read or staged shadow-mode verification; prohibit dual writes unless idempotent and proven.
- Perform controlled cutover with rollback and approved recovery point/time objectives.
- Separate production and staging environments; forbid source data or payment keys in logs.
