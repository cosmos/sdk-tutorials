# Testing our app

The example provider (MockProvider) doesn't really get any prices from the real world, it just pushes the same hardcoded prices on every block. To get our prices, we
first have to run a query through CLI:

```shell
tutoriald query oracle prices
```

This will get us the current prices, for example:

```shell
ATOMUSD: 10
OSMOUSD: 2
```

These prices won't change as they have been hardcoded in x/oracle/mockprovider/provider.go. To see them change, we need to stop the chain, and modify the
values there.

```go
switch pair {
case "ATOMUSD":
price = math.LegacyNewDec(20)
case
"OSMOUSD":
price = math.LegacyNewDec(3)
}
```

Now after building again we can run the app and after a block is produced we'll see that the prices have changed:

```shell
ATOMUSD: 20
OSMOUSD: 3
```