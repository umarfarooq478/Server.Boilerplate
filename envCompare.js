const fs = require('fs');

function areEnvFilesEqual(envPath, sampleEnvPath) {
  const envData = fs.readFileSync(envPath, 'utf-8').split('\n');
  const sampleEnvData = fs.readFileSync(sampleEnvPath, 'utf-8').split('\n');

  const envVariableNames = getVariableNames(envData);
  const sampleEnvVariableNames = getVariableNames(sampleEnvData);

  const missingVariables = envVariableNames.filter(
    (variable) => !sampleEnvVariableNames.includes(variable)
  );

  const differentVariables = sampleEnvVariableNames.filter(
    (variable) => !envVariableNames.includes(variable)
  );

  console.log("Variables not present in sample.env: ",missingVariables);
  console.log("Variables not present in .env: ",differentVariables);
  if (missingVariables.length > 0 || differentVariables.length > 0) {
    console.error('Please make sure that your sample.env and .env have same variables. Aborting commit.');
    process.exit(1); // Exit with a non-zero status code to indicate failure
  }
}

function getVariableNames(envData) {
  return envData
    .map((line) => line.trim())
    .filter((line) => line !== '' && !line.startsWith('#'))
    .map((line) => line.split('=')[0].trim());
}

const envPath = '.env';
const sampleEnvPath = 'sample.env';

areEnvFilesEqual(envPath, sampleEnvPath);
