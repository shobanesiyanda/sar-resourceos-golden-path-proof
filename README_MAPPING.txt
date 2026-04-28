SAR ResourceOS corrected read-alignment pages

Upload/replace these files as follows:

finance_page.tsx        -> app/finance/page.tsx
analytics_page.tsx      -> app/analytics/page.tsx
operations_page.tsx     -> app/operations/page.tsx
documents_page.tsx      -> app/documents/page.tsx
parties_page.tsx        -> app/parties/page.tsx
route_builder_page.tsx  -> app/route-builder/page.tsx
approvals_page.tsx      -> app/approvals/page.tsx
admin_page.tsx          -> app/admin/page.tsx

Do not replace:
app/layout.tsx
app/page.tsx
app/login/page.tsx
components/EconomicsEditTools.tsx

Commit message:
Contain read-page display normalization

Fixes:
- intermediate_concentrate displays as Intermediate / Saleable Product
- missing finance/cost values display as Not captured instead of looking like valid R0 data
- read pages remain read-only
- stable auth/home/login/economics files are untouched
