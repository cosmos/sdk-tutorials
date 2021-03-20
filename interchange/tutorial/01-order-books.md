## Order book lib

The files used for order book logic (all located in `types`):

[https://github.com/tendermint/interchange/tree/implementation-2/x/ibcdex/types](https://github.com/tendermint/interchange/tree/implementation-2/x/ibcdex/types)

- `orderbook.go` - interfaces and common logic for order books
- `sellorder.go` - logic for sell orders
- `buyorder.go` - logic for buy orders

You must copy these files in your project

We also have `buyorder_test.go`, `orderbook_test.go`, and `sellorder_test.go` for unit tests

## Proto definition

We must define the order book proto

```
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

We modify the proto for sell and buy order book by adding the list of orders

```
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


```
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