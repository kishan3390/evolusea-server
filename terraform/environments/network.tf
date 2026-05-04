resource "aws_subnet" "public" {
  for_each = toset(local.availability_zones)

  vpc_id            = data.terraform_remote_state.backend_shared.outputs.vpc_id
  availability_zone = each.key
  cidr_block        = local.public_subnets_cidrs[index(local.availability_zones, each.key)]

  tags = {
    Name = "${var.app_name}-${var.env_name}-public-${substr(each.key, -2, 2)}"
  }
}

resource "aws_subnet" "private" {
  for_each = toset(local.availability_zones)

  vpc_id            = data.terraform_remote_state.backend_shared.outputs.vpc_id
  availability_zone = each.key
  cidr_block        = local.private_subnets_cidrs[index(local.availability_zones, each.key)]

  tags = {
    Name = "${var.app_name}-${var.env_name}-private-${substr(each.key, -2, 2)}"
  }
}

resource "aws_security_group" "eb" {
  name   = "${var.app_name}-${var.env_name}-sg-eb"
  vpc_id = data.terraform_remote_state.backend_shared.outputs.vpc_id


  tags = {
    Name = "${var.app_name}-${var.env_name}-sg-eb"
  }
}

resource "aws_vpc_security_group_ingress_rule" "allow_https" {
  security_group_id = aws_security_group.eb.id
  cidr_ipv4         = data.terraform_remote_state.backend_shared.outputs.vpc_cidr_block
  from_port         = 443
  ip_protocol       = "tcp"
  to_port           = 443
}

resource "aws_vpc_security_group_egress_rule" "allow_all_traffic" {
  security_group_id = aws_security_group.eb.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}

resource "aws_security_group" "rds" {
  name   = "${var.app_name}-${var.env_name}-sg-rds"
  vpc_id = data.terraform_remote_state.backend_shared.outputs.vpc_id


  tags = {
    Name = "${var.app_name}-${var.env_name}-sg-rds"
  }
}

resource "aws_security_group_rule" "eb_db_access" {
  type              = "ingress"
  description       = "${var.env_name}-${var.app_name} eb env db access"
  protocol          = "tcp"
  from_port         = var.rds_db_port
  to_port           = var.rds_db_port
  security_group_id = aws_security_group.rds.id
  cidr_blocks       = [for subnet in aws_subnet.public : subnet.cidr_block]
}

resource "aws_security_group" "bastion_host" {
  name        = "${var.app_name}-${var.env_name}-sg-bastion-host"
  description = "Allow SSH for all"
  vpc_id      = data.terraform_remote_state.backend_shared.outputs.vpc_id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app_name} ${var.env_name} allow SSH from all outside world (for bastion host)"
  }
}

resource "aws_security_group_rule" "ingress_self" {
  security_group_id = aws_security_group.bastion_host.id
  type              = "ingress"

  from_port = 0
  to_port   = 0
  protocol  = "-1"

  self = true
}

resource "aws_route_table" "public" {
  vpc_id = data.terraform_remote_state.backend_shared.outputs.vpc_id

  tags = {
    Name = "${var.app_name}-${var.env_name}-public-rt"
  }
}

resource "aws_route_table_association" "public" {
  for_each = toset(local.availability_zones)

  subnet_id      = aws_subnet.public[each.key].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route" "public_internet_gateway" {
  route_table_id         = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = data.terraform_remote_state.backend_shared.outputs.igw_id
}
