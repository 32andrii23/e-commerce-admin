# E-commerce Admin and API

A multi-tenant commerce dashboard built with Next.js, TypeScript, Prisma, Clerk, Cloudinary, and Stripe. Store owners manage catalog data and orders in the dashboard, while the public API supplies a separate storefront.

## Architecture

- `app/(dashboard)/[storeId]` contains owner-only management screens and analytics.
- `app/api/[storeId]` exposes catalog reads, authenticated catalog mutations, and checkout creation for one store.
- `app/api/webhook` verifies Stripe signatures before marking orders paid and archiving purchased products.
- `prisma/schema.prisma` models stores, catalog resources, orders, and order items in PostgreSQL.
- Clerk authenticates owners; Prisma enforces persistence; Cloudinary hosts product media; Stripe hosts payment checkout.

The companion storefront should set `NEXT_PUBLIC_API_URL` to this app's `/api/<store-id>` endpoint. `FRONTEND_STORE_URL` may contain a comma-separated allowlist when more than one storefront origin is required.

## Security model

- Every dashboard route verifies that the current Clerk user owns the selected store.
- Detail mutations are scoped by both resource id and store id, preventing cross-tenant updates and deletes.
- Category billboard and product category/color/size references are checked against the same store before writes.
- Checkout accepts only unique UUID product ids, rejects archived or mixed-store products, and permits browser requests only from configured storefront origins.
- Stripe webhook payloads are read as raw text and verified with `STRIPE_WEBHOOK_SECRET` before any database mutation.

Never expose `CLERK_SECRET_KEY`, `DATABASE_URL`, `STRIPE_API_KEY`, or `STRIPE_WEBHOOK_SECRET` to the browser or commit real credentials.

## Local setup

Requirements: Node.js 22+, npm, and PostgreSQL.

```bash
cp .env.example .env
npm ci
npx prisma db push
npm run dev
```

Fill every value in `.env` first. Stripe webhooks must forward `checkout.session.completed` to `/api/webhook`; use the Stripe CLI or a configured Stripe endpoint during development. The dashboard defaults to `http://localhost:3000`.

## Validation

```bash
npm run lint
npm test
npm run typecheck
npm run build
npm audit
```

The test suite includes tenant-bound mutation, mixed-store checkout, request validation, and CORS regression coverage. GitHub Actions runs lint, tests, typechecking, and a production build for pushes and pull requests.

## License

[MIT](LICENSE)
