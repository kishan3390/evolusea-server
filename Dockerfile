# Development stage
FROM --platform=linux/amd64 node:22.17-bullseye-slim AS workspace
WORKDIR /usr/src/app
RUN yarn global add @nestjs/cli@10.1.18 && \
  mkdir /usr/src/tmp && \
  apt-get update && apt-get install curl unzip musl-dev procps socat -y && \
  ln -s /usr/lib/x86_64-linux-musl/libc.so /lib/libc.musl-x86_64.so.1 && \
  curl https://releases.hashicorp.com/terraform/1.5.7/terraform_1.5.7_linux_amd64.zip --output /usr/src/tmp/terraform.zip && \
  unzip /usr/src/tmp/terraform.zip -d /usr/bin && \
  curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "/usr/src/tmp/awscliv2.zip" && \
  unzip /usr/src/tmp/awscliv2.zip -d /usr/src/tmp && \
  /usr/src/tmp/aws/install && \
  curl "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/ubuntu_64bit/session-manager-plugin.deb" -o "session-manager-plugin.deb" && \
  dpkg -i session-manager-plugin.deb && \
  curl -sL https://sentry.io/get-cli/ | bash && \
  rm -r /usr/src/tmp
COPY package.json ./
COPY yarn.lock ./
RUN yarn install --frozen-lockfile && yarn cache clean --all
COPY . .
RUN yarn build
CMD './development-entrypoint.sh'

# Production stage
FROM --platform=linux/amd64 node:22.17-alpine3.21 AS production
ARG NODE_ENV=production
ARG APP_VERSION
ENV NODE_ENV=${NODE_ENV} \
  SENTRY_RELEASE=${APP_VERSION}
WORKDIR /usr/src/app
COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./
COPY entrypoint.sh ./

COPY ormconfig.ts ./
COPY migrations ./migrations
COPY seeds ./seeds
COPY src ./src
COPY prompts ./prompts
RUN yarn add tsconfig-paths ts-node typescript

RUN yarn install --frozen-lockfile --prod && yarn cache clean --all
RUN mkdir /dist
COPY --from=workspace /usr/src/app/dist ./dist
RUN yarn global add pm2
EXPOSE 3000
CMD './entrypoint.sh'
