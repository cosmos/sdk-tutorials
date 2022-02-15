---
title: "Bridges"
order: 15
description: Bridging to other blockchains on different protocols
tag: deep-dive
---

# Bridges

<HighlightBox type="synopsis">

In this section, you will learn more about bridges in the Cosmos ecosystem including the Gravity Bridge that connects Cosmos with Ethereum. Make sure to read the following sections as a preparation:

* [The Cosmos Ecosystem](../1-what-is-cosmos/cosmos-ecosystem.md)
* [Transactions](./transactions.md)
* [Messages](./messages.md)
* [Events](./events.md)
* [IBC](./ibc.md)

</HighlightBox>

## The Gravity Bridge

The [Gravity Bridge](https://gravitybridge.althea.net) is an on-going project currently being built by Althea with the goal to facilitate the transfer of ERC-20 tokens to Cosmos-based blockchains and back. The Gravity Bridge allows for novel applications that combine the power of Cosmos with the value of assets from Ethereum. Developers can use a Cosmos chain for computation that is expensive or impossible to perform with a Ethereum smart contracts. Developers could accept Ethereum ERC-20 tokens as payment or build an entire Cosmos application around Ethereum tokens.

## How it works

The Gravity Bridge consists of several components:

* **`Gravity.sol`.** An Ethereum smart contract on the Ethereum blockchain.
* **Cosmos Gravity module.** A Cosmos module designed to run on the Cosmos Hub.
* **Orchestrator.** A program that runs on Cosmos validators monitoring the Ethereum chain and submitting events that occur on Ethereum to Cosmos as messages.
* **Relayers.** A network of nodes that compete for the opportunity to earn fees for sending transactions on behalf of the Cosmos validators.

Tokens are locked on the Ethereum side by sending them to the `Gravity.sol` smart contract. This emits an event that is observable to validators running the orchestrator. When a quorum of validators agrees that tokens have been locked on Ethereum including the requisite confirmation blocks, a relayer is selected to send an instruction to the Cosmos Gravity module, which issues new tokens. This is non-dilutive - it does not increase the circulating support because an equal number of tokens is locked on the Ethereum side.

To transfer tokens from the Cosmos Hub to the Ethereum blockchain, tokens on the Cosmos network are destroyed and an equal number is released (they were previously deposited) from the `Gravity.sol` smart contract.

The Cosmos Gravity Bridge is designed to run on the Cosmos Hub. It focuses on maximum design simplicity and efficiency. The bridge can transfer ERC-20 assets originating on Ethereum to a Cosmos-based chain and back to Ethereum. Transactions are batched with transfers netted out. This creates efficiency at scale and lowers the transaction cost for each transfer.

### Key design components: trust in integrity

The signing of fraudulent validator set updates and transaction batches meant for the Ethereum smart contract is punished on the Cosmos chain by slashing. If the Cosmos chain is trustworthy, you can trust the Gravity Bridge operated by it as long as it is operated within certain parameters. Bridges to Cosmos chains derive their trustworthiness from the degree of trust associated with the Cosmos chain to which they bridge. Peg-zone validators must maintain a trusted Ethereum node. This is mandatory. This removes all trust and game theory issues that usually arise when involving independent relayers. This once again dramatically simplifies the design.

Verifying the votes of the validator set is the most expensive on-chain operation Gravity has to perform. Existing bridges incur more than double the gas costs for signature sets as small as eight signers.

### Operational parameters ensuring security

The bridge requires a validator set update on the Ethereum smart contract by calling the `updateValset` method at least once every Cosmos unbonding period, usually every two weeks. _Why is this necessary?_ Without an update every unbonding period, the validator set stored by the Ethereum smart contract could contain fraudulent/malicious validators who then cannot be slashed for misbehavior.

Cosmos full nodes do not verify events coming from Ethereum as events are validated into the Cosmos chain's state based purely on the signatures of the current validator set. If validators represent more than 2/3 of the stake, an event could be added to the state even without a corresponding event on Ethereum. In this case, observers of both the Cosmos and Ethereum chains will need to "raise the alarm" on the issue. This functionality is built into the relayer.

<HighlightBox type="tip">

Do you want to dive deeper when it comes to bridges? Here are some helpful resources:

* [Jehan Tremback, Deborah Simpier, and Justin Kilpatrick (2021): Announcing the Cosmos Gravity Bridge](https://blog.althea.net/gravity-bridge/)
* [Cosmos Gravity Bridge documentation](https://github.com/cosmos/gravity-bridge/)
* Projects based on the Gravity Bridge:
	* [Peggy JV Inc.: Gravity Bridge](https://github.com/PeggyJV/gravity-bridge/)
	* [Althea Testnet repository: Gravity Bridge](https://github.com/althea-net/cosmos-gravity-bridge/)

</HighlightBox>

## Next up

You will discover more on running a node in the [next chapter](../3-running-a-chain/index.md) before working on [your own chain](../4-my-own-chain/index.md).
