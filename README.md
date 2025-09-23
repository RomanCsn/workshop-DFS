This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Follow the steps below to set up and run the project locally.

## When you pull the project

- Update your local branch:
  - `git pull --rebase origin main`
- Install dependencies:
  - `npm ci` (or `npm install` if needed)
- Start local services (if used):
  - `docker compose up -d` (PostgreSQL via `docker-compose.yaml`)
- Update the database (Prisma):
  - Dev: `npx prisma migrate dev`
  - CI/Deploy: `npx prisma migrate deploy`
  - Regenerate client: `npx prisma generate`
- Start the app:
  - `npm run dev`

Open [http://localhost:3000](http://localhost:3000) to see the app.

You can start editing by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Postgres Config

We keep the database files in the `postgres/` folder. When you run `docker compose up db`, Docker mounts the files in this folder into the Postgres container. The files do the following:

- `postgres/conf/` holds the base Postgres configuration copied into `/etc/postgresql/15/main/` inside the container.
- `postgres/init_hook.sql` and `postgres/end_hook.sql` run on first start to set up the `erp` user and grant it access to the default database.
- `postgres/pgmemento.sql` creates the `audit` schema and enables the `pgmemento` extension if it is installed in the image. If the extension is missing the script prints a notice and Postgres keeps running.

This setup lets you watch every change in the database once the pgMemento extension is available.

## Better Auth

Authentication lives in `src/lib/auth.ts`. The file creates a Better Auth instance that uses Prisma and the Postgres database. When you change the config, run:

```bash
npx @better-auth/cli generate --config ./src/lib/auth.ts --yes
npx prisma generate
```

The first command updates `prisma/schema.prisma` with any new tables Better Auth needs, and the second command refreshes the generated Prisma client in `src/generated/prisma`. Read more in the Better Auth docs: [better-auth.com/docs/introduction](https://www.better-auth.com/docs/introduction).

## Github Organization

We follow a simple workflow when we ship new features:

- Create a branch for every change. Use the format `feat/<short-name>` for features and `fix/<short-name>` for bug fixes.
- Push your branch and open a pull request against `main`. Add a short summary of the change and mention anyone who should review it.
- Once the pull request is approved, squash-merge it into `main`. Delete the branch after merge to keep the repo tidy.

This keeps our history clean and makes it easy for everyone to track what is happening.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
