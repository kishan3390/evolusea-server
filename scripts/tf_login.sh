#!/bin/bash

cat <<END > ~/.terraformrc
credentials "app.terraform.io" {
  token = "${TERRAFORM_CLOUD_TOKEN}"
}
END
