resource "aws_iam_instance_profile" "eb_app_ec2_profile" {
  name = "${var.app_name}-${var.env_name}"
  role = aws_iam_role.eb_app_ec2_role.name
}

resource "aws_iam_role" "eb_app_ec2_role" {
  name = "${var.app_name}-${var.env_name}"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_role_policy" "eb_enchanced_health_access" {
  name = "eb_enchanced_health_access"
  role = aws_iam_role.eb_app_ec2_role.name

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ElasticBeanstalkHealthAccess",
      "Action": [
        "elasticbeanstalk:PutInstanceStatistics"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:elasticbeanstalk:*:*:application/*",
        "arn:aws:elasticbeanstalk:*:*:environment/*"
      ]
    }
  ]
}
EOF
}

resource "aws_iam_role_policy" "eb_ecr_access" {
  name = "ecr_access"
  role = aws_iam_role.eb_app_ec2_role.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowEbAuth"
        Effect = "Allow"
        Action = ["ecr:GetAuthorizationToken"]
        Resource = ["*"]
      },
      {
        Sid    = "AllowPull"
        Effect = "Allow"
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:GetRepositoryPolicy",
          "ecr:DescribeRepositories",
          "ecr:ListImages",
          "ecr:BatchGetImage"
        ]
        Resource = [
          "arn:aws:ecr:${var.aws_region}:${data.aws_caller_identity.current.account_id}:repository/evolusea-backend-ecr-repository"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "cloud_watch_full_access" {
  role       = aws_iam_role.eb_app_ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchFullAccess"

}

resource "aws_iam_role_policy" "eb_ssm_parameter_access" {
  name = "eb_ssm_parameter_access"
  role = aws_iam_role.eb_app_ec2_role.name

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "ssm:GetParametersByPath"
        ],
        Resource = "*"
      },
      {
        Effect = "Allow",
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters"
        ],
        Resource = "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter${local.ssm_prefix}/*"
      }
    ]
  })
}

resource "aws_iam_role_policy" "eb_s3_docker_auth_access" {
  name = "s3_docker_auth_access"
  role = aws_iam_role.eb_app_ec2_role.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowS3DockerAuth"
        Effect = "Allow"
        Action = [
          "s3:GetObject"
        ]
        Resource = [
          "arn:aws:s3:::elasticbeanstalk-${var.aws_region}-${data.aws_caller_identity.current.account_id}/docker/*"
        ]
      }
    ]
  })
}
