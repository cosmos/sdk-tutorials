---
title: "Learn to Integrate Keplr"
order: 5
description: Interact with a Cosmos SDK chain through CosmJS and Keplr
tags: 
  - tutorial
  - cosm-js
  - dev-ops
---

# Learn to Integrate Keplr

<HighlightBox type="learning">

Build applicatiosn that interact with the Keplr browser extension.
<br/><br/> 
In this section, you will learn more about: 
    
* Detecting Keplr.
* Getting chain information.
* Working with the user interaction flow.

</HighlightBox>

CosmJS allows you to connect with [Keplr](https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap), the widely used browser extension, to manage your private keys. In a previous section you used the command-line and CosmJS to issue commands to the Cosmos Hub Testnet. In this tutorial, you are working on a browser application that interacts with the Keplr extension.

You will again connect to the Cosmos Hub Testnet. Optionally, connect to your locally running Cosmos blockchain using `simapp` as explained [before](./2-first-steps.md).

To keep the focus on CosmJS and Keplr, you are going to use ready-made pages created by the Next.js framework. Do not worry if you routinely use another framework, the CosmJS-specific code in this tutorial can be applied similarly in Angular, Vue, and other frameworks.

## Creating your simple Next.js project

In your project folder create the ready-made Next.js app, which automatically places it in a subfolder for you. This follows [the docs](https://nextjs.org/docs):

```sh
$ npx create-next-app@latest --typescript
```

Which guides you with:

```txt
...
? What is your project named? › cosmjs-keplr
```

This created a new `cosmjs-keplr` folder. There you can find a `/pages` folder, which contains an `index.tsx`. That's your first page.

Run it, in the `cosmjs-keplr` folder:

```sh
$ npm run dev
```

Which returns:

```txt
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
...
```

You should see the result, a welcome page with links, in your browser by visiting [http://localhost:3000](http://localhost:3000). Next.js uses [React](https://reactjs.org/) under the hood.

## HTML elements

The goal of the exercise is to find token balances, yours and the faucet's, and then send some tokens back to the faucet. Before introducing any CosmJS, you can already create a React component that includes the basic user interface that you need. By convention, create a `/components` folder and then copy the following code inside a new file called `FaucetSender.tsx`:

<ExpansionPanel title="FaucetSender.tsx">

```typescript
import { ChangeEvent, Component, MouseEvent } from "react"
import styles from '../styles/Home.module.css'

interface FaucetSenderState {
    denom: string
    faucetBalance: string
    myAddress: string
    myBalance: string
    toSend: string
}

export interface FaucetSenderProps {
    faucetAddress: string
    rpcUrl: string
}

export class FaucetSender extends Component<FaucetSenderProps, FaucetSenderState> {


    // Set the initial state
    constructor(props:FaucetSenderProps) {
        super(props)
        this.state = {
            denom: "Loading...",
            faucetBalance: "Loading...",
            myAddress: "Click first",
            myBalance: "Click first",
            toSend: "0",
        }
    }

    // Store changed token amount to state
    onToSendChanged = (e: ChangeEvent<HTMLInputElement>) => this.setState({
        toSend: e.currentTarget.value
    })

    // When the user clicks the "send to faucet button"
    onSendClicked = async(e: MouseEvent<HTMLButtonElement>) => {
        alert("TODO")
    }

    // The render function that draws the component at init and at state change
    render() {
        const { denom, faucetBalance, myAddress, myBalance, toSend } = this.state
        const { faucetAddress } = this.props
        console.log(toSend)
        // The web page structure itself
        return <div>
            <fieldset className={styles.card}>
                <legend>Faucet</legend>
                <p>Address: {faucetAddress}</p>
                <p>Balance: {faucetBalance}</p>
            </fieldset>
            <fieldset className={styles.card}>
                <legend>You</legend>
                <p>Address: {myAddress}</p>
                <p>Balance: {myBalance}</p>
            </fieldset>
            <fieldset className={styles.card}>
                <legend>Send</legend>
                <p>To faucet:</p>
                <input value={toSend} type="number" onChange={this.onToSendChanged}/> {denom}
                <button onClick={this.onSendClicked}>Send to faucet</button>
            </fieldset>
        </div>
    }
}
```

</ExpansionPanel>

<HighlightBox type="note">

The **properties** of `FaucetSender.tsx` only contain the things it knows at build time. It keeps a **state**, and this state is either updated by the user or after a fetch. It reuses a default style you can find in `/styles`.

</HighlightBox>

The component is still unused. You do not need the default page that comes with create-next-app, so you can replace the contents of `index.tsx` with the following code that imports the new component:

```typescript
import type { NextPage } from 'next'
import { FaucetSender } from '../components/FaucetSender'

const Home: NextPage = () => {
  return <FaucetSender
    faucetAddress="cosmos15aptdqmm7ddgtcrjvc5hs988rlrkze40l4q0he"
    rpcUrl="https://rpc.sentry-01.theta-testnet.polypore.xyz" />
}

export default Home
```

The faucet address was found in the [previous section](./2-first-steps.md), as well as the RPC endpoint that connects to the Cosmos Hub Testnet.

When `npm run dev` picks up the changes, you should see that your page has changed to what you created. In particular, it alerts you with "TODO" when you click on the button.

Your page is not very useful yet, make it more so.

## Installing CosmJS

Now that you have a working Next.js project and ready page, it is time to add the necessary CosmJS elements to the project:

```sh
$ npm install @cosmjs/stargate cosmjs-types --save
```

## Displaying information without user input

When building a user interface, it is good practice to not ask your user's address until it becomes necessary (e.g. if they click a relevant button). You should start by showing information that is knowable without user input. In this case, this is the token `denom` (denomination) and the faucet's balance. Add the following function that gets the balance from the faucet and place it above the `onToSendChanged` function inside `FaucetSender.tsx`:

```typescript
// Get the faucet's balance
updateFaucetBalance = async(client: StargateClient) => {
    const balances: readonly Coin[] = await client.getAllBalances(this.props.faucetAddress)
    const first: Coin = balances[0]
    this.setState({
        denom: first.denom,
        faucetBalance: first.amount,
    })
}
```

Note that it only cares about the first coin type stored in `balances[0]`: this is to keep the exercise simple, but there could be multiple coins in that array of balances. It extracts the `denom`, which is then displayed to the user as the unit to transfer. Add the denom that in the constructor as well so that it runs on load via another specific function:

```typescript
constructor(props:FaucetSenderProps) {
    ...
    setTimeout(this.init, 500)
}

init = async() => this.updateFaucetBalance(await StargateClient.connect(this.props.rpcUrl))
```

After `run dev` picks the changes, you should see that your page starts showing the relevant information.

Now, add elements that handle your user's information.

## Getting testnet tokens

Refer to the previous section on how to [get Cosmos Hub Testnet tokens](./2-first-steps.md). This time you should use your Keplr address. If you have not set up one yet, do so now. Your Cosmos Hub Testnet address is the same one that Keplr shows you for the Cosmos Hub mainnet.

## Detecting Keplr

Following [Keplr's documentation](https://docs.keplr.app/api/#how-to-detect-keplr), it is time to add a function to see if Keplr is installed on the browser. For convenience and type hinting, install the Typescript Keplr types from within the folder of your project:

```sh
$ npm install @keplr-wallet/types --save-dev
```

After this package is installed, inform Typescript that `window` may have a `.keplr` field with the help of [this helper](https://github.com/chainapsis/keplr-wallet/tree/master/docs/api#keplr-specific-features), by adding it below your imports to `FaucetSender.tsx`:

```typescript
import { Window as KeplrWindow } from "@keplr-wallet/types";

declare global {
    interface Window extends KeplrWindow {}
}
```

Detecting Keplr can be done at any time, but to keep the number of functions low for this exercise do it in `onSendClicked`. You want to avoid detecting Keplr on page load if not absolutely necessary. This is generally considered bad user experience for users who might just want to browse your page and not interact with it. Replace the `onSendClicked` with the following:

```typescript
onSendClicked = async(e: MouseEvent<HTMLButtonElement>) => {
    const { keplr } = window
    if (!keplr) {
        alert("You need to install Keplr")
        return
    }
}
```

Hopefully, when you click on the button it does not show an alert. It does not do anything else either. As an optional confirmation, if you disable Keplr from Chrome's extension manager, when you click the button the page tells you to install it.

## Prepare Keplr

Keplr is now detected. By default, Keplr lets its users only connect to the blockchains it knows about. Unfortunately, the Cosmos Hub Testnet is not one of them, but there is a feature where you can instruct it to handle any Cosmos blockchain, provided you give its parameters. Here is [an example](https://github.com/chainapsis/keplr-example/blob/master/src/main.js). In the case of Cosmos Hub Testnet, these parameters are available, as mentioned on the [testnet page](https://github.com/cosmos/testnets/tree/master/public#add-to-keplr). Add a new function for them as shown in the expandable box:

<ExpansionPanel title="getTestnetChainInfo">

```typescript
getTestnetChainInfo = (): ChainInfo => ({
    chainId: "theta-testnet-001",
    chainName: "theta-testnet-001",
    rpc: "https://rpc.sentry-01.theta-testnet.polypore.xyz/",
    rest: "https://rest.sentry-01.theta-testnet.polypore.xyz/",
    bip44: {
        coinType: 118,
    },
    bech32Config: {
        bech32PrefixAccAddr: "cosmos",
        bech32PrefixAccPub: "cosmos" + "pub",
        bech32PrefixValAddr: "cosmos" + "valoper",
        bech32PrefixValPub: "cosmos" + "valoperpub",
        bech32PrefixConsAddr: "cosmos" + "valcons",
        bech32PrefixConsPub: "cosmos" + "valconspub",
    },
    currencies: [
        {
            coinDenom: "ATOM",
            coinMinimalDenom: "uatom",
            coinDecimals: 6,
            coinGeckoId: "cosmos",
        },
        {
            coinDenom: "THETA",
            coinMinimalDenom: "theta",
            coinDecimals: 0,
        },
        {
            coinDenom: "LAMBDA",
            coinMinimalDenom: "lambda",
            coinDecimals: 0,
        },
        {
            coinDenom: "RHO",
            coinMinimalDenom: "rho",
            coinDecimals: 0,
        },
        {
            coinDenom: "EPSILON",
            coinMinimalDenom: "epsilon",
            coinDecimals: 0,
        },
    ],
    feeCurrencies: [
        {
            coinDenom: "ATOM",
            coinMinimalDenom: "uatom",
            coinDecimals: 6,
            coinGeckoId: "cosmos",
        },
    ],
    stakeCurrency: {
        coinDenom: "ATOM",
        coinMinimalDenom: "uatom",
        coinDecimals: 6,
        coinGeckoId: "cosmos",
    },
    coinType: 118,
    gasPriceStep: {
        low: 1,
        average: 1,
        high: 1,
    },
    features: ["stargate", "ibc-transfer", "no-legacy-stdTx"],
})
```

</ExpansionPanel>

You need to add another import from the `@keplr-wallet` package so that your script understands what `ChainInfo` is:

```typescript
import { ChainInfo, Window as KeplrWindow } from "@keplr-wallet/types"
```

Note that it mentions the `chainId: "theta-testnet-001"`. In effect, this adds the Cosmos Hub Testnet to Keplr's registry of blockchains, under the label `theta-testnet-001`. Whenever you want to prompt the user to add the Cosmos Hub Testnet to Keplr, add the line:

```typescript
await window.keplr!.experimentalSuggestChain(this.getTestnetChainInfo())
```

This needs to be done once, which in this case is in the `onSendClicked` function after having detected Keplr, but repeating the line elsewhere is generally not a problem.

Keplr is now detected and prepared. Now try to do something useful with the user's information.

## Your address and balance

In `onSendClicked`, similar to the previous section, you can:

1. Prepare Keplr, with `keplr.experimentalSuggestChain`.
2. Get the signer for your user's accounts, with `KeplrWindow`'s `window.getOfflineSigner`.
3. Create your signing client.
4. Get the address and balance of your user's first account.
5. Send the requested coins to the faucet.
6. Inform and update.

In practice, the code for `onSendClicked` looks like this:

```typescript
onSendClicked = async(e: MouseEvent<HTMLButtonElement>) => {
    // Detect Keplr
    const { keplr } = window
    if (!keplr) {
        alert("You need to install Keplr")
        return
    }
    // Get the current state and amount of tokens that we want to transfer
    const { denom, toSend } = this.state
    const { faucetAddress, rpcUrl } = this.props
    // Suggest the testnet chain to Keplr
    await keplr.experimentalSuggestChain(this.getTestnetChainInfo())
    // Create the signing client
    const offlineSigner: OfflineSigner =
        window.getOfflineSigner!("theta-testnet-001")
    const signingClient = await SigningStargateClient.connectWithSigner(
        rpcUrl,
        offlineSigner,
    )
    // Get the address and balance of your user
    const account: AccountData = (await offlineSigner.getAccounts())[0]
    this.setState({
        myAddress: account.address,
        myBalance: (await signingClient.getBalance(account.address, denom))
            .amount,
    })
    // Submit the transaction to send tokens to the faucet
    const sendResult = await signingClient.sendTokens(
        account.address,
        faucetAddress,
        [
            {
                denom: denom,
                amount: toSend,
            },
        ],
        {
            amount: [{ denom: "uatom", amount: "500" }],
            gas: "200000",
        },
    )
    // Print the result to the console
    console.log(sendResult)
    // Update the balance in the user interface
    this.setState({
        myBalance: (await signingClient.getBalance(account.address, denom))
            .amount,
        faucetBalance: (
            await signingClient.getBalance(faucetAddress, denom)
        ).amount,
    })
}
```

<HighlightBox type="note">

Keplr is only tasked with signing transactions. The transactions are broadcast with the RPC endpoint of your choice.

</HighlightBox>

Now run the full script. In the refreshed page, enter an amount of `uatom` (for example `1000000`) and click <kbd>Send to faucet</kbd>. A number of events happen:

1. Keplr asks for confirmation that you agree to add the testnet network. It does not install any network without your approval, as that would be a security risk. It asks this only the first time you add a given network, which is why doing it in `onSendClicked` is harmless.
    ![Keplr asking for permission to add testnet network](/tutorials/7-cosmjs/images/keplr_testnet_addition.png)
2. Keplr asks whether you agree to share your account information, because this involves a potential security risk. Again, it asks this only once per web page + network combination.
    ![Keplr asking for permission to share your account information](/tutorials/7-cosmjs/images/keplr_share_account.png)
3. Your address and balance fields are updated and visible.
4. Keplr asks whether you agree to sign the transaction, a very important action that requires approval **every time**.
    ![Keplr asking for confirmation on the transaction](/tutorials/7-cosmjs/images/keplr_send_to_faucet.png)

After this is done, your balance updates again, and in the browser console you see the transaction result.

If you want to double check if you got everything right, you can find the full component's code in the expandable box below:

<ExpansionPanel title="Final FaucetSender.tsx file">

```typescript
import { Coin, SigningStargateClient, StargateClient } from "@cosmjs/stargate"
import { AccountData, OfflineSigner } from "@cosmjs/proto-signing"
import { ChainInfo, Window as KeplrWindow } from "@keplr-wallet/types"
import { ChangeEvent, Component, MouseEvent } from "react"
import styles from "../styles/Home.module.css"

declare global {
    interface Window extends KeplrWindow {}
}

interface FaucetSenderState {
    denom: string
    faucetBalance: string
    myAddress: string
    myBalance: string
    toSend: string
}

export interface FaucetSenderProps {
    faucetAddress: string
    rpcUrl: string
}

export class FaucetSender extends Component<
    FaucetSenderProps,
    FaucetSenderState
> {
    // Set the initial state
    constructor(props: FaucetSenderProps) {
        super(props)
        this.state = {
            denom: "Loading...",
            faucetBalance: "Loading...",
            myAddress: "Click first",
            myBalance: "Click first",
            toSend: "0",
        }
        setTimeout(this.init, 500)
    }

    // Connecting to the endpoint to fetch the faucet balance
    init = async () =>
        this.updateFaucetBalance(
            await StargateClient.connect(this.props.rpcUrl),
        )

    // Get the faucet's balance
    updateFaucetBalance = async (client: StargateClient) => {
        const balances: readonly Coin[] = await client.getAllBalances(
            this.props.faucetAddress,
        )
        const first: Coin = balances[0]
        this.setState({
            denom: first.denom,
            faucetBalance: first.amount,
        })
    }

    // Store changed token amount to state
    onToSendChanged = (e: ChangeEvent<HTMLInputElement>) =>
        this.setState({
            toSend: e.currentTarget.value,
        })

    // When the user clicks the "send to faucet button"
    onSendClicked = async (e: MouseEvent<HTMLButtonElement>) => {
        // Detect Keplr
        const { keplr } = window
        if (!keplr) {
            alert("You need to install Keplr")
            return
        }
        // Get the current state and amount of tokens that we want to transfer
        const { denom, toSend } = this.state
        const { faucetAddress, rpcUrl } = this.props
        // Suggest the testnet chain to Keplr
        await keplr.experimentalSuggestChain(this.getTestnetChainInfo())
        // Create the signing client
        const offlineSigner: OfflineSigner =
            window.getOfflineSigner!("theta-testnet-001")
        const signingClient = await SigningStargateClient.connectWithSigner(
            rpcUrl,
            offlineSigner,
        )
        // Get the address and balance of your user
        const account: AccountData = (await offlineSigner.getAccounts())[0]
        this.setState({
            myAddress: account.address,
            myBalance: (await signingClient.getBalance(account.address, denom))
                .amount,
        })
        // Submit the transaction to send tokens to the faucet
        const sendResult = await signingClient.sendTokens(
            account.address,
            faucetAddress,
            [
                {
                    denom: denom,
                    amount: toSend,
                },
            ],
            {
                amount: [{ denom: "uatom", amount: "500" }],
                gas: "200000",
            },
        )
        // Print the result to the console
        console.log(sendResult)
        // Update the balance in the user interface
        this.setState({
            myBalance: (await signingClient.getBalance(account.address, denom))
                .amount,
            faucetBalance: (
                await signingClient.getBalance(faucetAddress, denom)
            ).amount,
        })
    }

    // The Cosmos Hub Testnet chain parameters
    getTestnetChainInfo = (): ChainInfo => ({
        chainId: "theta-testnet-001",
        chainName: "theta-testnet-001",
        rpc: "https://rpc.sentry-01.theta-testnet.polypore.xyz/",
        rest: "https://rest.sentry-01.theta-testnet.polypore.xyz/",
        bip44: {
            coinType: 118,
        },
        bech32Config: {
            bech32PrefixAccAddr: "cosmos",
            bech32PrefixAccPub: "cosmos" + "pub",
            bech32PrefixValAddr: "cosmos" + "valoper",
            bech32PrefixValPub: "cosmos" + "valoperpub",
            bech32PrefixConsAddr: "cosmos" + "valcons",
            bech32PrefixConsPub: "cosmos" + "valconspub",
        },
        currencies: [
            {
                coinDenom: "ATOM",
                coinMinimalDenom: "uatom",
                coinDecimals: 6,
                coinGeckoId: "cosmos",
            },
            {
                coinDenom: "THETA",
                coinMinimalDenom: "theta",
                coinDecimals: 0,
            },
            {
                coinDenom: "LAMBDA",
                coinMinimalDenom: "lambda",
                coinDecimals: 0,
            },
            {
                coinDenom: "RHO",
                coinMinimalDenom: "rho",
                coinDecimals: 0,
            },
            {
                coinDenom: "EPSILON",
                coinMinimalDenom: "epsilon",
                coinDecimals: 0,
            },
        ],
        feeCurrencies: [
            {
                coinDenom: "ATOM",
                coinMinimalDenom: "uatom",
                coinDecimals: 6,
                coinGeckoId: "cosmos",
            },
        ],
        stakeCurrency: {
            coinDenom: "ATOM",
            coinMinimalDenom: "uatom",
            coinDecimals: 6,
            coinGeckoId: "cosmos",
        },
        coinType: 118,
        gasPriceStep: {
            low: 1,
            average: 1,
            high: 1,
        },
        features: ["stargate", "ibc-transfer", "no-legacy-stdTx"],
    })

    // The render function that draws the component at init and at state change
    render() {
        const { denom, faucetBalance, myAddress, myBalance, toSend } =
            this.state
        const { faucetAddress } = this.props
        // The web page structure itself
        return (
            <div>
                <fieldset className={styles.card}>
                    <legend>Faucet</legend>
                    <p>Address: {faucetAddress}</p>
                    <p>Balance: {faucetBalance}</p>
                </fieldset>
                <fieldset className={styles.card}>
                    <legend>You</legend>
                    <p>Address: {myAddress}</p>
                    <p>Balance: {myBalance}</p>
                </fieldset>
                <fieldset className={styles.card}>
                    <legend>Send</legend>
                    <p>To faucet:</p>
                    <input
                        value={toSend}
                        type="number"
                        onChange={this.onToSendChanged}
                    />{" "}
                    {denom}
                    <button onClick={this.onSendClicked}>Send to faucet</button>
                </fieldset>
            </div>
        )
    }
}
```

</ExpansionPanel>

## With a locally running chain

What if you wanted to experiment with your own chain while in development?

Keplr does not know about locally running chains by default. As you did with Cosmos Hub Testnet, you must inform Keplr about your chain: change `ChainInfo` to match the information about your chain, and change `rpcUrl` so that it points to your local port.

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How to use CosmJS to connect with Keplr, a browser extension widely used to manage private keys, to find your token balance and that of the faucet and then send some tokens back to the faucet.
* How to create a simple app in the Next.js framework for the purposes of performing the exercise, though the ComsJS-specific code is also applicable to Angular, Vue, and other frameworks.
* Best practices regarding when and when not to ask for your user's address, such as limiting your user interface to only showing information that is knowable without user input until making a request is absolutely necessary.
* How to add a function to detect whether or not Keplr is installed on the browser, also minimizing the occasions when information requests are made in line with best practices.
* How to prepare Keplr to handle any Cosmos blockchain (or for use with locally running chains, such as during development) by providing it with the necessary parameters for a specific chain, before experimenting with accessing useful information from the chain.

</HighlightBox>

<!--## Next up

You have how updated your CosmJS frontend so that it integrates with Keplr. In the [next section](./5-create-custom.md), learn more about creating custom CosmJS interfaces.-->

