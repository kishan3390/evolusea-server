locals {
  full_env_domain_name  = "${var.app_name}-${var.env_name}-api.${var.domain}"
  rds_db_name           = var.rds_db_name == "" ? replace(var.app_name, "/[^A-Za-z]/", "") : var.rds_db_name
  rds_username          = var.rds_username == "" ? replace(var.app_name, "/[^A-Za-z]/", "") : var.rds_username
  rds_identifier_prefix = "${var.env_name}-${var.app_name}"
  availability_zones    = slice(data.aws_availability_zones.current.names, 0, 2)
  public_subnets_cidrs = [
    "${cidrsubnet(var.vpc_cidr, 8, 0)}",
    "${cidrsubnet(var.vpc_cidr, 8, 1)}",
  ]
  private_subnets_cidrs = [
    "${cidrsubnet(var.vpc_cidr, 8, 2)}",
    "${cidrsubnet(var.vpc_cidr, 8, 3)}",
  ]

  # Auto Scaling SETTINGS
  development_scaling_settings = [
    {
      namespace = "aws:autoscaling:asg"
      name      = "MinSize"
      value     = "1"
    },
    {
      namespace = "aws:autoscaling:asg"
      name      = "MaxSize"
      value     = "1"
    }
  ]

  staging_scaling_settings = [
    {
      namespace = "aws:autoscaling:asg"
      name      = "MinSize"
      value     = "1"
    },
    {
      namespace = "aws:autoscaling:asg"
      name      = "MaxSize"
      value     = "1"
    }
  ]

  production_scaling_settings = [
    {
      namespace = "aws:autoscaling:asg"
      name      = "MinSize"
      value     = "1"
    },
    {
      namespace = "aws:autoscaling:asg"
      name      = "MaxSize"
      value     = "2"
    },
    {
      namespace = "aws:autoscaling:trigger"
      name      = "MeasureName"
      value     = "CPUUtilization"
    },
    {
      namespace = "aws:autoscaling:trigger"
      name      = "Statistic"
      value     = "Average"
    },
    {
      namespace = "aws:autoscaling:trigger"
      name      = "Unit"
      value     = "Percent"
    },
    {
      namespace = "aws:autoscaling:trigger"
      name      = "UpperThreshold"
      value     = "70"
    },
    {
      namespace = "aws:autoscaling:trigger"
      name      = "LowerThreshold"
      value     = "40"
    },
    {
      namespace = "aws:autoscaling:trigger"
      name      = "EvaluationPeriods"
      value     = "2"
    },
    {
      namespace = "aws:autoscaling:trigger"
      name      = "Period"
      value     = "60"
    },
    {
      namespace = "aws:autoscaling:trigger"
      name      = "BreachDuration"
      value     = "120"
    },
    {
      namespace = "aws:autoscaling:trigger"
      name      = "UpperBreachScaleIncrement"
      value     = "1"
    },
    {
      namespace = "aws:autoscaling:trigger"
      name      = "LowerBreachScaleIncrement"
      value     = "-1"
    }
  ]

  active_scaling_settings = (
    var.env_name == "production"
    ? local.production_scaling_settings
    : var.env_name == "staging"
    ? local.staging_scaling_settings
    : local.development_scaling_settings
  )

  ssm_prefix = "/ebs/${var.app_name}/${var.env_name}"
}
