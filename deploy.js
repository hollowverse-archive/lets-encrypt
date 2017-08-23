#! /bin/node

const shelljs = require('shelljs');
const decryptSecrets = require('@hollowverse/common/helpers/decryptSecrets');
const executeCommands = require('@hollowverse/common/helpers/executeCommands');
const retryCommand = require('@hollowverse/common/helpers/retryCommand');
const writeEnvFile = require('@hollowverse/common/helpers/writeEnvFile');

const { ENC_PASS_LETS_ENCRYPT, ENC_PASS_TRAVIS, PROJECT, BRANCH } = shelljs.env;

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
    console.info('Not on master branch. Nothing to do.');
    process.exit(0);
  }

  const code = await executeCommands([
    () => writeEnvFile('lets-encrypt', shelljs.env, './env.json'),
    () => decryptSecrets(secrets, './secrets'),
    `gcloud auth activate-service-account --key-file secrets/gcloud.travis.json`,
    // Remove Travis key file so it does not get deployed with the service
    () => {
      shelljs.rm('./secrets/gcloud.travis.json*');
      return 0;
    },
    () =>
      retryCommand(
        `gcloud app deploy app.yaml --project ${PROJECT} --version ${BRANCH} --quiet`,
      ),
  ]);

  process.exit(code);
}

main();
