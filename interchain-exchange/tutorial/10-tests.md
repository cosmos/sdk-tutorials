---
order: 11
---

# Write tests

To test your application, add the test files to your code.

After you add the test files below, change into the `interchange` directory with your terminal, then run

```bash
go test -timeout 30s ./x/ibcdex/types
```

## Create Tests for the Order Book

```go
// types/orderbook_test.go
package types_test

import (
	"github.com/cosmos/cosmos-sdk/crypto/keys/ed25519"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/stretchr/testify/require"
	"github.com/username/interchange/x/ibcdex/types"
	"math/rand"
	"sort"
	"testing"
)

func GenString(n int) string {
	alpha := []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")

	buf := make([]rune, n)
	for i := range buf {
		buf[i] = alpha[rand.Intn(len(alpha))]
	}
	return string(buf)
}

func GenAddress() string {
	pk := ed25519.GenPrivKey().PubKey()
	addr := pk.Address()
	return sdk.AccAddress(addr).String()
}

func GenAmount() int32 {
	return int32(rand.Intn(int(types.MaxAmount)) + 1)
}

func GenPrice() int32 {
	return int32(rand.Intn(int(types.MaxPrice)) + 1)
}

func GenPair() (string, string) {
	return GenString(10), GenString(10)
}

func GenOrder() (string, int32, int32) {
	return GenLocalAccount(), GenAmount(), GenPrice()
}

func GenLocalAccount() string {
	return GenAddress()
}

func MockAccount(str string) string {
	return str
}

func OrderListToSellOrderBook(list []types.Order) types.SellOrderBook {
	listCopy := make([]*types.Order, len(list))
	for i, order := range list {
		order := order
		listCopy[i] = &order
	}

	book := types.SellOrderBook{
		OrderIDTrack: 0,
		AmountDenom:  "foo",
		PriceDenom:   "bar",
		Orders:       listCopy,
	}
	return book
}

func OrderListToBuyOrderBook(list []types.Order) types.BuyOrderBook {
	listCopy := make([]*types.Order, len(list))
	for i, order := range list {
		order := order
		listCopy[i] = &order
	}

	book := types.BuyOrderBook{
		OrderIDTrack: 0,
		AmountDenom:  "foo",
		PriceDenom:   "bar",
		Orders:       listCopy,
	}
	return book
}

func TestAppendOrder(t *testing.T) {
	var ok bool
	sellBook := types.NewSellOrderBook(GenPair())

	// Prevent zero amount
	seller, amount, price := GenOrder()
	_, _, err := types.AppendOrder(sellBook, seller, 0, price)
	require.ErrorIs(t, err, types.ErrZeroAmount)

	// Prevent big amount
	_, _, err = types.AppendOrder(sellBook, seller, types.MaxAmount+1, price)
	require.ErrorIs(t, err, types.ErrMaxAmount)

	// Prevent zero price
	_, _, err = types.AppendOrder(sellBook, seller, amount, 0)
	require.ErrorIs(t, err, types.ErrZeroPrice)

	// Prevent big price
	_, _, err = types.AppendOrder(sellBook, seller, amount, types.MaxPrice+1)
	require.ErrorIs(t, err, types.ErrMaxPrice)

	// Can append sell orders
	for i := 0; i < 20; i++ {
		// Append a new order
		creator, amount, price := GenOrder()
		newOrder := types.Order{
			Id:      sellBook.OrderIDTrack,
			Creator: creator,
			Amount:  amount,
			Price:   price,
		}
		newBook, orderID, err := types.AppendOrder(sellBook, creator, amount, price)
		sellBook, ok = newBook.(types.SellOrderBook)

		// Checks
		require.True(t, ok)
		require.NoError(t, err)
		require.Contains(t, sellBook.Orders, &newOrder)
		require.Equal(t, newOrder.Id, orderID)
	}
	require.Len(t, sellBook.Orders, 20)
	require.True(t, sort.IsSorted(sellBook))

	// Can append buy orders
	buyBook := types.NewBuyOrderBook(GenPair())
	for i := 0; i < 20; i++ {
		// Append a new order
		creator, amount, price := GenOrder()
		newOrder := types.Order{
			Id:      buyBook.OrderIDTrack,
			Creator: creator,
			Amount:  amount,
			Price:   price,
		}
		newBook, orderID, err := types.AppendOrder(buyBook, creator, amount, price)
		buyBook, ok = newBook.(types.BuyOrderBook)

		// Checks
		require.True(t, ok)
		require.NoError(t, err)
		require.Contains(t, buyBook.Orders, &newOrder)
		require.Equal(t, newOrder.Id, orderID)
	}
	require.Len(t, buyBook.Orders, 20)
	require.True(t, sort.IsSorted(buyBook))
}

func simulateUpdateOrderBook(
	t *testing.T,
	sell bool,
	inputList []types.Order,
	inputOrder types.Order,
	expectedList []types.Order,
) {
	var inputBook types.OrderBook
	var expectedBook types.OrderBook
	if sell {
		inputBook = OrderListToSellOrderBook(inputList)
		expectedBook = OrderListToSellOrderBook(expectedList)
	} else {
		inputBook = OrderListToBuyOrderBook(inputList)
		expectedBook = OrderListToBuyOrderBook(expectedList)
	}

	require.True(t, sort.IsSorted(inputBook))
	require.True(t, sort.IsSorted(expectedBook))

	outputBook := types.UpdateOrderBook(inputBook, inputOrder)

	require.Equal(t, expectedBook, outputBook)
}

func TestUpdateOrderBook(t *testing.T) {
	// Sell order book
	inputBook := []types.Order{
		{Id: 0, Creator: MockAccount("0"), Amount: 100, Price: 25},
		{Id: 1, Creator: MockAccount("1"), Amount: 100, Price: 20},
		{Id: 2, Creator: MockAccount("2"), Amount: 100, Price: 15},
		{Id: 3, Creator: MockAccount("3"), Amount: 100, Price: 10},
	}

	// Sell 1
	inputOrder := types.Order{Id: 1, Creator: MockAccount("1"), Amount: 100, Price: 20}
	expectedBook := []types.Order{
		{Id: 0, Creator: MockAccount("0"), Amount: 100, Price: 25},
		{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
		{Id: 2, Creator: MockAccount("2"), Amount: 100, Price: 15},
		{Id: 3, Creator: MockAccount("3"), Amount: 100, Price: 10},
	}
	simulateUpdateOrderBook(t, true, inputBook, inputOrder, expectedBook)

	// Sell 2
	inputOrder = types.Order{Id: 4, Creator: MockAccount("1"), Amount: 100, Price: 17}
	expectedBook = []types.Order{
		{Id: 0, Creator: MockAccount("0"), Amount: 100, Price: 25},
		{Id: 1, Creator: MockAccount("1"), Amount: 100, Price: 20},
		{Id: 4, Creator: MockAccount("1"), Amount: 100, Price: 17},
		{Id: 2, Creator: MockAccount("2"), Amount: 100, Price: 15},
		{Id: 3, Creator: MockAccount("3"), Amount: 100, Price: 10},
	}
	simulateUpdateOrderBook(t, true, inputBook, inputOrder, expectedBook)

	// Sell 3
	inputOrder = types.Order{Id: 5, Creator: MockAccount("1"), Amount: 500, Price: 1}
	expectedBook = []types.Order{
		{Id: 0, Creator: MockAccount("0"), Amount: 100, Price: 25},
		{Id: 1, Creator: MockAccount("1"), Amount: 100, Price: 20},
		{Id: 2, Creator: MockAccount("2"), Amount: 100, Price: 15},
		{Id: 3, Creator: MockAccount("3"), Amount: 100, Price: 10},
		{Id: 5, Creator: MockAccount("1"), Amount: 500, Price: 1},
	}
	simulateUpdateOrderBook(t, true, inputBook, inputOrder, expectedBook)

	// Buy order book
	inputBook = []types.Order{
		{Id: 3, Creator: MockAccount("3"), Amount: 100, Price: 10},
		{Id: 2, Creator: MockAccount("2"), Amount: 100, Price: 15},
		{Id: 1, Creator: MockAccount("1"), Amount: 100, Price: 20},
		{Id: 0, Creator: MockAccount("0"), Amount: 100, Price: 25},
	}

	// Buy 1
	inputOrder = types.Order{Id: 1, Creator: MockAccount("1"), Amount: 100, Price: 20}
	expectedBook = []types.Order{
		{Id: 3, Creator: MockAccount("3"), Amount: 100, Price: 10},
		{Id: 2, Creator: MockAccount("2"), Amount: 100, Price: 15},
		{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
		{Id: 0, Creator: MockAccount("0"), Amount: 100, Price: 25},
	}
	simulateUpdateOrderBook(t, false, inputBook, inputOrder, expectedBook)

	// Buy 2
	inputOrder = types.Order{Id: 4, Creator: MockAccount("1"), Amount: 100, Price: 17}
	expectedBook = []types.Order{
		{Id: 3, Creator: MockAccount("3"), Amount: 100, Price: 10},
		{Id: 2, Creator: MockAccount("2"), Amount: 100, Price: 15},
		{Id: 4, Creator: MockAccount("1"), Amount: 100, Price: 17},
		{Id: 1, Creator: MockAccount("1"), Amount: 100, Price: 20},
		{Id: 0, Creator: MockAccount("0"), Amount: 100, Price: 25},
	}
	simulateUpdateOrderBook(t, false, inputBook, inputOrder, expectedBook)

	// Buy 3
	inputOrder = types.Order{Id: 5, Creator: MockAccount("1"), Amount: 500, Price: 1}
	expectedBook = []types.Order{
		{Id: 5, Creator: MockAccount("1"), Amount: 500, Price: 1},
		{Id: 3, Creator: MockAccount("3"), Amount: 100, Price: 10},
		{Id: 2, Creator: MockAccount("2"), Amount: 100, Price: 15},
		{Id: 1, Creator: MockAccount("1"), Amount: 100, Price: 20},
		{Id: 0, Creator: MockAccount("0"), Amount: 100, Price: 25},
	}
	simulateUpdateOrderBook(t, false, inputBook, inputOrder, expectedBook)
}

func simulateRestoreSellOrderBook(
	t *testing.T, sell bool,
	inputList []types.Order,
	liquidated []types.Order,
	expectedList []types.Order,
) {
	var inputBook types.OrderBook
	var expectedBook types.OrderBook
	if sell {
		inputBook = OrderListToSellOrderBook(inputList)
		expectedBook = OrderListToSellOrderBook(expectedList)
	} else {
		inputBook = OrderListToBuyOrderBook(inputList)
		expectedBook = OrderListToBuyOrderBook(expectedList)
	}

	require.True(t, sort.IsSorted(inputBook))
	require.True(t, sort.IsSorted(expectedBook))

	outputBook := types.RestoreOrderBook(inputBook, liquidated)

	require.Equal(t, expectedBook, outputBook)
}

func TestRestoreOrderBook(t *testing.T) {
	// Sell
	inputBook := []types.Order{
		{Id: 0, Creator: MockAccount("0"), Amount: 50, Price: 25},
		{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
		{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
		{Id: 3, Creator: MockAccount("3"), Amount: 2, Price: 10},
		{Id: 4, Creator: MockAccount("3"), Amount: 45, Price: 10},
		{Id: 5, Creator: MockAccount("3"), Amount: 12, Price: 5},
	}
	liquidated := []types.Order{
		{Id: 0, Creator: MockAccount("0"), Amount: 100, Price: 25},
		{Id: 5, Creator: MockAccount("3"), Amount: 200, Price: 5},
		{Id: 6, Creator: MockAccount("4"), Amount: 40, Price: 30},
		{Id: 7, Creator: MockAccount("5"), Amount: 42, Price: 1},
	}
	expectedBook := []types.Order{
		{Id: 6, Creator: MockAccount("4"), Amount: 40, Price: 30},
		{Id: 0, Creator: MockAccount("0"), Amount: 150, Price: 25},
		{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
		{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
		{Id: 3, Creator: MockAccount("3"), Amount: 2, Price: 10},
		{Id: 4, Creator: MockAccount("3"), Amount: 45, Price: 10},
		{Id: 5, Creator: MockAccount("3"), Amount: 212, Price: 5},
		{Id: 7, Creator: MockAccount("5"), Amount: 42, Price: 1},
	}
	simulateRestoreSellOrderBook(t, true, inputBook, liquidated, expectedBook)

	// Buy
	inputBook = []types.Order{
		{Id: 5, Creator: MockAccount("3"), Amount: 12, Price: 5},
		{Id: 4, Creator: MockAccount("3"), Amount: 45, Price: 10},
		{Id: 3, Creator: MockAccount("3"), Amount: 2, Price: 10},
		{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
		{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
		{Id: 0, Creator: MockAccount("0"), Amount: 50, Price: 25},
	}
	liquidated = []types.Order{
		{Id: 0, Creator: MockAccount("0"), Amount: 100, Price: 25},
		{Id: 5, Creator: MockAccount("3"), Amount: 200, Price: 5},
		{Id: 6, Creator: MockAccount("4"), Amount: 40, Price: 30},
		{Id: 7, Creator: MockAccount("5"), Amount: 42, Price: 1},
	}
	expectedBook = []types.Order{
		{Id: 7, Creator: MockAccount("5"), Amount: 42, Price: 1},
		{Id: 5, Creator: MockAccount("3"), Amount: 212, Price: 5},
		{Id: 4, Creator: MockAccount("3"), Amount: 45, Price: 10},
		{Id: 3, Creator: MockAccount("3"), Amount: 2, Price: 10},
		{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
		{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
		{Id: 0, Creator: MockAccount("0"), Amount: 150, Price: 25},
		{Id: 6, Creator: MockAccount("4"), Amount: 40, Price: 30},
	}
	simulateRestoreSellOrderBook(t, false, inputBook, liquidated, expectedBook)
}
```

##  Create Tests for the Buy Order

```go
// types/buyorder.go
package types_test

import (
	"github.com/stretchr/testify/require"
	"github.com/username/interchange/x/ibcdex/types"
	"sort"
	"testing"
)

func TestNewBuyOrderBook(t *testing.T) {
	amountDenom, priceDenom := GenPair()
	book := types.NewBuyOrderBook(amountDenom, priceDenom)
	require.Equal(t, int32(1), book.OrderIDTrack)
	require.Equal(t, amountDenom, book.AmountDenom)
	require.Equal(t, priceDenom, book.PriceDenom)
	require.Empty(t, book.Orders)
}

type liquidateBuyRes struct {
	Book       []types.Order
	Remaining  types.Order
	Liquidated types.Order
	Purchase   int32
	Match      bool
	Filled     bool
}

func TestBuyOrderBook_RemoveOrderFromID(t *testing.T) {
	inputList := []types.Order{
		{Id: 3, Creator: MockAccount("3"), Amount: 2, Price: 10},
		{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
		{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
		{Id: 0, Creator: MockAccount("0"), Amount: 50, Price: 25},
	}

	inputBook := OrderListToBuyOrderBook(inputList)
	expectedList := []types.Order{
		{Id: 3, Creator: MockAccount("3"), Amount: 2, Price: 10},
		{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
		{Id: 0, Creator: MockAccount("0"), Amount: 50, Price: 25},
	}
	expectedBook := OrderListToBuyOrderBook(expectedList)
	outputBook, err := inputBook.RemoveOrderFromID(2)
	require.NoError(t, err)
	require.Equal(t, expectedBook, outputBook)

	inputBook = OrderListToBuyOrderBook(inputList)
	expectedList = []types.Order{
		{Id: 3, Creator: MockAccount("3"), Amount: 2, Price: 10},
		{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
		{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
	}
	expectedBook = OrderListToBuyOrderBook(expectedList)
	outputBook, err = inputBook.RemoveOrderFromID(0)
	require.NoError(t, err)
	require.Equal(t, expectedBook, outputBook)

	inputBook = OrderListToBuyOrderBook(inputList)
	expectedList = []types.Order{
		{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
		{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
		{Id: 0, Creator: MockAccount("0"), Amount: 50, Price: 25},
	}
	expectedBook = OrderListToBuyOrderBook(expectedList)
	outputBook, err = inputBook.RemoveOrderFromID(3)
	require.NoError(t, err)
	require.Equal(t, expectedBook, outputBook)

	inputBook = OrderListToBuyOrderBook(inputList)
	_, err = inputBook.RemoveOrderFromID(4)
	require.ErrorIs(t, err, types.ErrOrderNotFound)
}

func simulateLiquidateFromBuyOrder(
	t *testing.T,
	inputList []types.Order,
	inputOrder types.Order,
	expected liquidateBuyRes,
) {
	inputBook := OrderListToSellOrderBook(inputList)
	expectedBook := OrderListToSellOrderBook(expected.Book)
	require.True(t, sort.IsSorted(inputBook))
	require.True(t, sort.IsSorted(expectedBook))

	outputBook, remaining, liquidated, purchase, match, filled := types.LiquidateFromBuyOrder(inputBook, inputOrder)

	require.Equal(t, expectedBook, outputBook)
	require.Equal(t, expected.Remaining, remaining)
	require.Equal(t, expected.Liquidated, liquidated)
	require.Equal(t, expected.Purchase, purchase)
	require.Equal(t, expected.Match, match)
	require.Equal(t, expected.Filled, filled)
}

func TestLiquidateFromBuyOrder(t *testing.T) {
	// No match for empty book
	inputOrder := types.Order{Id: 10, Creator: MockAccount("1"), Amount: 100, Price: 10}
	_, _, _, _, match, _ := types.LiquidateFromBuyOrder(OrderListToSellOrderBook([]types.Order{}), inputOrder)
	require.False(t, match)

	// Sell book
	inputBook := []types.Order{
		{Id: 0, Creator: MockAccount("0"), Amount: 50, Price: 25},
		{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
		{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
	}

	// Test no match if lowest ask too high (25 < 30)
	_, _, _, _, match, _ = types.LiquidateFromBuyOrder(OrderListToSellOrderBook(inputBook), inputOrder)
	require.False(t, match)

	// Entirely filled (30 > 15)
	inputOrder = types.Order{Id: 10, Creator: MockAccount("1"), Amount: 20, Price: 30}
	expected := liquidateBuyRes{
		Book: []types.Order{
			{Id: 0, Creator: MockAccount("0"), Amount: 50, Price: 25},
			{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
			{Id: 2, Creator: MockAccount("2"), Amount: 10, Price: 15},
		},
		Remaining:  types.Order{Id: 10, Creator: MockAccount("1"), Amount: 0, Price: 30},
		Liquidated: types.Order{Id: 2, Creator: MockAccount("2"), Amount: 20, Price: 15},
		Purchase:   int32(20),
		Match:      true,
		Filled:     true,
	}
	simulateLiquidateFromBuyOrder(t, inputBook, inputOrder, expected)

	// Entirely filled (30 = 30)
	inputOrder = types.Order{Id: 10, Creator: MockAccount("1"), Amount: 30, Price: 30}
	expected = liquidateBuyRes{
		Book: []types.Order{
			{Id: 0, Creator: MockAccount("0"), Amount: 50, Price: 25},
			{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
		},
		Remaining:  types.Order{Id: 10, Creator: MockAccount("1"), Amount: 0, Price: 30},
		Liquidated: types.Order{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
		Purchase:   int32(30),
		Match:      true,
		Filled:     true,
	}
	simulateLiquidateFromBuyOrder(t, inputBook, inputOrder, expected)

	// Not filled and entirely liquidated (60 > 30)
	inputOrder = types.Order{Id: 10, Creator: MockAccount("1"), Amount: 60, Price: 30}
	expected = liquidateBuyRes{
		Book: []types.Order{
			{Id: 0, Creator: MockAccount("0"), Amount: 50, Price: 25},
			{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
		},
		Remaining:  types.Order{Id: 10, Creator: MockAccount("1"), Amount: 30, Price: 30},
		Liquidated: types.Order{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
		Purchase:   int32(30),
		Match:      true,
		Filled:     false,
	}
	simulateLiquidateFromBuyOrder(t, inputBook, inputOrder, expected)
}

type fillBuyRes struct {
	Book       []types.Order
	Remaining  types.Order
	Liquidated []types.Order
	Purchase   int32
	Filled     bool
}

func simulateFillBuyOrder(
	t *testing.T,
	inputList []types.Order,
	inputOrder types.Order,
	expected fillBuyRes,
) {
	inputBook := OrderListToSellOrderBook(inputList)
	expectedBook := OrderListToSellOrderBook(expected.Book)
	require.True(t, sort.IsSorted(inputBook))
	require.True(t, sort.IsSorted(expectedBook))

	outputBook, remaining, liquidated, purchase, filled := types.FillBuyOrder(inputBook, inputOrder)

	require.Equal(t, expectedBook, outputBook)
	require.Equal(t, expected.Remaining, remaining)
	require.Equal(t, expected.Liquidated, liquidated)
	require.Equal(t, expected.Purchase, purchase)
	require.Equal(t, expected.Filled, filled)
}

func TestFillBuyOrder(t *testing.T) {
	var inputBook []types.Order

	// Empty book
	inputOrder := types.Order{Id: 10, Creator: MockAccount("1"), Amount: 30, Price: 10}
	expected := fillBuyRes{
		Book:       []types.Order{},
		Remaining:  inputOrder,
		Liquidated: []types.Order(nil),
		Purchase:   int32(0),
		Filled:     false,
	}
	simulateFillBuyOrder(t, inputBook, inputOrder, expected)

	// No match
	inputBook = []types.Order{
		{Id: 0, Creator: MockAccount("0"), Amount: 50, Price: 25},
		{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
		{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
	}
	expected = fillBuyRes{
		Book:       inputBook,
		Remaining:  inputOrder,
		Liquidated: []types.Order(nil),
		Purchase:   int32(0),
		Filled:     false,
	}
	simulateFillBuyOrder(t, inputBook, inputOrder, expected)

	// First order liquidated, not filled
	inputOrder = types.Order{Id: 10, Creator: MockAccount("1"), Amount: 60, Price: 18}
	expected = fillBuyRes{
		Book: []types.Order{
			{Id: 0, Creator: MockAccount("0"), Amount: 50, Price: 25},
			{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
		},
		Remaining: types.Order{Id: 10, Creator: MockAccount("1"), Amount: 30, Price: 18},
		Liquidated: []types.Order{
			{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
		},
		Purchase: int32(30),
		Filled:   false,
	}
	simulateFillBuyOrder(t, inputBook, inputOrder, expected)

	// Filled with two order
	inputOrder = types.Order{Id: 10, Creator: MockAccount("1"), Amount: 60, Price: 22}
	expected = fillBuyRes{
		Book: []types.Order{
			{Id: 0, Creator: MockAccount("0"), Amount: 50, Price: 25},
			{Id: 1, Creator: MockAccount("1"), Amount: 170, Price: 20},
		},
		Remaining: types.Order{Id: 10, Creator: MockAccount("1"), Amount: 0, Price: 22},
		Liquidated: []types.Order{
			{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
			{Id: 1, Creator: MockAccount("1"), Amount: 30, Price: 20},
		},
		Purchase: int32(30 + 30),
		Filled:   true,
	}
	simulateFillBuyOrder(t, inputBook, inputOrder, expected)

	// Not filled, sell order book liquidated
	inputOrder = types.Order{Id: 10, Creator: MockAccount("1"), Amount: 300, Price: 30}
	expected = fillBuyRes{
		Book:      []types.Order{},
		Remaining: types.Order{Id: 10, Creator: MockAccount("1"), Amount: 20, Price: 30},
		Liquidated: []types.Order{
			{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
			{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
			{Id: 0, Creator: MockAccount("0"), Amount: 50, Price: 25},
		},
		Purchase: int32(30 + 200 + 50),
		Filled:   false,
	}
	simulateFillBuyOrder(t, inputBook, inputOrder, expected)
}
```

## Create Tests for the Sell Order

```go
// types/sellorder_test.go
package types_test

import (
	"github.com/stretchr/testify/require"
	"github.com/username/interchange/x/ibcdex/types"
	"sort"
	"testing"
)

func TestNewSellOrderBook(t *testing.T) {
	amountDenom, priceDenom := GenPair()
	book := types.NewSellOrderBook(amountDenom, priceDenom)
	require.Equal(t, int32(0), book.OrderIDTrack)
	require.Equal(t, amountDenom, book.AmountDenom)
	require.Equal(t, priceDenom, book.PriceDenom)
	require.Empty(t, book.Orders)
}

type liquidateSellRes struct {
	Book       []types.Order
	Remaining  types.Order
	Liquidated types.Order
	Gain       int32
	Match      bool
	Filled     bool
}

func TestSellOrderBook_RemoveOrderFromID(t *testing.T) {
	inputList := []types.Order{
		{Id: 0, Creator: MockAccount("0"), Amount: 50, Price: 25},
		{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
		{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
		{Id: 3, Creator: MockAccount("3"), Amount: 2, Price: 10},
	}

	inputBook := OrderListToSellOrderBook(inputList)
	expectedList := []types.Order{
		{Id: 0, Creator: MockAccount("0"), Amount: 50, Price: 25},
		{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
		{Id: 3, Creator: MockAccount("3"), Amount: 2, Price: 10},
	}
	expectedBook := OrderListToSellOrderBook(expectedList)
	outputBook, err := inputBook.RemoveOrderFromID(2)
	require.NoError(t, err)
	require.Equal(t, expectedBook, outputBook)

	inputBook = OrderListToSellOrderBook(inputList)
	expectedList = []types.Order{
		{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
		{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
		{Id: 3, Creator: MockAccount("3"), Amount: 2, Price: 10},
	}
	expectedBook = OrderListToSellOrderBook(expectedList)
	outputBook, err = inputBook.RemoveOrderFromID(0)
	require.NoError(t, err)
	require.Equal(t, expectedBook, outputBook)

	inputBook = OrderListToSellOrderBook(inputList)
	expectedList = []types.Order{
		{Id: 0, Creator: MockAccount("0"), Amount: 50, Price: 25},
		{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
		{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
	}
	expectedBook = OrderListToSellOrderBook(expectedList)
	outputBook, err = inputBook.RemoveOrderFromID(3)
	require.NoError(t, err)
	require.Equal(t, expectedBook, outputBook)

	inputBook = OrderListToSellOrderBook(inputList)
	_, err = inputBook.RemoveOrderFromID(4)
	require.ErrorIs(t, err, types.ErrOrderNotFound)
}

func simulateLiquidateFromSellOrder(
	t *testing.T,
	inputList []types.Order,
	inputOrder types.Order,
	expected liquidateSellRes,
) {
	inputBook := OrderListToBuyOrderBook(inputList)
	expectedBook := OrderListToBuyOrderBook(expected.Book)
	require.True(t, sort.IsSorted(inputBook))
	require.True(t, sort.IsSorted(expectedBook))

	outputBook, remaining, liquidated, gain, match, filled := types.LiquidateFromSellOrder(inputBook, inputOrder)

	require.Equal(t, expectedBook, outputBook)
	require.Equal(t, expected.Remaining, remaining)
	require.Equal(t, expected.Liquidated, liquidated)
	require.Equal(t, expected.Gain, gain)
	require.Equal(t, expected.Match, match)
	require.Equal(t, expected.Filled, filled)
}

func TestLiquidateFromSellOrder(t *testing.T) {
	// No match for empty book
	inputOrder := types.Order{Id: 10, Creator: MockAccount("1"), Amount: 100, Price: 30}
	_, _, _, _, match, _ := types.LiquidateFromSellOrder(OrderListToBuyOrderBook([]types.Order{}), inputOrder)
	require.False(t, match)

	// Buy book
	inputBook := []types.Order{
		{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
		{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
		{Id: 0, Creator: MockAccount("0"), Amount: 50, Price: 25},
	}

	// Test no match if highest bid too low (25 < 30)
	_, _, _, _, match, _ = types.LiquidateFromSellOrder(OrderListToBuyOrderBook(inputBook), inputOrder)
	require.False(t, match)

	// Entirely filled (30 < 50)
	inputOrder = types.Order{Id: 10, Creator: MockAccount("1"), Amount: 30, Price: 22}
	expected := liquidateSellRes{
		Book: []types.Order{
			{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
			{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
			{Id: 0, Creator: MockAccount("0"), Amount: 20, Price: 25},
		},
		Remaining:  types.Order{Id: 10, Creator: MockAccount("1"), Amount: 0, Price: 22},
		Liquidated: types.Order{Id: 0, Creator: MockAccount("0"), Amount: 30, Price: 25},
		Gain:       int32(30 * 25),
		Match:      true,
		Filled:     true,
	}
	simulateLiquidateFromSellOrder(t, inputBook, inputOrder, expected)

	// Entirely filled and liquidated ( 50 = 50)
	inputOrder = types.Order{Id: 10, Creator: MockAccount("1"), Amount: 50, Price: 15}
	expected = liquidateSellRes{
		Book: []types.Order{
			{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
			{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
		},
		Remaining:  types.Order{Id: 10, Creator: MockAccount("1"), Amount: 0, Price: 15},
		Liquidated: types.Order{Id: 0, Creator: MockAccount("0"), Amount: 50, Price: 25},
		Gain:       int32(50 * 25),
		Match:      true,
		Filled:     true,
	}
	simulateLiquidateFromSellOrder(t, inputBook, inputOrder, expected)

	// Not filled and entirely liquidated (60 > 50)
	inputOrder = types.Order{Id: 10, Creator: MockAccount("1"), Amount: 60, Price: 10}
	expected = liquidateSellRes{
		Book: []types.Order{
			{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
			{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
		},
		Remaining:  types.Order{Id: 10, Creator: MockAccount("1"), Amount: 10, Price: 10},
		Liquidated: types.Order{Id: 0, Creator: MockAccount("0"), Amount: 50, Price: 25},
		Gain:       int32(50 * 25),
		Match:      true,
		Filled:     false,
	}
	simulateLiquidateFromSellOrder(t, inputBook, inputOrder, expected)
}

type fillSellRes struct {
	Book       []types.Order
	Remaining  types.Order
	Liquidated []types.Order
	Gain       int32
	Filled     bool
}

func simulateFillSellOrder(
	t *testing.T,
	inputList []types.Order,
	inputOrder types.Order,
	expected fillSellRes,
) {
	inputBook := OrderListToBuyOrderBook(inputList)
	expectedBook := OrderListToBuyOrderBook(expected.Book)
	require.True(t, sort.IsSorted(inputBook))
	require.True(t, sort.IsSorted(expectedBook))

	outputBook, remaining, liquidated, gain, filled := types.FillSellOrder(inputBook, inputOrder)

	require.Equal(t, expectedBook, outputBook)
	require.Equal(t, expected.Remaining, remaining)
	require.Equal(t, expected.Liquidated, liquidated)
	require.Equal(t, expected.Gain, gain)
	require.Equal(t, expected.Filled, filled)
}

func TestFillSellOrder(t *testing.T) {
	var inputBook []types.Order

	// Empty book
	inputOrder := types.Order{Id: 10, Creator: MockAccount("1"), Amount: 30, Price: 30}
	expected := fillSellRes{
		Book:       []types.Order{},
		Remaining:  inputOrder,
		Liquidated: []types.Order(nil),
		Gain:       int32(0),
		Filled:     false,
	}
	simulateFillSellOrder(t, inputBook, inputOrder, expected)

	// No match
	inputBook = []types.Order{
		{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
		{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
		{Id: 0, Creator: MockAccount("0"), Amount: 50, Price: 25},
	}
	expected = fillSellRes{
		Book:       inputBook,
		Remaining:  inputOrder,
		Liquidated: []types.Order(nil),
		Gain:       int32(0),
		Filled:     false,
	}
	simulateFillSellOrder(t, inputBook, inputOrder, expected)

	// First order liquidated, not filled
	inputOrder = types.Order{Id: 10, Creator: MockAccount("1"), Amount: 60, Price: 22}
	expected = fillSellRes{
		Book: []types.Order{
			{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
			{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
		},
		Remaining: types.Order{Id: 10, Creator: MockAccount("1"), Amount: 10, Price: 22},
		Liquidated: []types.Order{
			{Id: 0, Creator: MockAccount("0"), Amount: 50, Price: 25},
		},
		Gain:   int32(50 * 25),
		Filled: false,
	}
	simulateFillSellOrder(t, inputBook, inputOrder, expected)

	// Filled with two order
	inputOrder = types.Order{Id: 10, Creator: MockAccount("1"), Amount: 60, Price: 18}
	expected = fillSellRes{
		Book: []types.Order{
			{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
			{Id: 1, Creator: MockAccount("1"), Amount: 190, Price: 20},
		},
		Remaining: types.Order{Id: 10, Creator: MockAccount("1"), Amount: 0, Price: 18},
		Liquidated: []types.Order{
			{Id: 0, Creator: MockAccount("0"), Amount: 50, Price: 25},
			{Id: 1, Creator: MockAccount("1"), Amount: 10, Price: 20},
		},
		Gain:   int32(50*25 + 10*20),
		Filled: true,
	}
	simulateFillSellOrder(t, inputBook, inputOrder, expected)

	// Not filled, buy order book liquidated
	inputOrder = types.Order{Id: 10, Creator: MockAccount("1"), Amount: 300, Price: 10}
	expected = fillSellRes{
		Book:      []types.Order{},
		Remaining: types.Order{Id: 10, Creator: MockAccount("1"), Amount: 20, Price: 10},
		Liquidated: []types.Order{
			{Id: 0, Creator: MockAccount("0"), Amount: 50, Price: 25},
			{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
			{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
		},
		Gain:   int32(50*25 + 200*20 + 30*15),
		Filled: false,
	}
	simulateFillSellOrder(t, inputBook, inputOrder, expected)
}
```

When the tests are successful, your output should be 

```go
ok      github.com/username/interchange/x/ibcdex/types       0.550s
```