resource "aws_instance" "bastion_host" {
  ami           = data.aws_ami.amazon-linux-2.id
  key_name      = var.bastion_host_key_pair_name
  instance_type = "t3.nano"
  count = var.is_bastion_host_enabled ? 1 : 0

  associate_public_ip_address = true
  iam_instance_profile        = aws_iam_instance_profile.main.name

  vpc_security_group_ids = [aws_security_group.bastion_host.id]
  subnet_id              = [for subnet in aws_subnet.public : subnet.id][0]
  tags = {
    Name = "${var.app_name}-${var.env_name}-bastion-host"
  }
}

resource "aws_iam_role" "main" {
  name               = "${var.app_name}-${var.env_name}-bastion-host-role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume.json
}

resource "aws_iam_instance_profile" "main" {
  name = "${var.app_name}-${var.env_name}-bastion-host-instance-profile"
  role = aws_iam_role.main.name
}

resource "aws_iam_role_policy_attachment" "bastion_host_ssm_managed_instance_core" {
  role       = aws_iam_role.main.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}
