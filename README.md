# OdooJS - Modular ERP System

Un système ERP modulaire et évolutif inspiré d'Odoo, construit avec **Node.js**, **Next.js** et **Prisma**.

## 🚀 Fonctionnalités

- **Système de modules** : Installez et désinstallez des modules dynamiquement
- **Découverte automatique** : Les modules, menus et vues sont découverts automatiquement
- **Menus hiérarchiques** : Structure de menus dynamique basée sur les modules installés
- **Vues configurables** : Support des vues form, tree, kanban, search
- **Définition de modèles** : Déclarez vos modèles de données dans les manifests
- **Dépendances** : Gestion des dépendances entre modules
- **Auto-installation** : Modules auto-installables au démarrage
- **Données initiales** : Chargement de données lors de l'installation

## 📦 Installation

### Prérequis

- Node.js 20+
- PostgreSQL
- npm ou yarn

### Étapes

1. **Cloner le projet**
```bash
cd /workspace
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer la base de données**

Créez un fichier `.env` à la racine :
```env
DATABASE_URL="postgresql://user:password@localhost:5432/odoojs?schema=public"
```

4. **Générer le client Prisma**
```bash
npm run db:generate
```

5. **Appliquer le schéma de base de données**
```bash
npm run db:push
```

6. **Lancer le serveur de développement**
```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 🏗️ Architecture

```
/workspace
├── prisma/
│   └── schema.prisma          # Schéma de base de données
├── src/
│   ├── app/                   # Pages Next.js
│   │   ├── components/        # Composants React
│   │   ├── modules/           # Page de gestion des modules
│   │   ├── page.tsx           # Page d'accueil
│   │   └── layout.tsx         # Layout principal
│   ├── core/                  # Services principaux
│   │   ├── module-service.ts  # Gestion des modules
│   │   ├── menu-service.ts    # Gestion des menus
│   │   └── view-service.ts    # Gestion des vues
│   ├── lib/                   # Utilitaires
│   │   └── prisma.ts          # Client Prisma
│   └── modules/               # Modules de l'application
│       ├── base/              # Module de base (auto-installé)
│       │   └── manifest.ts
│       └── sales/             # Module exemple (ventes)
│           └── manifest.ts
└── package.json
```

## 🔧 Créer un module

1. **Créer un dossier** dans `src/modules/nom-du-module`

2. **Ajouter un manifeste** `manifest.ts` :

```typescript
import { ModuleManifest } from '../../core/module-service'

const manifest: ModuleManifest = {
  name: 'mon_module',
  version: '1.0.0',
  description: 'Description du module',
  author: 'Votre nom',
  autoInstall: false,
  dependencies: ['base'],
  menus: [
    {
      name: 'Mon Menu',
      sequence: 10,
      icon: '📁',
      action: '/mon_module/page'
    }
  ],
  views: [
    {
      name: 'Vue Formulaire',
      type: 'form',
      model: 'MonModele',
      arch: JSON.stringify({
        form: {
          fields: ['champ1', 'champ2']
        }
      })
    }
  ],
  models: [
    {
      name: 'MonModele',
      table: 'mon_modele',
      fields: {
        id: { type: 'String', id: true },
        champ1: { type: 'String', required: true },
        champ2: { type: 'Int?', default: 0 }
      }
    }
  ],
  data: []
}

export default manifest
```

3. **Installer le module** via l'interface web `/modules`

## 📚 API des Services

### ModuleService

```typescript
// Découvrir tous les modules
await moduleService.discoverModules()

// Installer un module
await moduleService.installModule('sales')

// Désinstaller un module
await moduleService.uninstallModule('sales')

// Lister les modules installés
await moduleService.getInstalledModules()

// Lister les modules disponibles
await moduleService.getAvailableModules()

// Auto-installation
await moduleService.autoInstallModules()
```

### MenuService

```typescript
// Construire l'arbre des menus
const menuTree = await menuService.buildMenuTree()

// Obtenir tous les menus
const allMenus = await menuService.getAllMenus()
```

### ViewService

```typescript
// Obtenir les vues pour un modèle
const views = await viewService.getViewsForModel('SaleOrder')

// Obtenir une vue spécifique
const formView = await viewService.getPrimaryView('SaleOrder', 'form')
```

## 🎯 Exemples de modules inclus

### Module Base (`base`)
- Auto-installé
- Modèle ResPartner (contacts/partenaires)
- Menu Settings

### Module Sales (`sales`)
- Dépend de `base`
- Modèles: SaleOrder, SaleOrderLine, ProductProduct
- Menus: Sales, Quotations, Orders, Products
- Vues: Form et Tree pour les commandes
- Données initiales: Produits exemples

## 🔄 Workflow typique

1. **Démarrage** → Auto-installation des modules marqués
2. **Navigation** → Les menus sont construits dynamiquement
3. **Installation** → Un module ajoute ses menus, vues, modèles et données
4. **Désinstallation** → Nettoyage des données du module (si pas de dépendances)

## 🛠️ Commandes npm

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run start        # Serveur de production
npm run db:generate  # Générer le client Prisma
npm run db:migrate   # Créer et appliquer une migration
npm run db:push      # Appliquer le schéma sans migration
npm run db:studio    # Ouvrir Prisma Studio
```

## 📝 Notes

- Les modules sont découverts automatiquement depuis `src/modules/`
- Les dépendances sont vérifiées avant installation
- Un module ne peut pas être désinstallé si d'autres en dépendent
- Le module `base` ne peut pas être désinstallé

## 🚧 À venir

- Génération automatique des tables Prisma depuis les manifests
- Système de vues héritées (XPath-like)
- ORM dynamique pour les modèles déclaratifs
- API REST automatique pour les modèles
- Système d'utilisateurs et permissions
- Traductions i18n
- Tests automatisés

## 📄 License

ISC
