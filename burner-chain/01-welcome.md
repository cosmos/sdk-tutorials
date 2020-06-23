---
order: 1
---

# Welcome

This tutorial was first presented as a workshop at [Eth Denver Hackathon 2020](https://www.ethdenver.com) by [Billy Rennekamp](https://twitter.com/billyrennekamp). {synopsis}

**Welcome to the first official Cosmos Burner Chain!** Following in the tradition of the Burner Wallet project (and other temporary low-security chains) we've built and launched a game chain to be used for the duration of the [Eth Denver Hackathon 2020](https://www.ethdenver.com). The goal of this chain is to provide a blueprint for your own application specific blockchain that interacts with other EVM based networks like Ethereum and xDai.

The Cosmos Burner Chain consists of a few moving pieces. The first of which is the [Cosmos SDK](https://docs.cosmos.network/) itself. This is a framework, much like Ruby-on-Rails, for building application specific blockchains. It comes with a set of standard modules that handles a common set of features: [Bank](https://docs.cosmos.network/master/modules/bank/) (Fungible Tokens like ERC-20), [Auth](https://docs.cosmos.network/master/modules/auth/) (Accounts secured by public key cryptography), [Staking](https://docs.cosmos.network/master/modules/staking/) + [Slashing](https://docs.cosmos.network/master/modules/slashing/) (together these modules handle a proof of stake validator set utilizing Tendermint Consensus with slashing conditions for equivocation and downtime) as well as [Params](https://docs.cosmos.network/master/modules/params/) (live updates to the chain) and [Gov](https://docs.cosmos.network/master/modules/gov/) (a governance module that can be used for text proposals, param changes and directing a community pool of funds) and a few others for lower level tasks.

Out of the core SDK modules, our Burner Chain uses Bank, Auth, Staking and Slashing. Outside of the standard fare it also uses [Peggy](https://github.com/cosmos/peggy), a new Module that was developed by [Swish Labs](https://www.swishlabs.com/) with support from the [Intechain Foundation](https://interchain.io). This module is essentially a bridge between EVM chains like Ethereum and [xDai](https://www.xdaichain.com/). Peggy is used to transport Fungible Tokens but could be extended to transfer NFTs as well as arbitrary messages. The final piece of our chain is the [Scavenge Module](https://tutorials.cosmos.network/scavenge/tutorial/01-background.html), which is part of the sdk-tutorials repo. This module allows you to post a riddle with a bounty for whoever can solve it.

In summary the pieces that are included are:

* [Bank](https://docs.cosmos.network/master/modules/bank/)
* [Auth](https://docs.cosmos.network/master/modules/auth/)
* [Staking](https://docs.cosmos.network/master/modules/staking/)
* [Slashing](https://docs.cosmos.network/master/modules/slashing/)
* [Peggy](https://github.com/cosmos/peggy)
* [Scavenge](https://tutorials.cosmos.network/scavenge/tutorial/01-background.html)