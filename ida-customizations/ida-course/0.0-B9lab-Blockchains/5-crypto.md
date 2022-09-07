---
title: "Cryptographic Fundamentals of Blockchain"
order: 6
description: Public-key cryptography
tag: fast-track
---

# Cryptographic Fundamentals of Blockchain

Modern cryptography leverages computer capabilities to make the power of certain mathematical functions available for practical use. Without modern cryptography, there would be no blockchain technology.

Therefore, anyone new to blockchains discovers frequent references to message signatures and other concepts related to cryptography. While this is not an extensive exploration of the topic and you will not deep dive into the mathematics, this section will demystify important concepts if they are new to you.

## Public and private keys

In public-key cryptographic systems, keys always **come in pairs** and offer various capabilities. The capabilities are based on cryptographic mathematics. As the name suggests, the **public key** is meant to be distributed while the **private key** is to be jealously guarded. Compare the key pairs to having your house address public but keeping the key to your house private.

The following example will help to better understand public/private keys, which you may know under the names:

* RSA
* PGP or GnuPG

```
// Create SECP256K1 private key with explicit parameters for backward compatibility
$ openssl ecparam -name secp256k1 -genkey -noout -out secp256k1-key.pem -param_enc explicit
// Create public key
$ openssl ec -in secp256k1-key.pem -pubout -out secp256k1-key-pub.pem
// Show public key
$ openssl ec -in secp256k1-key-pub.pem -pubin -text -noout

// Create RSA private key
$ openssl genrsa -des3 -out rsa-key.pem 2048
Generating RSA private key, 2048 bit long modulus
.....................................................+++
...........+++
e is 65537 (0x10001)
Enter pass phrase for rsa-key.pem:
Verifying - Enter pass phrase for rsa-key.pem:
// Create public key
$ openssl rsa -in rsa-key.pem -outform PEM -pubout -out rsa-key-pub.pem
Enter pass phrase for rsa-key.pem:
writing RSA key
```

This is like a password that is used to encrypt your private key on disk. If the private key was not encrypted, it would be at greater risk of theft. Since you are just testing here, you can put in nothing or just a simple word. Still remember that whenever you create keys in the future, you need to protect them with a proper password.

<HighlightBox type="tip">

Note that you may need openssl version 1.0 or a newer one.

</HighlightBox>

Now take a look at scenarios in which public/private key pairs are useful.

### Encrypt and decrypt

Alice wants to send a message to Bob that is meant for Bob's eyes only:

1. Bob gives Alice his public key.
2. Alice uses Bob's public key to encrypt the message.
3. Alice sends Bob the encrypted message.
4. Bob decrypts the message with his private key.

![Encrypt and decrypt a message](/academy/0.0-B9lab-Blockchains/images/00_11_rsa_keys_v1.png)

Now look at the senario code-wise. For example, try the following:

```sh
// Encrypt file
$ openssl pkeyutl -encrypt -pubin -inkey rsa-key-pub.pem -in helloworld.txt -out helloworld.enc
// Decrypt file
$ openssl pkeyutl -decrypt -inkey rsa-key.pem -in helloworld.enc -out helloworld2.txt
```

<HighlightBox type="tip">

If you receive an error, try with `openssl rsautl` instead.

</HighlightBox>

### Sign and verify

Alice wants to make sure that Bob's public announcement is indeed from Bob:

1. Bob gives Alice his public key.
2. Bob signs his announcement with his private key.
3. Bob sends Alice his announcement and its signature.
4. Alice verifies the signature with Bob's public key.

![Digital signature with public/private keys](/academy/0.0-B9lab-Blockchains/images/00_12_digital_signature_keys_v2.png)

Back to the code example:

```sh
# Sign file hash
$ openssl dgst -sha256 -sign secp256k1-key.pem -out helloworld-bin.sha256 helloworld.txt
# Encode signature in Base64
$ openssl base64 -in helloworld-bin.sha256 -out helloworld.sha256

# Decode signature form Base64
$ openssl base64 -d -in helloworld.sha256 -out helloworld-bin-decoded.sha256
# Verify signature
$ openssl dgst -sha256 -verify secp256k1-key-pub.pem -signature helloworld-bin-decoded.sha256 helloworld.txt
```

Which finally prints:

```
Verified OK
```

### Mix and match

It is possible to mix both conceptual ideas. For example:

1. Alice encrypts her message with Bob's public key.
2. Alice signs the encrypted file with her private key.
3. Upon reception, Bob verifies the signature with Alice's public key to make sure the file came from Alice.
4. Bob decrypts the file with his private key.

![Encryption, decryption, and signatures with public/private keys](/academy/0.0-B9lab-Blockchains/images/00_13_mix_n_match_keys_v3.png)

### Is this science or magic?

If these examples seem counter-intuitive it means you sense the mathematical shadow of public-key encryption. You do not have to understand the mathematics behind it at a deep level, but you must understand the properties and implications of using public-key cryptography.

Given four keys (A, B, C, and D), we can encrypt a message with three keys (A, B, and C) such that the fourth key (in this case, D) is required to decrypt it and is very hard to guess or discover. So, if Alice knows her private key and her public key and she also knows Bob's public key, she can encrypt a message that can only be understood by someone who knows Bob's private key.

Similarly, given knowledge of public and private keys, one can generate a signature (i.e. a character string) so that someone with a copy of the message and the signature can independently determine the public key of the entity that signed the message, proving that the signer knows the corresponding private key.

It is then possible to proceed with the understanding that signed messages from Alice could only come from someone with knowledge of Alice's private key, and messages that are encrypted for Bob can only be deciphered by Bob.

### Key management and public key infrastructure

If you look again at the Alice and Bob examples, you will notice that there is a vulnerability in "Bob gives Alice his public key". A malicious Charlie could intercept Bob's public key and pass on _his own_ public key to Alice.

Key management and public key infrastructure (PKI) is an important aspect of cryptography that helps mitigate this risk.

## Cryptographic hash functions

Blockchain technology relies heavily on hash functions, as they help establish the so-called "chain of blocks".

All cryptographic hash functions fulfill several properties:

* Converts an input (a.k.a. the message) into an output (a.k.a the hash).
* Does the conversion in a reasonable amount of time.
* It is practically impossible to re-generate the message out of the hash.
* The tiniest change in the message changes the hash beyond recognition.
* It is practically impossible to find two different messages with the same hash.

With such a function, you can:

* Prove that you have a message without disclosing the content of the message, for instance:
    * To prove you know your password.
    * To prove you previously wrote a message.
* Be confident that the message was not altered.
* Index your messages.

### A closer look at a hash function

MD5 is such a hash function:

```sh
$ echo "The quick brown fox jumps over the lazy dog" | md5
```

Which prints:

```
37c4b87edffc5d198ff5a185cee7ee09
```

On Linux, this is `md5sum`.

Now introduce a typo to see what happens (e.g. changing "jumps" to "jump"):

```sh
$ echo "The quick brown fox jump over the lazy dog" | md5
```

Which prints:

```
4ba496f4eec6ca17253cf8b7129e43be
```

Notice how the two hashes have nothing in common other than their length, but length is identical for all MD5 hashes so it reveals nothing about the input.

<HighlightBox type="info">

This provides a convenient example, but `MD5` is no longer considered a hard-to-crack hash function. Bitcoin uses `SHA-256`. Ethereum uses `Keccak-256`and `Keccak-512`.

</HighlightBox>

<HighlightBox type="reading">

**Further readings**

* [The Mathematics of the RSA Public-Key Cryptosystem](https://www.nku.edu/~christensen/the%20mathematics%20of%20the%20RSA%20cryptosystem.pdf)
* [OSCDaily (2012): Encrypt & Decrypt Files from the Command Line with OpenSSL](http://osxdaily.com/2012/01/30/encrypt-and-decrypt-files-with-openssl/)
* [Zimuel, Enrico (2016): Sign and verify a file using an OpenSSL comand line tool](https://gist.github.com/ezimuel/3cb601853db6ebc4ee49)

</HighlightBox>
