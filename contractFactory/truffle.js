var DefaultBuilder = require("truffle-default-builder");

module.exports = {
  build: new DefaultBuilder({
  }),
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    }
  }
};
