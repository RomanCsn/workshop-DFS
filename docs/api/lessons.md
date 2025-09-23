# API Lessons - Documentation

## Vue d'ensemble

L'API Lessons permet de gérer les leçons planifiées dans l'application. Elle offre des opérations CRUD pour créer, lire, mettre à jour et supprimer des leçons.

**Base URL :** `/api/lessons`

## Modèle de données

### Lesson

```typescript
{
  id: string;           // UUID généré automatiquement
  date: string;         // ISO 8601
  desc: string;         // Description
  status: "PENDING" | "IN_PROGRESS" | "FINISHED"; // Défaut: PENDING
  monitorId: string;    // UUID - Moniteur
  customerId: string;   // UUID - Client
  horseId: string;      // UUID - Cheval
}
```

## Routes disponibles

### 1. GET /api/lessons
Récupère la liste de toutes les leçons avec pagination.

#### Paramètres de requête (optionnels)
- `take` (number) : Nombre d'éléments à récupérer (min: 1, max: 1000, défaut: 100)
- `skip` (number) : Nombre d'éléments à ignorer (min: 0, défaut: 0)

#### Réponse de succès (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "date": "2025-09-23T10:00:00.000Z",
      "desc": "Séance d'initiation",
      "status": "PENDING",
      "monitorId": "550e8400-e29b-41d4-a716-446655440001",
      "customerId": "550e8400-e29b-41d4-a716-446655440002",
      "horseId": "550e8400-e29b-41d4-a716-446655440003"
    }
  ]
}
```

### 2. POST /api/lessons
Crée une nouvelle leçon.

#### Corps de la requête
```json
{
  "date": "2025-09-23T10:00:00.000Z",       // Requis (ISO)
  "desc": "Séance d'initiation",            // Requis
  "status": "PENDING",                      // Optionnel (défaut: PENDING)
  "monitorId": "550e8400-e29b-41d4-a716-446655440001",  // Requis
  "customerId": "550e8400-e29b-41d4-a716-446655440002", // Requis
  "horseId": "550e8400-e29b-41d4-a716-446655440003"     // Requis
}
```

#### Réponse de succès (201)
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "date": "2025-09-23T10:00:00.000Z",
    "desc": "Séance d'initiation",
    "status": "PENDING",
    "monitorId": "550e8400-e29b-41d4-a716-446655440001",
    "customerId": "550e8400-e29b-41d4-a716-446655440002",
    "horseId": "550e8400-e29b-41d4-a716-446655440003"
  }
}
```

### 3. PUT /api/lessons
Met à jour une leçon existante.

#### Corps de la requête
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000", // Requis
  "date": "2025-09-23T11:00:00.000Z",           // Optionnel
  "desc": "Séance confirmée",                    // Optionnel
  "status": "IN_PROGRESS",                      // Optionnel
  "monitorId": "550e8400-e29b-41d4-a716-446655440004",  // Optionnel
  "customerId": "550e8400-e29b-41d4-a716-446655440005", // Optionnel
  "horseId": "550e8400-e29b-41d4-a716-446655440006"     // Optionnel
}
```

#### Réponse de succès (200)
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "date": "2025-09-23T11:00:00.000Z",
    "desc": "Séance confirmée",
    "status": "IN_PROGRESS",
    "monitorId": "550e8400-e29b-41d4-a716-446655440004",
    "customerId": "550e8400-e29b-41d4-a716-446655440005",
    "horseId": "550e8400-e29b-41d4-a716-446655440006"
  }
}
```

### 4. DELETE /api/lessons
Supprime une leçon.

#### Paramètres de requête
- `id` (string) : UUID de la leçon à supprimer (requis)

#### Exemple d'URL
```
DELETE /api/lessons?id=550e8400-e29b-41d4-a716-446655440000
```

#### Réponse de succès (200)
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000"
  },
  "message": "Lesson deleted successfully"
}
```

## Gestion des erreurs

### Erreurs de validation (400)
```json
{
  "success": false,
  "error": "Invalid data",
  "details": {
    "monitorId": { "_errors": ["monitorId must be a valid UUID"] }
  }
}
```

### Erreurs serveur (500)
```json
{
  "success": false,
  "error": "Internal server error"
}
```

## Tests rapides avec Postman

- **GET** `{{base_url}}/api/lessons`
- **POST** `{{base_url}}/api/lessons`
- **PUT** `{{base_url}}/api/lessons`
- **DELETE** `{{base_url}}/api/lessons?id={{lesson_id}}`

> Note: Tous les IDs doivent être des UUID v4 valides. La validation d'entrée est faite avec Zod, la persistance avec Prisma.
