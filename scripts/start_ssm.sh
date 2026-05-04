if [ -z "$1" ]; then
  env_name="development"
elif [ "$1" = "development" ] || [ "$1" = "staging" ] || [ "$1" = "production" ]; then
  env_name=$1
else
  echo "Invalid environment name. Please use 'development', 'staging' or 'production'."
  exit 1
fi

local_port_number="5433"
bastion_host_name="$APP_NAME-$env_name-bastion-host"
db_instance_identifier="$env_name-$APP_NAME-db"

bastion_instance_id=$(aws ec2 describe-instances \
  --query "Reservations[].Instances[].InstanceId" \
  --filters "Name=tag:Name,Values=$bastion_host_name" \
)

db_endpoint=$(aws rds describe-db-instances --db-instance-identifier $db_instance_identifier --query "DBInstances[0].Endpoint")
db_endpoint_address=$(echo $db_endpoint | cut -d' ' -f1)
db_endpoint_port=$(echo $db_endpoint | cut -d' ' -f3)

echo Bastion Host Name: $bastion_host_name
echo Bastion Host ID: $bastion_instance_id
echo DB Endpoint Address: $db_endpoint_address
echo DB Endpoint Port: $db_endpoint_port
echo Local Port Number: $local_port_number

# https://stackoverflow.com/questions/40383804/how-to-expose-a-service-running-inside-a-docker-container-bound-to-localhost
# This command will allow to connect through ssm session from different containers like the pg admin container. 
# By default ssm session will only allow to connect from the machine where the ssm session was started.
socat TCP4-LISTEN:$local_port_number,bind=`hostname -I | tr -d '[:space:]'`,fork TCP4:localhost:$local_port_number &

aws ssm start-session \
  --region eu-central-1 \
  --target $bastion_instance_id \
  --document-name AWS-StartPortForwardingSessionToRemoteHost \
  --parameters host=$db_endpoint_address,portNumber=$db_endpoint_port,localPortNumber=$local_port_number
