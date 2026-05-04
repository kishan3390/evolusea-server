data "terraform_remote_state" "shared" {
  backend = "remote"

  config = {
    organization = "evolusea"
    workspaces = {
      name = "evolusea-backend-shared-infrastructure"
    }
  }
}

data "terraform_remote_state" "backend_shared" {
  backend = "remote"

  config = {
    organization = "evolusea"
    workspaces = {
      name = "evolusea-backend-shared-${var.env_name}"
    }
  }
}

data "aws_availability_zones" "current" {}

data "aws_ami" "amazon-linux-2" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-kernel-*-hvm-*-x86_64-gp2"]
  }
}

data "aws_iam_policy_document" "ec2_assume" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

data "aws_caller_identity" "current" {}
