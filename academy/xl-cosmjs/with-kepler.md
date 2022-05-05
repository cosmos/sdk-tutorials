---
title: "Bank - Send Tokens - with Keplr"
order: 4
description: Interacting with a Cosmos SDK chain through CosmJS and Kepler
tag: deep-dive
---

# Bank - Send Tokens - with Keplr

CosmJS allows you to connect with [Keplr](https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap), the widely used browser extension, to manage your private keys. In a previous section you used the command-line and CosmJS to issue commands to the Theta testnet. Here, you will do the same but with a GUI and a Keplr flavor.

Optionally you can connect your locally-started Cosmos blockchain like `simd` and do the same.

To keep the focus on CosmJS and Keplr, you are going to use ready-made pages created by the Next.js framework. Do not worry if you routinely use another framework, the CosmJS code is sufficiently identifiable.

## Create your simple Next.js project

In your project folder create the ready-made Next.js app, which automatically places it in a subfolder for you. This follows [the docs](https://nextjs.org/docs):

```sh
$ npx create-next-app@latest --typescript
...
? What is your project named? › cosmjs-keplr
```

This created a new `cosmjs-keplr` folder. There you can find a `/pages` folder, which contains an `index.tsx`. That's your first page.

Run it, in the `cosmjs-keplr` folder:

```sh
$ npm run dev
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
...
```

You should see the result, a welcome page with links, in your browser. Next.js uses [React](https://reactjs.org/) under the hood.

## HTML elements

The goal of the exercise is to find balances, yours and the faucet's, and then have you send back some tokens to the faucet. Before introducing any CosmJS, you can create a React component that is almost ready for this purpose. By convention, put your component in a `/components` folder, as in the following example using `FaucetSender.tsx`:

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

Note:

* The **properties** of `FaucetSender.tsx` only contain the things it knows at build time.
* It keeps a **state**, and this state is either updated by the user or will be updated after a fetch.
* It reuses a default style you can find in `/styles`.

The component is still unused. Put it inside `index.tsx`:

```typescript
import { FaucetSender } from '../components/FaucetSender'

const Home: NextPage = () => {
  return <FaucetSender
    faucetAddress="cosmos15aptdqmm7ddgtcrjvc5hs988rlrkze40l4q0he"
    rpcUrl="https://rpc.sentry-01.theta-testnet.polypore.xyz" />
}
```

The faucet address was found in the [previous section](./first-steps.md).

When `npm run dev` picks up the changes, you should see that your page has changed to what you created. In particular, it alerts you with "TODO" when you click on the button.

Your page is not very useful yet, but you can make it more so.

## Install CosmJS

Now that you have a working Next.js project and ready page, it is time to add the necessary CosmJS elements to the project:

```sh
$ npm install @cosmjs/stargate cosmjs-types --save
```

## Show what can be shown

When building a GUI, it is good practice to not ask your user's address until you have presumably gained their trust, or when it becomes necessary (e.g. if they click a relevant button). You should start by showing information that is knowable without user input. Here, this is `denom` and the faucet balance. Add a function for that:

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

Note that it only cares about the first coin type: this is to keep the exercise simple. It extracts the `denom`, which is then displayed to the user as the unit to transfer. Add that in the constructor as well so that it runs on load via another specific function:

```typescript
constructor(props:FaucetSenderProps) {
    ...
    setTimeout(this.init, 500)
}

init = async() => this.updateFaucetBalance(await StargateClient.connect(this.props.rpcUrl))
```

After `run dev` picks the changes, you should see that your page starts showing relevant information.

Now, add elements that will handle your user's information.

## Get test tokens

Refer to the previous section on how to [get Theta tokens](./first-steps.md). This time, you use your Keplr address. It is the same one that Keplr shows you for Cosmos Hub.

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

Detecting Keplr can be done at any time, but do it in `onSendClicked` to keep the number of functions low for this exercise. If you checked in `init`, you would risk annoying users who want to check your page incognito.

```typescript
onSendClicked = async(e: MouseEvent<HTMLButtonElement>) => {
    const { keplr } = window
    if (!keplr) {
        alert("You need to install Keplr")
        return
    }
}
```

Hopefully, when you click on the button it does not show an alert. It does not do anything else either. As an optional confirmation, if you disable Keplr from Chrome's extension manager, when you click the button the page will tell you to install it.

## Prepare Keplr

Keplr is now detected. By default, Keplr lets its user connect only to the blockchains it knows about. Unfortunately Theta is not one of them, but there is a feature where you can instruct it to handle any Cosmos blockchain provided you give its parameters. Here is [an example](https://github.com/chainapsis/keplr-example/blob/master/src/main.js). In the case of Theta these parameters have already been created, as mentioned on the [testnet page](https://github.com/cosmos/testnets/tree/master/v7-theta#add-to-keplr-1). Add a new function for them as shown in the expandable box:

<ExpansionPanel title="getThetaChainInfo">

```typescript
getThetaChainInfo = (): ChainInfo => ({
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

Note that it mentions the `chainId: "theta-testnet-001"`. In effect, this adds Theta to Keplr's registry of blockchains, under the label `theta-testnet-001`. Whenever you need to tell Keplr about Theta, add the line:

```typescript
await window.keplr!.experimentalSuggestChain(this.getThetaChainInfo())
```

This needs to be done once, but repeating the line is not problematic.

Keplr is now detected and prepared. Now have it do something interesting.

## Your address and balance

In `onSendClicked`, similar to the previous section, you can:

1. Prepare Keplr, with `keplr.experimentalSuggestChain`.
2. Get the signer for your user's accounts, with `KeplrWindow`'s `window.getOfflineSigner`.
3. Create your signing client.
4. Get the address and balance of your user's first account.
5. Send the requested coins to the faucet.
6. Inform and update.

In practice:

```typescript
onSendClicked = async(e: MouseEvent<HTMLButtonElement>) => {
    ...
    const { denom, toSend } = this.state
    const { faucetAddress, rpcUrl } = this.props
    await keplr.experimentalSuggestChain(this.getThetaChainInfo())
    const offlineSigner: OfflineSigner =
        window.getOfflineSigner!("theta-testnet-001")
    const signingClient = await SigningStargateClient.connectWithSigner(
        rpcUrl,
        offlineSigner,
    )
    const account: AccountData = (await offlineSigner.getAccounts())[0]
    this.setState({
        myAddress: account.address,
        myBalance: (await signingClient.getBalance(account.address, denom))
            .amount,
    })
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
    console.log(sendResult)
    this.setState({
        myBalance: (await signingClient.getBalance(account.address, denom))
            .amount,
        faucetBalance: (
            await signingClient.getBalance(faucetAddress, denom)
        ).amount,
    })
}
```

Note:

* Keplr is tasked with signing only.
* The transactions are broadcast with the RPC end point of your choice.

These functions could be better delineated, but this big function does the job in a readable manner.

Now run it. In the refreshed page, enter an amount of `uatom` (for example `1000000`) and click <kbd>Send to faucet</kbd>. The chain of events is launched:

1. Keplr asks for confirmation that you agree to add the Theta network. It will not install any network without your approval, as that would be a security risk. It asks this only the first time you add a given network, which is why doing it in `onSendClicked` is harmless.
    ![Keplr asking for permission to add Theta network](/keplr_theta_addition.png)
2. Keplr asks whether you agree to share your account information, because this involves a potential security risk. Again, it asks this only once per web page + network combination.
    ![Keplr asking for permission to share your account information](/keplr_share_account.png)
3. Your address and balance fields are updated and visible.
4. Keplr asks whether you agree to sign the transaction, a very important action that requires approval **every time**.
    ![Keplr asking for confirmation on the transaction](/keplr_send_to_faucet.png)

After this is done, your balance updates again, and in the browser console you see the transaction result.

For the avoidance of doubt, the full file appears in the expandable box below:

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

    init = async () =>
        this.updateFaucetBalance(
            await StargateClient.connect(this.props.rpcUrl),
        )

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

    onToSendChanged = (e: ChangeEvent<HTMLInputElement>) =>
        this.setState({
            toSend: e.currentTarget.value,
        })

    onSendClicked = async (e: MouseEvent<HTMLButtonElement>) => {
        const { keplr } = window
        if (!keplr) {
            alert("You need to install Keplr")
            return
        }
        const { denom, toSend } = this.state
        const { faucetAddress, rpcUrl } = this.props
        await keplr.experimentalSuggestChain(this.getThetaChainInfo())
        const offlineSigner: OfflineSigner =
            window.getOfflineSigner!("theta-testnet-001")
        const signingClient = await SigningStargateClient.connectWithSigner(
            rpcUrl,
            offlineSigner,
        )
        const account: AccountData = (await offlineSigner.getAccounts())[0]
        this.setState({
            myAddress: account.address,
            myBalance: (await signingClient.getBalance(account.address, denom))
                .amount,
        })
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
        console.log(sendResult)
        this.setState({
            myBalance: (await signingClient.getBalance(account.address, denom))
                .amount,
            faucetBalance: (
                await signingClient.getBalance(faucetAddress, denom)
            ).amount,
        })
    }

    getThetaChainInfo = (): ChainInfo => ({
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

    render() {
        const { denom, faucetBalance, myAddress, myBalance, toSend } =
            this.state
        const { faucetAddress } = this.props
        return (
            <div>
                <div className={styles.description}>
                    Send back to the faucet
                </div>
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

Keplr does not know about locally running chains by default. As you did with Theta, you must inform Keplr about your chain: change `ChainInfo` to match the information about your chain, and change `rpcUrl` so that it points to your local port.

## Conclusion

You have how updated your CosmJS GUI so that it integrates with Keplr.
