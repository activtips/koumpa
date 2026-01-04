# Koumpa - Guide de développement

## 📐 Architecture Clean Code

### Principes appliqués

1. **Separation of Concerns** : Chaque module a une responsabilité unique
2. **Dependency Injection** : Services injectés, pas de dépendances hardcodées
3. **Error Handling** : Gestion centralisée avec erreurs typées
4. **Configuration centralisée** : Toutes les variables d'environnement dans `config/`
5. **Repository Pattern** : Abstraction de l'accès aux données
6. **Service Layer** : Logique métier isolée

### Structure du code Backend

```
src/lambdas/
├── shared/                          # Code partagé entre Lambdas
│   ├── config/                      # Configuration centralisée
│   │   └── index.js                # Variables d'environnement
│   │
│   ├── errors/                      # Gestion d'erreurs
│   │   └── index.js                # Classes d'erreurs custom
│   │
│   ├── repositories/                # Accès aux données (DynamoDB)
│   │   ├── base.repository.js      # Repository de base
│   │   ├── user.repository.js      # Repository Users
│   │   ├── project.repository.js   # Repository Projects
│   │   ├── plan.repository.js      # Repository Plans
│   │   └── index.js                # Export
│   │
│   ├── services/                    # Logique métier
│   │   ├── secrets.service.js      # Gestion secrets (API keys)
│   │   ├── storage.service.js      # S3 operations
│   │   ├── claude.service.js       # Claude API integration
│   │   └── app-generation.service.js # Orchestration principale
│   │
│   └── utils/                       # Utilitaires
│       └── logger.js               # Logger structuré
│
└── generate-app/                    # Lambda individuelle
    ├── index.js                     # Handler principal
    ├── validators.js                # Validation des requêtes
    ├── package.json                 # Dépendances
    └── function.zip                 # Archive déployée
```

## 🔨 Développement

### Setup local

```bash
# Cloner le repo
git clone https://github.com/activtips/koumpa.git
cd koumpa

# Installer les dépendances des Lambdas
cd src/lambdas/shared
npm install

cd ../generate-app
npm install

# Variables d'environnement locales
cp .env.example .env
# Éditer .env avec tes clés
```

### Variables d'environnement

```bash
# .env
AWS_REGION=eu-west-1
PLANS_TABLE=koumpa-dev-plans
USERS_TABLE=koumpa-dev-users
PROJECTS_TABLE=koumpa-dev-projects
APPS_BUCKET=koumpa-dev-apps
SECRETS_ARN=arn:aws:secretsmanager:eu-west-1:123456789:secret:koumpa-dev-api-keys
CLOUDFRONT_URL=https://d123.cloudfront.net
LOG_LEVEL=debug
NODE_ENV=development
```

### Tests unitaires

```bash
# Tous les tests
npm test

# Tests avec watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

**Exemple de test :**

```javascript
// generate-app/index.test.js
const { handler } = require('./index');
const AppGenerationService = require('../shared/services/app-generation.service');

jest.mock('../shared/services/app-generation.service');

describe('Generate App Handler', () => {
  test('should generate app successfully', async () => {
    // Mock service
    const mockGenerateApp = jest.fn().mockResolvedValue({
      project: { id: 'test-123', deployUrl: 'https://test.com' },
      creditsRemaining: 95
    });
    
    AppGenerationService.prototype.generateApp = mockGenerateApp;

    // Mock event
    const event = {
      requestContext: {
        authorizer: {
          jwt: {
            claims: { sub: 'user-123' }
          }
        }
      },
      body: JSON.stringify({ prompt: 'Create a todo app' })
    };

    const response = await handler(event, {});

    expect(response.statusCode).toBe(200);
    expect(mockGenerateApp).toHaveBeenCalledWith(
      'user-123',
      'Create a todo app',
      expect.any(Object)
    );
  });
});
```

### Build des Lambdas

```bash
# Build une Lambda spécifique
./scripts/build-lambda.sh generate-app

# Build toutes les Lambdas
./scripts/build-all-lambdas.sh
```

Le script de build :
1. Installe les dépendances
2. Copie le code shared
3. Crée un ZIP optimisé
4. Prêt pour déploiement Terraform

## 🎯 Ajouter une nouvelle Lambda

### 1. Créer la structure

```bash
mkdir -p src/lambdas/my-new-lambda
cd src/lambdas/my-new-lambda
```

### 2. Créer le handler

```javascript
// index.js
const { ErrorHandler } = require('../shared/errors');
const { createLogger } = require('../shared/utils/logger');
const MyService = require('../shared/services/my.service');

const myService = new MyService();

exports.handler = ErrorHandler.wrapHandler(async (event, context) => {
  const logger = createLogger('my-new-lambda', context.requestId);
  logger.logInvocationStart(event);

  // Votre logique ici
  const result = await myService.doSomething();

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ success: true, data: result })
  };
});
```

### 3. Ajouter au Terraform

```hcl
# terraform/modules/api/lambdas.tf

resource "aws_lambda_function" "my_new_lambda" {
  filename         = "${path.module}/../../../src/lambdas/my-new-lambda/function.zip"
  function_name    = "${var.name_prefix}-my-new-lambda"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  timeout          = 30
  memory_size      = 256

  environment {
    variables = {
      USERS_TABLE = var.users_table_name
      # ... autres variables
    }
  }
}
```

## 🏗️ Patterns de code

### Repository Pattern

```javascript
// repositories/my.repository.js
const BaseRepository = require('./base.repository');

class MyRepository extends BaseRepository {
  constructor() {
    super('table-name');
  }

  async getByCustomField(value) {
    return await this.query({
      IndexName: 'custom-field-index',
      KeyConditionExpression: 'customField = :value',
      ExpressionAttributeValues: { ':value': value }
    });
  }
}

module.exports = MyRepository;
```

### Service Pattern

```javascript
// services/my.service.js
const MyRepository = require('../repositories/my.repository');
const { createLogger } = require('../utils/logger');

class MyService {
  constructor() {
    this.repo = new MyRepository();
    this.logger = createLogger('MyService');
  }

  async doSomething() {
    this.logger.info('Doing something...');
    
    try {
      const result = await this.repo.getByCustomField('value');
      return result;
    } catch (error) {
      this.logger.error('Error doing something', { error });
      throw error;
    }
  }
}

module.exports = MyService;
```

### Error Handling

```javascript
const { ValidationError, NotFoundError } = require('../shared/errors');

// Dans un service
if (!userId) {
  throw new ValidationError('User ID is required', 'userId');
}

if (!user) {
  throw new NotFoundError('User', userId);
}
```

## 📝 Guidelines de code

### Naming Conventions

- **Variables** : camelCase (`userId`, `projectName`)
- **Constants** : UPPER_SNAKE_CASE (`MAX_RETRIES`, `DEFAULT_TIMEOUT`)
- **Classes** : PascalCase (`UserRepository`, `ClaudeService`)
- **Files** : kebab-case (`user.repository.js`, `app-generation.service.js`)
- **Functions** : camelCase verbs (`generateApp`, `validateRequest`)

### Commentaires

```javascript
/**
 * Generate a new app using Claude AI
 * 
 * @param {string} userId - User's unique identifier
 * @param {string} prompt - Description of the app to generate
 * @param {Object} options - Optional generation parameters
 * @param {string} [options.framework='vanilla'] - Target framework
 * @param {boolean} [options.isPublic=true] - Make project public
 * @returns {Promise<Object>} Generated project details
 * @throws {InsufficientCreditsError} If user has no credits
 */
async generateApp(userId, prompt, options = {}) {
  // Implementation
}
```

### Async/Await

```javascript
// ✅ BON
async function myFunction() {
  try {
    const result = await someAsyncOperation();
    return result;
  } catch (error) {
    logger.error('Error in myFunction', { error });
    throw error;
  }
}

// ❌ MAUVAIS
function myFunction() {
  return someAsyncOperation()
    .then(result => result)
    .catch(error => {
      console.log(error);
    });
}
```

### Logging

```javascript
// ✅ BON - Logging structuré
logger.info('Processing payment', {
  userId,
  amount,
  currency: 'EUR'
});

// ❌ MAUVAIS
console.log(`Processing payment for user ${userId} of ${amount}`);
```

## 🚀 Déploiement

### Dev

```bash
cd terraform/environments/dev
terraform plan
terraform apply
```

### Production

```bash
cd terraform/environments/prod
terraform plan
terraform apply --auto-approve=false
```

### Rollback

```bash
# Revenir à la version précédente
terraform state list
terraform state mv [resource] [resource]
terraform apply -target=[resource]
```

## 🐛 Debugging

### Logs CloudWatch

```bash
# Tail des logs en temps réel
aws logs tail /aws/lambda/koumpa-dev-generate-app --follow --format short

# Rechercher des erreurs
aws logs filter-log-events \
  --log-group-name /aws/lambda/koumpa-dev-generate-app \
  --filter-pattern "ERROR"
```

### Debug local avec SAM

```bash
# Installer SAM CLI
brew install aws-sam-cli

# Invoquer Lambda localement
sam local invoke GenerateAppFunction \
  --event events/generate-app.json \
  --env-vars env.json
```

## 📚 Ressources

- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)

## 🤝 Contribution

1. Fork le projet
2. Crée une branche (`git checkout -b feature/amazing-feature`)
3. Commit (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Ouvre une Pull Request

### Code Review Checklist

- [ ] Tests unitaires passent
- [ ] Code coverage > 80%
- [ ] Logs structurés
- [ ] Gestion d'erreurs
- [ ] Documentation à jour
- [ ] Pas de secrets hardcodés
- [ ] TypeScript types (si applicable)

---

**Maintenu par Mohamed Tounkara**
