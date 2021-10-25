# Bridges

## Cosmos Ethereum Bridge, the Gravity Bridge

Cosmos' Gravity Bridge facilitates transfer of ERC20 tokens to Cosmos-based blockchains, and back. This facilitates novel applications that combine the power of Cosmos with assets from Ethereum. For example, one might wish to use Cosmos for computations that are expensive or impossible to perform with Ethereum smart contracts. These could automated portfolio management solutions. Or, a developer might want to accept Ethereum ERC20 tokens as payment or build an entire Cosmos application around Ethereum tokens. 

## How It Works

The Gravity Bridge consists of several components. 

* **Gravity.sol**: An Ethereum contract on the Ethereum blockchain.
* **Cosmos Gravity module**: A Cosmos module designed to run on the Cosmos Hub.
* **Orachestator**: A program which is run on Cosmos Validators, monitoring the Ethereum chain and submitting events that occur on Ethereum to Cosmos as messages.
* **Relayers**: A network of nodes that compete for the opportunity to earn fees for sending transactions on behalf of the Cosmos Validators.

In summary, tokens are locked on the Ethereum side by sending them to the `Gravity.sol` contract. This emits an event that is observable to Validators running the Orchastrator. When a quorum of Validators agrees that tokens have been locked on Ethereum, including the requisite confirmation blocks, a Relayer is selected to send an intruction to Cosmos Gravity module which issues new tokens. This is non-dilutive meaning it doesn't increase the circulating support because an equal number of tokens is locked on the Ethereum side. 

In the reverse, to return tokens from the Cosmos Hub to the Ethereum blockchain, tokens on the Cosmos network are destroyed and an equal number are released (they were previously deposited) from the `Gravity.sol` contract.

The Cosmos Ethereum bridge is designed to run on the Cosmos Hub focused on maximum design simplicity and efficiency. The bridge
can transfer ERC20 assets originating on Ethereum to a Cosmos based chain and back to Ethereum.

Transactions are batched with transfers netted out. This creates efficiency at scale and lowers the transaction cost for each transfer.

### Design

**Trust in Integrity**

Signing of fraudulent validator set updates and transaction batches meant for the Ethereum contract is punished by slashing on the Cosmos chain. If you trust the Cosmos chain, you can trust the **Gravity bridge** perated by it, as long as it is operated within certain parameters.

It is mandatory for peg zone validators to maintain a trusted Ethereum node. This removes all trust and game theory implications that usually arise from independent relayers, once again dramatically simplifying the design.

### Key Design Components

Verifying the votes of the validator set is the most expensive on chain operation Gravity has to perform. Existing bridges incur more than double the gas costs for signature sets as small as 8 signers. 

### Operational Parameters Ensuring Security:

The bridge requires a validator set update on the Ethereum contract by calling the updateValset method at least once every Cosmos unbonding period (usually 2 weeks) → reason: if there has not been an update for longer than the unbonding period, the validator set stored by the Ethereum contract could contain validators who cannot be slashed for misbehavior.

Cosmos full nodes do not verify events coming from Ethereum →  events are accepted into the Cosmos state based purely on the signatures of the current validator set. It is possible for the validators with >2/3 of the stake to put events into the Cosmos state which never happened on Ethereum. In this case observers of both chains will need to "raise the alarm". We have built this functionality into the relayer.

## Links

Explainer: https://blog.althea.net/gravity-bridge/ 
Cosmos implementation: https://github.com/cosmos/gravity-bridge/

Projects based on Gravity Bridge:

Sommerlier: https://github.com/PeggyJV/gravity-bridge/ 
Althea: https://github.com/althea-net/cosmos-gravity-bridge/
