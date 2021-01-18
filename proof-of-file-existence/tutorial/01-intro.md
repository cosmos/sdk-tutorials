---
order: 0
---

# Proof of File Existence

A Proof of File Existence can help prove the authenticity of a certain file at a particular time.

[Follow this tutorial with a video!](https://www.youtube.com/watch?v=PGLAW-HrzWg)

## How can we create a Proof of File Existence?

Creating a proof of file existence can be done performing a SHA256 hash of the file or document you wish to prove exist. We can [assume](https://stackoverflow.com/questions/4014090/is-it-safe-to-ignore-the-possibility-of-sha-collisions-in-practice) that the output of a SHA256 hash function will be unique for each input, and won't be prone to collisions.

The SHA256 hash of the file is also known as a checksum. When uploading the checksum to the blockchain, we create a timestamped proof that we know of a file whose hashed content equals the checksum value. This way, we are able to keep contents of file private while proving existence and ownership of the file.

## PoFE use cases

- Timestamping documents

    You can take any document and submit the hash as a Proof of File Existence on the blockchain. That way, you can prove that you had the file at the time when you submitted the block by sharing the file and letting others calculate the checksum. Afterwards, a link to the transaction containing that hash can be shared, proving existence of the file at the time the transaction was performed

- Document Integrity

    Governments or organizations can issue digital legal documents and sumbit the hash as a Proof of File Existence on the blockchain. That way, one can digitally submit a document when required, and any entity can verify its authenticity by querying its hash on the blockchain.

## Application overview

Our application is relatively simple - we want to implement a blockchain where a user can choose a file, hash its contents, and upload the file to the blockchain directly. We also want to give the owner the ability to revoke the claim.

## Requirements 

For this tutorial we will be using [Starport](https://github.com/tendermint/starport) v0.13.1, an easy to use tool for building blockchains. To install `starport` into `/usr/local/bin`, run the following command:

```
curl https://get.starport.network/starport@v0.13.1! | bash
```

You can also use Starport v0.13.1 on the web in a [browser-based IDE](http://gitpod.io/#https://github.com/tendermint/starport/tree/v0.13.1). Learn more about other ways to [install Starport](https://github.com/tendermint/starport/blob/develop/docs/1%20Introduction/2%20Install.md).

Now, we can start building our app!
