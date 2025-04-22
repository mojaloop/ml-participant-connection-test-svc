# Ping pong service

[![Git Commit](https://img.shields.io/github/last-commit/mojaloop/ml-jws-health-check-svc.svg?style=flat)](https://github.com/mojaloop/ml-jws-health-check-svc/commits/master)
[![Git Releases](https://img.shields.io/github/release/mojaloop/ml-jws-health-check-svc.svg?style=flat)](https://github.com/mojaloop/ml-jws-health-check-svc/releases)
[![Npm Version](https://img.shields.io/npm/v/@mojaloop/ml-jws-health-check-svc.svg?style=flat)](https://www.npmjs.com/package/@mojaloop/ml-jws-health-check-svc)
[![NPM Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/@mojaloop/ml-jws-health-check-svc.svg?style=flat)](https://www.npmjs.com/package/@mojaloop/ml-jws-health-check-svc)
[![CircleCI](https://circleci.com/gh/mojaloop/ml-jws-health-check-svc.svg?style=svg)](https://circleci.com/gh/mojaloop/ml-jws-health-check-svc)

This service is responsible for validating the mutual TLS (mTLS) setup,
JSON Web Signature (JWS) functionality, and network connectivity with a Mojaloop hub.

It ensures that the necessary security and communication protocols are correctly
configured and operational, which is critical for secure and reliable interactions
with the Mojaloop ecosystem.

## Contributing

Refer to [CONTRIBUTING.md](./CONTRIBUTING.md) for information on how to contribute, committing changes, releases and snapshots.

## Pre-requisites

### Install dependencies

```bash
npm install
```

## Build

Command to transpile Typescript into JS:

```bash
npm run build
```

Command to LIVE transpile Typescript into JS live when any changes are made to the code-base:

```bash
npm run watch
```

## Run

```bash
npm start
```

## Tests

```bash
npm test
```
