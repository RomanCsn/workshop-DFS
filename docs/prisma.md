[⬅ Retour à l’introduction](./introduction.md)

### Prisma & Migrations

> Comment générer le client et gérer/appliquer les migrations Prisma.

Prisma est configuré via `prisma/schema.prisma` et les migrations sont dans `prisma/migrations/`.

Commandes courantes:

```bash
# Générer le client Prisma (après modification du schéma)
npx prisma generate

# Créer une nouvelle migration à partir du schéma
npx prisma migrate dev --name <nom-de-migration>

# Appliquer les migrations (CI/Prod ou DB existante)
npx prisma migrate deploy
```

Notes:
- Assurez-vous que la base Postgres est démarrée avant d’exécuter des commandes Prisma.
- Vérifiez la variable de connexion (ex: `DATABASE_URL`) dans votre environnement.

