package provider

import (
	"fmt"

	"cosmossdk.io/log"
	"cosmossdk.io/math"
	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/client/tx"
	"github.com/cosmos/cosmos-sdk/codec"
	"github.com/cosmos/cosmos-sdk/codec/address"
	"github.com/cosmos/cosmos-sdk/crypto/keyring"
	sdk "github.com/cosmos/cosmos-sdk/types"
	authclient "github.com/cosmos/cosmos-sdk/x/auth/client"
	authkeeper "github.com/cosmos/cosmos-sdk/x/auth/keeper"

	auction "github.com/cosmos/sdk-tutorials/tutorials/nameservice/base/x/auction"
)

/*
This implementation is for demo purposes only and does not reflect all limitations and
constraints of a live distributed network.

Transaction Provider is an embedded solution to demonstrate an interface an application could
leverage to extract MEV when building and proposing a block. In this example, the
application is building and signing transactions locally for the sake of a simplicity.
Alternatively, another implementation could instead take transactions submitted directly
via RPC to its app side mempool, and could even implement a separate custom mempool for
special transactions of this nature.
*/
type TxProvider interface {
	BuildProposal(ctx sdk.Context, proposalTxs []sdk.Tx) ([]sdk.Tx, error)
	getMatchingBid(ctx sdk.Context, bid *auction.MsgBid) sdk.Tx
}

type LocalSigner struct {
	KeyName    string
	KeyringDir string
	codec      codec.Codec
	txConfig   client.TxConfig
	kb         keyring.Keyring
	lg         log.Logger
}

type LocalTxProvider struct {
	Logger     log.Logger
	Codec      codec.Codec
	Signer     LocalSigner
	TxConfig   client.TxConfig
	AcctKeeper authkeeper.AccountKeeper
}

func (bp *LocalTxProvider) Init() error {
	return bp.Signer.Init(bp.TxConfig, bp.Codec, bp.Logger)
}

func (ls *LocalSigner) Init(txCfg client.TxConfig, cdc codec.Codec, logger log.Logger) error {
	if len(ls.KeyName) == 0 {
		return fmt.Errorf("keyName  must be set")
	}

	if len(ls.KeyringDir) == 0 {
		return fmt.Errorf("keyDir  must be set")
	}

	ls.txConfig = txCfg
	ls.codec = cdc
	ls.lg = logger

	kb, err := keyring.New("cosmos", keyring.BackendTest, ls.KeyringDir, nil, ls.codec)
	if err != nil {
		return err
	}
	ls.kb = kb
	return nil
}

func (ls *LocalSigner) RetreiveSigner(ctx sdk.Context, actKeeper authkeeper.AccountKeeper) (sdk.AccountI, error) {
	lg := ls.lg

	info, err := ls.kb.Key(ls.KeyName)
	if err != nil {
		lg.Error(fmt.Sprintf("Error retrieving key info: %v", err))
		return nil, err
	}

	addrBz, err := info.GetAddress()
	if err != nil {
		lg.Error(fmt.Sprintf("Error retrieving address by key name: %v", err))
		return nil, err
	}

	addCodec := address.Bech32Codec{
		Bech32Prefix: sdk.GetConfig().GetBech32AccountAddrPrefix(),
	}

	addrStr, err := addCodec.BytesToString(addrBz)
	if err != nil {
		lg.Error(fmt.Sprintf("Error converting address bytes to str: %v", err))
		return nil, err
	}

	sdkAddr, err := sdk.AccAddressFromBech32(addrStr)
	if err != nil {
		lg.Error(fmt.Sprintf("Error getting acct address from addr string: %v", err))
		return nil, err
	}

	acct := actKeeper.GetAccount(ctx, sdkAddr)
	return acct, nil
}

func (ls *LocalSigner) BuildAndSignTx(ctx sdk.Context, acct sdk.AccountI, msg auction.MsgBid) sdk.Tx {
	factory := tx.Factory{}.
		WithTxConfig(ls.txConfig).
		WithKeybase(ls.kb).
		WithChainID(ctx.ChainID()).
		WithAccountNumber(acct.GetAccountNumber()).
		WithSequence(acct.GetSequence()).
		WithFees("50uatom")

	txBuilder, err := factory.BuildUnsignedTx(&msg)
	if err != nil {
		ls.lg.Error(fmt.Sprintf("Error building unsigned tx: %v", err))

		return nil
	}
	clientCtx := client.Context{}

	err = authclient.SignTx(factory, clientCtx, ls.KeyName, txBuilder, true, true)
	if err != nil {
		ls.lg.Error(fmt.Sprintf("Error signing tx: %v", err))

		return nil
	}
	return txBuilder.GetTx()
}

func (b *LocalTxProvider) getMatchingBid(ctx sdk.Context, bid *auction.MsgBid) sdk.Tx {
	acct, err := b.Signer.RetreiveSigner(ctx, b.AcctKeeper)
	if err != nil {
		b.Logger.Error(fmt.Sprintf("Error retrieving signer: %v", err))
		return nil
	}
	b.Logger.Info("💨 :: Created new bid")

	msg := auction.MsgBid{
		Name:           bid.Name,
		Owner:          acct.GetAddress().String(),
		ResolveAddress: acct.GetAddress().String(),
		Amount:         bid.Amount.MulInt(math.NewInt(2)),
	}

	newTx := b.Signer.BuildAndSignTx(ctx, acct, msg)
	return newTx
}

func (b *LocalTxProvider) BuildProposal(ctx sdk.Context, proposalTxs []sdk.Tx) ([]sdk.Tx, error) {
	b.Logger.Info("💨 :: Building Proposal")

	var newProposal []sdk.Tx
	for _, tx := range proposalTxs {
		sdkMsgs := tx.GetMsgs()
		for _, msg := range sdkMsgs {
			switch msg := msg.(type) {
			case *auction.MsgBid:
				b.Logger.Info("💨 :: Found a Bid to Snipe")

				// Get matching bid from matching engine
				newTx := b.getMatchingBid(ctx, msg)

				// First append sniped Bid
				newProposal = append(newProposal, newTx)
				newProposal = append(newProposal, tx)
			default:
				// Append all other transactions
				newProposal = append(newProposal, tx)
			}
		}
	}

	return newProposal, nil
}
