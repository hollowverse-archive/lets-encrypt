#! /bin/node

const shelljs = require('shelljs');
const fs = require('fs');
const path = require('path');
const decryptSecrets = require('@hollowverse/common-config/helpers/decryptSecrets');
const executeCommands = require('@hollowverse/common-config/helpers/executeCommands');
const retryCommand = require('@hollowverse/common-config/helpers/retryCommand');
const writeEnvFile = require('@hollowverse/common-config/helpers/writeEnvFile');

const {
  ENC_PASS_LETS_ENCRYPT,
  ENC_PASS_TRAVIS,
  PROJECT,
  BRANCH,
} = shelljs.env;

const secrets = [
  {
    password: ENC_PASS_LETS_ENCRYPT,
    decryptedFilename: 'gcloud.letsEncrypt.json',
  },
  {
    password: ENC_PASS_TRAVIS,
    decryptedFilename: 'gcloud.travis.json',
  },
 ];

async function main() {
  if (BRANCH !== 'master') {
    process.exit(0);
  }

  const code = await executeCommands([
    () => writeEnvFile('lets-encrypt', shelljs.env, './env.json'),
    () => decryptSecrets(secrets, './secrets'),
    `gcloud auth activate-service-account --key-file secrets/gcloud.travis.json`,
    () => retryCommand(`gcloud app deploy app.yaml --project ${PROJECT} --version ${BRANCH} --quiet`),
  ]);

  process.exit(code);
}

main();
