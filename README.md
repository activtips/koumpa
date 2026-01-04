# Koumpa - AI App Builder Platform

> Clone de Lovable.dev avec architecture serverless AWS et modèle économique modifiable

## 🏗️ Architecture

```
Frontend (Next.js)
    ↓
API Gateway (HTTP API)
    ↓
Lambda Functions
    ├── Generate App (Claude API)
    ├── Stripe Webhook
    ├── User Management
    └── Admin Functions
    ↓
DynamoDB (Plans, Users, Projects)
    ↓
S3 + CloudFront (Hosting des apps générées)
```

## 💰 Coûts estimés

### Tier gratuit AWS (premiers 12 mois)
- DynamoDB: 25 GB storage + 25 WCU/RCU **GRATUIT À VIE**
- Lambda: 1M requêtes/mois **GRATUIT**
- API Gateway: 1M requêtes/mois **GRATUIT** (12 mois)
- Cognito: 50k MAU **GRATUIT À VIE**
- S3: 5 GB **GRATUIT** (12 mois)
- CloudFront: 1 TB transfer **GRATUIT** (12 mois)

### Coûts réels après 12 mois (1000 users actifs)
- DynamoDB: 0€ (dans gratuit permanent)
- Lambda: 0€ (dans gratuit permanent)
- API Gateway: ~2€/mois
- S3 + CloudFront: ~5€/mois
- Claude API: ~100€/mois (variable selon usage)
- **Total: ~107€/mois**

## 📋 Prérequis

1. **Compte AWS** avec CLI configuré
2. **Terraform** >= 1.5.0
3. **Node.js** >= 20.x
4. **Stripe** account et API keys
5. **Anthropic** account et Claude API key

## 🚀 Déploiement rapide

### 1. Configuration initiale

```bash
# Clone le repo
git clone https://github.com/activtips/koumpa.git
cd koumpa

# Configure AWS CLI
aws configure

# Crée le bucket S3 pour le state Terraform (une seule fois)
aws s3api create-bucket \
  --bucket koumpa-terraform-state \
  --region eu-west-1 \
  --create-bucket-configuration LocationConstraint=eu-west-1

aws dynamodb create-table \
  --table-name koumpa-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region eu-west-1
```

### 2. Configuration des secrets

```bash
# Copie le fichier d'exemple
cd terraform/environments/dev
cp terraform.tfvars.example terraform.tfvars

# Édite avec tes clés API
nano terraform.tfvars
```

**Contenu de `terraform.tfvars`:**
```hcl
aws_region  = "eu-west-1"
environment = "dev"

# Obtenir sur https://console.anthropic.com/settings/keys
claude_api_key = "sk-ant-api03-XXXXXXX"

# Obtenir sur https://dashboard.stripe.com/apikeys
stripe_secret_key = "sk_test_XXXXXXX"

# Obtenir sur https://dashboard.stripe.com/webhooks
stripe_webhook_secret = "whsec_XXXXXXX"

cognito_callback_urls = [
  "http://localhost:3000/auth/callback",
  "https://dev.koumpa.com/auth/callback"
]

cognito_logout_urls = [
  "http://localhost:3000",
  "https://dev.koumpa.com"
]
```

### 3. Build des Lambda functions

```bash
# Depuis la racine du projet
cd src/lambdas

# Build chaque fonction
./build.sh
```

### 4. Déploiement Terraform

```bash
cd terraform/environments/dev

# Initialise Terraform
terraform init

# Vérifie le plan
terraform plan

# Déploie !
terraform apply
```

### 5. Configuration post-déploiement

```bash
# Récupère les outputs
terraform output

# Configure le frontend avec les valeurs
terraform output -raw frontend_env_variables > ../../../frontend/.env.local
```

### 6. Déploie le frontend

```bash
cd ../../../frontend

# Installe les dépendances
npm install

# Lance en dev
npm run dev

# Ou déploie sur Vercel
vercel --prod
```

## 🎛️ SuperAdmin Dashboard

URL: `https://koumpa.com/admin`

**Fonctionnalités:**
- ✅ Modifier les prix des plans (temps réel)
- ✅ Ajuster les quotas de crédits
- ✅ Activer/désactiver des features
- ✅ Gérer les utilisateurs
- ✅ Modifier manuellement les crédits
- ✅ Analytics business (MRR, users, churn)
- ✅ Logs système

**Accès:**
1. Créer un user dans Cognito
2. Ajouter l'attribut `custom:is_admin = true`
3. Login avec ce compte

## 📊 Monitoring

### CloudWatch Dashboards

```bash
# Lambda metrics
aws cloudwatch get-dashboard --dashboard-name koumpa-dev-lambdas

# API Gateway metrics
aws cloudwatch get-dashboard --dashboard-name koumpa-dev-api

# DynamoDB metrics
aws cloudwatch get-dashboard --dashboard-name koumpa-dev-db
```

### Logs

```bash
# Logs Generate App Lambda
aws logs tail /aws/lambda/koumpa-dev-generate-app --follow

# Logs Stripe Webhook
aws logs tail /aws/lambda/koumpa-dev-stripe-webhook --follow

# Logs API Gateway
aws logs tail /aws/apigateway/koumpa-dev --follow
```

## 🔄 CI/CD avec GitLab

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

variables:
  AWS_DEFAULT_REGION: eu-west-1

test:
  stage: test
  image: node:20
  script:
    - cd src/lambdas
    - npm test

build:
  stage: build
  image: node:20
  script:
    - cd src/lambdas
    - ./build.sh
  artifacts:
    paths:
      - src/lambdas/*/function.zip

deploy-dev:
  stage: deploy
  image: hashicorp/terraform:1.5
  script:
    - cd terraform/environments/dev
    - terraform init
    - terraform apply -auto-approve
  only:
    - develop

deploy-prod:
  stage: deploy
  image: hashicorp/terraform:1.5
  script:
    - cd terraform/environments/prod
    - terraform init
    - terraform apply -auto-approve
  only:
    - main
  when: manual
```

## 🔐 Sécurité

### Secrets Management

- **API Keys**: Stockés dans AWS Secrets Manager
- **Terraform State**: Chiffré dans S3
- **Lambda Environment Variables**: Chiffrées avec KMS
- **DynamoDB**: Encryption at rest activée

### IAM Best Practices

- Principe du moindre privilège
- Roles spécifiques par Lambda
- Pas de credentials hardcodés

### CORS

Configuration restrictive en production:
```hcl
cors_configuration {
  allow_origins = ["https://koumpa.com"]
  allow_methods = ["GET", "POST", "PUT", "DELETE"]
  allow_headers = ["content-type", "authorization"]
}
```

## 📈 Scaling

### DynamoDB Auto-Scaling

```hcl
# À ajouter si nécessaire (non inclus car PAY_PER_REQUEST)
resource "aws_appautoscaling_target" "users_table" {
  max_capacity       = 100
  min_capacity       = 5
  resource_id        = "table/koumpa-dev-users"
  scalable_dimension = "dynamodb:table:ReadCapacityUnits"
  service_namespace  = "dynamodb"
}
```

### Lambda Reserved Concurrency

```hcl
# Limite le nombre d'exécutions simultanées
resource "aws_lambda_function" "generate_app" {
  # ...
  reserved_concurrent_executions = 10
}
```

## 🧪 Tests

```bash
# Tests unitaires Lambdas
cd src/lambdas
npm test

# Tests d'intégration
npm run test:integration

# Tests e2e frontend
cd frontend
npm run test:e2e
```

## 📝 Variables d'environnement

### Backend (Lambda)
```bash
PLANS_TABLE=koumpa-dev-plans
USERS_TABLE=koumpa-dev-users
PROJECTS_TABLE=koumpa-dev-projects
APPS_BUCKET=koumpa-dev-apps
SECRETS_ARN=arn:aws:secretsmanager:...
CLOUDFRONT_URL=https://d123.cloudfront.net
```

### Frontend (Next.js)
```bash
NEXT_PUBLIC_API_URL=https://abc123.execute-api.eu-west-1.amazonaws.com
NEXT_PUBLIC_COGNITO_USER_POOL_ID=eu-west-1_XXXXXX
NEXT_PUBLIC_COGNITO_CLIENT_ID=1234567890abcdef
NEXT_PUBLIC_COGNITO_DOMAIN=koumpa-dev-12345678.auth.eu-west-1.amazoncognito.com
NEXT_PUBLIC_AWS_REGION=eu-west-1
NEXT_PUBLIC_CLOUDFRONT_DOMAIN=d123.cloudfront.net
```

## 🐛 Troubleshooting

### Lambda timeout
```bash
# Augmente le timeout
resource "aws_lambda_function" "generate_app" {
  timeout = 300 # 5 minutes max
}
```

### Out of memory
```bash
# Augmente la RAM
resource "aws_lambda_function" "generate_app" {
  memory_size = 1024 # 1 GB
}
```

### DynamoDB throttling
```bash
# Passe à On-Demand (PAY_PER_REQUEST) déjà configuré
# Ou augmente les WCU/RCU si en PROVISIONED
```

## 📚 Documentation

- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [API Gateway HTTP API](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api.html)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)

## 🤝 Support

- GitHub Issues: https://github.com/activtips/koumpa/issues
- Email: mohamed@koumpa.com

## 📄 License

MIT License - voir [LICENSE](LICENSE)

---

**Développé par Mohamed Tounkara** 🚀
