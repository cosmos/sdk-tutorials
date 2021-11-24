---
title: "Accounts"
order: 4
description: Accounts, addresses and keys in Cosmos.
---

# Accounts

## What is an Account?

An account is a pair of keys called PubKey, a public key, and PrivKey, a private key. A public key is a unique identifier for a **user or entity** that is safe to disclose.  

Private keys are sensitive information that users are required to manage confidentially. Private keys are used to sign information in a way that **proves** to others that the message was signed by someone using the private key that corresponds to a given public key. This is done without revealing the private key itself.

## Public Key Cryptography

Public key cryptography, also known as **asymmetric cryptography**, is a cryptographic system that employs pairs of keys. Every pair consists of a public and a private key. The public key can be shared publicly and the security of the system is not endangered as long as the private key is not disclosed.

Asymmetric cryptography has two primary applications:

* **Authentication**, because the public key serves as a verification instrument for the private key pair;
* **Encryption**, because only the private key can decrypt the information encrypted with the public key.

We will focus on the _authentication_ aspect.

Compared to symmetric key algorithms, asymmetric ones do not require parties to use a secure channel to exchange the keys for encryption and decryption.

Public key cryptography assures confidentiality, authenticity and non-repudiability. Examples of applications include [S/MIME](https://en.wikipedia.org/wiki/S/MIME) and [GPG](https://en.wikipedia.org/wiki/GNU_Privacy_Guard), as well as the basis of several Internet standards like [SSL](https://www.ssl.com/faqs/faq-what-is-ssl/) and [TLS](https://en.wikipedia.org/wiki/Transport_Layer_Security).

Due to its computational complexity, asymmetric cryptography is normally applied to small data blocks. In a hybrid system, symmetric and asymmetric cryptography are combined. For example, asymmetric encryption could be employed to transfer a symmetric encryption, which would then be used as an encryption key for the message. Examples of this hybrid system include [PGP](https://en.wikipedia.org/wiki/Pretty_Good_Privacy).

The length of keys is vital. Asymmetric cryptographic keys are usually very long. One can keep in mind a general principle: the longer the key, the more difficult it is to break the code. To break an asymmetric key, the attacker needs to try every possible key (brute force attack). The longer the key is, the more difficult it is to guess.

## Public/Private Keys

Asymmetric keys always come in pairs and offer their owner various capabilities. Those capabilities are based on cryptographic mathematics. As their name suggests, the public key is meant to be distributed to whoever is relevant, while the private key is to remain a secret. This is similar to sharing your house address, but keeping the key to your house private. Don't be Dilbert's CEO, [a story](http://dilbert.com/strip/2018-10-26) in [2 parts](http://dilbert.com/strip/2018-10-27).

### Sign and Verify Example

Alice wants to make sure that Bob's public announcement is indeed from Bob:

* Bob gives Alice his public key.
* Bob signs his announcement with his private key.
* Bob sends Alice his announcement and its signature.
* Alice verifies the signature with Bob's public key.

When Alice has verified the signature, she will be convinced that the announcement was signed using the private key that corresponds to Bob’s public key, which is already known to represent Bob.

In summary, private keys are used to **prove** that messages originate from owners of accounts that are known by their public keys. More precisely, signatures **prove** that messages were signed by someone with knowledge of the private key that corresponds to a given public key. This is the basis of user authentication in a blockchain. For this reason, private keys are jealously guarded secrets.

<ExpansionPanel title="How to manage multiple key pairs over multiple blockchains">

## Hierarchical deterministic wallets

Blockchains generally maintain ledgers of user accounts and rely on public key cryptography for user authentication. Implicitly, knowledge of one’s public and private keys is a requirement for executing transactions. Client software applications known as wallets provide methods to generate new key pairs and store them between sessions, as well as basic services such as creating transactions, signing messages, interacting with applications (for example, web pages) and communicating with the blockchain.

Although it is technically feasible to generate and store multiple key pairs in a wallet, key management quickly becomes tedious and error-prone for users. Given that all keys would exist only in one place, users would need to devise ways to recover the keys in adverse situations, such as the loss or destruction of the computer. To put it simply, the more accounts, the more keys to back up.

### Do I need many addresses, though?

Using multiple addresses can help you improve your privacy. You may be a single individual, or entity, but you may want to transact with others under different aliases. Additionally, in the Cosmos ecosystem, you will likely interact with more than one blockchain. It is convenient that your inevitably-different addresses on different blockchains can all stem from a single seed.

A **hierarchical deterministic wallet** uses a single seed phrase to generate many key pairs. In this way, only the seed phrase needs to be backed up.

The Cosmos SDK uses [BIP32](https://en.bitcoin.it/wiki/BIP_0032), which allows users to generate a set of accounts from an initial **secret** and a **derivation path**, containing some input data such as a blockchain identifier and account index, among others. Since BIP39, this initial secret is mostly generated with 12 or 24 words, known as the mnemonic, taken from a standardized dictionary. Importantly, key pairs can always be mathematically reproduced from the mnemonic and the derivation path, which explains the deterministic nature of wallets.

To see BIP32 in action, visit [bip32.net](https://www.bip32.net/). Click `Show entropy details` and enter random data in the `Entropy` field. This reveals an important aspect of the initial seed generation process. A source of randomness is essential. As you provide entropy, the `BIP39 Mnemonic` field begins to populate with words. Scroll down further and select the `BIP32` `Derivation Path` tab, then, under `Derived Addresses`, you can see the `Public Key` and `Private Key` pairs.

Like most blockchain implementations, Cosmos derives addresses from the public keys. More on this below.

![From a mnemonic seed to accounts](./images/hd-accounts.png)

When using BIP39 or one of its variants, a user is required only to store their BIP39 mnemonic in a safe and confidential manner. All key pairs can be reconstructed from the mnemonic because it’s deterministic. The input taken from the [BIP44](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki) derivation path is utilized to generate a key pair for every blockchain using one single mnemonic, hence the name hierarchical deterministic to describe this approach of key generation.

</ExpansionPanel>

## Keyring, Addresses and Address Types

In the Cosmos SDK, keys are stored and managed in an object called a Keyring.

Authentication is implemented as signature verification.

* Users generate transactions, sign transactions and send the signed transaction to the blockchain.
* Transactions are formatted with the public key as part of the message. Signatures are verified by confirming that the signature’s public key matches the public key in the message. If the message is signed by anyone other than the purported sender, then the signature is invalid and the transaction is rejected.

In case the foregoing is unclear, consider the following pseudo message:

```
Message: {
    Payload: {
        Sender: "0x1234",
        Data: "Hello World"
    },
    Signature: "0xabcd"
}
```
Passing `Payload` and `Signature` into the signature verification function returns a sender. This derived sender must match the `Sender` in the `Payload` itself. This confirms that the `Payload` could only originate from someone with knowledge of the private key corresponding to `Sender: “0x1234”`.

## Signature Schemes

As you might guess, there is more than one implementation of the public key signature process described so far. Cosmos SDK supports the following digital key schemes for creating digital signatures:

* [secp256k1](https://www.secg.org/sec2-v2.pdf), as implemented in the SDK's crypto/keys/secp256k1 package.
* [secp256r1](https://www.secg.org/sec2-v2.pdf), as implemented in the SDK's crypto/keys/secp256r1 package.
* [tm-ed25519](https://ed25519.cr.yp.to/ed25519-20110926.pdf), as implemented in the SDK crypto/keys/ed25519 package. This scheme is supported only for the consensus validation.

![signature schemes](./images/signature_schemes.png)

## Accounts

The `BaseAccount` object provides the basic account implementation that stores authentication information.

## Public Keys

These are generally not used to reference accounts (see Addresses, below). Public keys do exist and they are accessible through the `cryptoTypes.PubKey` interface. This facilitates operations developers may find useful such as signing off-chain messages or using a public key for other out-of-band operations.

## Addresses

An address is the public information normally used to reference an account. Addresses are derived from public keys using [ADR-28](https://github.com/cosmos/cosmos-sdk/blob/master/docs/architecture/adr-028-public-key-addresses.md). Three types of addresses specify a context when an account is used:

* `AccAddress` identifies users (the sender of a message).
* `ValAddress` identifies validator operators.
* `ConsAddress` identifies validator nodes that are participating in consensus. Validator nodes are derived using the [ed25519](https://www.cryptopp.com/wiki/Ed25519) curve.

## Keyring

The Keyring object stores and manages multiple accounts. In the SDK, the Keyring object implements the Keyring interface.

## Next up

In the [next section](./05-transactions), you will learn how transactions are generated and handled in the Cosmos SDK.

<ExpansionPanel title="Show me some code for my checkers' blockchain">

Previously, our ABCI application accepted anonymous checkers moves. This was a problem. With accounts, you can restrict moves to the right player.

As first step to port the checkers' blockchain to the Cosmos SDK, you are going to differentiate between players and other actors. This will help to make sure there is no identity spoofing, that players do not play out of turn, and reward the correct winner when the time comes. You are also going to store the creator of a game, which may, or may not, be a player.

## Game object

Let's define some elements of the eventual stored game:

```go
type StoredGame struct {
    Creator string // A stringified address for the creator of the game.
    Red string // A stringified address for the player playing reds.
    Black string // A stringified address for the player playing blacks.
    ...
}
```

How would you extract and serialize addresses? Easy, the extraction is handled like this:

```go
import (
    sdk "github.com/cosmos/cosmos-sdk/types"
)

creator, err := sdk.AccAddressFromBech32(storedGame.Creator)
if err != nil {
    // Handle the error.
}
```
While the serialization is handled in this way:

```go
var creator sdk.AccAddress
storedGame.Creator = creator.String()
```
Similarly, you will only accept the right players regarding transactions - as you will learn in the next section.

## Remaining game object

Defining the players is good, but the stored game is not complete unless we add game details, for example, the current board state and the game's unique identifier. Conveniently, you can [serialize](https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go#L303) and [deserialize](https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go#L331) the board state, so we can already confirm the following struct:

```go
type StoredGame struct {
    Creator string
    Index string // The unique id that identifies this game.
    Game string // The serialized board.
    Turn string // "red" or "black"
    Red string
    Black string
}
```

If you want to go beyond these out-of-context code samples and instead see more in detail how to define all this, head to the [section on how to build your chain](../5-my-own-chain/01-index).

</ExpansionPanel>
