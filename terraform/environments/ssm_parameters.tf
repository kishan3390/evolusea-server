# PostgreSql
resource "aws_ssm_parameter" "postgres_host" {
  name  = "${local.ssm_prefix}/postgres_host"
  type  = "String"
  value = split(":", aws_db_instance.rds.endpoint)[0]
}
resource "aws_ssm_parameter" "postgres_port" {
  name  = "${local.ssm_prefix}/postgres_port"
  type  = "String"
  value = var.rds_db_port
}
resource "aws_ssm_parameter" "postgres_user" {
  name  = "${local.ssm_prefix}/postgres_user"
  type  = "SecureString"
  value = aws_db_instance.rds.username
}
resource "aws_ssm_parameter" "postgres_db" {
  name  = "${local.ssm_prefix}/postgres_db"
  type  = "String"
  value = aws_db_instance.rds.db_name
}
resource "aws_ssm_parameter" "postgres_password" {
  name  = "${local.ssm_prefix}/postgres_password"
  type  = "SecureString"
  value = var.rds_password
}

# Firebase
resource "aws_ssm_parameter" "firebase_credentials_encoded" {
  name  = "${local.ssm_prefix}/firebase_credentials_encoded"
  type  = "SecureString"
  value = var.firebase_credentials_encoded
}

# Strapi
resource "aws_ssm_parameter" "strapi_api_token" {
  name  = "${local.ssm_prefix}/strapi_api_token"
  type  = "SecureString"
  value = var.strapi_api_token
}
resource "aws_ssm_parameter" "strapi_url" {
  name  = "${local.ssm_prefix}/strapi_url"
  type  = "String"
  value = var.strapi_url
}

# AI
resource "aws_ssm_parameter" "openai_api_key" {
  name  = "${local.ssm_prefix}/openai_api_key"
  type  = "SecureString"
  value = var.openai_api_key
}
resource "aws_ssm_parameter" "gemini_api_key" {
  name  = "${local.ssm_prefix}/gemini_api_key"
  type  = "SecureString"
  value = var.gemini_api_key
}

# Sentry
resource "aws_ssm_parameter" "sentry_dsn" {
  name  = "${local.ssm_prefix}/sentry_dsn"
  type  = "String"
  value = var.sentry_dsn
}

# Revenue Cat
resource "aws_ssm_parameter" "revenue_cat_api_key_v1" {
  name  = "${local.ssm_prefix}/revenue_cat_api_key_v1"
  type  = "SecureString"
  value = var.revenue_cat_api_key_v1
}
resource "aws_ssm_parameter" "revenue_cat_api_key_v2" {
  name  = "${local.ssm_prefix}/revenue_cat_api_key_v2"
  type  = "SecureString"
  value = var.revenue_cat_api_key_v2
}
resource "aws_ssm_parameter" "revenue_cat_webhook_key" {
  name  = "${local.ssm_prefix}/revenue_cat_webhook_key"
  type  = "SecureString"
  value = var.revenue_cat_webhook_key
}
resource "aws_ssm_parameter" "revenue_cat_project_id" {
  name  = "${local.ssm_prefix}/revenue_cat_project_id"
  type  = "String"
  value = var.revenue_cat_project_id
}

# Wisdom Story
resource "aws_ssm_parameter" "wisdom_story_strapi_sync_cron" {
  name  = "${local.ssm_prefix}/wisdom_story_strapi_sync_cron"
  type  = "String"
  value = var.wisdom_story_strapi_sync_cron
}
resource "aws_ssm_parameter" "wisdom_story_strapi_sync_timezone" {
  name  = "${local.ssm_prefix}/wisdom_story_strapi_sync_timezone"
  type  = "String"
  value = var.wisdom_story_strapi_sync_timezone
}