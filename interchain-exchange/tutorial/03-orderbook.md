---
order: 4
---

# Create the Orderbook

In this chapter you implement the code for the orderbook, Buy orders and Sell orders.

The orderbook will contain the interface and common logic for the exchange. On the orderbook you can create new pairs to exchange.
The Sell Order will contain the interface for creating sell orders on the orderbook.
The Buy Order will contain the interface for creating buy orders on the orderbook.

<!-- [https://github.com/tendermint/interchange/tree/implementation-2/x/ibcdex/types](https://github.com/tendermint/interchange/tree/implementation-2/x/ibcdex/types) -->

## Add The Orderbook

First, create a new file `orderbook.go` in the `ibcdex` module `types` directory.
In this file, you will define the logic for creating a new orderbook. 

Create a `orderbook.go` file and add the code:

```go
// x/ibcdex/orderbook.go
package types

import (
	"errors"
	"sort"
)

const (
	MaxAmount = int32(100000)
	MaxPrice  = int32(100000)
)

var (
	ErrMaxAmount     = errors.New("max amount reached")
	ErrMaxPrice      = errors.New("max price reached")
	ErrZeroAmount    = errors.New("amount is zero")
	ErrZeroPrice     = errors.New("price is zero")
	ErrOrderNotFound = errors.New("order not found")
)

type OrderBook interface {
	sort.Interface
	InsertOrder(Order) OrderBook
	GetOrder(int) (Order, error)
	SetOrder(int, Order) (OrderBook, error)
	GetNextOrderID() int32
	IncrementNextOrderID() OrderBook
	GetOrderFromID(int32) (Order, error)
	RemoveOrderFromID(int32) (OrderBook, error)
}

// UpdateOrderBook updates an order book with an order
// if the ID already exist, it append the amount to the existing order (without checking price)
// if it doesn't exist, the order is inserted
func UpdateOrderBook(book OrderBook, order Order) OrderBook {
	// Search of the order of the same ID
	var found bool
	var orderToUpdate Order
	var i int
	for i = book.Len() - 1; i >= 0; i-- {
		orderToUpdate, _ = book.GetOrder(i)
		if orderToUpdate.Id == order.Id {
			found = true
			break
		}
	}

	// If order found
	if found {
		orderToUpdate.Amount += order.Amount
		book, _ = book.SetOrder(i, orderToUpdate)
	} else {
		book = book.InsertOrder(order)
	}

	return book
}

// RestoreOrderBook restores the order book from a order book transition
func RestoreOrderBook(book OrderBook, liquidated []Order) OrderBook {
	// Restore all liquidation inside the order book
	for _, liquidation := range liquidated {
		book = UpdateOrderBook(book, liquidation)
	}

	return book
}

// AppendOrder initializes and appends a new order in a book from order information
func AppendOrder(book OrderBook, creator string, amount int32, price int32) (OrderBook, int32, error) {
	if err := checkAmountAndPrice(amount, price); err != nil {
		return book, 0, err
	}

	// Initialize the order
	var order Order
	order.Id = book.GetNextOrderID()
	order.Creator = creator
	order.Amount = amount
	order.Price = price

	// Increment ID tracker
	book = book.IncrementNextOrderID()

	// Insert the order
	book = book.InsertOrder(order)

	return book, order.Id, nil
}

// checkAmountAndPrice checks correct amount or price
func checkAmountAndPrice(amount int32, price int32) error {
	if amount == int32(0) {
		return ErrZeroAmount
	}
	if amount > MaxAmount {
		return ErrMaxAmount
	}
	if price == int32(0) {
		return ErrZeroPrice
	}
	if price > MaxPrice {
		return ErrMaxPrice
	}

	return nil
}
```

## Add The Sellorder

For the code of the sell orders, create a `sellorder.go` file in the `types` directory and add the following code:

```go
package types

import (
	"sort"
)

// sort.Interface
func (book SellOrderBook) Len() int {
	return len(book.Orders)
}
func (book SellOrderBook) Less(i, j int) bool {
	return book.Orders[i].Price > book.Orders[j].Price
}
func (book SellOrderBook) Swap(i, j int) {
	book.Orders[i], book.Orders[j] = book.Orders[j], book.Orders[i]
}

// InsertOrder inserts the order in the decreasing order in the book
// it doesn't set the ID or check if the ID already exist
func (book SellOrderBook) InsertOrder(order Order) OrderBook {
	// Insert the order in the increasing order
	if len(book.Orders) > 0 {
		i := sort.Search(len(book.Orders), func(i int) bool { return book.Orders[i].Price < order.Price })
		orders := append(book.Orders, &order)
		copy(orders[i+1:], orders[i:])
		orders[i] = &order
		book.Orders = orders
	} else {
		book.Orders = append(book.Orders, &order)
	}

	return book
}

// GetOrder gets the order from an index
func (book SellOrderBook) GetOrder(index int) (order Order, err error) {
	if index >= len(book.Orders) {
		return order, ErrOrderNotFound
	}

	return *book.Orders[index], nil
}

// SetOrder gets the order from an index
func (book SellOrderBook) SetOrder(index int, order Order) (OrderBook, error) {
	if index >= len(book.Orders) {
		return book, ErrOrderNotFound
	}

	book.Orders[index] = &order

	return book, nil
}

// GetNextOrderID gets the ID of the next order to append
func (book SellOrderBook) GetNextOrderID() int32 {
	return book.OrderIDTrack
}

// IncrementNextOrderID updates the ID tracker for sell orders
func (book SellOrderBook) IncrementNextOrderID() OrderBook {
	// Even numbers to have different ID than buy orders
	book.OrderIDTrack += 2

	return book
}

// GetOrderFromID gets an order from the book from its id
func (book SellOrderBook) GetOrderFromID(id int32) (Order, error) {
	for _, order := range book.Orders {
		if order.Id == id {
			return *order, nil
		}
	}
	return Order{}, ErrOrderNotFound
}

// RemoveOrderFromID removes an order from the book and keep it ordered
func (book SellOrderBook) RemoveOrderFromID(id int32) (OrderBook, error) {
	for i, order := range book.Orders {
		if order.Id == id {
			book.Orders = append(book.Orders[:i], book.Orders[i+1:]...)
			return book, nil
		}
	}
	return book, ErrOrderNotFound
}

func NewSellOrderBook(AmountDenom string, PriceDenom string) SellOrderBook {
	return SellOrderBook{
		OrderIDTrack: 0,
		AmountDenom:  AmountDenom,
		PriceDenom:   PriceDenom,
	}
}

// LiquidateFromSellOrder liquidates the first buy order of the book from the sell order
// if no match is found, return false for match
func LiquidateFromSellOrder(book BuyOrderBook, order Order) (
	newBook BuyOrderBook,
	remainingSellOrder Order,
	liquidatedBuyOrder Order,
	gain int32,
	match bool,
	filled bool,
) {
	remainingSellOrder = order

	// No match if no order
	if book.Len() == 0 {
		return book, order, liquidatedBuyOrder, gain, false, false
	}

	// Check if match
	highestBid := book.Orders[book.Len()-1]
	if order.Price > highestBid.Price {
		return book, order, liquidatedBuyOrder, gain, false, false
	}

	liquidatedBuyOrder = *highestBid

	// Check if sell order can be entirely filled
	if highestBid.Amount >= order.Amount {
		remainingSellOrder.Amount = 0
		liquidatedBuyOrder.Amount = order.Amount
		gain = order.Amount * highestBid.Price

		// Remove highest bid if it has been entirely liquidated
		highestBid.Amount -= order.Amount
		if highestBid.Amount == 0 {
			book.Orders = book.Orders[:book.Len()-1]
		} else {
			book.Orders[book.Len()-1] = highestBid
		}
		return book, remainingSellOrder, liquidatedBuyOrder, gain, true, true
	}

	// Not entirely filled
	gain = highestBid.Amount * highestBid.Price
	book.Orders = book.Orders[:book.Len()-1]
	remainingSellOrder.Amount -= highestBid.Amount

	return book, remainingSellOrder, liquidatedBuyOrder, gain, true, false
}

// FillSellOrder try to fill the sell order with the order book and returns all the side effects
func FillSellOrder(book BuyOrderBook, order Order) (
	newBook BuyOrderBook,
	remainingSellOrder Order,
	liquidated []Order,
	gain int32,
	filled bool,
) {
	var liquidatedList []Order
	totalGain := int32(0)
	remainingSellOrder = order

	// Liquidate as long as there is match
	for {
		var match bool
		var liquidation Order
		book, remainingSellOrder, liquidation, gain, match, filled = LiquidateFromSellOrder(
			book,
			remainingSellOrder,
		)
		if !match {
			break
		}

		// Update gains
		totalGain += gain

		// Update liquidated
		liquidatedList = append(liquidatedList, liquidation)

		if filled {
			break
		}
	}

	return book, remainingSellOrder, liquidatedList, totalGain, filled
}
```
## Add The Buyorder

For the buy orders, createa `buyorder.go` file in the `types` directory and add the following code:

```go
package types

import (
	"sort"
)

// sort.Interface
func (book BuyOrderBook) Len() int {
	return len(book.Orders)
}
func (book BuyOrderBook) Less(i, j int) bool {
	// Buy orders are decreasingly sorted
	return book.Orders[i].Price < book.Orders[j].Price
}
func (book BuyOrderBook) Swap(i, j int) {
	book.Orders[i], book.Orders[j] = book.Orders[j], book.Orders[i]
}

// InsertOrder inserts the order in the increasing order in the book
// it doesn't set the ID or check if the ID already exist
func (book BuyOrderBook) InsertOrder(order Order) OrderBook {
	// Insert the order in the increasing order
	if len(book.Orders) > 0 {
		i := sort.Search(len(book.Orders), func(i int) bool { return book.Orders[i].Price > order.Price })
		orders := append(book.Orders, &order)
		copy(orders[i+1:], orders[i:])
		orders[i] = &order
		book.Orders = orders
	} else {
		book.Orders = append(book.Orders, &order)
	}

	return book
}

// GetOrder gets the order from an index
func (book BuyOrderBook) GetOrder(index int) (order Order, err error) {
	if index >= len(book.Orders) {
		return order, ErrOrderNotFound
	}

	return *book.Orders[index], nil
}

// SetOrder gets the order from an index
func (book BuyOrderBook) SetOrder(index int, order Order) (OrderBook, error) {
	if index >= len(book.Orders) {
		return book, ErrOrderNotFound
	}

	book.Orders[index] = &order

	return book, nil
}

// GetNextOrderID gets the ID of the next order to append
func (book BuyOrderBook) GetNextOrderID() int32 {
	return book.OrderIDTrack
}

// IncrementNextOrderID updates the ID tracker for buy orders
func (book BuyOrderBook) IncrementNextOrderID() OrderBook {
	// Even numbers to have different ID than buy orders
	book.OrderIDTrack += 2

	return book
}

// GetOrderFromID gets an order from the book from its id
func (book BuyOrderBook) GetOrderFromID(id int32) (Order, error) {
	for _, order := range book.Orders {
		if order.Id == id {
			return *order, nil
		}
	}
	return Order{}, ErrOrderNotFound
}

// RemoveOrderFromID removes an order from the book and keep it ordered
func (book BuyOrderBook) RemoveOrderFromID(id int32) (OrderBook, error) {
	for i, order := range book.Orders {
		if order.Id == id {
			book.Orders = append(book.Orders[:i], book.Orders[i+1:]...)
			return book, nil
		}
	}
	return book, ErrOrderNotFound
}

func NewBuyOrderBook(AmountDenom string, PriceDenom string) BuyOrderBook {
	return BuyOrderBook{
		OrderIDTrack: 1,
		AmountDenom:  AmountDenom,
		PriceDenom:   PriceDenom,
	}
}

// LiquidateFromBuyOrder liquidates the first sell order of the book from the buy order
// if no match is found, return false for match
func LiquidateFromBuyOrder(book SellOrderBook, order Order) (
	newBook SellOrderBook,
	remainingBuyOrder Order,
	liquidatedSellOrder Order,
	purchase int32,
	match bool,
	filled bool,
) {
	remainingBuyOrder = order

	// No match if no order
	if book.Len() == 0 {
		return book, order, liquidatedSellOrder, purchase, false, false
	}

	// Check if match
	lowestAsk := book.Orders[book.Len()-1]
	if order.Price < lowestAsk.Price {
		return book, order, liquidatedSellOrder, purchase, false, false
	}

	liquidatedSellOrder = *lowestAsk

	// Check if buy order can be entirely filled
	if lowestAsk.Amount >= order.Amount {
		remainingBuyOrder.Amount = 0
		liquidatedSellOrder.Amount = order.Amount
		purchase = order.Amount

		// Remove lowest ask if it has been entirely liquidated
		lowestAsk.Amount -= order.Amount
		if lowestAsk.Amount == 0 {
			book.Orders = book.Orders[:book.Len()-1]
		} else {
			book.Orders[book.Len()-1] = lowestAsk
		}

		return book, remainingBuyOrder, liquidatedSellOrder, purchase, true, true
	}

	// Not entirely filled
	purchase = lowestAsk.Amount
	book.Orders = book.Orders[:book.Len()-1]
	remainingBuyOrder.Amount -= lowestAsk.Amount

	return book, remainingBuyOrder, liquidatedSellOrder, purchase, true, false
}

// FillBuyOrder try to fill the buy order with the order book and returns all the side effects
func FillBuyOrder(book SellOrderBook, order Order) (
	newBook SellOrderBook,
	remainingBuyOrder Order,
	liquidated []Order,
	purchase int32,
	filled bool,
) {
	var liquidatedList []Order
	totalPurchase := int32(0)
	remainingBuyOrder = order

	// Liquidate as long as there is match
	for {
		var match bool
		var liquidation Order
		book, remainingBuyOrder, liquidation, purchase, match, filled = LiquidateFromBuyOrder(
			book,
			remainingBuyOrder,
		)
		if !match {
			break
		}

		// Update gains
		totalPurchase += purchase

		// Update liquidated
		liquidatedList = append(liquidatedList, liquidation)

		if filled {
			break
		}
	}

	return book, remainingBuyOrder, liquidatedList, totalPurchase, filled
}
```

<!-- You must copy these files in your project

We also have `buyorder_test.go`, `orderbook_test.go`, and `sellorder_test.go` for unit tests -->


## Proto definition

Define the proto files. 
The proto files for `order`, `sellOrderBook` and `buyOrderBook` define what parameters each of the messages will have.

```proto
// proto/order.proto
syntax = "proto3";
package tendermint.interchange.ibcdex;

option go_package = "github.com/tendermint/interchange/x/ibcdex/types";

message Order {
  int32 id = 1;
  string creator = 2;
  int32 amount = 3;
  int32 price = 4;
}
```

We modify the proto for sell and buy order book by adding the list of orders

```proto
// proto/sellOrderBook.proto
syntax = "proto3";
package tendermint.interchange.ibcdex;

option go_package = "github.com/tendermint/interchange/x/ibcdex/types";

import "ibcdex/order.proto";

message SellOrderBook {
  string index = 2;
  int32 orderIDTrack = 3;
  string amountDenom = 4;
  string priceDenom = 5;
  repeated Order orders = 6;
}
```

```proto
// proto/buyOrderBook.proto
syntax = "proto3";
package tendermint.interchange.ibcdex;

option go_package = "github.com/tendermint/interchange/x/ibcdex/types";

import "ibcdex/order.proto";

message BuyOrderBook {
  string index = 2;
  int32 orderIDTrack = 3;
  string amountDenom = 4;
  string priceDenom = 5;
  repeated Order orders = 6;
}
```