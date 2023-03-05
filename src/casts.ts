import { Command } from 'commander';
import { MerkleAPIClient } from '@standard-crypto/farcaster-js';
import { Wallet } from 'ethers';

import { spinnerSuccess, updateSpinnerText } from './spinner';

// init
const mnemonic = process.env.MNEMONIC || 'NOT WORKING AFTER BUILD NEED TO FIX';
console.log('mnem: ', mnemonic);
const wallet = Wallet.fromMnemonic(mnemonic);
const apiClient = new MerkleAPIClient(wallet);

export const casts = new Command('casts');

casts
  .command('get')
  .argument('<fname>', 'the useFarcaster username')
  .action(async (fname) => {
    updateSpinnerText('Searching for user @' + fname);
    const user = await apiClient.lookupUserByUsername(fname);
    if (user === undefined) {
      throw new Error('no user found');
    }
    spinnerSuccess();

    updateSpinnerText('Getting casts for user @' + fname);
    for await (const cast of apiClient.fetchCastsForUser(user)) {
      spinnerSuccess();
      console.table({
        text: cast.text,
      });
    }
  });
