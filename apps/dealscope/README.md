# DealScope — separate external application

This is the isolated DealScope application added to the original SAR ResourceOS migration branch. Its source remains in `apps/dealscope`; SAR's existing internal ResourceOS app remains at the repository root.

## Run / deploy
```sh
cd apps/dealscope
npm install
npm run typecheck
npm run build
npm run dev
```
Vercel project root directory: `apps/dealscope`. Publish only to a **preview** deployment before production acceptance. Shared business logic is imported from `../../packages/commodity-core`.

## Safety
- All deal inputs are provided by the user; there is no market-feed claim and no trade execution.
- The Deal Run calculator is client-local only; it does not store private data or transact.
- Exchange and subscription activation are deliberately unavailable until a dedicated DealScope backend, verified tenant identity, billing and consent controls are live.
- No access to SAR ResourceOS data, finance or internal approvals.
- No GitHub Actions.
- Future hosting uses portable Next.js standalone output, separately provisioned PostgreSQL/auth/storage/queue adapters.

## Separation regression
The original root Vercel project must retain its root build settings and root `app/` directory. This child application is not to be treated as a ResourceOS page. Do not point either application at the other's database.
