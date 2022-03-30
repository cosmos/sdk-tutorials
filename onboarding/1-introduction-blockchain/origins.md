---
title: "The Origins"
order: 7
description: Historic overview
tag: fast-track
---

WIP --> Edited but needs to be combined with the deployment section

# A Brief History of Blockchain

Important groundwork was laid in the 1980s and 1990s for what will later be known as blockchain technology. Although the technology itself was not created until 2008, researchers from different fields in computer science and cryptography proposed solutions to many problems regarding security, transparency, and trust. All of them contributed to the development of the first large-scale, successful public blockchain network, Bitcoin.

<ExpansionPanel title="The groundwork of the 1990s">

Sometimes a look in the past tells us a lot about the present.

In 1991, two research scientists, Stuart Haber and W. Scott Stornetta, identified a problem: how can it be ensured that digital documents are authentic and changes to them are tracked in an immutable time-stamped manner? In "How to time-stamp a digital document", they worked on the concept of append-only, cryptographically secured logs. With their work, the foundations of what much later becomes blockchain technology were laid.

Haber and Stornetta's work was later followed and elaborated on by Ross J. Anderson in 1996 when he described the creation of [The Eternity Service](https://www.cl.cam.ac.uk/~rja14/Papers/eternity.pdf) - a storage medium resistant to DoS attacks by using redundancy and scattering techniques, as well as anonymity mechanisms.

In 1998, [Bruce Schneier](https://www.schneier.com/crypto-gram/) and [John Kelsey](https://www.nist.gov/people/john-m-kelsey) proposed a computationally cheap way to safeguard sensitive information and allow for computer forensics with secure audit logs by using hashing, authentication keys, and encryption keys (see: [Schneier, B. & Kelsey, J. (1998): Secure Audit Logs to Support Computer Forensics](https://www.schneier.com/academic/paperfiles/paper-auditlogs.pdf)).

Another significant work arose in 1994 when computer scientist Nick Szabo first described the concept of [smart contracts](http://www.fon.hum.uva.nl/rob/Courses/InformationInSpeech/CDROM/Literature/LOTwinterschool2006/szabo.best.vwh.net/smart.contracts.html). Although we will discuss smart contracts in depth later in the course, it is important to recognize Szabo's intent was to minimize the need for trusted intermediaries. In 1998 he proposed BitGold, a conceptual predecessor to Bitcoin as he argued for a decentralized digital currency. In both PoW is used as a consensus algorithm to solve cryptographic puzzles in a P2P network with BFT. The solutions are also linked together by a "hash chain" (See: [Moskoy, Phillip (2018): What Is Bit Gold? The Brainchild of Blockchain Pioneer Nick Szabo](https://coincentral.com/what-is-bit-gold-the-brainchild-of-blockchain-pioneer-nick-szabo/)). Although BitGold was never implemented, many perceive it as being the direct ancestor to BitCoin.

As we can see, these intellectual predecessors identified elements that are essential to blockchain technology.

</ExpansionPanel>

![Blockchain Timeline](images/timeline.png)

On October 31, 2008, an individual or group calling itself Satoshi Nakamoto proposed a **P2P network for a digital currency**, calling it **Bitcoin**. Bitcoin introduced a novel consensus mechanism, now referred to as Nakamoto Consensus, that uses Proof-of-Work (PoW) to enable nodes to reach agreement in a decentralized network. It became possible to send online payments directly between parties **independent of financial institutions and trusted third parties**. Bitcoin became the first public, decentralized payment application.

<HighlightBox type="info">

Want to look closer at the initial proposition of Bitcoin? Take a look at the [Bitcoin Whitepaper](https://bitcoin.org/bitcoin.pdf)

</HighlightBox>

As soon as it became clear that the technology presents a very attractive base infrastructure for payments, other groups and organizations began adapting the technology for their purposes or developed new approaches using the same basic principles but adopting them to more traditional use cases.

In 2014, Vitalik Buterin started what is now known as the second wave of blockchain technology by publishing the paper underlying the Ethereum blockchain protocol, [A Next Generation Smart Contract and Decentralised Application Platform](https://github.com/ethereum/wiki/wiki/White-Paper). Beyond being a distributed ledger, the Ethereum whitepaper proposed the development of a distributed computation platform.

<HighlightBox type="tip">

Have a closer look at the [Ethereum whitepaper](https://ethereum.org/whitepaper/).

</HighlightBox>

Beyond a distributed ledger, the Ethereum whitepaper proposed the development of a distributed computation platform. The project raised roughly $20 million in one of the most successful crowdfunding campaigns up to that point. The first public network was up and running in 2015. At the same time, it spawned the first managed blockchain network approach when the company Eris forked a version of Ethereum and expanded it to implement a layer of permissions, as well as making it easier to deploy custom, access-controlled networks. In 2017, the [Ethereum Enterprise Alliance]((https://entethalliance.org/) was formed as an industry consortium to adapt Ethereum for enterprise use.

As soon as it became clear that the technology presents a very attractive base infrastructure for payments, other groups and organizations adapted the technology for their purposes or developed new approaches using the same basic principles but adapting them to more traditional use cases. Late 2015 saw the establishment of the [Hyperledger Project](https://www.hyperledger.org/) from the [Linux Foundation](https://www.linuxfoundation.org/), an industry consortium with a focus on enterprise blockchain technology for managed networks and business applications. Following the Hyperledger endeavors, R3, first a bank consortium that later became an enterprise software company, launched Corda, an open-source blockchain platform.

In August 2014, L.M. Goodman published the [Tezos position paper](https://tezos.com/static/position_paper-841a0a56b573afb28da16f6650152fb4.pdf) followed by the [Tezos whitepaper](https://tezos.com/static/white_paper-2dc8c02267a8fb86bd67a108199441bf.pdf) in September of the same year. By the Fall of 2014, a group of developers tasked with developing the protocol had produced a crude but functional network shell. In 2017, the Tezos Foundation raised $232 million in one of the biggest initial coin offerings (ICO) that year. The network launched in June 2018 its Betanet and later in September its Mainnet.

Early in 2016, R3CEV, later renamed R3, announced it was working on a distributed ledger "that might otherwise be considered a blockchain, but which the company made perfectly clear was anything but." As we will see, in summary, Corda has many blockchain-like properties as well as distinctive properties.

<HighlightBox type="reading">

* [Anderson, R. J. (1996): The Eternity Service](https://www.cl.cam.ac.uk/~rja14/Papers/eternity.pdf)
er Nick Szabo](https://coincentral.com/what-is-bit-gold-the-brainchild-of-blockchain-pioneer-nick-szabo/)
* [Hyperledger Foundation](https://www.hyperledger.org/)
* [Nakamoto, S. (2008): Bitcoin: A Peer-to-Peer Electronic Cash System](https://bitcoin.org/bitcoin.pdf)
* [A Next-Generation Smart Contract and Decentralized Application Platform - the Ethereum Whitepaper](https://ethereum.org/whitepaper/)
* [Schneier, B. &amp; Kelsey, J. (1998): Secure Audit Logs to Support Computer Forensics](https://mikemabey.com/cse469s19/papers/04_Secure_Audit_Logs.pdf)
* [Szabo, N. (1994): Smart Contracts](http://www.fon.hum.uva.nl/rob/Courses/InformationInSpeech/CDROM/Literature/LOTwinterschool2006/szabo.best.vwh.net/smart.contracts.html)
* [Moskov, P. (2018): What Is Bit Gold? The Brainchild of Blockchain Pioneer Nick Szabo](https://coincentral.com/what-is-bit-gold-the-brainchild-of-blockchain-pioneer-nick-szabo/)
* [The Ethereum Enterprise Alliance](https://entethalliance.org/")

</HighlightBox>

## Next up

Today we can see two broader trends in the development and adoption of blockchain technology - public blockchains and managed/private blockchains. Have a closer look at both types in the next section on deployment patterns.
