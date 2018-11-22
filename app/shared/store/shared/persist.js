import { createMigrate } from 'redux-persist';
import createElectronStorage from 'redux-persist-electron-storage';

const migrations = {
  /*
    2 - Wallet Migration

      - Creating a new `wallets` parameter that contains all wallets you can swap between.
      - Migrating the `walletMode` from the settings/current wallet into each individual wallet.

  */
  2: (state) => {
    const {
      settings,
      wallet
    } = state;
    // Create a copy of the existing wallet
    const existingWallet = Object.assign({}, wallet);
    // Replicate the wallet account and mode from settings onto the wallet
    existingWallet.account = settings.account;
    existingWallet.mode = settings.walletMode;
    // Update this individual wallets version
    existingWallet.version = 2;
    return {
      // Update the existing settings + wallet state
      settings: state.settings,
      wallet: existingWallet,
      // Create the new wallets state and inject the first wallet
      wallets: [existingWallet]
    };
  },
  /*
    3 - Wallet Migration

      - Ensure the customTokens field is set with the base token 
        contract. Will set base token dynamically based on selected blockchain
      - Configure default blockchains

  */
  3: (state) => {
    const {
      settings
    } = state;
    const newSettings = Object.assign({}, settings);
    if (
      !newSettings.customTokens
      || !newSettings.customTokens.length
    ) {
      newSettings.customTokens = ['eosio.token:'];
    }
    if (
      newSettings.customTokens
      && newSettings.customTokens.indexOf('eosio.token:') === -1
    ) {
      newSettings.customTokens.push('eosio.token:');
    }
    return Object.assign({}, state, {
      settings: newSettings
    });
  },
  /*
  4 - Wallet Migration

    - Correct format of all customTokens

  */
  4: (state) => {
    const {
      settings
    } = state;
    const newSettings = Object.assign({}, settings);
    if (
      newSettings.customTokens
      && newSettings.customTokens.length > 0
    ) {
      newSettings.customTokens.forEach((token, idx) => {
        const [contract, symbol] = token.split(':');
        newSettings.customTokens[idx] = [contract.toLowerCase(), symbol.toUpperCase()].join(':');
      });
    }
    return Object.assign({}, state, {
      settings: newSettings
    });
  },
  /*
  5 - Settings Migration

    - Add recentContracts array to existing settings

  */
  5: (state) => {
    const {
      settings
    } = state;
    const newSettings = Object.assign({}, settings);
    if (
      !newSettings.recentContracts
    ) {
      newSettings.recentContracts = [];
    }
    return Object.assign({}, state, {
      settings: newSettings
    });
  },
  /*
  6 - Settings Migration

    - Add contacts array to existing settings
    - Add recentProposalsScopes array to existing settings

  */
  6: (state) => {
    const {
      settings
    } = state;
    const newSettings = Object.assign({}, settings);
    if (
      !newSettings.recentProposalsScopes
    ) {
      newSettings.recentProposalsScopes = [];
    }
    if (
      !newSettings.contacts
    ) {
      newSettings.contacts = [];
    }
    return Object.assign({}, state, {
      settings: newSettings
    });
  },
  /*
    7 - Chain Migration

      - Support for multi blockchains

  */
  7: (state) => {
    const {
      settings
    } = state;
    const newSettings = Object.assign({}, settings);
    if (
      !newSettings.blockchains
      || !newSettings.blockchains.length
    ) {
      newSettings.blockchains = [
        {
          blockchain:'Telos StageNet', 
          tokenSymbol:'TLOS',
          node:'http://testnet.eos.miami:8888',
          chainId: 'd2954ab81fa1e45f244feb4287ae4db46607989034d7adbfdcd94e8cd50eada2'
        },
        {
          blockchain:'Telos Testnet', 
          tokenSymbol:'TLOS',
          node:'https://api.eos.miami:17441',
          chainId: '335e60379729c982a6f04adeaad166234f7bf5bf1191252b8941783559aec33e'
        },
        {
          blockchain:'EOS Mainnet', 
          tokenSymbol:'EOS',
          node:'https://eos.greymass.com',
          chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906'
        },
        {
          blockchain:'Jungle Testnet',
          tokenSymbol:'EOS',
          node:'http://jungle.cryptolions.io:18888',
          chainId:'038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca'
        },
        {
          blockchain:'EOSForce Testnet',
          tokenSymbol:'EOS',
          node:'https://w1.eosforce.cn',
          chainId:'bd61ae3a031e8ef2f97ee3b0e62776d6d30d4833c8f7c1645c657b149151004b'
        }
      ];
    }
    return Object.assign({}, state, {
      settings: newSettings
    });
  }
};

const persistConfig = {
  key: 'Sqrl-config',
  version: 7,
  migrate: createMigrate(migrations, { debug: true }),
  storage: createElectronStorage(),
  whitelist: [
    'settings',
    'wallet',
    'wallets'
  ]
};

export default persistConfig;
