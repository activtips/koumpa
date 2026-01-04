# 🚀 Koumpa - Quick Start Guide

## ⚡ Installation rapide (15 minutes)

### 1. Prérequis

```bash
# AWS CLI
aws --version  # >= 2.0

# Terraform
terraform --version  # >= 1.5.0

# Node.js
node --version  # >= 20.0.0

# Git
git --version
```

### 2. Clone et configuration

```bash
# Clone le repo
git clone https://github.com/activtips/koumpa.git
cd koumpa

# Créer le backend Terraform (une seule fois)
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

### 3. Configuration des secrets

```bash
cd terraform/environments/dev
cp terraform.tfvars.example terraform.tfvars

# Éditer avec tes clés API
nano terraform.tfvars
```

**Contenu de `terraform.tfvars` :**
```hcl
aws_region  = "eu-west-1"
environment = "dev"

# 👉 Obtenir sur https://console.anthropic.com/settings/keys
claude_api_key = "sk-ant-api03-XXXXXXX"

# 👉 Obtenir sur https://dashboard.stripe.com/apikeys
stripe_secret_key = "sk_test_XXXXXXX"
stripe_webhook_secret = "whsec_XXXXXXX"

cognito_callback_urls = ["http://localhost:3000/auth/callback"]
cognito_logout_urls = ["http://localhost:3000"]
```

### 4. Build des Lambdas

```bash
# Rendre les scripts exécutables
chmod +x scripts/*.sh

# Build toutes les Lambdas
./scripts/build-all-lambdas.sh
```

### 5. Déploiement Infrastructure

```bash
cd terraform/environments/dev

# Initialiser Terraform
terraform init

# Vérifier le plan
terraform plan

# Déployer ! ✨
terraform apply
```

⏱️ **Durée : ~5-10 minutes**

### 6. Récupérer les URLs

```bash
# Afficher toutes les outputs
terraform output

# Variables pour le frontend
terraform output -raw frontend_env_variables > ../../../frontend/.env.local
```

## 🎨 Frontend (Next.js)

```bash
cd frontend

# Installer dépendances
npm install

# Lancer en dev
npm run dev

# Ouvre http://localhost:3000
```

## 📊 Vérification

```bash
# Test API Gateway
curl https://YOUR_API_ID.execute-api.eu-west-1.amazonaws.com/dev/api/plans

# Test Lambda directement
aws lambda invoke \
  --function-name koumpa-dev-generate-app \
  --payload '{"prompt":"Hello"}' \
  response.json

# Voir les logs
aws logs tail /aws/lambda/koumpa-dev-generate-app --follow
```

## 🛠️ Commandes utiles

### Build

```bash
# Build une Lambda spécifique
./scripts/build-lambda.sh generate-app

# Build toutes les Lambdas
./scripts/build-all-lambdas.sh
```

### Terraform

```bash
cd terraform/environments/dev

# Plan
terraform plan

# Apply
terraform apply

# Destroy (⚠️ ATTENTION)
terraform destroy

# Output spécifique
terraform output api_gateway_url
```

### Logs

```bash
# Logs temps réel
aws logs tail /aws/lambda/koumpa-dev-generate-app --follow

# Filtrer les erreurs
aws logs filter-log-events \
  --log-group-name /aws/lambda/koumpa-dev-generate-app \
  --filter-pattern "ERROR"

# Logs API Gateway
aws logs tail /aws/apigateway/koumpa-dev --follow
```

### DynamoDB

```bash
# Lister les tables
aws dynamodb list-tables

# Scanner une table
aws dynamodb scan --table-name koumpa-dev-users --limit 10

# Ajouter un user admin
aws dynamodb put-item \
  --table-name koumpa-dev-users \
  --item file://admin-user.json
```

### S3

```bash
# Lister les apps générées
aws s3 ls s3://koumpa-dev-apps/

# Télécharger une app
aws s3 cp s3://koumpa-dev-apps/PROJECT_ID/index.html .
```

## 🐛 Troubleshooting

### Erreur: "Insufficient credits"

```bash
# Ajouter des crédits manuellement
aws dynamodb update-item \
  --table-name koumpa-dev-users \
  --key '{"userId":{"S":"USER_ID"}}' \
  --update-expression "SET creditsBalance = :val" \
  --expression-attribute-values '{":val":{"N":"100"}}'
```

### Erreur: "Table not found"

```bash
# Vérifier que les tables existent
aws dynamodb list-tables | grep koumpa-dev

# Re-déployer si nécessaire
terraform apply -target=module.database
```

### Lambda timeout

```bash
# Augmenter le timeout dans Terraform
# terraform/modules/api/lambdas.tf
resource "aws_lambda_function" "generate_app" {
  timeout = 300  # 5 minutes
}

terraform apply
```

### Coûts AWS

```bash
# Vérifier les coûts actuels
aws ce get-cost-and-usage \
  --time-period Start=2025-01-01,End=2025-01-04 \
  --granularity DAILY \
  --metrics "BlendedCost"
```

## 📚 Documentation

- **Architecture** : [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Développement** : [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
- **API** : [docs/api/README.md](docs/api/README.md)
- **Déploiement** : [README.md](README.md)

## 🤝 Support

- Issues GitHub : https://github.com/activtips/koumpa/issues
- Email : mohamed@koumpa.com

## 📈 Prochaines étapes

1. ✅ Infrastructure déployée
2. 🎨 Développer le frontend SuperAdmin
3. 💳 Configurer Stripe Products & Prices
4. 🔐 Configurer domaine custom
5. 🚀 Déployer en production

---

**Développé avec ❤️ par Mohamed Tounkara**
