#!/bin/bash
set -e

env=""
aws_region=""
ecr_image_tag=""
aws_eb_app_name=""

while getopts e:t:r:n: flag
do
  case "${flag}" in
    r) aws_region=${OPTARG};;
    e) env=${OPTARG};;
    t) ecr_image_tag=${OPTARG};;
    n) aws_eb_app_name=${OPTARG};;
  esac
done

if [ -z "$aws_region" ] || [ -z "$env" ] || [ -z "$ecr_image_tag" ] || [ -z "$aws_eb_app_name" ]
then
  echo "All parameters required (-r -e -t -n)"
  exit 1
fi

if [[ "$env" != "development" && "$env" != "staging" && "$env" != "production" ]]
then
  echo "Invalid env: $env"
  exit 1
fi

aws_eb_env_name="$aws_eb_app_name-$env"
version=$(echo "$ecr_image_tag" | cut -d: -f2)

echo "--------------------------------------------------------------------------------"
echo "Settings:"
echo "* env: $env"
echo "* aws_eb_app_name: $aws_eb_app_name"
echo "* aws_eb_env_name: $aws_eb_env_name"
echo "* aws_region: $aws_region"
echo "* ecr_image_tag: $ecr_image_tag"
echo "* version: $version"
echo "--------------------------------------------------------------------------------"

DEPLOY_WORK_DIR="$(mktemp -d)"
echo "Temp dir: $DEPLOY_WORK_DIR"

# Extract ECR registry from image tag
ecr_registry=$(echo "$ecr_image_tag" | cut -d'/' -f1)

# -------------------------------
# Dockerrun.aws.json
# -------------------------------
cat <<EOF > "$DEPLOY_WORK_DIR/Dockerrun.aws.json"
{
  "AWSEBDockerrunVersion": "1",
  "Image": {
    "Name": "$ecr_image_tag",
    "Update": "true"
  },
  "Ports": [
    {
      "ContainerPort": 3000
    }
  ],
  "Logging": "/var/log"
}
EOF

# -------------------------------
# ECR LOGIN (runs BEFORE docker pull)
# -------------------------------
mkdir -p "$DEPLOY_WORK_DIR/.platform/hooks/prebuild"

cat <<EOF > "$DEPLOY_WORK_DIR/.platform/hooks/prebuild/01_ecr_login.sh"
#!/bin/bash
set -e
echo "Logging in to ECR..."
aws ecr get-login-password --region $aws_region \
  | docker login --username AWS --password-stdin $ecr_registry
EOF

chmod +x "$DEPLOY_WORK_DIR/.platform/hooks/prebuild/01_ecr_login.sh"

# -------------------------------
# Elastic Beanstalk config
# -------------------------------
mkdir -p "$DEPLOY_WORK_DIR/.elasticbeanstalk"

cat <<EOF > "$DEPLOY_WORK_DIR/.elasticbeanstalk/config.yml"
global:
  application_name: $aws_eb_app_name
  default_region: $aws_region
  workspace_type: Application
deploy:
  artifact: app.zip
EOF

# -------------------------------
# Package & Deploy
# -------------------------------
cd "$DEPLOY_WORK_DIR"
zip -r app.zip Dockerrun.aws.json .platform

echo "--------------------------------------------------------------------------------"
echo "Deploying to Elastic Beanstalk..."
eb deploy "$aws_eb_env_name" --region "$aws_region" --label "$version"