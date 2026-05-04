resource "aws_db_instance" "rds" {
  identifier                = "${local.rds_identifier_prefix}-db"
  allocated_storage         = var.rds_allocated_storage
  max_allocated_storage     = var.rds_max_allocated_storage
  storage_type              = var.rds_storage_type
  engine                    = "postgres"
  engine_version            = var.rds_engine_version
  instance_class            = var.rds_db_instance_class
  db_name                   = local.rds_db_name
  multi_az                  = var.rds_db_multi_az
  apply_immediately         = true
  username                  = local.rds_username
  password                  = var.rds_password
  port                      = var.rds_db_port
  
  publicly_accessible       = false
  backup_retention_period   = var.rds_backup_retention_period
  db_subnet_group_name      = aws_db_subnet_group.postgresql.name
  parameter_group_name      = aws_db_parameter_group.default.name
  final_snapshot_identifier = "${local.rds_identifier_prefix}-${formatdate("YYYY-MM-DD-hh-mm-ss", timestamp())}-final-snapshot"
  snapshot_identifier       = var.rds_snapshot_identifier
  vpc_security_group_ids = [
    aws_security_group.rds.id
  ]

  tags = {
    env = var.env_name
  }
}

resource "aws_db_subnet_group" "postgresql" {
  name       = "${var.env_name}-${var.app_name}-db-subnet-group"
  subnet_ids = [for subnet in aws_subnet.private : subnet.id]
}

resource "aws_db_parameter_group" "default" {
  name   = "${var.env_name}-${var.app_name}-db-parameter-group"
  family = "postgres16"

  parameter {
    name  = "rds.force_ssl"
    value = "0"
  }
}
