# SAR ResourceOS Golden Path Proof

This is a beginner-deployable Next.js baseline proving one full parcel lifecycle from:
document → dispatch → movement → delivery → reconciliation → finance

## Included
- seeded demo parcel
- golden-path proof page
- API route returning parcel JSON
- docs explaining the proof boundary

## Run locally
1. Install dependencies:
   npm install

2. Start dev server:
   npm run dev

3. Open:
   - http://localhost:3000/
   - http://localhost:3000/golden-path
   - http://localhost:3000/api/demo/parcel

## Deploy on Vercel
1. Push to GitHub
2. Import into Vercel
3. Deploy with default Next.js settings

## Next build step
After this golden path, implement exception-path controls:
- missing sample
- missing seal
- truck mismatch
- variance dispute
- short delivery
- finance hold