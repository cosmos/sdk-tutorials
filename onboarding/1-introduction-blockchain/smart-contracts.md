---
title: "Smart contracts"
order: 9
description: 
tag: fast-track
---

--> Curtail content

# Introduction

A contract is commonly known as a *formalisation of a relationship and/or transaction*. In common law a contract is understood as a *"meeting of minds"* -a meeting that entails an intricate play of trust building and relies on a legal system evolved through centuries with deep underlying traditions and understandings.

Smart contracts are a main application area in blockchain technology. Understanding what a smart contract is and how it can be deployed, as well as knowing what important aspects to keep in mind when developing and deploying a smart contract is of essence to understand blockchain technology’s possible areas of application and current developments.

<!-- Title: Smart contracts, URL:  https://www.youtube.com/watch?v=SirFQ4WIkDY -->

The term **smart contract** is often misused and/or misunderstood. 

There are 2 main concepts regarding smart contracts. Smart contract can be viewed either from **theoretical perspective** or in the **context of the Ethereum protocol**.

When taking a **theoretical approach**, the focus lies on two questions: 

* What is a contract?
* And respectively, what is a smart contract?

We will take a closer look at the different understandings of smart contracts, theoretical and practical, in the sections to come.

## About the Smart Contracts Module

In this module, we will turn our eye to smart contracts.

Smart contracts are seen as a possibility to combine rising technical awareness and developments with insights from the field of business administration and legal practice.

We will start with an introduction into contract theory by discussing contract processes and a model to understand contractual relationships, the principal-agent theory. Then we will proceed with a short description of the beginnings of smart contracts. Important dimensions and security challenges to keep in mind during the drafting of contracts will follow. Afterwards, as part of our overview on smart contracts, we will explore the challenges both traditional and smart contracts face when trying to mitigate risk and reinforce trust. Then legal consideration, as well as technical implementation issues will be addressed. We will end this module with a small introduction to Ricardian contracts and their combination possibility with smart contracts as well as an implementation example.

Have fun!



## Beginnings & current state of smart contracts

Let us backtrack to the 1990's when Nick Szabo first used the term smart contract in his [*Formalizing and Securing Relationships on Public Networks*](https://journals.uic.edu/ojs/index.php/fm/article/view/548/469).

In his paper, he introduces the possibility of efficiently transferring automated traditional contracts from common law into distributed protocols, especially in conjunction with digital transactions. Nick Szabo uses the example of a vending machine to break his proposition down into a real-life scenario. The vending machine is a contract with bearer: Those with a sufficient amount of coins can engage in an exchange and receive the goods offered.

Szabo envisioned a world where contracts could be embedded in all kinds of property with value and be controlled digitally. The main argument is that software could minimise human involvement therefore lowering costs and creating a more efficient relationships by automating contract performance, monitoring, and enforcement.

This is where the "smart" comes in: These type of contracts are "self-enforcing".

Since Szabo’s article, we use the term **smart contract** to describe the transfer from a common law contract to computer code or programs. It can be understood as a legally binding contract in digital form, or as others put it, a computerised protocol that executes the terms of a common contract.

Smart contracts later resurfaced with **distributed ledger technology (DLT)**. DLT revitalised the debate surrounding their advantages and usefulness, as well as potentials for application of smart contracts.

When taking the more **practical approach** by looking at the concept of smart contracts in the **Ethereum protocol**, one focuses on the application of smart contracts.

Ethereum is a special case because code storing and execution are possible on its distributed ledger network (See: **Deployment Patterns**, *Introduction to Ethereum*). Smart contracts in Ethereum are called this way because they partially achieve what Szabo envisioned as one can transfer and hold funds to secure and enforce predefined transactions and relationships.

Just as Szabo envisioned, the contract itself contains the enforcement of its terms, causing **third parties** to play a much smaller role. Smart contract advocates expect that by automating contracting, we eliminate human error and with it lower error rates. Intermediaries are expected to pay a secondary role in the future. It is often argued that they would only come into play when addressing performance evaluation and in dispute resolution.

For now, smart contracts are mainly used in making fund transfers possible through the blockchain, but they can be used for all processes in which a reliable record is necessary.

However, researchers foresee smart contracts breaking new ground in capital markets and digital asset sales, government activities, real estate registries, and digital identity, as well as supply chain management. One remarkable application of smart contracts could be to provide financial services to the world’s "unbanked", which amount to 1.7 billion adults according to the Worldbank (See: [The Global Findex Database 2017](https://globalfindex.worldbank.org/)).

In the more recent **context of blockchain protocols**, a smart contract represents a digital agreement and interaction framework for the parties involved. We will see how this definition contrasts with the legal definition of contracts because of the challenges they face to function as contracts within our legal system. 

## Smart contract vs. common law contract 

After we have provided a general overview of what is important in contract creation and the strategies to mitigate risk and disputes, let us now take a look at how smart contracts compare to traditional contracts.  

### Smart contract benefits

Smart contracts have several benefits mainly due to their:

* **self-executing**, 
* **self-enforcing**, and 
* **self-verifying nature**.

The contractual process can be facilitated by the use of protocols and user interfaces.

**Smart contracts are self-executing.**

They automate the established contractual terms. Just like the vending machine Szabo alluded to, these contracts carry out the terms they are programmed to execute. 

Both parties can observe the performance of terms, if the code is written to confirm this information and include it on the chain.

The need for often costly and time-consuming litigation could be potentially reduced drastically, because parties can be forced to comply with the rules and specifications of their contract by including the stipulated actions in the underlying code and automating them. This leads us right to the second smart contract characteristic.

**Smart contracts are self-enforcing.**

Contract parties can be forced to comply with the rules and specifications of their contract by including the stipulated actions in the underlying code.

This in turn reduces ex-ante transaction costs in the search and signalling process, as well as ex-post costs with regards to monitoring and enforcement. 

**Smart contracts are self-verifying.**

Since the smart contracts exist on the blockchain, as soon as the contract terms are met, transactions are automatically carried out and data is recorded securely as it cannot be altered nor deleted.

![Advantages Smart Contracts](images/sc3.png)

<div class="b9-reading">
	<ul>
	<li><a href="https://www.capgemini.com/consulting/wp-content/uploads/sites/30/2017/07/smart-contracts.pdf">CapGemini Consulting (2016): <i>Smart Contracts in Financial Services: From Hype to Reality</i></a></li>
	<li><a href="https://www.iif.com/Publications/ID/582/Getting-Smart-Contracts-on-the-Blockchain">Getting Smart: <i>Contracts on the Blockchain</i></a></li>
	<li><a href="https://journals.uic.edu/ojs/index.php/fm/article/view/548/469">Szabo, N. (1997): <i>Formalizing and Securing Relationships on Public Networks. In: First Monday 2 (9)</i></a></li>
	</ul>
</div>




# Legal Considerations

The **legal debate** surrounding smart contracts questions the potential legality of smart contracts. There are those who accept smart contracts and question the potential implications smart contracts could have on contract law and the legal profession. Do lawyers have to learn how to code? Are they going to end massively unemployed? There are others who are more sceptical and discuss whether smart contracts could be considered legal at all.

Most critics do not see smart contracts as a substitute to contract law, but an opportunity for a more clear, predictable, enforceable, and auditable contract form.

Therefore, some argue that the term "smart contract" is misleading, considering they do not address significant areas in the contractual process. So far, there are significant areas in the contractual process that cannot be executed by a smart contract.

Smart contracts represent a new form of contracting transactions. With them, new legal implications arise.

In legal analysis, smart contracts are often conceptualised as a mean to use code to articulate, execute, and verify contracts -Which, according to legal professionals is very limited, if smart contracts are perceived as a replacement to legal contracts. What really concerns legal professionals is how smart contracts could be regulated and enforced in court and how to deal with **notice**, **consent**, **fraud potential**, **force majeure**, and **consumer protection** in smart contracts without a legal system addressing them specifically.

**The code is as smart as the human who writes it.**

Smart contracts are complex in their programming and their potential implications -Self-execution bears the potential of small errors causing significant effects.

Business activities offering smart contract services should be wary of the consequences of programming mistakes, those mistakes could touch upon the areas of product liability, breach of contract, and/or deceptive trade charges, as well as other security aspects of smart contract implementation.

In addition, auditing has been seen as a focal point to make the utilisation of smart contracts safe for all contractual parties.

In this section we will discuss what happens when code is incorporated into contract law, as well as possible implications of an increased smart contract usage for legal experts.

## Code as contract

Joel Reidenberg was the first to introduce the term [**Lex informatica**](https://ir.lawnet.fordham.edu/cgi/viewcontent.cgi?article=1041&context=faculty_scholarship). This term is inspired by a recent tradition of conceptualising smart contracts for legal scholars in the following sense: **"code is law"**. With it the paradigm of **"code as contract"** has been debated equally by legal scholars and smart contract developers.

![Code as Contract](images/codeascontract.png)

Smart contracts are not equal to contracts in the realm of traditional, non-digital law. It is essential to differentiate smart contracts from existing contract forms and to be mindful of the similarities and differences between them to avoid unintended consequences and the transfer of misconceptions.

**Trust mechanisms** in traditional contract law are based on human agents, institutions with authority to enforce contracts, and the concept of intent. 
Smart contracts in contrast operate on trust mechanism based on their source code and rely on signalling transparency. 
Remember that smart contracts, even if part of the digital world, are not free from public constraints, as well as under the influence of economic and societal norms.

## Potential impact on legal profession

A great deal of lawyering activities nowadays surround contract law. 
With an expected change in the way contracts are developed and conceptualised, the role lawyers fulfil will probably transform too.
Therefore, the change towards smart contracts could represent a fundamental change of how a large part of lawyering is conducted.

The role of lawyers in the **contractual lifecycle** depends heavily on the type of network they are deployed on. 
Is it a managed blockchain network (which is preferred by large traditional businesses), or is it a public blockchain network like Bitcoin and Ethereum (which is more likely to be used by startups)?
Structure determines the inclusion of intermediaries such as lawyers. 

A hot **debate** between “crypto-pragmatists” and “crypto-purists” has been raging for the past few years. 
Pragmatists advocate for the incorporation of aspects of traditional legal systems, whereas purists reject the idea of including intermediaries.

Let us briefly have a look at the role legal professions could have after a future shift towards smart contracts by taking a more detailed viewed at some phases and important steps of the contractual lifecycle: deal structuring, advising, due diligence questions, drafting of contracts, the formation of entities and authorisation aspects, as well as the role of regulatory authorities, and the documentation and recording of contracts.

![Contractula Lifecycle](images/contractlifecycle.png)

An efficiency increase is often expected when business relationships and transactions are structured using blockchain protocols. 
In deal structuring and advising the main aim is to reduce the risks of effects due to contract stipulations to a minimum and maximise the potential outcomes of the principals. 
An inverse relationship between the usefulness and complexity of certain types of transactions conducted on blockchain networks and the workload of lawyers is expected in regard to deal structuring and advising. 
As the expansion of smart contracts continues, the amount of legal work necessary will likely be high initially, but flatten and decrease with time. 

Traditional lawyering will probably become less important for a subset of contract law due to streamlining and automation.

In regard to due diligence the necessity for traditional legal scholars depends on the complexity of the transaction addressed in the contract. 
As in the negotiation phase, the necessity of legal advice to ensure due diligence will decrease as soon as smart contracts become common practice and certain automation effects can bear fruits.

Changes in drafting and review activities, which are a key activity of legal scholars, could mean that the traditional role of lawyers will be shifting more towards drafting templates. 
Legal experts will have to translate protocol contents and proceedings into legal prose to summarise inputs, outputs, and other off-chain effects.

In common law, the creation of entities and authorisation of intermediaries represents an important aspect of the work lawyers perform in contract law. 
Entity formation might in some cases still be necessary, because even if smart contracts are executed in the digital realm the contract still has effects on the non-digital realm and entities operating in it.

In regard to the authorisation of intermediaries, one of the main aspects of smart contracts is to reduce the role of intermediaries’ imperative for contracting. 
We can expect that legal work focused on this aspect will decline over time.

The relationships between regulatory authorities and entities are often structured by lawyers. 
This field of activity will likely continue to rely on legal scholars even when smart contracts become more common.

In regard to documentation and recording, which are mainly undertaken by lawyers, digitising contracts will probably lead to a decrease of this aspect of the legal profession.

## Quick recap


<div class="b9-reading">
	<ul>
	<li><a href="http://biglawkm.com/2016/10/20/smart-contracts-and-the-role-of-lawyers-part-1-about-smart-contracts/">Miller, B. (2016): <i>Smart Contracts and the Role of Lawyers (Part 1) – About Smart Contracts</i>. In: BigLaw KM.</a></li>
	<li><a href="http://biglawkm.com/2016/10/22/smart-contracts-and-the-role-of-lawyers-part-2-about-code-is-law/">Miller, B. (2016): <i>Smart Contracts and the Role of Lawyers (Part 2) – About “Code is Law”</i>. In: BigLaw KM.</a></li>
	<li><a href="https://biglawkm.com/2016/10/25/smart-contracts-and-the-role-of-lawyers-part-3-about-lawyering-transactions-on-blockchains/">Miller, B. (2016): <i>Smart Contracts and the Role of Lawyers (Part 3) – About Lawyering Transactions on Blockchains</i>. In: BigLaw KM.</a></li>
	<li><a href="https://web.archive.org/web/20160306082533/https://www.cypherpunks.to/erights/talks/pisa/paper/digital-path.pdf">Miller, M. S.; Stiegler, Marc (2003): The digital path. Smart contracts and the Third World. In: Birner, J. &amp; Garrouste, P.: <i>Markets, Information and Communication. Austrian Perspectives on the Internet Economy</i>. London: Routledge. Page 63-88.</a></li>
	<li><a href="https://coincenter.org/entry/what-are-smart-contracts-and-what-can-we-do-with-them">Shadab, H. (2014): <i>What are Smart Contracts, and What Can We do with Them?</i>. In: Coincenter.</a></li>
	</ul>
</div>


--> add more on limitations and difficulties and sub-section on Gas


## Next up
