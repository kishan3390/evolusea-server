resource "aws_route53_record" "api_domain" {
  zone_id = var.domain_route53_zone_id
  name    = local.full_env_domain_name
  type    = "CNAME"
  ttl     = 300
  records = [aws_elastic_beanstalk_environment.eb_env.cname]
}
