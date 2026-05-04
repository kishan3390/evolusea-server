terraform {
  required_version = ">= 1.14.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  cloud {
    organization = "evolusea"

    workspaces {
      name = "evolusea-backend-development"
    }
  }

}

provider "aws" {
  region = var.aws_region
}
