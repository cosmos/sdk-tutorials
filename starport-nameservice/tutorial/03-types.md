---
order: 3
---

# Types

First thing we're going to do is create a module in the `/x/` folder with the scaffold tool using the below command:

In the case of this tutorial we will be naming the module `nameservice`

```bash
cd x/

scaffold module [user] [repo] nameservice
```

## `types.go`

Now we can continue with creating a module. Start by creating the file `types.go`in `./x/nameservice/types` folder which will hold customs types for the module.

## Whois

Each name will have three pieces of data associated with it.

- Value - The value that a name resolves to. This is just an arbitrary string, but in the future you can modify this to require it fitting a specific format, such as an IP address, DNS Zone file, or blockchain address.
- Owner - The address of the current owner of the name
- Price - The price you will need to pay in order to buy the name

To start your SDK module, define your `nameservice.Whois` struct in the `./x/nameservice/types/types.go` file:

<<< @/nameservice/x/nameservice/types/types.go

As mentioned in the [Design doc](./app-design.md), if a name does not already have an owner, we want to initialize it with some MinPrice.
