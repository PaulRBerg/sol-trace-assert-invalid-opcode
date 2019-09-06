const { CoverageSubprovider } = require("@0x/sol-coverage");
const { ProfilerSubprovider } = require("@0x/sol-profiler");
const { RevertTraceSubprovider, TruffleArtifactAdapter } = require("@0x/sol-trace");
const ProviderEngine = require("web3-provider-engine");
const WebsocketSubprovider = require("web3-provider-engine/subproviders/websocket");
const { toHex, toWei } = require("web3-utils");

const compilerConfig = require("./compiler");

const defaultFromAddress = "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1";
const isVerbose = true;
const coverageSubproviderConfig = {
  isVerbose,
  ignoreFilesGlobs: ["**/Migrations.sol"],
};

const projectRoot = "";
const truffleArtifactAdapter = new TruffleArtifactAdapter(projectRoot, compilerConfig.solcVersion);
const provider = new ProviderEngine();

if (process.env.MODE) {
  switch (process.env.MODE) {
    case "profile":
      global.profilerSubprovider = new ProfilerSubprovider(truffleArtifactAdapter, defaultFromAddress, isVerbose);
      global.profilerSubprovider.stop();
      provider.addProvider(global.profilerSubprovider);
      break;
    case "coverage":
      global.coverageSubprovider = new CoverageSubprovider(
        truffleArtifactAdapter,
        defaultFromAddress,
        coverageSubproviderConfig,
      );
      provider.addProvider(global.coverageSubprovider);
      break;
    case "trace":
      provider.addProvider(new RevertTraceSubprovider(truffleArtifactAdapter, defaultFromAddress, isVerbose));
      break;
    default:
      break;
  }

  provider.addProvider(new WebsocketSubprovider({ rpcUrl: "http://localhost:8545" }));
  provider.start((err) => {
    if (err !== undefined) {
      console.log("provider started with error:", err);
      process.exit(1);
    }
  });
}

/**
 * HACK: Truffle providers should have `send` function, while `ProviderEngine` creates providers with `sendAsync`,
 * but it can be easily fixed by assigning `sendAsync` to `send`.
 */
provider.send = provider.sendAsync.bind(provider);

const truffleOptions = {};
const compilerSettings = { optimizer: {} };

// We do this because we have to disable the optimizer while covering the contracts
if (process.env.MODE) {
  truffleOptions.provider = provider;
  compilerSettings.optimizer.enabled = false;
} else {
  truffleOptions.host = "127.0.0.1";
  compilerSettings.optimizer.enabled = true;
}

module.exports = {
  compilers: {
    solc: {
      version: "0.5.10",
      settings: {
        optimizer: {
          enabled: false,
          runs: 200,
        },
      },
    },
  },
  networks: {
    development: {
      ...truffleOptions,
      gas: 6000000,
      gasPrice: toHex(toWei("1", "gwei")),
      network_id: "*", // eslint-disable-line camelcase
      port: 8545,
      skipDryRun: true,
    },
  },
};
