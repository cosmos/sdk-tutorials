---
title: "Bank - Send Tokens - With Kepler"
order: 4
description: Interacting with a Cosmos SDK chain through CosmJs and Kepler
tag: deep-dive
---

# Bank - Send Tokens - With Kepler

CosmJs allows you to connect with Keplr, the widely used browser extension, to manage your private keys. In a previous section you used the command-line and CosmJs to issue commands to the Theta dev net. Here, you will do the same but with a GUI and a Keplr flavor.

If you want, afterwards you can connect your locally started Cosmos blockchain like `simd`, and do the same.

To keep the focus on CosmJs and Keplr, you are going to use ready-made pages created by the Next.js framework. If you routinely use another framework, fear not, the CosmJs code is sufficiently identifiable.

## Create your simple Next.js project

In your project folder you create the ready-made Next.js app. It automatically places it in a subfolder for you. This follows [the docs](https://nextjs.org/docs).

```sh
$ npx create-next-app@latest --typescript
...
? What is your project named? › cosmjs-keplr
```

This created a new `cosmjs-keplr` folder. Go there. There you can find a `/pages` folder, which contains an `index.tsx`. That's your first page.

Run it, in the `cosmjs-keplr` folder:

```sh
$ npm run dev
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
...
```

You should see the result, a welcome page with links, in your browser. Next.js uses [React](https://reactjs.org/) under the hood.

## HTML elements

The goal of the exercise is to find balances, yours and the faucet's, and then have you send back some tokens to the faucet. So before introducing any CosmJs, you can create a React component that is almost ready for this purpose. By convention, you put your component in a `/components` folder. Below, in the expandable box is an example, named `FaucetSender.tsx`:

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

    onToSendChanged = (e: ChangeEvent<HTMLInputElement>) => this.setState({
        toSend: e.currentTarget.value
    })

    onSendClicked = async(e: MouseEvent<HTMLButtonElement>) => {
        alert("TODO")
    }

    render() {
        const { denom, faucetBalance, myAddress, myBalance, toSend } = this.state
        const { faucetAddress } = this.props
        console.log(toSend)
        return <div>
        <div className={styles.description}>Send back to the faucet</div>
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

Of note is that:

* Its **properties** happen to only contain the things it knows at build time.
* It keeps a **state**, and this state is either updated by the user or will be updated after a fetch.
* It reuses some default style you can find in `/styles`.

The component is still unused. Put it inside `index.tsx` like so:

```typescript
const Home: NextPage = () => {
  return <FaucetSender
    faucetAddress="cosmos15aptdqmm7ddgtcrjvc5hs988rlrkze40l4q0he"
    rpcUrl="https://rpc.one.theta-devnet.polypore.xyz" />
}
```

The faucet address was found in the [previous section](./first-steps.md).

When `npm run dev` picks up the changes, you should see that your page has changed to what you created.

It is not very useful just yet, but you can make it more so.

## Install CosmJs

Now that you have a working Next.js project and ready page, it is time to add the necessary CosmJs elements to the project:

```sh
$ npm install @cosmjs/stargate cosmjs-types --save
```

## Show what can be shown

When building a GUI, it is good practice to not ask your user's address until the point where you have presumably gained their trust and / or it is necessary, e.g. if they clicked a relevant button. So you ought to start by showing information that is knowable without user input. Here, it is `denom` and the faucet balance. Add a function for that:

```typescript
updateFaucetBalance = async(client: StargateClient) => {
    const balances: readonly Coin[] = await client.getAllBalances(this.props.faucetAddress)
    const first: Coin = balances[0]
    this.setState({
        denom: first.denom,
        faucetBalance: first.amount,
    })
}
```

Notice how it only cares about the first coin type. Add that in the constructor as well so that it does it on load. Via another specific function:

```typescript
constructor(props:FaucetSenderProps) {
    ...
    setTimeout(this.init, 500)
}

init = async() => this.updateFaucetBalance(await StargateClient.connect(this.props.rpcUrl))
```

After `run dev` picks the changes, you should see your page that starts showing relevant information.

Now, add elements that will handle your user's information.

## Detect Keplr

Following [Keplr's documentation](https://docs.keplr.app/api/#how-to-detect-keplr), it is time to add a function to see if Keplr is installed on the browser. For convenience and type hinting, install the Typescript Keplr types:

```sh
$ npm install @keplr-wallet/types --save-dev
```

And inform Typescript that `window` may have a `.keplr` field with the help of [this helper](https://github.com/chainapsis/keplr-wallet/tree/master/docs/api#keplr-specific-features), by adding it to `FaucetSender.tsx`:

```typescript
import { Window as KeplrWindow } from "@keplr-wallet/types";

declare global {
    interface Window extends KeplrWindow {}
}
```

Detecting Keplr can be done at any time, but because you want to keep the number of functions low for this exercise, you do it in `onSendClicked`. If you checked in `init`, you would risk annoying users who want to check your page incognito.

```typescript
onSendClicked = async(e: MouseEvent<HTMLButtonElement>) => {
    const { keplr } = window
    if (!keplr) {
        alert("You need to install Keplr")
        return
    }
}
```

Hopefully, now when you click on the button, it does not show any alert. It does not do anything either.

## Prepare Keplr

Keplr is now detected. Keplr, by default, lets its user connect only to the blockchains it knows about. Unfortunately, at the time of writing, Vega is not one of them. Fortunately, there is a not-so-experimental feature where you can instruct it to handle any Cosmos blockchain, provided you give the parameters for it. Here is [an example](https://github.com/chainapsis/keplr-example/blob/master/src/main.js). In the case of Vega, these parameters have already been created. Add a new function for them as shown in the expandable box:

<ExpansionPanel title="getVegaChainInfo">

```typescript
getVegaChainInfo = (): ChainInfo => ({
    chainId: "vega-testnet",
    chainName: "vega-testnet",
    rpc: "https://vega-rpc.interchain.io",
    rest: "https://vega-rest.interchain.io",
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

Notice how it mentions the `chainId: "vega-testnet"`. In effect, this adds Vega to its registry of blockchains, under the label `vega-testnet`. So whenever you need to tell Keplr about Vega, you would add the line:

```typescript
await window.keplr!.experimentalSuggestChain(this.getVegaChainInfo())
```

This needs to be done only once per reload.

Keplr is detected and prepared. Now have it do something interesting.

## Your address and balance

Now in `onSendClicked`, similarly to what you did in the previous section, you can:

1. Actually prepare Keplr.
2. Get the signer for your user's accounts.
3. Create your signing client.
4. Get the address and balance of your user's first account.
5. Send the requested coins to the faucet.
6. Inform and update.

In effect:

```typescript
onSendClicked = async(e: MouseEvent<HTMLButtonElement>) => {
    ...
    const { denom, toSend } = this.state
    const { faucetAddress, rpcUrl } = this.props
    await keplr.experimentalSuggestChain(this.getVegaChainInfo())
    const offlineSigner: OfflineSigner = window.getOfflineSigner!("vega-testnet")
    const signingClient = await SigningStargateClient.connectWithSigner(
        rpcUrl,
        offlineSigner,
        {
            gasPrice: GasPrice.fromString("1stake"),
        },
        )
    const account: AccountData = (await offlineSigner.getAccounts())[0];
    this.setState({
        myAddress: account.address,
        myBalance: (await signingClient.getBalance(account.address, denom)).amount,
    })
    const result = await signingClient.sendTokens(
        account.address,
        faucetAddress,
        [
            {
                denom: denom,
                amount: toSend,
            },
        ],
        "auto",
    )
    console.log(result)
    this.setState({
        myBalance:  (await signingClient.getBalance(account.address, denom)).amount,
        faucetBalance: (await signingClient.getBalance(faucetAddress, denom)).amount,
    })
}
```

Notice how Keplr is tasked with signing only. The transactions are broadcast with the RPC end point of your choice.

Of course, the functions could be better delineated, but this big function does the job in a readable manner.

To do the same but with a locally running chain, you only need to change the `ChainInfo` and the `rpcUrl`.

For the avoidance of doubt, you can find the full file in the expandable box below:

<ExpansionPanel title="Result FaucetSender file">

```typescript
import { Coin, GasPrice, SigningStargateClient, StargateClient } from "@cosmjs/stargate"
import { ChangeEvent, Component, MouseEvent } from "react"
import styles from '../styles/Home.module.css'
import { ChainInfo, Window as KeplrWindow } from "@keplr-wallet/types";
import { AccountData, OfflineSigner } from "@cosmjs/stargate/node_modules/@cosmjs/proto-signing";

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

export class FaucetSender extends Component<FaucetSenderProps, FaucetSenderState> {

    constructor(props:FaucetSenderProps) {
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

    onToSendChanged = (e: ChangeEvent<HTMLInputElement>) => this.setState({
        toSend: e.currentTarget.value
    })

    onSendClicked = async(e: MouseEvent<HTMLButtonElement>) => {
        const { keplr } = window
        if (!keplr) {
            alert("You need to install Keplr")
            return
        }
        const { denom, toSend } = this.state
        const { faucetAddress, rpcUrl } = this.props
        await keplr.experimentalSuggestChain(this.getVegaChainInfo())
        const offlineSigner: OfflineSigner = window.getOfflineSigner!("vega-testnet")
        const signingClient = await SigningStargateClient.connectWithSigner(
            rpcUrl,
            offlineSigner,
            {
                gasPrice: GasPrice.fromString("1stake"),
            },
            )
        const account: AccountData = (await offlineSigner.getAccounts())[0];
        this.setState({
            myAddress: account.address,
            myBalance: (await signingClient.getBalance(account.address, denom)).amount,
        })
        const result = await signingClient.sendTokens(
            account.address,
            faucetAddress,
            [
                {
                    denom: denom,
                    amount: toSend,
                },
            ],
            "auto",
        )
        console.log(result)
        this.setState({
            myBalance:  (await signingClient.getBalance(account.address, denom)).amount,
            faucetBalance: (await signingClient.getBalance(faucetAddress, denom)).amount,
        })
    }

    getVegaChainInfo = (): ChainInfo => ({
        chainId: "vega-testnet",
        chainName: "vega-testnet",
        rpc: "https://vega-rpc.interchain.io",
        rest: "https://vega-rest.interchain.io",
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

    init = async() => this.updateFaucetBalance(await StargateClient.connect(this.props.rpcUrl))

    updateFaucetBalance = async(client: StargateClient) => {
        const balances: readonly Coin[] = await client.getAllBalances(this.props.faucetAddress)
        const first: Coin = balances[0]
        this.setState({
            denom: first.denom,
            faucetBalance: first.amount,
        })
    }

    render() {
        const { denom, faucetBalance, myAddress, myBalance, toSend } = this.state
        const { faucetAddress } = this.props
        console.log(toSend)
        return <div>
        <div className={styles.description}>Send back to the faucet</div>
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
