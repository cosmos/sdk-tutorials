---
title: "Getting ATOM and Staking It"
order: 4
description: Stake your first ATOM
tags:
  - concepts
  - cosmos-hub
---

# Getting ATOM and Staking It

<HighlightBox type="learning">

In this section you are going to:

* Get some ATOM.
* Participate in the consensus, to passively earn a yield on your ATOMs while working on your own Cosmos application, sleeping, or studying further.

</HighlightBox>

The [Cosmos Hub](https://hub.cosmos.network) is the first among equals of Cosmos blockchains. ATOM is its native token, also called the staking token. You need some ATOM to be able to transact on the Cosmos Hub or to participate in the proof-of-stake (PoS) consensus.

<HighlightBox type="info">

The main concepts are covered in more detail in the [next chapter](/academy/2-cosmos-concepts/index.md).

</HighlightBox>

There are two steps to successfully get ATOM:

1. Install a wallet application and configure it safely. You will use [Keplr](https://keplr.app/).
2. Buy some ATOM on an exchange and transfer them to your wallet.

If you prefer to do the same but with test ATOMs, you can use an existing Cosmos Hub testnet. Head to this [later section](/tutorials/7-cosmjs/2-first-steps.md#get-a-balance) for guidance. Then come back here and adjust accordingly for the relevant testnet.

## Setting up Keplr

Open Google Chrome on your computer and go to the [Keplr extension page](https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap). Alternatively, you can search for Keplr in the [Chrome extensions store](https://chrome.google.com/webstore/search/Keplr).

<HighlightBox type="warn">

It is always good practice to be careful with links to wallet software because of the possibility of fraudulent software designed to steal from you. A link to the official Keplr extension can also be found on the [Interchain Ecosystem overview page](https://cosmos.network/ecosystem/wallets).

</HighlightBox>

When Keplr is installed it should be available in the list of extensions when you click on the icon that looks like a puzzle piece in the top-right corner of Chrome:

![Keplr seen as an extension in Google Chrome](/academy/1-what-is-cosmos/images/keplr-as-extension.png)

<HighlightBox type="warn">

When you own ATOM with Keplr, **you are in charge**. There is no one you can call if _you forget your password/seed phrase or you send tokens to the wrong address_.
<br/><br/>
Keplr is a non-custodial wallet.

</HighlightBox>

With the Keplr extension installed and the previous warning in mind, create a new account. Click your Keplr extension and the following page should open:

![Creating a new account or connecting to an existing account with Keplr](/academy/1-what-is-cosmos/images/keplr-create-menu.png)

Click _Create new account_. A new page offers you a mnemonic (a secret list of words) and asks you for a password. Because **you are in charge**, it is important to understand the following points:

* Whoever knows the **mnemonic seed** has access to **all** the assets in the wallet as easily as you do. This means that:
    * Nobody else should be looking at your screen right now. If that is not the case, click _Back_.
    * You should only ever share your mnemonic seed with parties you would also give access to your bank account. **Do not** share it with an exchange, a proof-of-stake validator, another blockchain service, or "someone from the Interchain" on the phone  - these are _not_ trusted partners.
    * You should save the mnemonic seed in a safe place, so that you can import it back into this or another wallet at a later date. **Make sure** you write it down somewhere safe.
* Keplr saves your seed on disk but in an encrypted form.
* Keplr asks you for the **encryption password**, which is used to encrypt your mnemonic on your computer. For the password, keep in mind:
    * It should be a strong password.
    * You should also save it securely.
    * Keplr will ask you for it every time you open the wallet and for important actions.
* If your computer or the encrypted mnemonic seed file is stolen, your wallet assets are only as protected as your password is strong.

![Keplr mnemonic seed and creating a password page](/academy/1-what-is-cosmos/images/keplr-mnemonic-step.png)

When you are ready, click _Next_.

If you saved your seed, you should be able to complete the next step: click on each word in the correct order.

![Keplr mnemonic recall prompt: Selecting the correct words of your mnemonic](/academy/1-what-is-cosmos/images/keplr-mnemonic-recall-prompt.png)

When done, the _Register_ button should become active:

![Keplr mnemonic recall done](/academy/1-what-is-cosmos/images/keplr-mnemonic-recall-done.png)

Click _Register_. Your Keplr wallet is now fully created:

![Keplr all set](/academy/1-what-is-cosmos/images/keplr-all-set.png)

Click the extension icon again. It shows your first public address in the form `cosmos1...`, and that you hold zero ATOM.

Click the drop-down menu labeled _Cosmos_ at the top of the screen to see how many assets from other supported networks you have:

![Keplr empty assets](/academy/1-what-is-cosmos/images/keplr-empty-assets.png)

<HighlightBox type="info">

A note on your **address**: As with a street address, it is OK for others to know it, as it allows others to send you ATOM or other assets.

</HighlightBox>

You can also open the [Keplr dashboard page](https://wallet.keplr.app/#/dashboard), which interfaces with the extension. Note that the dashboard at this address is a web page loaded from a website and, as such, is **not** a trusted partner. It will never ask you for your mnemonic or your password.

<HighlightBox type="tip">

Be sure to save your mnemonic and password safely before you put any valuables in your wallet.

</HighlightBox>

## Purchase one ATOM

How you purchase ATOM depends on your preference, but you need to use your trusted exchange to purchase ATOM. You can buy any amount you wish, although it is recommended to get at least 0.3 ATOM so your funds are not consumed in transaction fees before the end of this exercise.

For the purpose of this section we assume you buy one ATOM.

<HighlightBox type="info">

As you can see in the [Get ATOM and stake page](https://cosmos.network/learn/get-atom) from the Interchain, there is a [list of exchanges](https://messari.io/asset/cosmos/markets) that are known by the Interchain for offering ATOM tokens.

</HighlightBox>

When you are done, your account on the exchange should show that you _own_ one ATOM:

![When you have one ATOM on Kraken](/academy/1-what-is-cosmos/images/kraken-one-atom.png)

However, you do not yet own it as you would if the token were in your Keplr wallet. The exchange still owns the token but assures you that they will send it to you when asked. The exchange acts like a custodial wallet.

## Withdraw your ATOM

Your exchange has a withdrawal function that allows you to send your ATOM anywhere, including to your Keplr wallet. You must set this up.

You need your wallet address. Since it is very long, you should avoid typing it by hand and instead copy it to the clipboard by clicking it in Keplr:

![View of the Keplr address zone](/academy/1-what-is-cosmos/images/keplr-address-zone.png)

Now go back to your exchange and paste this address where asked. **Confirm that it looks identical to the original you copied**, and proceed with the confirmation the exchange requires from you:

![Kraken: add address](/academy/1-what-is-cosmos/images/kraken-add-address.png)

When this is set, you ask the exchange to withdraw properly. Take note of the transaction fee of the exchange. It is much higher than a realistic transaction fee would have been, had you done the transaction yourself within your wallet:

![Kraken exchange parameters](/academy/1-what-is-cosmos/images/kraken-exchange-params.png)

If all went well, you should see your new asset in Keplr after a few minutes:

![Keplr received ATOM](/academy/1-what-is-cosmos/images/keplr-with-atom.png)

Congratulations! You now own slightly less than one ATOM. Remember that **you** are really in charge, so check again that your mnemonic and password are saved properly.

<HighlightBox type="tip">

You can also look at your address using a public explorer, like [mintscan.io](https://mintscan.io).

</HighlightBox>

You can see the same if you open the [wallet dashboard page](https://wallet.keplr.app/#/dashboard). On this wallet page you can see a small link icon that leads you to your address page:

![Keplr wallet link out to address page](/academy/1-what-is-cosmos/images/keplr-wallet-link-out.png)

There you can see the transaction that originated from the exchange's wallet:

![Mintscan crediting transaction](/academy/1-what-is-cosmos/images/mintscan-crediting-tx.png)

## Stake your ATOM

Your 0.9 ATOM is now available and waiting in your wallet. It will stay there and remain 0.9 ATOM forever unless you use it for something.

_What about participating in the security of the Cosmos Hub blockchain?_

You can do this by delegating some of your ATOM as stake to a network validator. A validator consists of one or more cooperating computers that participate in the consensus by creating blocks. In exchange for this service, validators receive block rewards and share the rewards with their delegators, minus their commission. Your modest delegated stake could award you a modest share of a validator's rewards.

<HighlightBox type="tip">

When considering staking, keep the following factors in mind:

* Unlike a centralized exchange that holds your assets in a custodial wallet, when you delegate your ATOM **you remain in charge of your ATOM**. The validator does not have access to your assets. Think of your stake as a weighted vote of confidence.
* There is a non-zero risk that the validator you chose behaves incorrectly or even maliciously, which exposes the faulty validator _and you_ to **protocol penalties**.
* When you delegate ATOM to a validator, it becomes **locked**. You cannot use it for anything else, and **there is a time commitment**. Should you decide to un-delegate your stake, you will have to wait **three weeks** to regain access to your delegated stake.

</HighlightBox>

Now find a validator and delegate your ATOM to it. Click the _Stake_ button in Keplr. You are presented with a list of validators:

![Keplr: list of validators](/academy/1-what-is-cosmos/images/keplr-validator-list.png)

You can immediately discard any validators that keep 100% of the rewards for themselves, as they work for custodial wallets kept on behalf of their customers. Pick a validator that you like, click _Manage_, and a link will direct you to more information on this validator. You can see more information on each validator on [Mintscan's validator list for the Interchain](https://www.mintscan.io/cosmos/validators). Pay attention to the uptime, as a missed block would cost you penalties.

A validator can have small or large voting power. The larger the voting power, the more often the validator is tasked with issuing a block. Voting power is closely linked to the reward amount you can expect:

<Accordion :items="
    [
        {
            title: 'Validator has large voting power',
            description: 'If your chosen validator has large voting power, your rewards come frequently (for example, every minute) but in small numbers.'
        },
        {
            title: 'Validator has small voting power',
            description: 'If your chosen validator has small voting power, your rewards come infrequently (for example, every hour) but in large numbers.'
        }
    ]
"/>

Over the long run, you should receive the same amount in rewards regardless of whether your chosen validator has large or small voting power. What matters more is the size of your stake.

If you like the validator's information, click _Delegate_ and add the sum you want to delegate. Do not delegate all that you own, because you need a fraction of ATOM to send the transaction, plus further ATOM in the future to either un-delegate or claim your rewards.

Pick 0.8 ATOM and click _Delegate_ again:

![Keplr: delegate parameters](/academy/1-what-is-cosmos/images/keplr-delegate-params.png)

This delegation is an important action. It is the first action you take with your private key. Every time an application asks Keplr to do an important action, Keplr will ask you to confirm it:

![Keplr: delegate confirm window](/academy/1-what-is-cosmos/images/keplr-delegate-confirm.png)

You do not need this delegate transaction to be confirmed quickly, so choose the low end of transaction fees and click _Approve_. The transaction should not take longer than a couple of minutes to be confirmed.

When it is confirmed, your **pending staking rewards** start to accrue. Their increase will not be fast because you delegated only 0.8 ATOM, and they only accrue when your chosen validator issues a block. After perhaps 20 minutes, you should see something similar to this:

![Keplr: accruing rewards](/academy/1-what-is-cosmos/images/keplr-accruing-rewards.png)

Your rewards are said to be "pending" because you need to claim them before they are yours. The claim transaction incurs fees, so it is best to wait until your rewards exceed the transaction fees before submitting any claim transaction. With only 0.8 ATOM staked you will need to wait about 10 days to accrue something worth the claim transaction.

## Claim your ATOM

You did it! You waited 10 days, and have accrued rewards:

![Keplr: accruing good rewards](/academy/1-what-is-cosmos/images/keplr-accruing-good-rewards.png)

This is enough to cover the claim transaction. Go ahead and claim it. Again, choose the low fee option to reduce losses against this small reward sum:

![Keplr: claim rewards](/academy/1-what-is-cosmos/images/keplr-claim-rewards.png)

Your rewards are added straight to your wallet:

![Keplr: increased number of available ATOM tokens](/academy/1-what-is-cosmos/images/keplr-increased-available.png)

If you want to re-stake this amount and benefit from the compound effect, go ahead, but make sure you do not lose too much in transaction costs.

This completes the exercise: you are set up to participate in the Cosmos Hub network, and even contribute to its security. Your stake will work for you as you continue your Interchain training journey.

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How to safely install and configure a Keplr wallet and transfer ATOM into it.
* How to stake ATOM on a validator, thereby participating in the security of the blockchain and potentially increasing your wealth by accruing staking rewards.

</HighlightBox>

<!--## Next up

In the [next chapter](../2-cosmos-concepts/index.md), you will continue to explore the Cosmos SDK and learn about the underlying blockchain application architecture.-->

<!--In the [next chapter](../3-ibc/index.md), you will learn about the Inter-Blockchain Communication Protocol.-->
