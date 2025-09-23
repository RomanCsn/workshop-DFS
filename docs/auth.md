[⬅ Retour à l’introduction](./introduction.md)

### Better Auth (authentification)

> Better Auth simplifie l’authentification utilisateur avec Prisma et Postgres dans Next.js.

La configuration principale se trouve dans `src/lib/auth.ts`. Better Auth utilise Prisma et Postgres.

Quand vous modifiez la configuration Better Auth, exécutez:

```bash
npx @better-auth/cli generate --config ./src/lib/auth.ts --yes
npx prisma generate
```

- La première commande met à jour `prisma/schema.prisma` avec les tables nécessaires.
- La seconde régénère le client Prisma.

Documentation: `https://better-auth.com/docs/introduction`.

