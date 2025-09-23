# API Lessons - Documentation

## Vue d'ensemble

L'API Lessons permet de gérer les leçons d'équitation dans l'application. Elle offre des opérations CRUD complètes pour créer, lire, mettre à jour et supprimer des leçons, avec des fonctionnalités avancées de filtrage et de recherche.

**Base URL :** `/api/lessons`

## Modèle de données

### Lesson

```typescript
{
  id: string;           // UUID généré automatiquement
  date: Date;           // Date et heure de la leçon
  desc: string;         // Description de la leçon (1-1000 caractères)
  status: "PENDING" | "IN_PROGRESS" | "FINISHED";  // Statut de la leçon (défaut: PENDING)
  monitorId: string;    // UUID - ID du moniteur
  customerId: string;   // UUID - ID du client
  horseId: string;      // UUID - ID du cheval
}
```

## Routes disponibles

### 1. GET /api/lessons
Récupère la liste des leçons avec filtrage avancé et pagination.

#### Paramètres de requête (optionnels)
- `take` (number) : Nombre d'éléments à récupérer (min: 1, max: 1000, défaut: 100)
- `skip` (number) : Nombre d'éléments à ignorer (min: 0, défaut: 0)
- `id` (string) : UUID d'une leçon spécifique
- `status` (string) : Filtre par statut ("PENDING", "IN_PROGRESS", "FINISHED")
- `customerId` (string) : UUID pour filtrer par client
- `monitorId` (string) : UUID pour filtrer par moniteur
- `startDate` (string) : Date de début (format ISO)
- `endDate` (string) : Date de fin (format ISO)

#### Réponse de succès (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "date": "2024-12-25T10:00:00.000Z",
      "desc": "Leçon de galop débutant",
      "status": "PENDING",
      "monitorId": "550e8400-e29b-41d4-a716-446655440001",
      "customerId": "550e8400-e29b-41d4-a716-446655440002",
      "horseId": "550e8400-e29b-41d4-a716-446655440003"
    }
  ]
}
```

#### Exemples de filtrage

**Par statut :**
```
GET /api/lessons?status=PENDING
```

**Par client :**
```
GET /api/lessons?customerId=550e8400-e29b-41d4-a716-446655440002
```

**Par plage de dates :**
```
GET /api/lessons?startDate=2024-12-01T00:00:00Z&endDate=2024-12-31T23:59:59Z
```

**Leçon spécifique :**
```
GET /api/lessons?id=550e8400-e29b-41d4-a716-446655440000
```

### 2. POST /api/lessons
Crée une nouvelle leçon.

#### Corps de la requête
```json
{
  "date": "2024-12-25T10:00:00.000Z",  // Requis
  "desc": "Leçon de galop débutant",   // Requis (1-1000 caractères)
  "status": "PENDING",                 // Optionnel, défaut: "PENDING"
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
    "date": "2024-12-25T10:00:00.000Z",
    "desc": "Leçon de galop débutant",
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
  "id": "550e8400-e29b-41d4-a716-446655440000",        // Requis
  "date": "2024-12-25T14:00:00.000Z",                  // Optionnel
  "desc": "Leçon de galop avancé",                     // Optionnel
  "status": "IN_PROGRESS",                             // Optionnel
  "monitorId": "550e8400-e29b-41d4-a716-446655440001", // Optionnel
  "customerId": "550e8400-e29b-41d4-a716-446655440002",// Optionnel
  "horseId": "550e8400-e29b-41d4-a716-446655440003"    // Optionnel
}
```

#### Réponse de succès (200)
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "date": "2024-12-25T14:00:00.000Z",
    "desc": "Leçon de galop avancé",
    "status": "IN_PROGRESS",
    "monitorId": "550e8400-e29b-41d4-a716-446655440001",
    "customerId": "550e8400-e29b-41d4-a716-446655440002",
    "horseId": "550e8400-e29b-41d4-a716-446655440003"
  }
}
```

### 4. PATCH /api/lessons
Met à jour uniquement le statut d'une leçon.

#### Corps de la requête
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",  // Requis
  "status": "FINISHED"                           // Requis
}
```

#### Réponse de succès (200)
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "date": "2024-12-25T14:00:00.000Z",
    "desc": "Leçon de galop avancé",
    "status": "FINISHED",
    "monitorId": "550e8400-e29b-41d4-a716-446655440001",
    "customerId": "550e8400-e29b-41d4-a716-446655440002",
    "horseId": "550e8400-e29b-41d4-a716-446655440003"
  },
  "message": "Lesson status updated to FINISHED"
}
```

### 5. DELETE /api/lessons
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
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "date": "2024-12-25T14:00:00.000Z",
    "desc": "Leçon de galop avancé",
    "status": "FINISHED",
    "monitorId": "550e8400-e29b-41d4-a716-446655440001",
    "customerId": "550e8400-e29b-41d4-a716-446655440002",
    "horseId": "550e8400-e29b-41d4-a716-446655440003"
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
    "date": {
      "_errors": ["date must be a valid date"]
    },
    "desc": {
      "_errors": ["Description is required"]
    }
  }
}
```

### Leçon non trouvée (404)
```json
{
  "success": false,
  "error": "Lesson not found"
}
```

### Erreurs serveur (500)
```json
{
  "success": false,
  "error": "Internal server error"
}
```

## Tests avec Postman

### Configuration de l'environnement
1. Créez un environnement Postman
2. Ajoutez la variable `base_url` avec la valeur : `http://localhost:3000`

### Collection de tests

#### 1. Récupérer toutes les leçons
```
GET {{base_url}}/api/lessons
```

#### 2. Récupérer les leçons d'un client
```
GET {{base_url}}/api/lessons?customerId=550e8400-e29b-41d4-a716-446655440002
```

#### 3. Filtrer par statut
```
GET {{base_url}}/api/lessons?status=PENDING&take=10
```

#### 4. Filtrer par plage de dates
```
GET {{base_url}}/api/lessons?startDate=2024-12-01T00:00:00Z&endDate=2024-12-31T23:59:59Z
```

#### 5. Créer une nouvelle leçon
```
POST {{base_url}}/api/lessons
Content-Type: application/json

{
  "date": "2024-12-25T10:00:00.000Z",
  "desc": "Leçon de galop débutant",
  "status": "PENDING",
  "monitorId": "550e8400-e29b-41d4-a716-446655440001",
  "customerId": "550e8400-e29b-41d4-a716-446655440002",
  "horseId": "550e8400-e29b-41d4-a716-446655440003"
}
```

#### 6. Mettre à jour une leçon
```
PUT {{base_url}}/api/lessons
Content-Type: application/json

{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "desc": "Leçon de galop avancé",
  "status": "IN_PROGRESS"
}
```

#### 7. Mettre à jour uniquement le statut
```
PATCH {{base_url}}/api/lessons
Content-Type: application/json

{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "FINISHED"
}
```

#### 8. Supprimer une leçon
```
DELETE {{base_url}}/api/lessons?id=550e8400-e29b-41d4-a716-446655440000
```

### Scénarios de test

#### Test de validation
1. **Date invalide :**
   ```json
   {
     "date": "invalid-date",
     "desc": "Test leçon",
     "monitorId": "550e8400-e29b-41d4-a716-446655440001",
     "customerId": "550e8400-e29b-41d4-a716-446655440002",
     "horseId": "550e8400-e29b-41d4-a716-446655440003"
   }
   ```
   **Résultat attendu :** 400 avec message d'erreur de validation

2. **Description trop longue :**
   ```json
   {
     "date": "2024-12-25T10:00:00.000Z",
     "desc": "A".repeat(1001),
     "monitorId": "550e8400-e29b-41d4-a716-446655440001",
     "customerId": "550e8400-e29b-41d4-a716-446655440002",
     "horseId": "550e8400-e29b-41d4-a716-446655440003"
   }
   ```
   **Résultat attendu :** 400 avec message "Description must be less than 1000 characters"

3. **UUID invalide :**
   ```json
   {
     "date": "2024-12-25T10:00:00.000Z",
     "desc": "Test leçon",
     "monitorId": "invalid-uuid",
     "customerId": "550e8400-e29b-41d4-a716-446655440002",
     "horseId": "550e8400-e29b-41d4-a716-446655440003"
   }
   ```
   **Résultat attendu :** 400 avec message "monitorId must be a valid UUID"

#### Test de filtrage avancé
```
GET {{base_url}}/api/lessons?status=PENDING&customerId=550e8400-e29b-41d4-a716-446655440002&take=5
```

#### Test avec paramètres invalides
```
GET {{base_url}}/api/lessons?take=0
GET {{base_url}}/api/lessons?take=1001
GET {{base_url}}/api/lessons?startDate=2024-12-31&endDate=2024-12-01
```

### Scripts de test Postman

#### Script de validation de réponse POST
```javascript
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Response has success and data", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.have.property('id');
    pm.expect(jsonData.data).to.have.property('date');
    pm.expect(jsonData.data).to.have.property('desc');
    pm.expect(jsonData.data).to.have.property('status');
});

// Sauvegarder l'ID pour les tests suivants
pm.test("Save lesson ID", function () {
    var jsonData = pm.response.json();
    pm.environment.set("lesson_id", jsonData.data.id);
});
```

#### Script de validation de réponse GET
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response is an array of lessons", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.be.an('array');
});

pm.test("Each lesson has required fields", function () {
    var jsonData = pm.response.json();
    if (jsonData.data.length > 0) {
        jsonData.data.forEach(lesson => {
            pm.expect(lesson).to.have.property('id');
            pm.expect(lesson).to.have.property('date');
            pm.expect(lesson).to.have.property('desc');
            pm.expect(lesson).to.have.property('status');
            pm.expect(lesson.status).to.be.oneOf(['PENDING', 'IN_PROGRESS', 'FINISHED']);
        });
    }
});
```

## Notes importantes

1. **UUIDs :** Tous les IDs doivent être des UUIDs valides au format v4
2. **Dates :** Les dates doivent être au format ISO 8601
3. **Validation :** Toutes les entrées sont validées avec Zod avant traitement
4. **Pagination :** La pagination est optimisée avec des limites (max 1000 éléments)
5. **Filtrage :** Possibilité de combiner plusieurs filtres pour des recherches précises
6. **Statuts :** Les statuts valides sont : PENDING, IN_PROGRESS, FINISHED
7. **Relations :** Les leçons sont liées aux modèles User (monitor et customer) et Horse
8. **Tri :** Les résultats peuvent être triés selon différents critères
