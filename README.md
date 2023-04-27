# fling ⌆

fling (and retrieve) your daily logs with Farcaster. [Read more about the fling pattern](https://gist.github.com/whatrocks/b4b7c306b307c3c707f0d6256fe9afb0).

## Setup

```bash
npm install -g fling-cli
```

This is a demo CLI tool, do not expect perfection!

For example, "signing in" to your Farcaster account is fairly hacky right now with this tool. Current implementation assumes two environment variables in your local shell: `MNEMONIC` and `FNAME`. 

You *could* add these to your bash_profile directly (probably not advised, in case you keep your dotfiles in a public repo!), but what I've done is create a new file in my home directory called `.fling` that looks like this:

```bash
export MNEMONIC="twelve words go here"
export FNAME="my_farcaster_username"
```

And then I've updated my .bash_profile to source that file:

```bash
source ~/.fling
```

Just don't check in your .fling file to your dotfiles repo. Also, please submit a PR to improve this setup, please!

## Usage

```bash
$ fling -m "* shipped basic web view for fling data"
```

Some time later that day:

```bash
$ fling -m $'* cli pushed to npm\n* sent proposal to first beta testers'
```

That's it! Your flings should show up in any Farcaster client, or you can try specific clients tuned just for the fling pattern, such as [this demo web client](https://whatrocks.github.io/fling-web).


## Updating NPM package

```bash
npm run release
```