---
title: "IBC Migration"
order: 
description: 
tag: deep-dive
---

# IBC Migration

When working with IBC, it is important to be able to upgrade IBC chains and clients. IBC-connected chains and counterparty clients must also be able to perform IBC upgrades to prevent failures of cross-chain communication, or even of all communication. This is of importance for all developers working with Tendermint clients enabling upgrades.

The **IBC module** serves several different user groups, such as:

* Chain operators
* Relayer developers and operators 
* IBC application and light client developers

Each of these stakeholders has different expectations when it comes to **backward compatibility**. For example, the (IBC protocol specifications)[https://github.com/cosmos/ibc] and (IBC Go)[ibc-go] both maintain different versions, and changes can be backward or non-backward compatible for different users.

<HighlightBox type="info">

There is an effort to ensure that all IBC Go releases do not hinder successful chain communication. Therefore, all IBC Go releases use IBC protocol specification v1.0.

</HighlightBox>

All **IBC module releases** allow chains to communicate successfully with any chain running any version of the code. It is ensured that all major releases are supported by relayers so that they can relay between the new major release and older releases. Currently, an IBC protocol specification v2.0 upgrade is not planned because this would be very disruptive to the ecosystem.

## Upgrading IBC clients - client breaking upgrades

When an upgrade will break IBC counterparty clients, IBC-connected chains **must** perform an IBC upgrade. The IBC protocol supports upgrading Tendermint chains for a specific subset of **IBC-client-breaking upgrades** but **does not support unplanned upgrades**.

<HighlightBox type="info">

To not be an **unplanned upgrade** and be supported, an upgrade needs to be committed in advance to the upgrading chain. This way the counterparty clients can maintain a secure connection.

</HighlightBox>

On Tendermint chains, an upgrade is implemented for Tendermint clients, which could break the counterparty IBC Tendermint clients. Here is an exhaustive list of **IBC client-breaking upgrades** which notes whether the IBC protocol currently supports the upgrades:

* **Changing the Chain-ID: supported**.
* **Changing the `UnbondingPeriod`: partially supported**. Chains may *increase* the unbonding period with no issues. Be mindful that *decreasing* the unbonding period may irreversibly break some counterparty clients, so it is not recommended that chains reduce the unbonding period.
* **Changing the height (resetting to 0): supported**, as long as chains remember to increment the revision number in their `chain-id`.
* **Changing the `ProofSpecs`: supported**. If the proof structure required to verify IBC proofs is changed across the upgrade, ProofSpecs should be changed. For example, this is the case when you switch from an [IAVL](https://github.com/cosmos/iavl/blob/master/docs/overview.md) store to a `SimpleTree` store.
* **Changing the `UpgradePath`: supported**. This might include a change of the key under which upgraded clients and consensus states are stored in the `x/upgrade`'s store, or even a migration of the `x/upgrade`'s store itself.
* **Migrating the IBC store: unsupported**, because the IBC store location is negotiated by the connection.
* **Upgrading to a backward compatible version of IBC: supported**.
* **Upgrading to a non-backward compatible version of IBC: unsupported**, because the IBC version is negotiated on connection handshakes.
* **Changing the Tendermint Light Client algorithm: partially Supported**. Changes to the light client algorithm that do not change the `ClientState` or `ConsensusState` structs are sometimes supported, provided the counterparty is also upgraded to support the new light client algorithm. Changes requiring an update of the `ClientState` and `'ConsensusState` structs are theoretically possible, by providing a path to translate an older `ClientState` struct into the new `ClientState` struct. This is however not currently implemented.

<HighlightBox type="note">

Since upgrades are only implemented for Tendermint clients, this list only discusses upgrades on Tendermint chains that would break counterparty IBC Tendermint Clients.

</HighlightBox>

When you have an IBC-connected chain conducting an upgrade that includes changes breaking counterparty clients, you must:

1. Ensure IBC support for the upgrade: you can use the previous list for this.
2. Execute the following upgrade process to prevent counterparty clients from breaking:

* Create an `UpgradeProposal` with an IBC `ClientState` in the `UpgradedClientState` field and an `UpgradePlan` in the `Plan` field.

<HighlightBox type="note">

The proposal `Plan` must only specify an upgrade height and no upgrade time. Also, the `ClientState` should only include fields common to all valid clients and zero out any client-customizable fields such as `TrustingPeriod`.

</HighlightBox>

* Vote on and pass the `UpgradeProposal`: When the `UpgradeProposal` passes, the upgrade module will commit the `UpgradedClient` under the key `upgrade/UpgradedIBCState/{upgradeHeight}/upgradedClient`. On the block before the upgrade height, the upgrade module will also commit an initial consensus state for the next chain under the key `upgrade/UpgradedIBCState/{upgradeHeight}/upgradedConsState`.

>Once the chain reaches the upgrade height and halts, a relayer can upgrade the counterparty clients to the last block of the old chain. The relayer can then submit the proofs for the `UpgradedClient` and `UpgradedConsensusState` against this last block and upgrade the counterparty client.

## Upgrading counterparty clients with relayers

Once a chain commits to upgrade, relayers must wait for the chain to halt at the upgrade height before they upgrade the counterparty clients, as chains may reschedule or cancel upgrade plans before being realized. Thus, relayers have to wait for the chain to reach the upgrade height and halt to know if an upgrade will happen.

For this reason, the upgrade process for relayers trying to upgrade the counterparty clients is:

1. Wait for the upgrading chain to reach the upgrade height and halt.
2. Query a full node for proofs of `UpgradedClient` and `UpgradedConsensusState` at the last height of the old chain.
3. Update the counterparty client to the last height of the old chain using the `UpdateClient` message.
4. Submit an `UpgradeClient` message to the counterparty chain with `UpgradedClient`, `UpgradedConsensusState`, and their respective proofs.
5. Submit an `UpdateClient` message to the counterparty chain with a header from the upgraded chain.

The Tendermint client on the counterparty chain verifies that the upgrading chain did indeed commit to the upgraded client and upgraded consensus state at the upgrade height - since the upgrade height is included in the key.

If the proofs can be verified against the upgrade height, the client will upgrade to the new client while retaining all of the client-customized fields. Thus, it will retain the old `TrustingPeriod`, `TrustLevel`, `MaxClockDrift`, etc., while adopting new chain-specified fields such as `UnbondingPeriod`, `ChainId`, `UpgradePath`, etc.

<HighlightBox type="note">

This can lead to an invalid client when the old client-chosen fields are no longer valid given the new chain-chosen fields. When you upgrade chains, you should try to avoid situations like this by not altering parameters that can break old clients.

</HighlightBox>

The upgraded consensus state serves purely as a basis of trust for future `UpdateClientMsgs`. It does not contain a consensus root to perform proof-verification against. For this reason, relayers must submit a `UpdateClientMsg` with a header from the new chain so that the connection can be used for proof verification.

<HighlightBox type="tip">

Look at the [Relayer section](./relayerintro.md) to find out how to get started with the Hermes relayer. Then you can go ahead and [test a client update with Hermes](https://hermes.informal.systems/commands/upgrade/test.html).

</HighlightBox>
