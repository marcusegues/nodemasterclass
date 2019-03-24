var environments = {};

environments.staging = {
  httpPort: 3000,
  envName: 'staging',
  hashingSecret: 'thisIsASecret',
};

environments.production = {
  httpPort: 5000,
  envName: 'production',
  hashingSecret: 'thisIsAlsoASecret',
};

var currentEnvironment = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';

var environmentToReturn =
  typeof environments[currentEnvironment] === 'object'
    ? environments[currentEnvironment]
    : environments.staging;

module.exports = environmentToReturn;
