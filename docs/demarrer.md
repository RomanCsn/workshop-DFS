[⬅ Retour à l’introduction](./introduction.md)

### Getting Started (développement)

> Setup minimal pour démarrer en local.

1) Créer le fichier d'environnement

```bash
cp .env.example .env
```

2) Démarrer Postgres (Docker)

```bash
docker compose up -d
```

3) Synchroniser la base (Prisma)

```bash
npx prisma migrate dev
npx prisma generate
```

4) Installer les dépendances

```bash
npm ci
```

5) Lancer le serveur de développement

```bash
npm run dev
```

