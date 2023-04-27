#!/usr/bin/env node
import { Command } from 'commander';
import { MerkleAPIClient } from '@standard-crypto/farcaster-js';
import { Wallet } from 'ethers';

import {
  spinnerSuccess,
  updateSpinnerText,
  spinnerError,
  stopSpinner,
} from './spinner';

// date setup
const SAME_DATE = 'same date';
const BEFORE = 'before';
const AFTER = 'after';

// Farcaster setup
const mnemonic = process.env.MNEMONIC || '';
const wallet = Wallet.fromMnemonic(mnemonic);
const apiClient = new MerkleAPIClient(wallet);
const FNAME = process.env.FNAME || 'taro';
const FLING_SYMBOL = '⌆';
const FLING_STARTER = `${FLING_SYMBOL}\n`;

// Commander.js setup
const program = new Command();
program.name('fling');
program.description('⌆ Fling - how did your day go?');
program.version('0.0.2');
program.option('-m, --message <message>', 'message to fling');
program.action(async (message) => {
  if (!message.message) {
    console.log(
      "You didn't provide a message to fling! Try running 'fling --help'!",
    );
  } else if (message.message.length > 315) {
    console.log('Your message is too long! Try again with a shorter message!');
  } else {
    await sendCast(message.message);
  }
});

process.on('unhandledRejection', function (err: Error) {
  const debug = program.opts().verbose;
  if (debug) {
    console.error(err.stack);
  }
  spinnerError();
  stopSpinner();
  program.error('', { exitCode: 1 });
});

async function main() {
  await program.parseAsync();
}

main();

async function sendCast(flingcast: string) {
  // check if today's cast exists
  const today_ts = new Date().getTime() / 1000;

  updateSpinnerText('Searching for user @' + FNAME);
  const user = await apiClient.lookupUserByUsername(FNAME);
  if (user === undefined) {
    throw new Error('no user found');
  }
  spinnerSuccess();
  updateSpinnerText('Getting casts for user @' + FNAME);

  let should_stop_searching = false;
  let dateComparison = '';

  for await (const cast of apiClient.fetchCastsForUser(user)) {
    const current_cast = cast;
    spinnerSuccess();
    dateComparison = compareDates(cast.timestamp / 1000, today_ts);
    switch (dateComparison) {
      case SAME_DATE:
        // same date and we already flung
        if (current_cast.text[0] === FLING_SYMBOL) {
          should_stop_searching = true;
          updateSpinnerText("Updating today's fling");
          await apiClient.publishCast(flingcast, current_cast);
          spinnerSuccess();
        }
        break;
      case BEFORE: // already past today's day, so we should post our first fling
        should_stop_searching = true;
        updateSpinnerText("Creating today's fling");
        await apiClient.publishCast(`${FLING_STARTER}${flingcast}`);
        spinnerSuccess();
        break;
      case AFTER: // probably should never happen
        console.log('after');
        break;
    }

    if (should_stop_searching) {
      break;
    }
  }
  // handle case where newly created account tries to fling on their first day
  if (!should_stop_searching && dateComparison === SAME_DATE) {
    updateSpinnerText("Creating today's fling");
    await apiClient.publishCast(`${FLING_STARTER}${flingcast}`);
    spinnerSuccess();
  }
}

function compareDates(timestamp1: number, timestamp2: number): string {
  const date1 = new Date(timestamp1 * 1000);
  const date2 = new Date(timestamp2 * 1000);

  if (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  ) {
    return SAME_DATE;
  }

  return date1 < date2 ? BEFORE : AFTER;
}
