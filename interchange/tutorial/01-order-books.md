## Order book

The files used for order book logic (all located in `types`):

[https://github.com/tendermint/interchange/tree/implementation-2/x/ibcdex/types](https://github.com/tendermint/interchange/tree/implementation-2/x/ibcdex/types)

- `orderbook.go` - interfaces and common logic for order books
- `sellorder.go` - logic for sell orders
- `buyorder.go` - logic for buy orders

You must copy these files in your project

We also have `buyorder_test.go`, `orderbook_test.go`, and `sellorder_test.go` for unit tests

## Proto definition

Let's create a proto file and define an `Order` type. An order consists of an amount of tokens to be exchanged, a price a token, incrementing ID and creator's address. We don't need to record denoms in orders, because information about denoms is stored in order books.

```proto
// order.proto:
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

We now need to add a list of orders to order books: `repeated Order orders = 6;`. Since we're using `Order` type we need to make sure that we import the proto file `import "ibcdex/order.proto";`.

```proto
// sellOrderBook.proto:
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

Let's do the same in `BuyOrderBook.proto`.

```proto
// buyOrderBook.proto:
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