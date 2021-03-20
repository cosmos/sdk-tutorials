# Cancel orders

Canceling order is done locally

Source chain can cancel sell orders

Target chain can cancel buy order

## Sell orders

We must retrieve the sell order book and remove the order. Thankfully, we have a method to remove order from the book from the ID

```go
// msg_server_cancelSellOrder.go
func (k msgServer) CancelSellOrder(goCtx context.Context, msg *types.MsgCancelSellOrder) (*types.MsgCancelSellOrderResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)

	// Retrieve the book
	pairIndex := types.OrderBookIndex(msg.Port, msg.Channel, msg.AmountDenom, msg.PriceDenom)
	book, found := k.GetSellOrderBook(ctx, pairIndex)
	if !found {
		return &types.MsgCancelSellOrderResponse{}, errors.New("the pair doesn't exist")
	}

	// Check order creator
	order, err := book.GetOrderFromID(msg.OrderID)
	if err != nil {
		return &types.MsgCancelSellOrderResponse{}, err
	}
	if order.Creator != msg.Creator {
		return &types.MsgCancelSellOrderResponse{}, errors.New("canceller must be creator")
	}

	// Remove order
	newBook, err := book.RemoveOrderFromID(msg.OrderID)
	if err != nil {
		return &types.MsgCancelSellOrderResponse{}, err
	}
	book = newBook.(types.SellOrderBook)
	k.SetSellOrderBook(ctx, book)

  // Refund seller with remaining amount
	seller, err := sdk.AccAddressFromBech32(order.Creator)
	if err != nil {
		return &types.MsgCancelSellOrderResponse{}, err
	}
	if err := k.SafeMint(
		ctx,
		msg.Port,
		msg.Channel,
		seller,
		msg.AmountDenom,
		order.Amount,
	); err != nil {
		return &types.MsgCancelSellOrderResponse{}, err
	}

	return &types.MsgCancelSellOrderResponse{}, nil
}
```

## Buy orders

Same

```go
// msg_server_cancelBuyOrder.go
func (k msgServer) CancelBuyOrder(goCtx context.Context, msg *types.MsgCancelBuyOrder) (*types.MsgCancelBuyOrderResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)

	// Retrieve the book
	pairIndex := types.OrderBookIndex(msg.Port, msg.Channel, msg.AmountDenom, msg.PriceDenom)
	book, found := k.GetBuyOrderBook(ctx, pairIndex)
	if !found {
		return &types.MsgCancelBuyOrderResponse{}, errors.New("the pair doesn't exist")
	}

	// Check order creator
	order, err := book.GetOrderFromID(msg.OrderID)
	if err != nil {
		return &types.MsgCancelBuyOrderResponse{}, err
	}
	if order.Creator != msg.Creator {
		return &types.MsgCancelBuyOrderResponse{}, errors.New("canceller must be creator")
	}

	// Remove order
	newBook, err := book.RemoveOrderFromID(msg.OrderID)
	if err != nil {
		return &types.MsgCancelBuyOrderResponse{}, err
	}
	book = newBook.(types.BuyOrderBook)
	k.SetBuyOrderBook(ctx, book)

  // Refund buyer with remaining price amount
	buyer, err := sdk.AccAddressFromBech32(order.Creator)
	if err != nil {
		return &types.MsgCancelBuyOrderResponse{}, err
	}
	if err := k.SafeMint(
		ctx,
		msg.Port,
		msg.Channel,
		buyer,
		msg.PriceDenom,
		order.Amount*order.Price,
	); err != nil {
		return &types.MsgCancelBuyOrderResponse{}, err
	}

	return &types.MsgCancelBuyOrderResponse{}, nil
}
```