# Infrastructure

The infrastructure is hosted on AWS and build with [terraform](https://www.terraform.io/).
Terraform state is keeped on [terraform cloud](https://app.terraform.io/).

Terraform code is devided into two parts:
- shared located in [shared directory](./shared). It creates:
  - AWS EB application
  - AWS ECR
  - CI/CD user
- environment specific infrastructure located id [environments directory](./environments). It creates:
   - AWS EB environment
   - EB application ec2 profile and role
   - EB ECR access policy

## Prerequisites

To create or change infrastructure, AWS access key and terraform cloud token are required.

**Terraform version:** This project uses Terraform 1.14.x (required by HCP). From the repo root run `./scripts/tf.sh` (e.g. `./scripts/tf.sh init`, `./scripts/tf.sh plan`). Do not run raw `terraform` if your default is 1.5.x. If you see "workspaces not supported", run `unset TF_WORKSPACE` and then `./scripts/tf.sh init` (do not use `-reconfigure` with the cloud block).

**Remote state dependency:** The environments code reads from two other HCP workspaces in the same org (`evolusea`). If you see "Unable to find remote state", those workspaces must exist and have state:

| Workspace name | Used for | Required outputs |
|----------------|----------|------------------|
| `evolusea-backend-shared-infrastructure` | EB application name | `eb_application_name` |
| `evolusea-backend-shared-<env_name>` (e.g. `evolusea-backend-shared-development`) | VPC / network | `vpc_id`, `vpc_cidr_block`, `igw_id` |

Create these workspaces in [HCP Terraform](https://app.terraform.io/) (org **evolusea**), run the shared-infrastructure Terraform in each so they have state, then in the shared workspace(s) go to **Settings → General → Remote state sharing** and share state with `evolusea-backend-development` (and other env workspaces as needed).

## Setting up new infrastructure

### Shared
1. Go to [shared infrastructure directory](./shared)
2. Run `terraform init` in terminal.
3. Go to [terraform cloud](https://app.terraform.io/), login to your account, and find `evolusea-backend-shared-infrastructure` workspace.
4. Add `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` to environment variables as sensitive.
5. Run `terraform apply` in terminal.

### Environment
1. Go to [environments directory](./environments)
2. Run `terraform workspace new env_name` in terminal. `env_name` should be one of `development`, `staging` or `production`.
3. Go to [terraform cloud](https://app.terraform.io/), login to your account, and find `evolusea-backend-[env_name]` workspace.
4. Add `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` to environment variables as sensitive.
5. Add variable `env_name` and set itvalue to previously choosen enviroment name.
6. Add variable `sentry_dsn` and set its value to dsn url for the project.
7. Add variable `rds_password` as sensitive and set its value to password for the database (remember to generate a strong password).
8. Find `evolusea-backend-shared-infrastructure` workspace and go to settings -> general.
9. Add `evolusea-backend-[env_name]` in `Remote state sharing` section in `Share with selected workspaces:` input.
10. Run `terraform apply` in terminal.

## Change infrastructure

To change infrastructure terraform cloud account with access to organisation where infrastructures state is keep is required.
All infrastructure updates should be performed in terraform code. To apply changes open terminal in corresponding directory ([shared](./shared) or [enviroments](./environments)) and run command `terraform apply`.

## Domain
By default the `dor-dev.org` is used as a base domain. It is registered on [aws' route53](https://docs.aws.amazon.com/route53).
Every enviroment has its own subdomain with name `[app-name]-[env-name]-api.dor-dev.org` and ssl certificate signed by AWS.
By default enviroments are listening only on port 443 (https) and have listiner with port 80 disabled.

### Change base domain
To change base domain the `domain_route53_zone_id` and `domain` variables have to be provided. A ssl certificate will be issued by aws for every new domain.
To change that behaviour or to import existing certificate you can change [ssl certificate terraform file](./environments/ssl_certificate.tf)

