---
title: "Managed Blockchains"
order: 3
description: Introduction to Managed Networks
tag: fast-track
---

# Introduction to Managed Networks

Managed networks, just like public networks, rely on blockchain data structures. But unlike public blockchain networks they do not *necessarily* need to mitigate the Byzantine General's Problem because they operate in a predictable environment with elements of authority, hierarchy and accountability.

![Public and Managed Network Comparison](images/00_08_public_vs_private_comparison_dark.png)

# Managed Blockchain Networks

Public networks are based on game theory and economic incentives, which means that every action is probabilistic. We have no guarantee that our transactions will be picked up and even the integrity of the network is merely very likely, not 100% guaranteed.

This is often unacceptable, for example, for traditional financial institutions. Still, one of the biggest expenses financial and other institutions face is the operation and maintenance of infrastructure as well as the cost resulting from leaks, hacks, reconciliation with trading partners, errors and data incompatibility. Blockchain seems like a promising solution. 

Unlike public networks where the interaction between participants is governed by the protocol and crypto-economic incentives, in managed networks the blockchain protocol is a technical enforcement of pre-existing relationships and legally enforceable agreements.

![Public vs Private](images/Publicvsprivate.png)

**Private blockchains**:

- **can be designed for a limited number of vetted and approved participants.** Accommodation of performance-challenged and poorly connected nodes is of lesser importance. 

- **can be designed for optimised performance.** Most participants in an Enterprise network will be well-capable of standing up well-connected high-performance and high-availability nodes. A group of participants can agree to raise the bar defining minimum system requirements significantly. For example, participation might be limited to sizable Enterprise-class servers with redundant low-latency, high-bandwidth network connections.

- **can be governed by a well-defined agreement between the participants.** Such an agreement may codify the decision-making processes that will be used to decide such matters as protocol upgrades, admission requirements, and remedial action. In a private or consortium setting, “who decides?” can (likely must) be determined well in advance of an incident.

In summary, managed networks enable high performance blockchain networks that can use consensus processes that don't solve for anonymous users. A group of trading partners can create a small network for their own purposes, agree on equitable participation in the block-generation process (e.g. each participant runs one validator), agree on minimum performance metrics for acceptable validators and agree on governance, all of which enable fast confirmation and even deterministic transaction finality within their small group. The principle tradeoff for this performance improvement is the shunning of permissionless public access. 

Cosmos is applicable to both public and private settings and, importantly, supports communication between networks following different consensus rules, a seemingly intractable challenge for Cosmos' predecessors. 

<HighlightBox type="reading">
    
    * Vitalik Buterin on private chains [https://blog.ethereum.org/2016/05/09/on-settlement-finality/](https://www.multichain.com/blog/2017/11/three-non-pointless-blockchains-production/)
    * Permissioned blockchains in production [https://www.multichain.com/blog/2017/11/three-non-pointless-blockchains-production/](https://www.multichain.com/blog/2017/11/three-non-pointless-blockchains-production/)

</HighlightBox>
