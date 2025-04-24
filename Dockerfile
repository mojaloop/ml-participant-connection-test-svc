# Arguments
ARG NODE_VERSION=lts-alpine

# NOTE: Ensure you set NODE_VERSION Build Argument as follows...
#
#  export NODE_VERSION="$(cat .nvmrc)-alpine" \
#  docker build \
#    --build-arg NODE_VERSION=$NODE_VERSION \
#    -t mojaloop/repo-name:local \
#    . \
#

FROM node:${NODE_VERSION} AS builder
WORKDIR /opt/app

RUN apk --no-cache add git
RUN apk add --no-cache -t build-dependencies make gcc g++ python3 py3-setuptools libtool autoconf automake bash \
    && cd $(npm root -g)/npm \
    && npm install -g node-gyp

## Copy basic files for installing dependencies
COPY tsconfig.json package*.json package-lock.json* /opt/app/

RUN npm ci

COPY ./ /opt/app/
RUN npm run build
RUN rm -rf src test
RUN npm prune --production

## *Application*
FROM node:${NODE_VERSION}
WORKDIR /opt/app

# Create a non-root user: ml-user
RUN adduser -D ml-user
USER ml-user

COPY --chown=ml-user --from=builder /opt/app .
RUN npm prune --production

EXPOSE 3080

CMD [ "node" , "./dist/src/cli.js" ]
