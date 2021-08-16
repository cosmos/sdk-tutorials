# Getting ATOM & Staking

The [Cosmos Hub](https://hub.cosmos.network) is the first among equals of Cosmos blockchains. The ATOM is the native token of the Cosmos Hub, also called the staking token. You need some ATOM to be able to transact on the Cosmos Hub, or to participate in the proof-of-stake consensus. Because of its usefulness, there are markets that determine the ATOM price in common currencies.

So let's get our feet wet. We are going to:

1. get some ATOM,
2. and participate in the consensus, thereby earning yield on our ATOMs while sleeping, or studying further.

We cover all the main concepts in the next chapter. For now, a surface-level understanding will get you through.

The simple step of _get some ATOM_ hides multiple steps:

1. Install a wallet application, and configure it safely. We will use Keplr.
2. Buy some ATOM on an exchange, and transfer them to your wallet.

Let's get started.

## Set up Keplr

First the easiest part, open Google Chrome on your computer and go to the [Keplr extension](https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap) page. Alternatively, you could search by yourself for Keplr in the [Chrome extensions store](https://chrome.google.com/webstore/search/Keplr). Indeed it is always good practice to be a bit suspicious of links to wallets as sometimes fraudulent ones are published in order to steal from you. Good thing, Keplr is mentioned, and linked, [here](https://cosmos.network/ecosystem/wallets), lending it some credibility.

When it is installed, it should be available in your list of extensions when you click on the icon in the top-right corner of Chrome:

![Keplr seen as an extension](./images/keplr-as-extension.png)

You can go ahead and pin it if you want.

<HighlightBox type="warn">

When you own ATOM with Keplr, **you are in charge**. For real. There is no one you can call because _you forgot your password_, _your hard-disk crashed_, or _you sent to the wrong address_.

In the jargon, Keplr is a non-custodial wallet.

</HighlightBox>

Now, with the Keplr extension installed and the above warning, let's create a new account. Click on Keplr and the following page should open:

![Keplr create menu](./images/keplr-create-menu.png)

Click _Create new account_. The page that opens offers you a mnemonic and asks you for a password. Because _you are in charge_, it is important to understand the following points:

1. Whoever knows the mnemonic seed has access to **all** the assets in this wallet as easily as you with your own wallet. This means that:
    1. Nobody else should be looking at your screen right now. If that is not the case, click _Back_.
    2. You should share it only with trusted partners, if at all. An exchange, a proof-of-stake validator or another blockchain service is _not_ a trusted partner.
    3. You should save it in safe places, typically on paper, so that you can import it back in this or another wallet at a later date.
2. Keplr will save your seed on disk but encrypted.
3. Keplr is asking you for the encryption password.
    1. It should be a strong password.
    2. You should save it too.
    3. Keplr will ask you for it every first time you open it and for important actions.
4. If your computer or the encrypted mnemonic seed file is stolen, your wallet assets are as protected as your password is strong.
5. If you are starting now with weak security because you plan on keeping only very little value in your wallet, consider creating a new mnemonic and password in the future when you plan on holding more value. In effect, as if your _weaker_ wallet had been compromised.

![Keplr mnemonic page](./images/keplr-mnemonic-step.png)

Forewarned is forearmed. When you are ready, click on _Next_.

If you saved your seed, you should be able to complete the next step, where you need to click on each word in the right order.

![Keplr mnemonic recall prompt](./images/keplr-mnemonic-recall-prompt.png)

When done:

![Keplr mnemonic recall done](./images/keplr-mnemonic-recall-done.png)

After clicking _Register_, it says you are all set:

![Keplr all set](./images/keplt-all-set.png)

You can click on the extension icon again and see that you hold zero ATOMs in Cosmos, and that you have a first public address of the form `cosmos1...`. You have zero assets in the other supported networks either, if you care to click on the drop-down labeled _Cosmos_ at the top.

![Keplr empty assets](./images/keplr-empty-assets.png)

A note on your address. As a street address, it is ok for others to know it, as it allows others to send you ATOMs or other tokens of the Cosmos Hub.

You can also open the [Keplr dashboard](https://wallet.keplr.app/#/dashboard) page, which interfaces with the extension.

<HighlightBox type="tip">

Now would be a good time for you to save your mnemonic and password safely before you put valuables in your wallet.

</HighlightBox>

## Purchase 1 ATOM

How you do it is highly dependent on what your preferences are. But roughly, you need to get on an exchange and, for instance, purchase 1 ATOM, which is worth 16 USD at the time of writing. Don't get less than 0.3 ATOM so that it does not get all consumed in transaction fees.

As found [here](https://cosmos.network/learn/get-atom), [this](https://messari.io/asset/cosmos/markets) is a list of exchanges that are known by Cosmos for carrying the token.

When you are done, your account on the exchange should show you that you _own_ 1 ATOM. Actually, you don't own it as you would if the token were in your Keplr wallet. It is the exchange that owns it, and assures you that they will send it to you when you ask them to. In the jargon, the exchange acts like a custodial wallet.

![ATOM on Kraken](./images/kraken-one-atom.png)

## Withdraw your ATOM

Let's see if the exchange makes good on their promise to send the ATOM to you. Your exchange has a withdrawal function that allows you to send your ATOM anywhere, including to your Keplr wallet. Let's see this up. You need your wallet address. Since it is very long, you should avoid typing it by hand but instead copy it in the clipboard by clicking on it in Keplr:

![Keplr address zone](./images/keplr-address-zone.png)

Now go back at your exchange, you paste this address where asked, and, if necessary, proceed with the confirmation the exchange asks:

![Kraken add address](./images/kraken-add-address.png)

When it is set, you ask the exchange to withdraw proper. Take note of transaction fee taken by the exchange. It is much higher than a realistic transaction fee if you did it yourself within your own wallet:

![Kraken exchange params](./images/kraken-exchange-params.png)

If all went well, you should see your new asset in Keplr after a couple minutes:

![Keplr received ATOM](./images/keplr-with-atom.png)

Congratulations! You now own just short of 1 ATOM. And remember, **you** are really in charge, so check again that your mnemonic and passwords are saved properly.

You can see the same if you open the [wallet page](https://wallet.keplr.app/#/dashboard). By the way you can look at your address within a public explorer like [mintscan.io](https://mintscan.io). In this wallet page, you can see a small link that leads you to your address page:

![Keplr wallet link out](./images/keplr-wallet-link-out.png)

There, you can see the transaction that originated from the exchange's wallet:

![Mintscan crediting transaction](./images/mintscan-crediting-tx.png)

Note in particular how the exchange charged you, say 0.1 ATOM, way more than it actually costed, here 0.0003 ATOM.

## Stake your ATOM

Your 0.9 ATOM is available. It is sitting there in your wallet. And it will stay there forever. It will also stay at 0.9 ATOM forever, unless you use it for something.

What about participating in the security of the Cosmos Hub blockchain? You can do this by delegating some of your ATOM to a network validator. A validator is 1 or more cooperating computers that participate in the consensus by, among other things, creating blocks. In exchange for this service, they receive block rewards, and share the rewards with the delegators too, minus their own commission. Your modest delegated sum could award you a modest share of the rewards.

* The benefit of it is that, unlike a bank, which holds your assets in a custodial wallet, when you delegate your ATOM, the custody remains with you, so the validator does not have access to your assets.
* A non-zero risk is that the validator you chose behaves incorrectly, or even maliciously, which exposes you proportionally to the same protocol penalties as the faulty validator.
* Also keep in mind that the amount you delegate is locked away, and you would need 3 weeks to have access to it again, should you so ask.

Let's find a validator and delegate to it. Past performance is no indicator of future performance, but in our case we are going to believe it is. So click the _Stake_ button in Keplr. You are presented with a list of validators:

![Keplr list of validators](./images/keplr-validator-list.png)

Right away you can discard the validators that keep 100% of the rewards for themselves as they work for the custodial wallets they keep on behalf of their customers. Pick one validator that you like and click _Manage_. There you should see a link where you can learn more about this validator. If you like it, it is time to click _Delegate_ and put a sum here.

Do not delegate all that you own because you still need a fraction of ATOM to send the delegate transaction, and further fractions in the future to either undelegate or claim your rewards. Let's pick 0.8 ATOM and click _Delegate_.

![Keplr delegate params](./images/keplr-delegate-params.png)

This delegation is an important action. It is in fact the first action you will take with your private key. It is therefore natural and welcome that a window pops up to confirm with you that it is indeed what you intended. Every time an application asks Keplr to do an important action, Keplr will confirm with you.

![Keplr delegate confirm window](./images/keplr-delegate-confirm.png)

You do not need this delegate transaction to be confirmed fast, so go and choose the low end of transaction fees. Click _Approve_. The transaction should not take longer than a couple minutes to be confirmed.

When it is confirmed, your pending staking rewards start accruing. Not that fast because you delegated only 0.8 ATOM, and they only accrue when your chosen delegator issues a block. After perhaps 20 minutes, you should see something like this:

![Keplr accruing rewards](./images/keplr-accruing-rewards.png)

Your rewards are said to be pending because you need to claim them before you get them for real. Of course, the claim transaction has its own fees, so it is best for you to wait that your rewards exceed the transaction fees before submitting any claim transaction.

This completes this exercise, where you got yourself set up to participate in the Cosmos Hub network, and even participate in its security.
