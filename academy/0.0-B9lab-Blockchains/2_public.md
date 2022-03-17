---
title: "Blockchain History"
order: 3
description: A Brief History of Blockchain Technology
tag: fast-track
---

# A Brief History of Blockchain

To fully appreciate Cosmos, it is helpful to understand the origins of blockchain technology, the advances that have unfolded, and the intractable challenges of other blockchain protocols Cosmos decisively solves.

Important groundwork was laid in the 1980s and 1990s for what would later be known as blockchain technology. Although the technology itself was not created until 2008, researchers from different fields in computer science and cryptography proposed solutions to many problems regarding security, transparency, and trust. All of them contributed to the development of the first large-scale, successful public blockchain network, Bitcoin.

## 1990s

In 1991, two research scientists, Stuart Haber and W. Scott Stornetta, identified a problem: How can it be ensured that digital documents are authentic and changes to them are tracked in an immutable time-stamped manner? In *How to time-stamp a digital document*, they worked on the concept of append-only, cryptographically secured logs. With their work, the foundations of what much later becomes blockchain technology were laid.

Haber and Stornetta’s work was later followed and elaborated on by Ross J. Anderson in 1996 when he described the creation of [*The Eternity Service*](https://www.cl.cam.ac.uk/~rja14/Papers/eternity.pdf), a storage medium resistant to denial-of-service (DoS) attacks using redundancy and scattering techniques, as well as anonymity mechanisms.

In 1998 [Bruce Schneier](https://www.schneier.com/crypto-gram/) and [John Kelsey](https://www.nist.gov/people/john-m-kelsey) proposed a computationally cheap way to safeguard sensitive information and allow for computer forensics with secure audit logs using hashing, authentication keys, and encryption keys.

<HighlightBox type="tip">

If you want to take a look at Schneier and Kelsey's proposed solution, take a look at [Schneier, B. & Kelsey, J. (1998): *Secure Audit Logs to Support Computer Forensics*](https://www.schneier.com/academic/paperfiles/paper-auditlogs.pdf).

</HighlightBox>

Another significant work arose in 1994, when computer scientist Nick Szabo first described the concept of [smart contracts](http://www.fon.hum.uva.nl/rob/Courses/InformationInSpeech/CDROM/Literature/LOTwinterschool2006/szabo.best.vwh.net/smart.contracts.html). It is important to recognize that Szabo's intent was to minimize the need for trusted intermediaries. In 1998 he proposed BitGold, a conceptual predecessor to Bitcoin as he argued for a decentralized digital currency. In both, Proof-of-Work (PoW) is used as a consensus algorithm to solve cryptographic puzzles in a peer-to-peer (P2P) network with Byzantine Fault Tolerance. The solutions are also linked together by a "hash chain". Although BitGold was never implemented, many perceive it as being the direct ancestor to Bitcoin.

<HighlightBox type="tip">

For more on BitGold, take a look at [Phillip Moskoy's 2018 paper *What Is Bit Gold? The Brainchild of Blockchain Pioneer Nick Szabo*](https://coincentral.com/what-is-bit-gold-the-brainchild-of-blockchain-pioneer-nick-szabo/).

</HighlightBox>

As we can see, these intellectual predecessors brought forward elements that are essential to blockchain technology.

## 2000s

On October 31, 2008, Satoshi Nakamoto called for a P2P system for a digital currency in the Bitcoin whitepaper that would allow online payments sent directly from one party to another without going through a financial institution or requiring any other third party involvement. This sounds familiar for a reason: Nick Szabo had already mentioned a currency that would depend minimally on third parties in the 1990s. However, Satoshi’s paper differed significantly - not only because of the name difference between BitGold and Bitcoin. The Bitcoin whitepaper also proposed a data structure for the Bitcoin blockchain and laid out the decentralized consensus mechanism. It became the first large-scale, successful public blockchain network.

<ExpansionPanel title="Who is Satoshi Nakamoto? The disruptive origins of blockchain">

To this day, we do not know who is behind the whitepaper or the first client implementation of Bitcoin. Satoshi Nakamoto is the pseudonym used by the person or group that published the whitepaper. As you might have seen in the news, the identity of Nakomoto has sparked plenty of conspiracy theories as several individuals have claimed to be the creator of Bitcoin. But to this date, none of the claims have been verified.

What is certain is that the community initially working on the network and the client can be characterized as generally pro-capitalist, anti-regulation, anti-monopoly, and pro-free-trade. Many of those developing and driving the technology have also heralded its potential to reduce corruption and perceived human failures by pushing processes out of human reach.

All this may not seem important but it is. Blockchain technology was built with disruption in mind. It was envisaged as the anti-thesis to the central control of banks, governments, and incumbent holders of monopolies. This has an influence on the direction the technology takes and remains a strong influence on its development.

Given its anti-establishment roots, blockchain technology has been seized upon by other groups interested in circumventing government, law enforcement, or regulatory control, as well as activists persecuted by their governments.

</ExpansionPanel>

![Historic timeline of blockchain technology](images/timeline.png)

## 2010s

As soon as it became clear that the technology presents a very attractive base infrastructure for payments, other groups and organizations adapted the technology for their purposes or developed new approaches using the same basic principles but adapting them to more traditional use cases.

In 2014, Vitalik Buterin started what is now known as the second wave of blockchain technology by publishing the paper underlying the Ethereum blockchain protocol, [A Next Generation Smart Contract & Decentralised Application Platform](https://github.com/ethereum/wiki/wiki/White-Paper). Beyond a distributed ledger, the Ethereum whitepaper proposed the development of a distributed computing platform.

<HighlightBox type="tip">

Have a closer look at the [Ethereum whitepaper](https://github.com/ethereum/wiki/wiki/White-Paper) to discover more on the initial concept.

</HighlightBox>

The Ethereum project raised roughly $20 million in one of the most successful crowdfunding campaigns up to that point. The first public network was up and running in 2015. Simultaneously, it spawned the first managed blockchain network approach when the company Eris forked a version of Ethereum and expanded it to implement a layer of permissions and making it easier to deploy custom, access controlled networks.

Late 2015 saw the establishment of the [Hyperledger Foundation](https://www.hyperledger.org/), an industry consortium with a focus on enterprise blockchain technology for managed networks and business applications.

In 2017 the [Ethereum Enterprise Alliance](https://entethalliance.org/) was formed as an industry consortium to adapt Ethereum for enterprise use.

This brief background introduces the vibrant community and fast-paced evolution of the space from which Cosmos would emerge.

Today we can see two broad trends in the development and adoption of blockchain technology: public blockchains and managed/private blockchains. Understanding this distinction will be important to your understanding of Cosmos. Cosmos is applicable to both use-cases and, importantly, enables seamless interoperability that has challenged predecessors.

Let us start by diving into public blockchains and their most known examples, Bitcoin and Ethereum, and later taking a closer look at private/managed blockchains in the next section.



<HighlightBox type="reading">

## Books

* [Swan Melanie: Blockchain (2015): Blueprint for a New Economy](https://www.amazon.co.uk/Blockchain-Blueprint-Economy-Melanie-Swan/dp/1491920491)
* [Antonopolous, Andreas (2017): Mastering Bitcoin](https://bitcoinbook.info/)

## Further reading

* [Anderson, Ross J. (1996): The Eternity Service](https://www.cl.cam.ac.uk/~rja14/Papers/eternity.pdf)
* [Buterin, Vitalik (2014): A Next-Generation Smart Contract and Decentralized Application Platform - The Ethereum White Paper](https://github.com/ethereum/wiki/wiki/White-Paper)
* [Moskov, P. (2018): What Is Bit Gold? The Brainchild of Blockchain Pioneer Nick Szabo](https://coincentral.com/what-is-bit-gold-the-brainchild-of-blockchain-pioneer-nick-szabo/)
* [Nakamoto, S. (2008): Bitcoin: A Peer-to-Peer Electronic Cash System](https://bitcoin.org/bitcoin.pdf)
* [Schneier, B. & Kelsey, J. (1998): Secure Audit Logs to Support Computer Forensics](https://www.schneier.com/academic/paperfiles/paper-auditlogs.pdf)
* [Szabo, N. (1994): Smart Contracts](http://www.fon.hum.uva.nl/rob/Courses/InformationInSpeech/CDROM/Literature/LOTwinterschool2006/szabo.best.vwh.net/smart.contracts.html)
    
</HighlightBox>
