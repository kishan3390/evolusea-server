#!/bin/bash

./scripts/tf_login.sh

yarn install --frozen-lockfile
yarn run generate:metadata
yarn start:dev
