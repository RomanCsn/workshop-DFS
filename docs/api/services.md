# API Services - Documentation

## Vue d'ensemble

L'API Services permet de gérer les services exécutés (PerformedService) dans l'application. Elle offre des opérations CRUD complètes pour créer, lire, mettre à jour et supprimer des services.

**Base URL :** `/api/services`

## Modèle de données

### PerformedService

```typescript
{
  id: string; // UUID généré automatiquement
  serviceType: "CARE" | "LESSON"; // Type de service (défaut: LESSON)
  billingId: string; // UUID - Référence vers la facture
  userId: string; // UUID - ID de l'utilisateur bénéficiaire
  serviceId: string; // UUID - ID du service/leçon
  amount: number; // Montant (défaut: 0, minimum: 0)
}
```

## Routes disponibles

### 1. GET /api/services

Récupère la liste de tous les services exécutés avec pagination.

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
      "serviceType": "LESSON",
      "billingId": "550e8400-e29b-41d4-a716-446655440001",
      "userId": "550e8400-e29b-41d4-a716-446655440002",
      "serviceId": "550e8400-e29b-41d4-a716-446655440003",
      "amount": 50.0
    }
  ]
}
```

### 2. POST /api/services

Crée un nouveau service exécuté.

#### Corps de la requête

```json
{
  "serviceType": "LESSON", // Optionnel, défaut: "LESSON"
  "billingId": "550e8400-e29b-41d4-a716-446655440001", // Requis
  "userId": "550e8400-e29b-41d4-a716-446655440002", // Requis
  "serviceId": "550e8400-e29b-41d4-a716-446655440003", // Requis
  "amount": 50.0 // Optionnel, défaut: 0
}
```

#### Réponse de succès (201)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "serviceType": "LESSON",
    "billingId": "550e8400-e29b-41d4-a716-446655440001",
    "userId": "550e8400-e29b-41d4-a716-446655440002",
    "serviceId": "550e8400-e29b-41d4-a716-446655440003",
    "amount": 50.0
  }
}
```

### 3. PUT /api/services

Met à jour un service exécuté existant.

#### Corps de la requête

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000", // Requis
  "serviceType": "CARE", // Optionnel
  "billingId": "550e8400-e29b-41d4-a716-446655440001", // Optionnel
  "userId": "550e8400-e29b-41d4-a716-446655440002", // Optionnel
  "serviceId": "550e8400-e29b-41d4-a716-446655440003", // Optionnel
  "amount": 75.0 // Optionnel
}
```

#### Réponse de succès (200)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "serviceType": "CARE",
    "billingId": "550e8400-e29b-41d4-a716-446655440001",
    "userId": "550e8400-e29b-41d4-a716-446655440002",
    "serviceId": "550e8400-e29b-41d4-a716-446655440003",
    "amount": 75.0
  }
}
```

### 4. DELETE /api/services

Supprime un service exécuté.

#### Paramètres de requête

- `id` (string) : UUID du service à supprimer (requis)

#### Exemple d'URL

```
DELETE /api/services?id=550e8400-e29b-41d4-a716-446655440000
```

#### Réponse de succès (200)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "serviceType": "LESSON",
    "billingId": "550e8400-e29b-41d4-a716-446655440001",
    "userId": "550e8400-e29b-41d4-a716-446655440002",
    "serviceId": "550e8400-e29b-41d4-a716-446655440003",
    "amount": 50.0
  },
  "message": "Service deleted successfully"
}
```

## Gestion des erreurs

### Erreurs de validation (400)

```json
{
  "success": false,
  "error": "Invalid data",
  "details": {
    "billingId": {
      "_errors": ["billingId must be a valid UUID"]
    }
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

## Tests avec Postman

### Configuration de l'environnement

1. Créez un environnement Postman
2. Ajoutez la variable `base_url` avec la valeur : `http://localhost:3000`

### Collection de tests

#### 1. Récupérer tous les services

```
GET {{base_url}}/api/services
```

**Tests optionnels avec pagination :**

```
GET {{base_url}}/api/services?take=10&skip=0
```

#### 2. Créer un nouveau service

```
POST {{base_url}}/api/services
Content-Type: application/json

{
  "serviceType": "LESSON",
  "billingId": "550e8400-e29b-41d4-a716-446655440001",
  "userId": "550e8400-e29b-41d4-a716-446655440002",
  "serviceId": "550e8400-e29b-41d4-a716-446655440003",
  "amount": 50.0
}
```

#### 3. Mettre à jour un service

```
PUT {{base_url}}/api/services
Content-Type: application/json

{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "serviceType": "CARE",
  "amount": 75.0
}
```

#### 4. Supprimer un service

```
DELETE {{base_url}}/api/services?id=550e8400-e29b-41d4-a716-446655440000
```

### Scénarios de test

#### Test de validation

1. **UUID invalide :**

   ```json
   {
     "billingId": "invalid-uuid",
     "userId": "550e8400-e29b-41d4-a716-446655440002",
     "serviceId": "550e8400-e29b-41d4-a716-446655440003"
   }
   ```

   **Résultat attendu :** 400 avec message d'erreur de validation

2. **Montant négatif :**

   ```json
   {
     "billingId": "550e8400-e29b-41d4-a716-446655440001",
     "userId": "550e8400-e29b-41d4-a716-446655440002",
     "serviceId": "550e8400-e29b-41d4-a716-446655440003",
     "amount": -10
   }
   ```

   **Résultat attendu :** 400 avec message "Amount must be positive"

3. **Type de service invalide :**
   ```json
   {
     "serviceType": "INVALID_TYPE",
     "billingId": "550e8400-e29b-41d4-a716-446655440001",
     "userId": "550e8400-e29b-41d4-a716-446655440002",
     "serviceId": "550e8400-e29b-41d4-a716-446655440003"
   }
   ```
   **Résultat attendu :** 400 avec erreur de validation

#### Test de pagination

```
GET {{base_url}}/api/services?take=5&skip=10
```

#### Test avec paramètres invalides

```
GET {{base_url}}/api/services?take=0
GET {{base_url}}/api/services?take=1001
GET {{base_url}}/api/services?skip=-1
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
  pm.expect(jsonData.data).to.have.property("id");
});

// Sauvegarder l'ID pour les tests suivants
pm.test("Save service ID", function () {
  var jsonData = pm.response.json();
  pm.environment.set("service_id", jsonData.data.id);
});
```

#### Script de validation de réponse GET

```javascript
pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Response is an array of services", function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.success).to.be.true;
  pm.expect(jsonData.data).to.be.an("array");
});
```

## Notes importantes

1. **UUIDs :** Tous les IDs doivent être des UUIDs valides au format v4
2. **Validation :** Toutes les entrées sont validées avec Zod avant traitement
3. **Pagination :** La pagination est optimisée avec des limites (max 1000 éléments)
4. **Tri :** Les résultats sont triés par ID décroissant (plus récents en premier)
5. **Relations :** Les services sont liés aux modèles Billing, User et Lesson via les clés étrangères
