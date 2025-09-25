# Page Billing - Documentation

## Ce que fait la page

La page `/billing` affiche les factures des utilisateurs. Elle fonctionne différemment selon le rôle de l'utilisateur connecté.

## Fonctionnement selon le rôle

### 👑 ADMIN
- **Voit** : Toutes les factures du système
- **Colonnes** : Billing, Date, User, Service, Amount, Download
- **Composant** : `AllBillings`

### 👤 Autres utilisateurs (CUSTOMER, OWNER, etc.)
- **Voit** : Seulement leurs propres factures
- **Colonnes** : Billing, Date, Service, Amount, Download
- **Composant** : `AllBillingsUser`

## Fonctionnalités

### 📋 Affichage des factures
- Tableau avec les factures
- Colonne "User" visible uniquement pour les ADMIN
- Date formatée en français
- Montant en euros

### 📄 Téléchargement PDF
- Bouton "Download PDF" sur chaque ligne
- Génère un PDF avec les détails de la facture
- Téléchargement automatique

## Navigation

Le lien "Billing" est visible dans la sidebar pour tous les utilisateurs avec l'icône de carte de crédit.

## Structure des fichiers

```
src/app/billing/page.tsx              # Page principale
src/components/billing/
├── allBillings.tsx                   # Pour ADMIN
└── allBillingsUser.tsx               # Pour autres utilisateurs
src/app/api/billing/
├── route.ts                          # API des factures
└── pdf/route.ts                      # API PDF
```
