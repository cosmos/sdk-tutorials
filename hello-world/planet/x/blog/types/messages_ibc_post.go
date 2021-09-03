package types

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

var _ sdk.Msg = &MsgSendIbcPost{}

func NewMsgSendIbcPost(
	sender string,
	port string,
	channelID string,
	timeoutTimestamp uint64,
	title string,
	content string,
) *MsgSendIbcPost {
	return &MsgSendIbcPost{
		Sender:           sender,
		Port:             port,
		ChannelID:        channelID,
		TimeoutTimestamp: timeoutTimestamp,
		Title:            title,
		Content:          content,
	}
}

func (msg *MsgSendIbcPost) Route() string {
	return RouterKey
}

func (msg *MsgSendIbcPost) Type() string {
	return "SendIbcPost"
}

func (msg *MsgSendIbcPost) GetSigners() []sdk.AccAddress {
	sender, err := sdk.AccAddressFromBech32(msg.Sender)
	if err != nil {
		panic(err)
	}
	return []sdk.AccAddress{sender}
}

func (msg *MsgSendIbcPost) GetSignBytes() []byte {
	bz := ModuleCdc.MustMarshalJSON(msg)
	return sdk.MustSortJSON(bz)
}

func (msg *MsgSendIbcPost) ValidateBasic() error {
	_, err := sdk.AccAddressFromBech32(msg.Sender)
	if err != nil {
		return sdkerrors.Wrapf(sdkerrors.ErrInvalidAddress, "invalid sender address (%s)", err)
	}
	return nil
}
