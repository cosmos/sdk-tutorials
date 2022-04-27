---
title: "IBC/TAO"
order: 
description: 
tag: deep-dive
---

## Light Clients

In the IBC Protocol, an actor - an end user, an off-chain process, or a machine - needs to be able to verify updates to another machine's state that the other machine's consensus algorithm has agreed to and reject any possible updates that the other machine's consensus algorithm has not agreed upon.

![Light clients](/academy/ibc/images/lightclient.png)

Different abstraction layers are described in the ICS.

<HighlightBox type="info">

In case you want to take a refresher of ICS and the different layers, take a look at the section [What is IBC?](./what-is-ibc.md).

</HighlightBox>

**Light clients** confirm that received packets are verified. With this approach, an IBC chain is not required to maintain a **full node** for the verification of state changes of another chain. A **relayer** has access to both full nodes and passes headers from full nodes to the light clients.

Before a **connection** can be established - a connection handshake starts - chain A will create a light client for chain B and chain B will create a light client for chain A.

Start with [`msg_serve.go`](https://github.com/cosmos/ibc-go/blob/main/modules/core/keeper/msg_server.go), this is where the messages come in. In it, we first see a `CreateClient` function:

```go
// CreateClient defines a rpc handler method for MsgCreateClient.
func (k Keeper) CreateClient(goCtx context.Context, msg *clienttypes.MsgCreateClient) (*clienttypes.MsgCreateClientResponse, error) {
  ctx := sdk.UnwrapSDKContext(goCtx)

  clientState, err := clienttypes.UnpackClientState(msg.ClientState)
  ...

  consensusState, err := clienttypes.UnpackConsensusState(msg.ConsensusState)
  
  ...

  ... = k.ClientKeeper.CreateClient(ctx, clientState, consensusState); 
  
  ...

}
```

It creates a light client by calling [`ClientKeeper.CreateClient`](https://github.com/cosmos/ibc-go/blob/main/modules/core/02-client/keeper/client.go):

```go
// CreateClient creates a new client state and populates it with a given consensus
// state as defined in https://github.com/cosmos/ibc/tree/master/spec/core/ics-002-client-semantics#create
func (k Keeper) CreateClient(
  ctx sdk.Context, clientState exported.ClientState, consensusState exported.ConsensusState,
) 
  
  ...

  clientID := k.GenerateClientIdentifier(ctx, clientState.ClientType())

  ...

  k.SetClientState(ctx, clientID, clientState)

  ...

  // verifies initial consensus state against client state and initializes client store with any client-specific metadata
  // e.g. set ProcessedTime in Tendermint clients
  ... := clientState.Initialize(ctx, k.cdc, k.ClientStore(ctx, clientID), consensusState);

  ...

  EmitCreateClientEvent(ctx, clientID, clientState)

  return clientID, nil
}
```

Each client for a chain has a unique `clientID`. In addition, you can see that the function expects a [`clientState`](https://github.com/cosmos/ibc-go/blob/main/modules/light-clients/07-tendermint/types/client_state.go):

 ```go
// NewClientState creates a new ClientState instance
func NewClientState(
  chainID string, trustLevel Fraction,
  trustingPeriod, ubdPeriod, maxClockDrift time.Duration,
  latestHeight clienttypes.Height, specs []*ics23.ProofSpec,
  upgradePath []string, allowUpdateAfterExpiry, allowUpdateAfterMisbehaviour bool,
) *ClientState {
  return &ClientState{
    ChainId:                      chainID,
    TrustLevel:                   trustLevel,
    TrustingPeriod:               trustingPeriod,
    UnbondingPeriod:              ubdPeriod,
    MaxClockDrift:                maxClockDrift,
    LatestHeight:                 latestHeight,
    FrozenHeight:                 clienttypes.ZeroHeight(),
    ProofSpecs:                   specs,
    UpgradePath:                  upgradePath,
    AllowUpdateAfterExpiry:       allowUpdateAfterExpiry,
    AllowUpdateAfterMisbehaviour: allowUpdateAfterMisbehaviour,
  }
}

```

`TrustLevel` in the `NewClientState` lets you set the security conditions. It determines, for example, how often the relayer will pass a header to the light client. Also it determines the portion of the validator set you want to have signing for the block confirmation.

`CreateClient` additionally expects a [`consensusState`](https://github.com/cosmos/ibc-go/blob/main/modules/light-clients/07-tendermint/types/consensus_state.go):

```go
// NewConsensusState creates a new ConsensusState instance.
func NewConsensusState(
  timestamp time.Time, root commitmenttypes.MerkleRoot, nextValsHash tmbytes.HexBytes,
) *ConsensusState {
  return &ConsensusState{
    Timestamp:          timestamp,
    Root:               root,
    NextValidatorsHash: nextValsHash,
  }
}
```

This is the code from the Tendermint client. The Tendermint client tracks the timestamp (block time), validator set, and commitment root for all previously verified consensus states.

<HighlightBox type="info">

If you want to see where `ConsensusState` is stored, take a look at the [Interchain Standard (ICS) 24](https://github.com/cosmos/ibc/tree/master/spec/core/ics-024-host-requirements), which describes the paths also for other keys to be stored and used by IBC.

</HighlightBox>

The IBC module uses [Merkle trees](https://en.wikipedia.org/wiki/Merkle_tree) for the `root` [verifications](https://github.com/cosmos/ibc-go/blob/main/modules/core/23-commitment/types/merkle.go):

```go
// VerifyMembership verifies the membership pf a merkle proof against the given root, path, and value.
func (proof MerkleProof) VerifyMembership(specs []*ics23.ProofSpec, root exported.Root, path exported.Path, value []byte) error {
  if err := proof.validateVerificationArgs(specs, root); err != nil {
    return err
  }

  // VerifyMembership specific argument validation
  mpath, ok := path.(MerklePath)
  if !ok {
    return sdkerrors.Wrapf(ErrInvalidProof, "path %v is not of type MerklePath", path)
  }
  if len(mpath.KeyPath) != len(specs) {
    return sdkerrors.Wrapf(ErrInvalidProof, "path length %d not same as proof %d",
      len(mpath.KeyPath), len(specs))
  }
  if len(value) == 0 {
    return sdkerrors.Wrap(ErrInvalidProof, "empty value in membership proof")
  }

  // Since every proof in chain is a membership proof we can use verifyChainedMembershipProof from index 0
  // to validate entire proof
  if err := verifyChainedMembershipProof(root.GetHash(), specs, proof.Proofs, mpath, value, 0); err != nil {
    return err
  }
  return nil
}
```

As mentioned before, you have different security guarantees for an update depending on the trust level you set. Take a look at [`CheckHeaderAndUpdateState`](https://github.com/cosmos/ibc-go/blob/main/modules/light-clients/07-tendermint/types/update.go) and read through the comments. Notice that `consensusState` is not updated, instead another `consensusState` with a different height is stored on the chain:

```go
func (cs ClientState) CheckHeaderAndUpdateState(
  ctx sdk.Context, cdc codec.BinaryCodec, clientStore sdk.KVStore,
  header exported.Header,
) (exported.ClientState, exported.ConsensusState, error) {
  tmHeader, ok := header.(*Header)
  if !ok {
    return nil, nil, sdkerrors.Wrapf(
      clienttypes.ErrInvalidHeader, "expected type %T, got %T", &Header{}, header,
    )
  }

 ...

  // get consensus state from clientStore
  trustedConsState, err := GetConsensusState(clientStore, cdc, tmHeader.TrustedHeight)
  if err != nil {
    return nil, nil, sdkerrors.Wrapf(
      err, "could not get consensus state from clientstore at TrustedHeight: %s", tmHeader.TrustedHeight,
    )
  }

  if err := checkValidity(&cs, trustedConsState, tmHeader, ctx.BlockTime()); err != nil {
    return nil, nil, err
  }

  consState := tmHeader.ConsensusState()
  // Header is different from existing consensus state and also valid, so freeze the client and return
  if conflictingHeader {
    cs.FrozenHeight = FrozenHeight
    return &cs, consState, nil
  }
  // Check that consensus state timestamps are monotonic
  prevCons, prevOk := GetPreviousConsensusState(clientStore, cdc, header.GetHeight())
  nextCons, nextOk := GetNextConsensusState(clientStore, cdc, header.GetHeight())
  // if previous consensus state exists, check consensus state time is greater than previous consensus state time
  // if previous consensus state is not before current consensus state, freeze the client and return.
  if prevOk && !prevCons.Timestamp.Before(consState.Timestamp) {
    cs.FrozenHeight = FrozenHeight
    return &cs, consState, nil
  }
  // if next consensus state exists, check consensus state time is less than next consensus state time
  // if next consensus state is not after current consensus state, freeze the client and return.
  if nextOk && !nextCons.Timestamp.After(consState.Timestamp) {
    cs.FrozenHeight = FrozenHeight
    return &cs, consState, nil
  }

  // Check the earliest consensus state to see if it is expired, if so then set the prune height
  // so that we can delete consensus state and all associated metadata.
  
  ...

  newClientState, consensusState := update(ctx, clientStore, &cs, tmHeader)
  return newClientState, consensusState, nil
}

```

`header` has not been mentioned yet, so take a look at the [header definition](https://github.com/cosmos/ibc-go/blob/main/modules/light-clients/07-tendermint/types/tendermint.pb.go):

```go
type Header struct {
  *types2.SignedHeader `protobuf:"bytes,1,opt,name=signed_header,json=signedHeader,proto3,embedded=signed_header" json:"signed_header,omitempty" yaml:"signed_header"`
  ValidatorSet         *types2.ValidatorSet `protobuf:"bytes,2,opt,name=validator_set,json=validatorSet,proto3" json:"validator_set,omitempty" yaml:"validator_set"`
  TrustedHeight        types.Height         `protobuf:"bytes,3,opt,name=trusted_height,json=trustedHeight,proto3" json:"trusted_height" yaml:"trusted_height"`
  TrustedValidators    *types2.ValidatorSet `protobuf:"bytes,4,opt,name=trusted_validators,json=trustedValidators,proto3" json:"trusted_validators,omitempty" yaml:"trusted_validators"`
}
```

Header defines the Tendermint client consensus `Header`. It encapsulates all the information necessary to update from a trusted Tendermint `ConsensusState`. The inclusion of `TrustedHeight` and `TrustedValidators` allows this update to process correctly, so long as the `ConsensusState` for the `TrustedHeight` exists, this removes race conditions among relayers.

The `SignedHeader` and `ValidatorSet` are the new untrusted update fields for the client. The `TrustedHeight` is the height of a stored `ConsensusState` on the client that will be used to verify the new untrusted
header. The Trusted `ConsensusState` must be within the unbonding period of current time in order to correctly verify, and the `TrustedValidators` must hash to `TrustedConsensusState.NextValidatorsHash` since that is the last trusted validator set at the `TrustedHeight`.

The header is passed by the relayer to the light client. You can see that the the header is confirmed with:

```go
  if err := checkValidity(&cs, trustedConsState, tmHeader, ctx.BlockTime()); err != nil {
    return nil, nil, err
  }
```

So take a closer look to see the different verifications made in this call:

```go
// checkValidity checks if the Tendermint header is valid.
// CONTRACT: consState.Height == header.TrustedHeight
func checkValidity(
  clientState *ClientState, consState *ConsensusState,
  header *Header, currentTimestamp time.Time,
) error {
  if err := checkTrustedHeader(header, consState); err != nil {
    return err
  }

  // UpdateClient only accepts updates with a header at the same revision
  // as the trusted consensus state
  ...

  tmTrustedValidators, err := tmtypes.ValidatorSetFromProto(header.TrustedValidators)
  ...

  tmSignedHeader, err := tmtypes.SignedHeaderFromProto(header.SignedHeader)
  ...

  tmValidatorSet, err := tmtypes.ValidatorSetFromProto(header.ValidatorSet)
  ...

  // assert header height is newer than consensus state
  ...

  chainID := clientState.GetChainID()
  // If chainID is in revision format, then set revision number of chainID with the revision number
  // of the header we are verifying
  // This is useful if the update is at a previous revision rather than an update to the latest revision
  // of the client.
  // The chainID must be set correctly for the previous revision before attempting verification.
  // Updates for previous revisions are not supported if the chainID is not in revision format.
  if clienttypes.IsRevisionFormat(chainID) {
    chainID, _ = clienttypes.SetRevisionNumber(chainID, header.GetHeight().GetRevisionNumber())
  }

  // Construct a trusted header using the fields in consensus state
  // Only Height, Time, and NextValidatorsHash are necessary for verification
  trustedHeader := tmtypes.Header{
    ChainID:            chainID,
    Height:             int64(header.TrustedHeight.RevisionHeight),
    Time:               consState.Timestamp,
    NextValidatorsHash: consState.NextValidatorsHash,
  }
  signedHeader := tmtypes.SignedHeader{
    Header: &trustedHeader,
  }

  // Verify next header with the passed-in trustedVals
  // - asserts trusting period not passed
  // - assert header timestamp is not past the trusting period
  // - assert header timestamp is past latest stored consensus state timestamp
  // - assert that a TrustLevel proportion of TrustedValidators signed new Commit
  err = light.Verify(
    &signedHeader,
    tmTrustedValidators, tmSignedHeader, tmValidatorSet,
    clientState.TrustingPeriod, currentTimestamp, clientState.MaxClockDrift, clientState.TrustLevel.ToTendermint(),
  )

  ...

  return nil
}
```

The client is also used to [verify an incoming packet](https://github.com/cosmos/ibc-go/blob/main/modules/light-clients/07-tendermint/types/client_state.go):

```go
// VerifyPacketCommitment verifies a proof of an outgoing packet commitment at
// the specified port, specified channel, and specified sequence.
func (cs ClientState) VerifyPacketCommitment(
  ctx sdk.Context,
  store sdk.KVStore,
  cdc codec.BinaryCodec,
  height exported.Height,
  delayTimePeriod uint64,
  delayBlockPeriod uint64,
  prefix exported.Prefix,
  proof []byte,
  portID,
  channelID string,
  sequence uint64,
  commitmentBytes []byte,
) error {
  merkleProof, consensusState, err := produceVerificationArgs(store, cdc, cs, height, prefix, proof)
  ...

  // check delay period has passed
  if err := verifyDelayPeriodPassed(ctx, store, height, delayTimePeriod, delayBlockPeriod); 
  ...

  commitmentPath := commitmenttypes.NewMerklePath(host.PacketCommitmentPath(portID, channelID, sequence))
  path, err := commitmenttypes.ApplyPrefix(prefix, commitmentPath)
  ...

  if err := merkleProof.VerifyMembership(cs.ProofSpecs, consensusState.GetRoot(), path, commitmentBytes);
  ...

  return nil
}
```

Now you can see how the [client is updated](https://github.com/cosmos/ibc-go/blob/main/modules/core/02-client/keeper/client.go):

```go
// UpdateClient updates the consensus state and the state root from a provided header.
func (k Keeper) UpdateClient(ctx sdk.Context, clientID string, header exported.Header) error {
  clientState, found := k.GetClientState(ctx, clientID)
  ...

  clientStore := k.ClientStore(ctx, clientID)

  ... status := clientState.Status(ctx, clientStore, k.cdc); 
  ...

  // Any writes made in CheckHeaderAndUpdateState are persisted on both valid updates and misbehaviour updates.
  // Light client implementations are responsible for writing the correct metadata (if any) in either case.
  newClientState, newConsensusState, err := clientState.CheckHeaderAndUpdateState(ctx, k.cdc, clientStore, header)
  ...

  // emit the full header in events
  ...
    // set default consensus height with header height
    consensusHeight = header.GetHeight()
  ...

  // set new client state regardless of if update is valid update or misbehaviour
  k.SetClientState(ctx, clientID, newClientState)

  // If client state is not frozen after clientState CheckHeaderAndUpdateState,
  // then update was valid. Write the update state changes, and set new consensus state.
  // Else the update was proof of misbehaviour and we must emit appropriate misbehaviour events.
  ...

    // emitting events in the keeper emits for both begin block and handler client updates
    EmitUpdateClientEvent(ctx, clientID, newClientState, consensusHeight, headerStr)
  ...

  return nil
}

```
