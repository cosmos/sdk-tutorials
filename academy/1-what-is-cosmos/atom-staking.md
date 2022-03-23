---
title: "Getting ATOM and Staking It"
order: 4
description: Staking your first ATOM
tag: fast-track
---

# Getting ATOM and Staking It

The [Cosmos Hub](https://hub.cosmos.network) is the first among equals of Cosmos blockchains. ATOM is its native token, also called the staking token. You need some ATOM to be able to transact on the Cosmos Hub or to participate in the proof-of-stake (PoS) consensus.

In this section you are going to:

1. Get some ATOM.
2. Participate in the consensus to passively earn a yield on your ATOMs while working on your own Cosmos application, sleeping, or studying further.

<HighlightBox type="info">

We cover the main concepts in more detail in the [next chapter](../2-main-concepts/index.md).

</HighlightBox>

There are two steps to successfully get ATOM:

1. Install a wallet application and configure it safely. You will use [Keplr](https://keplr.app/).
2. Buy some ATOM on an exchange and transfer them to your wallet.

## Setting up Keplr

Open Google Chrome on your computer and go to the [Keplr extension page](https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap). Alternatively you can search for Keplr in the [Chrome extensions store](https://chrome.google.com/webstore/search/Keplr).

<HighlightBox type="tip">

It is always good practice to be careful with links to wallet software because of the possibility of fraudulent software designed to steal from you. A link to the official Keplr extension can also be found on the [Cosmos ecosystem overview page](https://cosmos.network/ecosystem/wallets).

</HighlightBox>

When it is installed, it should be available in your list of extensions when you click on the icon that looks like a puzzle piece in the top-right corner of Chrome:

![Keplr seen as an extension in Google Chrome](/keplr-as-extension.png)

<HighlightBox type="warn">

When you own ATOM with Keplr, **you are in charge**. There is no one you can call if _you forget your password/seed phrase or you send tokens to the wrong address_.

Keplr is a non-custodial wallet.

</HighlightBox>

Now, with the Keplr extension installed and the above warning in mind, create a new account. Click on your Keplr extension and the following page should open:

![Creating a new account or connecting to an existing account with Keplr](/keplr-create-menu.png)

Click _Create new account_. The page that opens offers you a mnemonic, which is a secret list of words, and asks you for a password. Because **you are in charge**, it is important to understand the following points:

* Whoever knows the **mnemonic seed** has access to **all** the assets in the wallet as easily as you do. This means that:
    * Nobody else should be looking at your screen right now. If that is not the case click _Back_.
    * You should only ever share your mnemonic seed with parties you would also give access to your bank account. **Do not** share it with an exchange, a proof-of-stake validator, another blockchain service, or "someone from Cosmos" on the phone  - these are _not_ trusted partners.
    * You should save the mnemonic seed in safe places so that you can import it back in this or another wallet at a later date. **Make sure** you write it down somewhere safe.
* Keplr saves your seed on disk but encrypted.
* Keplr asks you for the **encryption password**, which is used to encrypt your mnemonic on your computer. For the password, keep in mind:
    * It should be a strong password.
    * You should save it too.
    * Keplr will ask you for it every time you open the wallet and for important actions.
* If your computer or the encrypted mnemonic seed file is stolen, your wallet assets are as protected as your password is strong.

![Keplr mnemonic seed and creating a password page](/keplr-mnemonic-step.png)

When you are ready, click _Next_.

If you saved your seed, you should be able to complete the next step: click on each word in the correct order.

![Keplr mnemonic recall prompt: Selecting the correct words of your mnemonic](/keplr-mnemonic-recall-prompt.png)

When done, it should look like this:

![Keplr mnemonic recall done](/keplr-mnemonic-recall-done.png)

After clicking _Register_ you are all set:

![Keplr all set](/keplr-all-set.png)

You can click on the extension icon again and see that you hold zero ATOMs and your first public address in the form `cosmos1...`.

If you click on the drop-down labeled _Cosmos_ at the top you can see how many assets from other supported networks, you have:

![Keplr empty assets](/keplr-empty-assets.png)

<HighlightBox type="info">

A note on your **address**: As with a street address, it is ok for others to know it, as it allows others to send you ATOM or other assets.

</HighlightBox>

You can also open the [Keplr dashboard page](https://wallet.keplr.app/#/dashboard), which interfaces with the extension. Take note of how the dashboard at this address is a web page loaded from a website and, as such, is not a trusted partner. It will never ask you for your mnemonic or your password.

<HighlightBox type="tip">

Now would be a good time for you to save your mnemonic and password safely, before you put valuables in your wallet.

</HighlightBox>

## Purchase one ATOM

How you purchase ATOM depends on your preferences. You need to use your trusted exchange to purchase ATOM. You can get any amount you wish, although it is recommended to get at least 0.3 ATOM so that all of it is not consumed in transaction fees before the end of this exercise.
For the purpose of this section we assume you buy one ATOM.

<HighlightBox type="info">

As you can see in the [Get ATOM and stake page from Cosmos](https://cosmos.network/learn/get-atom) there is a [list of exchanges](https://messari.io/asset/cosmos/markets) that are known by Cosmos for offering ATOM token.

</HighlightBox>

When you are done, your account on the exchange should show that you _own_ one ATOM:

![When you have one ATOM on Kraken](/kraken-one-atom.png)

You do not own it as you would if the token were in your Keplr wallet. It is the exchange that owns the token and assures you that they will send it to you when asked. The exchange acts like a custodial wallet.

## Withdraw your ATOM

Your exchange has a withdrawal function that allows you to send your ATOM anywhere, including your Keplr wallet. Now it is time to set this up.

You need your wallet address. Since it is very long, you should avoid typing it by hand and instead copy it in the clipboard by clicking on it in Keplr:

![View of the Keplr address zone](/keplr-address-zone.png)

Now go back to your exchange, paste this address where asked, **confirm** that it looks identical to the original you copied, and proceed with the confirmation the exchange requires from you:

![Kraken: add address](/kraken-add-address.png)

When it is set, you ask the exchange to withdraw properly. Take note of the transaction fee of the exchange. It is much higher than a realistic transaction fee would have been had you done the transaction yourself within your wallet:

![Kraken exchange parameters](/kraken-exchange-params.png)

If all went well, you should see your new asset in Keplr after a few minutes:

![Keplr received ATOM](/keplr-with-atom.png)

Congratulations! You now own just short of one ATOM. Remember that **you** are really in charge, so check again that your mnemonic and password are saved properly.

<HighlightBox type="info">

You can also look at your address using a public explorer, like [mintscan.io](https://mintscan.io).

</HighlightBox>

You can see the same if you open the [wallet dashboard page](https://wallet.keplr.app/#/dashboard). On this wallet page you can see a small link that leads you to your address page:

![Keplr wallet link out to address page](/keplr-wallet-link-out.png)

There you can see the transaction that originated from the exchange's wallet:

![Mintscan crediting transaction](/mintscan-crediting-tx.png)

## Stake your ATOM

Your 0.9 ATOM is available. It is sitting there in your wallet. It will stay there and remain 0.9 ATOM forever unless you use it for something.

_What about participating in the security of the Cosmos Hub blockchain?_

You can do this by delegating some of your ATOM as stake to a network validator. A validator consists of one or more cooperating computers that participate in the consensus by creating blocks. In exchange for this service, validators receive block rewards and share the rewards with their delegators, minus their commission. Your modest delegated stake could award you a modest share of a validator's rewards.

<HighlightBox type="tip">

When considering staking, keep in mind:

* Unlike a centralized exchange that holds your assets in a custodial wallet, when you delegate your ATOM **you remain in charge of your ATOM**. The validator does not have access to your assets. Think of your stake as a weighted vote of confidence.
* A non-zero risk is that the validator you chose behaves incorrectly or even maliciously, which exposes the faulty validator and you to **protocol penalties**.
* Also keep in mind that the amount you delegate **is locked** away. You would have to wait three weeks to again have access to your delegated stake should you decide to un-delegate your stake.

</HighlightBox>

Now find a validator and delegate your ATOM to it. Click the _Stake_ button in Keplr. You are presented with a list of validators:

![Keplr: list of validators](/keplr-validator-list.png)

Right away you can discard the validators that keep 100% of the rewards for themselves, as they work for custodial wallets they keep on behalf of their customers. Pick one validator that you like and click _Manage_. Then you should see a link directing you to more information on this validator. You can see more information on each validator on [Mintscan's validator list for Cosmos](https://www.mintscan.io/cosmos/validators). Pay attention to the uptime, as a missed block would cost you penalties.

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

Over the long run, you should get the same amount. What matters is the size of your stake.

If you like what you see, it is time to click _Delegate_ and add the sum you want to delegate. Do not delegate all that you own, because you still need a fraction of ATOM to send the delegate transaction and further ATOM in the future to either undelegate or claim your rewards. Pick 0.8 ATOM and click _Delegate_:

![Keplr: delegate parameters](/keplr-delegate-params.png)

This delegation is an important action. It is the first action you take with your private key. Every time an application asks Keplr to do an important action, Keplr will ask you to confirm it:

![Keplr: delegate confirm window](/keplr-delegate-confirm.png)

You do not need this delegate transaction to be confirmed quickly, so choose the low end of transaction fees. Once you click _Approve_, the transaction should not take longer than a couple of minutes to be confirmed.

When it is confirmed, your pending staking rewards start accruing. The accruing is not that fast because you delegated only 0.8 ATOM, and they only accrue when your chosen validator issues a block. After perhaps 20 minutes, you should see something similar to this:

![Keplr: accruing rewards](/keplr-accruing-rewards.png)

Your rewards are said to be pending because you need to claim them before they are yours. The claim transaction has its fees, so it is best to wait until your rewards exceed the transaction fees before submitting any claim transaction. With only 0.8 ATOM staked you need to wait about 10 days to get something worth the claim transaction.

## Claim your ATOM

You did it: you waited 10 days, and you are accruing rewards:

![Keplr: accruing good rewards](/keplr-accruing-good-rewards.png)

It now is enough to cover the claim transaction. Go ahead and claim it. Choose low fees to make it worth it:

![Keplr: claim rewards](/keplr-claim-rewards.png)

Now you can see how your rewards went straight to your wallet.

![Keplr: increased number of available ATOM tokens](/keplr-increased-available.png)

If you want to re-stake this amount and benefit from the compound effect, go ahead, but make sure you are not losing too much in transaction costs.

This completes this exercise. You got yourself set up to participate in the Cosmos Hub network and even its security. Your stake is working for you as you continue your Cosmos training journey.

## Next up

Head on to the [next chapter](../2-main-concepts/index.md) to keep exploring the Cosmos SDK. Next it is all about the SDKs main components.
