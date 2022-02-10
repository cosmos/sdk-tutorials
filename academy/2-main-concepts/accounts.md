---
title: "Accounts"
order: 3
description: Discover how accounts, addresses, keys, and keyrings relate to each other
tag: deep-dive
---

# Accounts

An account is a pair of keys:

* **`PubKey`.** A public key
* **`PrivKey`.** A private key

A public key is a unique identifier for a **user or entity** that is safe to disclose. Private keys are sensitive information that users are required to manage confidentially. Private keys are used to sign information in a way that **proves** to others that a message was signed by someone using the private key corresponding to a given public key. This is done without revealing the private key itself.

## Public key cryptography

Modern cryptographic systems leverage computer capabilities to make the power of certain mathematical functions accessible. Public key cryptography is also known as **asymmetric cryptography** and is a cryptographic system that employs pairs of keys. Every pair consists of a public and a private key. The security of the system is not endangered as long as the private key is not disclosed. Compared to symmetric key algorithms, asymmetric ones do not require parties to use a secure channel to exchange the keys for encryption and decryption.

Asymmetric cryptography has two primary applications:

<Accordion :items="
    [
        {
            title: 'Authentication',
            description: 'The public key serves as a verification instrument for the private key pair.'
        },
        {
            title: 'Encryption',
            description: 'Only the private key can decrypt the information encrypted with the public key.'
        }
    ]
"/>

We will focus on the _authentication_ aspect of asymmetric cryptography.

Public key cryptography assures confidentiality, authenticity, and non-repudiation. Examples of applications include [S/MIME](https://en.wikipedia.org/wiki/S/MIME) and [GPG](https://en.wikipedia.org/wiki/GNU_Privacy_Guard) and it is the basis of several internet standards like [SSL](https://www.ssl.com/faqs/faq-what-is-ssl/) and [TLS](https://en.wikipedia.org/wiki/Transport_Layer_Security).

Asymmetric cryptography is normally applied to small data blocks due to its computational complexity. Symmetric and asymmetric cryptography are combined in a hybrid system. Asymmetric encryption could be for example employed to transfer a symmetric encryption then used as an encryption key for the message. An example of hybrid systems is [PGP](https://en.wikipedia.org/wiki/Pretty_Good_Privacy).

The **length of keys** is vital. Asymmetric cryptographic keys are usually very long. One can keep in mind a general principle: the longer the key, the more difficult it is to break the code. Breaking an asymmetric key can only be done with a _brute force attack_. Whereby the attacker would need to try every possible key for a match.

## Public and private keys

<HighlightBox type="info">

Asymmetric keys always come in pairs and offer their owner various capabilities. These capabilities are based on cryptographic mathematics. The public key is meant to be distributed to whoever is relevant, while the private key is to remain a secret. This is similar to sharing your house address, but keeping the key to your house private.

</HighlightBox>

### Sign and verify

Let's take a look at signing and verifying with public and private keys as an example.

We have Alice and Bob. Alice wants to make sure that Bob's public announcement is indeed from Bob, so:

* Bob gives Alice his public key.
* Bob signs his announcement with his private key.
* Bob sends Alice his announcement and its signature.
* Alice verifies the signature with Bob's public key.

Alice can verify the source of the announcement by checking if the signature was done with the private key that corresponds to Bob’s public key, which is already known to represent Bob.

Private keys are used to **prove** that messages originate from the owners of accounts known by their public keys: the signatures **prove** that messages were signed by someone that knows the private key that corresponds to a given public key. This is the basis of user authentication in a blockchain and why private keys are strictly guarded secrets.

<ExpansionPanel title="How to manage multiple key pairs over multiple blockchains with hierarchical-deterministic wallets">

## Hierarchical-deterministic wallets

Blockchains generally maintain ledgers of user accounts and rely on public key cryptography for user authentication. Knowledge of one's public and private keys is a requirement to execute transactions. Client software applications known as wallets provide methods to generate new key pairs and store them, as well as basic services such as creating transactions, signing messages, interacting with applications, and communicating with the blockchain.

Although it is technically feasible to generate and store multiple key pairs in a wallet, key management quickly becomes tedious and error-prone for users. Given that all keys would exist only in one place, users would need to devise ways to recover their keys in adverse situations such as the loss or destruction of the computer. The more accounts, the more keys to back up.

### Do I need many addresses?

Using multiple addresses can help you improve privacy. You may be a single individual or entity, but you may want to transact with others under different aliases. Additionally, you will likely interact with more than one blockchain in the Cosmos ecosystem. Conveniently, your inevitably-different addresses on different blockchains can all stem from a single seed.

A **hierarchical-deterministic wallet** uses a single seed phrase to generate many key pairs to reduce this complexity. Only the seed phrase needs to be backed up.

### Cryptographic standards

The Cosmos SDK uses [BIP32](https://en.bitcoin.it/wiki/BIP_0032), which allows users to generate a set of accounts from an initial **secret** and a **derivation path** containing some input data such as a blockchain identifier and account index. Since BIP39, this initial secret is mostly generated with 12 or 24 words, known as the mnemonic, taken from a standardized dictionary. Key pairs can always be mathematically reproduced from the mnemonic and the derivation path, which explains the deterministic nature of wallets.

<HighlightBox type="tip">

To see BIP32 in action, visit [https://www.bip32.net/](https://www.bip32.net/).

Click `Show entropy details` and enter random data in the `Entropy` field. This reveals an important aspect of the initial seed generation process. A source of randomness is essential. The `BIP39 Mnemonic` field begins to populate with words as you provide entropy. Scroll down further and select the `BIP32` `Derivation Path` tab. Under `Derived Addresses` you will see the `Public Key` and `Private Key` pairs.

</HighlightBox>

Like most blockchain implementations, Cosmos derives addresses from the public keys.

![HD wallets: The seed, keys, addresses, and accounts](/hd-accounts.png)

When using BIP39 or one of its variants a user is required _only_ to store their BIP39 mnemonic in a safe and confidential manner. All key pairs can be reconstructed from the mnemonic because it is deterministic. There is no practical upper limit to the number of key pairs that can be generated from a single mnemonic. The input taken from the [BIP44](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki) derivation path is used to generate a key pair for every blockchain using one single mnemonic. Hence the name hierarchical-deterministic to describe this key generation approach.

### Can you be tracked across different addresses?

A hierarchical-deterministic wallet also preserves privacy because the next public key or address cannot be deducted from the previous ones. Two addresses issued from a single mnemonic or two addresses created from two different mnemonics are indistinguishable.

</ExpansionPanel>

## Keyring, addresses, and address types

In the Cosmos SDK keys are stored and managed in an object called a **keyring**.

Authentication is implemented as signature verification:

* Users generate transactions, sign transactions, and send the signed transactions to the blockchain.
* Transactions are formatted with the public key as part of the message. Signatures are verified by confirming that the signature's public key matches the public key associated with the sender. If the message is signed by anyone other than the purported sender, the signature is invalid and the transaction is rejected.

Consider the following pseudo message in case the foregoing is unclear:

```json
"Message": {
  "Payload": {
    "Sender": "0x1234",
    "Data": "Hello World"
  },
  "Signature": "0xabcd"
}
```

Passing `Payload` and `Signature` into the signature verification function returns a sender. The derived sender must match the `Sender` in the `Payload` itself. This confirms that the `Payload` could only originate from someone that knows the private key corresponding to `Sender: “0x1234”`.

## Signature schemes

There is more than one implementation of the public key signature process previously described. The Cosmos SDK supports the following digital key schemes for creating digital signatures:

<H5PComponent :contents="['/h5p/M2-accounts-secp-HS']"></H5PComponent>

## Accounts

The [`BaseAccount`](https://github.com/cosmos/cosmos-sdk/blob/bf11b1bf1fa0c52fb2cd51e4f4ab0c90a4dd38a0/x/auth/types/auth.pb.go#L31-L36) object provides the basic account implementation that stores authentication information.

## Public keys

Public keys are generally not used to reference accounts (see Address below). Public keys do exist and they are accessible through the [`cryptoTypes.PubKey`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/crypto/types/types.go#L9) interface. This facilitates operations developers may find useful such as signing off-chain messages or using a public key for other out-of-band operations.

## Address

An address is public information normally used to reference an account. Addresses are derived from public keys using [ADR-28](https://github.com/cosmos/cosmos-sdk/blob/master/docs/architecture/adr-028-public-key-addresses.md). Three types of addresses specify a context when an account is used:

* [`AccAddress`](https://github.com/cosmos/cosmos-sdk/blob/1dba6735739e9b4556267339f0b67eaec9c609ef/types/address.go#L129). Identifies users, which are the sender of a message.
* [`ValAddress`](https://github.com/cosmos/cosmos-sdk/blob/23e864bc987e61af84763d9a3e531707f9dfbc84/types/address.go#L298). Identifies validator operators.
* [`ConsAddress`](https://github.com/cosmos/cosmos-sdk/blob/23e864bc987e61af84763d9a3e531707f9dfbc84/types/address.go#L448). Identifies validator nodes that are participating in consensus. Validator nodes are derived using the [ed25519](https://www.cryptopp.com/wiki/Ed25519) curve.

## Keyring

The keyring object stores and manages multiple accounts. The keyring object implements the [`Keyring`](https://github.com/cosmos/cosmos-sdk/blob/bf11b1bf1fa0c52fb2cd51e4f4ab0c90a4dd38a0/crypto/keyring/keyring.go#L55) interface in the Cosmos SDK.

## Next up

In the [next section](./transactions.md), you will learn how transactions are generated and handled in the Cosmos SDK.

<ExpansionPanel title="Show me some code for my checkers blockchain">

In the [previous section](../2-main-concepts/architecture.md) your ABCI application accepted anonymous checkers moves. This was a problem. You can restrict moves to the right player with accounts.

Now you are going to differentiate between players and other actors. This will help assure there is no identity spoofing, that players do not play out of turn, and rewards are paid to the correct winner. You are also going to store the creator of a game, which may or may not be a player.

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

How would you extract and serialize addresses? Handle the extraction like this:

```go
import (
    sdk "github.com/cosmos/cosmos-sdk/types"
)

creator, err := sdk.AccAddressFromBech32(storedGame.Creator)
if err != nil {
    // Handle the error.
}
```
Handle the serialization in this way:

```go
var creator sdk.AccAddress
storedGame.Creator = creator.String()
```

You will only accept the right players when it comes to transactions.

## Remaining game object

Defining the players is good, but the stored game is not complete unless you add game details like the current board state and the game's unique identifier. Conveniently, you can [serialize](https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go#L303) and [deserialize](https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go#L331) the board state. So you can already confirm the following struct:

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

If you want to go beyond these out-of-context code samples and instead see more details on defining all of this, head to the [section on how to build your chain](../4-my-own-chain/index.md).

</ExpansionPanel>
