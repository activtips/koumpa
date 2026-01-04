# Architecture Koumpa - Clean Code & Best Practices

## 🏗️ Principes architecturaux

### 1. Separation of Concerns
- **Controllers** (Handlers) : Point d'entrée, validation input
- **Services** : Logique métier
- **Repositories** : Accès aux données (DynamoDB, S3)
- **Utils** : Fonctions utilitaires réutilisables
- **Config** : Configuration centralisée
- **Middleware** : Validation, logging, error handling

### 2. Dependency Injection
- Services injectés dans les handlers
- Facilite les tests unitaires
- Pas de dépendances hardcodées

### 3. Error Handling
- Erreurs custom typées
- Gestion centralisée
- Messages clairs pour debugging

### 4. SOLID Principles
- **S**ingle Responsibility
- **O**pen/Closed
- **L**iskov Substitution
- **I**nterface Segregation
- **D**ependency Inversion

### 5. DRY (Don't Repeat Yourself)
- Réutilisation du code
- Pas de duplication

## 📁 Structure du projet

```
koumpa/
├── terraform/                    # Infrastructure as Code
│   ├── environments/
│   │   ├── dev/
│   │   ├── staging/
│   │   └── prod/
│   └── modules/
│       ├── database/
│       ├── auth/
│       ├── storage/
│       ├── api/
│       └── cron/
│
├── src/                         # Backend code
│   ├── lambdas/                # Lambda functions
│   │   ├── shared/             # Code partagé entre lambdas
│   │   │   ├── config/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── utils/
│   │   │   ├── middleware/
│   │   │   ├── errors/
│   │   │   └── types/
│   │   │
│   │   ├── generate-app/       # Lambda individuelle
│   │   │   ├── index.js        # Handler
│   │   │   ├── handler.test.js
│   │   │   └── package.json
│   │   │
│   │   ├── stripe-webhook/
│   │   ├── daily-bonus/
│   │   ├── get-user/
│   │   └── admin-update-plan/
│   │
│   └── layers/                 # Lambda Layers
│       └── dependencies/
│           └── nodejs/
│               └── package.json
│
├── frontend/                   # Next.js Frontend
│   ├── app/                   # App Router (Next.js 13+)
│   │   ├── (auth)/           # Route group
│   │   ├── (dashboard)/
│   │   ├── admin/
│   │   └── api/              # API routes
│   │
│   ├── components/           # React components
│   │   ├── ui/              # Composants UI de base
│   │   ├── features/        # Composants métier
│   │   └── layouts/
│   │
│   ├── lib/                 # Services & utilities
│   │   ├── api/            # API client
│   │   ├── auth/           # Auth helpers
│   │   ├── hooks/          # Custom hooks
│   │   └── utils/
│   │
│   ├── types/              # TypeScript types
│   ├── config/             # Configuration
│   └── public/
│
├── scripts/                # Build & deploy scripts
│   ├── build-lambdas.sh
│   ├── deploy.sh
│   └── seed-db.sh
│
├── docs/                  # Documentation
│   ├── api/
│   ├── architecture/
│   └── deployment/
│
└── tests/                # Tests e2e
    ├── integration/
    └── e2e/
```

## 🎯 Patterns utilisés

### Backend (Lambda)
- **Repository Pattern** : Abstraction accès données
- **Service Pattern** : Logique métier isolée
- **Factory Pattern** : Création d'instances
- **Middleware Pattern** : Pipeline de traitement
- **Strategy Pattern** : Différentes stratégies de génération

### Frontend
- **Container/Presenter** : Séparation logique/UI
- **Custom Hooks** : Réutilisation logique
- **Context API** : État global
- **Composition** : Composants composables
- **Server Components** : Performance optimale
