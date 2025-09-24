# API Billing - Documentation

## Vue d'ensemble

L'API Billing permet de gérer les factures dans l'application. Elle offre des opérations CRUD complètes pour créer, lire, mettre à jour et supprimer des factures, avec la possibilité d'inclure les services associés.

**Base URL :** `/api/billing`

## Modèle de données

### Billing

```typescript
{
  id: string;      // UUID généré automatiquement
  date: Date;      // Date de la facture
  services?: PerformedService[];  // Services associés (optionnel selon le query)
}
```

### Relation avec PerformedService

```typescript
{
  id: string; // UUID généré automatiquement
  serviceType: "CARE" | "LESSON"; // Type de service
  billingId: string; // UUID - Référence vers cette facture
  userId: string; // UUID - ID de l'utilisateur bénéficiaire
  serviceId: string; // UUID - ID du service/leçon
  amount: number; // Montant du service
}
```

## Routes disponibles

### 1. GET /api/billing

Récupère la liste des factures avec filtrage et pagination.

#### Paramètres de requête (optionnels)

- `take` (number) : Nombre d'éléments à récupérer (min: 1, max: 1000, défaut: 100)
- `skip` (number) : Nombre d'éléments à ignorer (min: 0, défaut: 0)
- `id` (string) : UUID d'une facture spécifique
- `includeServices` (boolean) : Inclure les services associés (défaut: false)
- `startDate` (string) : Date de début pour le filtrage (format ISO)
- `endDate` (string) : Date de fin pour le filtrage (format ISO)

#### Réponse de succès (200)

**Sans services inclus :**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "date": "2024-12-20T00:00:00.000Z"
    }
  ]
}
```

**Avec services inclus :**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "date": "2024-12-20T00:00:00.000Z",
      "services": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440001",
          "serviceType": "LESSON",
          "billingId": "550e8400-e29b-41d4-a716-446655440000",
          "userId": "550e8400-e29b-41d4-a716-446655440002",
          "serviceId": "550e8400-e29b-41d4-a716-446655440003",
          "amount": 50.0
        }
      ]
    }
  ]
}
```

#### Exemples d'utilisation

**Récupérer toutes les factures :**

```
GET /api/billing
```

**Récupérer une facture spécifique avec services :**

```
GET /api/billing?id=550e8400-e29b-41d4-a716-446655440000&includeServices=true
```

**Filtrer par plage de dates :**

```
GET /api/billing?startDate=2024-12-01T00:00:00Z&endDate=2024-12-31T23:59:59Z
```

**Avec pagination :**

```
GET /api/billing?take=10&skip=20
```

### 2. POST /api/billing

Crée une nouvelle facture.

#### Corps de la requête

```json
{
  "date": "2024-12-20T00:00:00.000Z" // Requis
}
```

#### Réponse de succès (201)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "date": "2024-12-20T00:00:00.000Z"
  }
}
```

### 3. PUT /api/billing

Met à jour une facture existante.

#### Corps de la requête

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000", // Requis
  "date": "2024-12-21T00:00:00.000Z" // Optionnel
}
```

#### Réponse de succès (200)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "date": "2024-12-21T00:00:00.000Z"
  }
}
```

### 4. DELETE /api/billing

Supprime une facture.

#### Paramètres de requête

- `id` (string) : UUID de la facture à supprimer (requis)

#### Exemple d'URL

```
DELETE /api/billing?id=550e8400-e29b-41d4-a716-446655440000
```

#### Réponse de succès (200)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "date": "2024-12-21T00:00:00.000Z"
  },
  "message": "Billing deleted successfully"
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
    }
  }
}
```

### Date de début après date de fin (400)

```json
{
  "success": false,
  "error": "startDate must be before endDate"
}
```

### Facture non trouvée (404)

```json
{
  "success": false,
  "error": "Billing not found"
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

#### 1. Récupérer toutes les factures

```
GET {{base_url}}/api/billing
```

#### 2. Récupérer une facture avec services

```
GET {{base_url}}/api/billing?id=550e8400-e29b-41d4-a716-446655440000&includeServices=true
```

#### 3. Filtrer par plage de dates

```
GET {{base_url}}/api/billing?startDate=2024-12-01T00:00:00Z&endDate=2024-12-31T23:59:59Z
```

#### 4. Pagination

```
GET {{base_url}}/api/billing?take=5&skip=0
```

#### 5. Créer une nouvelle facture

```
POST {{base_url}}/api/billing
Content-Type: application/json

{
  "date": "2024-12-20T00:00:00.000Z"
}
```

#### 6. Mettre à jour une facture

```
PUT {{base_url}}/api/billing
Content-Type: application/json

{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "date": "2024-12-21T00:00:00.000Z"
}
```

#### 7. Supprimer une facture

```
DELETE {{base_url}}/api/billing?id=550e8400-e29b-41d4-a716-446655440000
```

### Scénarios de test

#### Test de validation

1. **Date invalide :**

   ```json
   {
     "date": "invalid-date-format"
   }
   ```

   **Résultat attendu :** 400 avec message "date must be a valid date"

2. **ID manquant pour UPDATE :**

   ```json
   {
     "date": "2024-12-20T00:00:00.000Z"
   }
   ```

   **Résultat attendu :** 400 avec message d'erreur de validation

3. **UUID invalide :**
   ```json
   {
     "id": "invalid-uuid",
     "date": "2024-12-20T00:00:00.000Z"
   }
   ```
   **Résultat attendu :** 400 avec message "id must be a valid UUID"

#### Test de plage de dates invalide

```
GET {{base_url}}/api/billing?startDate=2024-12-31T00:00:00Z&endDate=2024-12-01T00:00:00Z
```

**Résultat attendu :** 400 avec message "startDate must be before endDate"

#### Test de pagination invalide

```
GET {{base_url}}/api/billing?take=0
GET {{base_url}}/api/billing?take=1001
GET {{base_url}}/api/billing?skip=-1
```

**Résultat attendu :** 400 avec messages d'erreur appropriés

#### Test avec facture inexistante

```
GET {{base_url}}/api/billing?id=00000000-0000-0000-0000-000000000000
```

**Résultat attendu :** 404 avec message "Billing not found"

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
  pm.expect(jsonData.data).to.have.property("date");
});

pm.test("Date format is correct", function () {
  var jsonData = pm.response.json();
  var date = new Date(jsonData.data.date);
  pm.expect(date).to.be.a("date");
});

// Sauvegarder l'ID pour les tests suivants
pm.test("Save billing ID", function () {
  var jsonData = pm.response.json();
  pm.environment.set("billing_id", jsonData.data.id);
});
```

#### Script de validation de réponse GET

```javascript
pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Response is an array of billings", function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.success).to.be.true;
  pm.expect(jsonData.data).to.be.an("array");
});

pm.test("Each billing has required fields", function () {
  var jsonData = pm.response.json();
  if (jsonData.data.length > 0) {
    jsonData.data.forEach((billing) => {
      pm.expect(billing).to.have.property("id");
      pm.expect(billing).to.have.property("date");
    });
  }
});
```

#### Script pour tester les services inclus

```javascript
pm.test("Services are included when requested", function () {
  var url = pm.request.url.toString();
  var jsonData = pm.response.json();

  if (url.includes("includeServices=true") && jsonData.data.length > 0) {
    jsonData.data.forEach((billing) => {
      pm.expect(billing).to.have.property("services");
      if (billing.services && billing.services.length > 0) {
        billing.services.forEach((service) => {
          pm.expect(service).to.have.property("id");
          pm.expect(service).to.have.property("serviceType");
          pm.expect(service).to.have.property("billingId");
          pm.expect(service).to.have.property("amount");
          pm.expect(service.serviceType).to.be.oneOf(["CARE", "LESSON"]);
        });
      }
    });
  }
});
```

### Workflow de test complet

#### 1. Créer une facture

```javascript
// Pre-request Script
pm.environment.set("test_date", new Date().toISOString());

// Test
POST {{base_url}}/api/billing
{
  "date": "{{test_date}}"
}
```

#### 2. Récupérer la facture créée

```javascript
GET {{base_url}}/api/billing?id={{billing_id}}
```

#### 3. Mettre à jour la facture

```javascript
// Pre-request Script
var newDate = new Date();
newDate.setDate(newDate.getDate() + 1);
pm.environment.set("updated_date", newDate.toISOString());

// Test
PUT {{base_url}}/api/billing
{
  "id": "{{billing_id}}",
  "date": "{{updated_date}}"
}
```

#### 4. Supprimer la facture

```javascript
DELETE {{base_url}}/api/billing?id={{billing_id}}
```

## Notes importantes

1. **UUIDs :** Tous les IDs doivent être des UUIDs valides au format v4
2. **Dates :** Les dates doivent être au format ISO 8601
3. **Validation :** Toutes les entrées sont validées avec Zod avant traitement
4. **Pagination :** La pagination est optimisée avec des limites (max 1000 éléments)
5. **Relations :** Les factures peuvent contenir plusieurs services via PerformedService
6. **Performance :** Utilisez `includeServices=true` seulement si nécessaire pour éviter les requêtes lourdes
7. **Tri :** Les résultats sont triés par date de création décroissante
8. **Suppression :** La suppression d'une facture supprime en cascade tous les services associés
9. **Filtrage :** Le filtrage par date se base sur le champ `date` de la facture
