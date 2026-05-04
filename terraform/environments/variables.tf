variable "app_name" {
  description = "workspace prefix with application name"
  type        = string
  default     = "evolusea-backend"
}

variable "eb_solution_stack_name" {
  description = "Elastic Beanstalk solution stack (Docker platform). List with: aws elasticbeanstalk list-available-solution-stacks --region <region> --query \"SolutionStacks[?contains(@, 'Amazon Linux 2023') && contains(@, 'Docker')]\""
  type        = string
  default     = "64bit Amazon Linux 2023 v4.8.0 running Docker"
}

variable "aws_region" {
  type    = string
  default = "ap-southeast-7"
}

variable "env_name" {
  type        = string
  default     = "development"
  description = "Environment variable name, example: development, staging, production"
}

variable "sentry_dsn" {
  type = string
}

variable "domain_route53_zone_id" {
  type        = string
  description = "Domain zone id"
  default     = "Z0459697MJ0TQA745VKF"
}

variable "domain" {
  type    = string
  default = "evolusea.com"
}

variable "rds_allocated_storage" {
  type        = number
  description = "The allocated storage in gigabytes"
  default     = 20
}

variable "rds_max_allocated_storage" {
  type        = number
  description = "The maximum allocated storage in gigabytes"
  default     = 100
}

variable "rds_storage_type" {
  type        = string
  description = "The storage type"
  default     = "gp3"
}

variable "rds_engine_version" {
  type        = string
  description = "The engine version to use"
  default     = "16"
}

variable "rds_db_instance_class" {
  type        = string
  description = "The instance class to use"
  default     = "db.t4g.small"
}

variable "rds_db_multi_az" {
  type        = bool
  description = "If the RDS instance is multi-AZ"
  default     = false
}

variable "rds_db_name" {
  type        = string
  description = "The name of the database"
  default     = ""
}

variable "rds_username" {
  type        = string
  description = "The username for the database"
  default     = ""
}

variable "rds_password" {
  type        = string
  description = "The password for the database"
}

variable "rds_db_port" {
  type        = number
  description = "The port for the database"
  default     = 5432
}

variable "rds_backup_retention_period" {
  type        = number
  description = "The backup retention period in days"
  default     = 7
}

variable "vpc_cidr" {
  type        = string
  description = "The CIDR block for the VPC"
  default     = "10.16.0.0/16"
}
variable "rds_snapshot_identifier" {
  type        = string
  description = "The snapshot identifier to restore from"
  default     = ""
}

variable "firebase_credentials_encoded" {
  type        = string
  description = "Firebase credentials encoded by base64"
  default     = ""
}

variable "bastion_host_key_pair_name" {
  type        = string
  description = "Name of the key pair, that was already generated/imported to AWS"
}

variable "openai_api_key" {
  type        = string
  description = "API Key for the OpenAI"
}

variable "gemini_api_key" {
  type        = string
  description = "API Key for the Gemini"
}

variable "is_bastion_host_enabled" {
  type        = bool
  default     = false
  description = "Indicates whether a bastion host is enabled"
}

# Strapi
variable "strapi_api_token" {
  type        = string
  description = "API Token for Strapi"
}
variable "strapi_url" {
  type        = string
  description = "URL for Strapi"
}

# RevenueCat
variable "revenue_cat_api_key_v1" {
  type        = string
  description = "API key v1 for RevenueCat"
}
variable "revenue_cat_api_key_v2" {
  type        = string
  description = "API key v2 for RevenueCat"
}
variable "revenue_cat_webhook_key" {
  type        = string
  description = "Webhook key for RevenueCat"
}
variable "revenue_cat_project_id" {
  type        = string
  description = "RevenueCat project id"
}

# Wisdom Story
variable "wisdom_story_strapi_sync_cron" {
  type        = string
  description = "CRON expression for syncing wisdom stories between backend and strapi"
}
variable "wisdom_story_strapi_sync_timezone" {
  type        = string
  description = "CRON timezone for syncing wisdom stories between backend and strapi"
}