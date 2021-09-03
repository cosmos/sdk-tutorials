# Bridges

## What is a bridge?


<!--TODO -->
https://blog.althea.net/gravity-bridge/ 
Purpose of bridges
Example scenario with a heavy computation

## Gravity Bridge

Gravity bridge - https://github.com/cosmos/gravity-bridge 

## Cosmos Ethereum Bridge

The Cosmos Ethereum bridge is designed to run on the Cosmos Hub focused on maximum design simplicity and efficiency. The bridge
can transfer ERC20 assets originating on Ethereum to a Cosmos based chain and back to Ethereum.

### Design

**Trust in Integrity**

Signing of fraudulent validator set updates and transaction batches meant for the Ethereum contract is punished by slashing on the Cosmos chain. If you trust the Cosmos chain, you can trust the **Gravity bridge** <!--TODO: separate these concepts --> operated by it, as long as it is operated within certain parameters.

It is mandatory for peg zone validators to maintain a trusted Ethereum node. This removes all trust and game theory implications that usually arise from independent relayers, once again dramatically simplifying the design.

### Key Design Components

Verifying the votes of the validator set is the most expensive on chain operation Gravity has to perform. Existing bridges incur more than double the gas costs for signature sets as small as 8 signers. 

### Operational Parameters Ensuring Security:

<!-- TODO: sounds confused -->

The bridge requires a validator set update on the Ethereum contract by calling the updateValset method at least once every Cosmos unbonding period (usually 2 weeks) → reason: if there has not been an update for longer than the unbonding period, the validator set stored by the Ethereum contract could contain validators who cannot be slashed for misbehavior.

Cosmos full nodes do not verify events coming from Ethereum →  events are accepted into the Cosmos state based purely on the signatures of the current validator set. It is possible for the validators with >2/3 of the stake to put events into the Cosmos state which never happened on Ethereum. In this case observers of both chains will need to "raise the alarm". We have built this functionality into the relayer.
