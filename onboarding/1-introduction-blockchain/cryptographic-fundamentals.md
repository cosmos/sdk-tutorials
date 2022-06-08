---
title: "Cryptographic Fundamentals"
order: 
description: The cryptography behind blockchain
tag: fast-track
---

# Cryptographic Fundamentals

In laymen's terms, cryptography is the use of codes and ciphers to secure communication, messages, and information. 

In this section, we are going to take a specific look at how blockchain uses cryptographic techniques. Thus, we will take a look at: 

* Public-key or asymmetric cryptography
* The use of public and private keys
* Cryptographic hash functions
* Merkle trees

<ExpansionPanel title="A historic overview of cryptography - from ancient times to public-key cryptography systems">

Until some decades ago, cryptography constituted a method of encryption mainly based on simple methods, sometimes including mechanical aids. In case you want to also do a historic recap of the developments in the field of cryptography, take a look at the following content.

## Ancient times - Caesar's cipher

In ancient times **simple mechanisms for encryption** were used. One example of such a simple instrument is the so-called **Caesar's cipher**, also known as **shift cipher**. Named after Julius Caesar who used it for private correspondence, the shift cipher is a type of substitution cipher already used long before Caesar.

Caesar's cipher constitutes a substitution mechanism, in which each letter in a text/message is replaced by a certain letter according to a fixed number of positions in the alphabet later (shift value). It can easily be deciphered/broken because it is a single-alphabet substitution cipher. Breaking a Caesar's cipher is among others possible by using two rotating disks.

![Rotating disk](images/caesars-cipher.png)

In more modern applications, the encryption step of Caesar's ciphers is often part of more complex schemes. An example of such an encryption scheme is the [ROT13 system](https://en.wikipedia.org/wiki/ROT13). Caesar's cipher was also still used in the early 20th century by the Russian army as a simple-to-understand option for communication.

A further example of the application of shift ciphers is the **Vigenère cipher**, which uses Caesar's cipher where the value of the shift is defined with a repeating keyword. This specific cipher is unbreakable if the following conditions are fulfilled:

* The length of the keyword is the same as of the message;
* The keyword is chosen randomly;
* The keyword is not entrusted to anyone else;
* The keyword cannot be reused.

<HighlightBox type="info">

These conditions are met by so-called [one-time pad](https://en.wikipedia.org/wiki/One-time_pad) ciphers, but very hard to maintain. In one-time pad encryption, a text is paired with a pre-shared, single-use key (the one-time pad). A segment or each character of the text is encrypted through a combination of the text and the key/pad.

</HighlightBox>

Simple substitution ciphers like Caesar's cipher are easily broken. This becomes clear when observing two different settings: 

* The cipher type (a simple substitution cipher) is known to the malicious party.
* The malicious party knows Caesar's cipher is being used and only needs to determine the shift value.

If the cipher type is known, the encrypted message can be decrypted by using frequency analysis or pattern words. If it is known that the Caesar cipher is used, the malicious party would only have to check for all the number of possible shifts in a brute force attack. For messages in English, this would require going through 26 different options as the number of possible shifts is determined by the number of characters in an alphabet.

Encrypting messages multiple times with a simple substitution cipher does not increase the security of encryption. Why is this? If you encrypt a message by a shift value X and then encrypt it by a shift value Y, it is as you would have encrypted it by the shift value X+Y. Thus, decrypting it is as difficult as it would be with a simple substation cipher.

## Medieval times - frequency analysis and homophonic substitution

Around AD 800 an Arab mathematician named Al-Kindi introduced a technique nowadays known as **frequency analysis** to break mono-alphabetic substitution ciphers - this is often seen as the most significant development in cryptography until World War II. Among others, Al-Kindi analyzed methods of enciphering and conducted a statistical analysis of letters and letter combinations in Arabic. When knowing the frequency of letters in an encrypted text and correlating it with the frequency of letters common in the original language, the value shift becomes easy to determine.

Take a closer look at frequency analysis for the English language to better understand this method. 

![Frequency analysis for English](images/frequency-analysis-english.png)

English has 26 characters in its alphabet, whereby E and T are the most frequent and Q and Z are the least frequent. Knowing the frequency of characters in a language makes it possible to probabilistically estimate the shift value. With computer availability, it is even easier to determine the shift value since one can measure the actual frequency distribution compared to the expected distribution by for example Chi-Squared statistics.

Another cryptographically interesting development of the Middle Ages is **homophonic substitution ciphers**. In the early 1400s, the Duke of Mantua already used homophonic substitution ciphers. It is a substitution cipher, in which each letter is replaced by multiple symbols depending on letter frequency. In doing so, it combines mono-alphabetic and poly-alphabetic features.

It is, therefore, more difficult to break than other techniques with substitution ciphers and its break difficulty depends on the number of homophones. To break them, one has to:

* Find out which letter is substituted with which character;
* Find out how many characters or symbols a letter can have.

Most cryptographic techniques remained important during the Middle Ages due to their relevance in political and religious conflicts to ensure the secrecy of messages.

## Modern times - from (electro-)mechanical machines to electronics and computing

Until the **19th century** most cryptographic methods were rather of an ad-hoc nature and research was mainly concerned with encryption and/or methods focused on finding weaknesses in cryptographic techniques. In the **20th century**, **complex mechanical and electromechanical machines** were used to decipher. One of the most prominent examples of such a machine is the Enigma rotor machine - most prominently used by Nazi Germany for diplomatic and military communication, as well as to protect commercial information exchange.

During World War I, one of the most prominent cases when it comes to cryptography is the Zimmermann telegram: a cable sent from the German Foreign Office via Washington to the ambassador Heinrich von Eckardt in Mexico was decrypted. The content of the telegram is said to have contributed to the United States' decision to enter the war.

Gilbert Vernam proposed the idea of a teleprinter cipher in 1917, in which a key is kept on paper tape. The key is combined character by character with the text message and results in a ciphertext. This method established the benefit of electromechanical devices as cipher machines and led to the development of an unbreakable cipher, the **one-time pad**.

During World War II, **mechanical and electromechanical cipher machines** were often used as a more secure option to manual systems. Some examples of cipher machines are: 

* TypeX and Colossus used by Great Britain;
* The SIGABA used by the US;
* The Lacida used by the Polish;
* The Enigma machine used by Nazi Germany;
* The VIC cipher, the most complex hand cipher, used by the Soviets - at least until 1957.

## Symmetric key algorithms

Until modern cryptography was developed in the 1970s, **encryption algorithms had always been symmetric key algorithms**. This type of algorithm can be found in the electromechanical machines of World War II, but also Caesar's cipher and all other past cipher systems.

Symmetric key algorithms use a **key**, usually, a codebook, to encrypt a message. Both sender and recipient of a message have to know the key and keep it secret to ensure the security of encryption. So that the algorithm could be useful, the key had to be exchanged through a "secure channel" before the start of communication and maintained secret. As the number of participants increases, the secret is harder to keep. Thus, this type of algorithm is not suitable for communication between large amounts of participants.

In 1945, Claude E. Shannon, while working for Bell Telephone Labs, applied information theory to cryptography and with it laid the foundation for mathematical cryptography. He published the paper *Mathematical Theory of Cryptography*, in which **two main cryptographic goals** were defined: **secrecy and authenticity**. Shannon focused on **secrecy** and concluded that there were two types of system design for it:

* Systems that are designed to protect against attackers with infinite resources - **theoretical secrecy**.
* Systems that are designed to protect against attackers with finite resources at their disposal - **practical secrecy**.

One can understand theoretical secrecy as a characteristic of a system based on algorithms, which mathematically cannot be resolved independently of the computing power available for decryption. Practical secrecy refers to systems, in which the underlying algorithms could be broken, but computational power is not sufficient to do so.

Shannon stated that the length of a key in binary digits had to be equal to or greater than the number of bits contained in the message encrypted to ensure secrecy.

Later G.J. Simmons addressed the issues related to **authenticity**. More elaborate schemes for encryption became possible as electronics and computers were developed.

Before the 1970s, secure cryptography was often limited to the governmental realm. Cryptography became part of the public realm mainly due to two events: the public encryption standard (DES) and public-key cryptography.

</ExpansionPanel>

## Asymmetric cryptography

We can all agree that assuring the integrity and authenticity of messages are fundamental to the working of the blockchain. Without a trusted third party, a cryptographic proof is needed to ensure a direct and safe transaction between two parties. Thus, blockchain technology relies heavily on public-key cryptography.

<ExpansionPanel title="The second half of the 20th century - the development of asymmetric cryptography and other cryptographic achievements">

In 1970, British cryptographer James H. Ellis advocated the possibility of a **non-secret encryption** but was not sure about its implementation. A colleague of his, Clifford Cocks, developed the first scheme for the later called **Rivest–Shamir–Adleman (RSA) encryption algorithm** in 1973, which demonstrated implementation to be possible. Ron Rivest, Adi Shamir, and Leonard Adleman, all three at the Massachusetts Institute of Technology, created a generalization of Cocks' scheme, known as RSA. RSA is one of the first cryptographic systems, in which there is a public encryption key and a second private decryption key. It relies on the practical difficulty to factor large integers because it uses a module that operates with the product of two large prime numbers.

In 1974, Malcolm J. Williamson created a key exchange later named **Diffie-Hellman key exchange**. In 1976, Whitfield Diffie and Martin Hellman, influenced by Ralph Merkle's thinking on public-key distribution, published a method of **asymmetric key cryptography** nowadays known as **Diffie-Hellman key exchange**. This became the start of public-key cryptography since it was the first published practical technique for asymmetric cryptography.

<HighlightBox type="info">

Want to take a look at the Diffie-Hellman paper introducing the key exchange? See [New Directions in Cryptography](https://www-ee.stanford.edu/~hellman/publications/24.pdf)).

</HighlightBox>

Sadly, all these developments in cryptography were not made public - but they did not remain secret for long.

Another important development in the beginning 1970s was the **Data Encryption Standard (DES)**. Developed by IBM, the algorithm was approved by the National Bureau of Standards (NBS) after consulting the NSA and amending the version to be stronger against cryptanalysis. In 1977, it became part of the official Federal Information Processing Standard (FIPS).

Neal Koblitz and Victor Miller both introduced **elliptic curve cryptography** in the mid-1980s. Their achievements led to the development of new public-key algorithms based on the discrete logarithm problem - discrete logarithms are quickly computable in a few special cases but there is no efficient method known to compute them in general. Elliptic curve cryptography is mathematically more complex, while at the same time allowing for smaller key sizes and faster operations.

Beginning the era of the internet, a standard for encryption became vital to ensure its commercial use, among others for commercial transactions. Until the introduction of the **Advanced Encryption Standard (AES)**, DES continued to be used for encryption. After a public competition hosted by the National Institute of Standards and Technology (NIST, the successor agency of NBS), AES was selected as encryption standard. In addition, the Secure Socket Layer (SSL) was developed and introduced as a standard, which found application in web browsing, email, etc. The necessity for encryption later became more evident with wireless internet and the expanded use of devices and applications that rely on secure communication.

The developments after World War II and especially in the 1970s led cryptography to become part of the public realm again as encryption became available for public use.

</ExpansionPanel>

In simple words, **public-key cryptography**, also known as asymmetric cryptography, is _a form of cryptography based on **key pairs**_. Every pair consists of a **public** and a **private key**. The public key, as its names suggests, can be shared publicly. Its counterpart, the private key, should not be publicly shared. As long as the private key stays private, the security of the system is not endangered. Compare the key pair to having your house address public but keeping the key to your house private. Assuming you do not want to have any strangers in your home, you will want to keep your private key safe.

The two keys work together to carry out the **two functions of asymmetric cryptography**:

* **Authentication:** the process of confirming the identity and/or verifying the source. The public key serves as a verification instrument for the private key. For example, a message can be signed with the sender's private key so that it confirms the message is in fact signed by the owner with their private key.
* **Encryption:** the process of encoding the message as it is meant for a specifically authorized party. The information is encrypted with a public key and only the private key can decrypt the information encrypted with the public key.

<HighlightBox type="info">

How key pairs are used for authentication and encryption is discussed later. For now, just remember that asymmetric cryptography uses key pairs.

</HighlightBox>

How does a cryptographic system work?

Modern cryptographic systems leverage computer capabilities to make the power of certain mathematical functions accessible. Asymmetric algorithms rely on one-way functions like the multiplication of large prime numbers, discrete logarithm problems, and elliptic curve relationships. This type of algorithm needs to be based on computations that do not require much computational power to be executed but a large amount of computational power to be reversed.

What makes asymmetric systems more secure than symmetric systems?

Compared to symmetric key algorithms, asymmetric ones do not require parties to use a secure channel to exchange the keys for encryption and decryption. Asymmetric algorithms need to be able to output key pairs, encrypt and decrypt information. This requires a lot of computational power compared to symmetric algorithms. The need to invest large amounts of computational power into finding the keys, often referred to as work factor, makes asymmetrical cryptography practically secure.

Public-key cryptography ensures confidentiality, authenticity, and non-repudiation. Examples of applications are [S/MIME](https://en.wikipedia.org/wiki/S/MIME) and [GPG or GnuPG](https://en.wikipedia.org/wiki/GNU_Privacy_Guard), as well as the basis of several internet standards like [TLS](https://en.wikipedia.org/wiki/Transport_Layer_Security). Asymmetric key cryptography is normally applied to small data blocks due to its computational complexity.

Does the length of the key matter?

The length of the key matters. One would think the longer the key the more secure. However, funnily enough very long asymmetrical cryptographic keys provide at least the same degree of security a shorter symmetric key would provide because of the lower number of potential asymmetric keys for a given number of bits and the patterns within asymmetric keys. A general rule to still keep in mind: The longer the key, the more difficult it is to break the code. An attacker has to try out every possible key to break an asymmetric algorithm with a brute force attack. The longer the key is, the more difficult it is to "guess" the right key.

Maybe a simple example makes it clearer: every binary entity of information can have the value `0` or `1`. If one has an 8-bit key, 2^8 or 256 possible keys could be used. As the number of bits per unit of information increases, so does the number of possible keys.

Modern asymmetric ciphers have been established as a secure option but are not free of faults and possible problems. Faulty design and/or implementation have been points of insecurity. Furthermore, public-key cryptography is susceptible to brute force attacks, as well as "man-in-the-middle" attacks. The latter occur, when a third party intercepts, decrypts, and re-encrypts a message. A trusted entity installed as a certification authority can prevent such attacks.

<HighlightBox type="info">

Fun fact: Cryptographic systems are not exclusive of one another. In hybrid systems, symmetrical and asymmetrical cryptography is combined. For example, asymmetric encryption could be employed to transfer symmetric encryption, which would then be used as an encryption key for the message. Examples of these hybrid cryptosystems are [PGP](https://en.wikipedia.org/wiki/Pretty_Good_Privacy) and [SSL/TLS](https://en.wikipedia.org/wiki/Transport_Layer_Security).

</HighlightBox>

Let us have a look at some examples to better understand how public-private key pairs are used and how they implement functionalities to make authentication and encryption possible.

### Encrypt and decrypt with key pairs

While using an asymmetric key algorithm, each user needs to know their pair of keys, public and private, as well as the other participants' public key. 

Alice wants to send a message to Bob, which is intended for Bob's eyes only:

1. Bob gives Alice his public key.
2. Alice uses Bob's public key to encrypt the message.
3. Alice sends Bob the encrypted message.
4. Bob decrypts the message with his private key.

![Encrypt and decrypt](images/encrypt-decrypt.png)

### Sign and verify with key pairs

Private and public keys are used to **sign and verify** documents/files.

Alice wants to make sure that Bob's public announcement is indeed from Bob:

1. Bob gives Alice his public key.
2. Bob signs his announcement with his private key.
3. Bob sends Alice his announcement and its signature.
4. Alice verifies the signature with Bob's public key.

![Sign and verify](images/sign-verify.png)

Signing a message with a private key lets the other participant verify who send a message by using the public key.

### Encrypt, sign, verify, and decrypt

It is possible to mix both conceptual ideas. For example:

1. Alice encrypts her message with Bob's public key.
2. Alice signs the encrypted file with her private key.
3. Upon reception, Bob verifies the signature with Alice's public key to make sure the file came from Alice.
4. Bob decrypts the file with his private key.

![Encrypt, sign, verify, and decrypt](images/mix.png)

### Key management and public key infrastructure

If you look again at the Alice and Bob examples, you will notice that there is a vulnerability in "Bob gives Alice his public key". A malicious Charlie could intercept Bob's public key and pass on his public key to Alice.

![Intercepting a message](images/attack.png)

Public key infrastructure (PKI) is used to prevent fraudulent keys and the tampering of messages through interception. Key management and PKI are an important part of cryptography to mitigate risks.

## Cryptographic hash functions

After exploring how cryptography is used to make transactions secure with the use of key pairs, now it is time to look at how the **integrity of the blocks** and the logging of transactions in blocks is achieved.

A **hash function** is _a function used to map a group of characters (i.e. data) into values of a certain length called hash values or just hash_ - hash comes from the French "hacher" meaning to chop. Cryptographic hash functions are a special form of one-way hash functions that exhibit certain features to allow their implementation in cryptographic systems.

A hash function performs an operation on an input of data (i.e. the string) that results in an output of data of a fixed size called a hash value, a hash code, a digest, or sometimes just a hash. The fixed-length output remains the same no matter the size of the message. Remember, five main properties are of essence for a hash function:

* It is **deterministic**: the hash function produces the same output (hash value) for the same input (message).
* It is **fast**: the hash value for any given message is computed quickly.
* It is **resistant**: it is infeasible to work backward and thus impossible to generate the input (message) from the output (hash value) without trying **all** the possible inputs (this could be infinite).
* It exhibits an **avalanche effect**: any small change to the input, changing a "b" to "B" for example, results in a completely different hash value that has no resemblance to the old hash value.
* It is completely **unique**: it is infeasible to find two different inputs (messages) with the same hash value.

<HighlightBox type="warn">

Be careful with confusing hashing and encrypting, they are two different concepts. Hashing is an operation, which transforms data into a checksum or message digest. It is a one-way operation; it cannot be reversed. While encryption describes a two-way operation. This transforms a message into cipher-text and can also transform it back into its original state while ensuring the confidentiality of the message. Both terms should not be used analogously.

</HighlightBox>

With the described characteristics, what can you do with a hash function?

A cryptographic hash function:

* Converts an input, a.k.a. the message, into an output, a.k.a. the hash (or hash value);
* Converts the data in a reasonable amount of time;
* Operates one-way - it is practically impossible to re-generate the message out of the hash;
* Creates unique outputs - even the tiniest change in the message changes the hash beyond recognition so that it appears uncorrelated with the old hash value;
* Makes it practically impossible to find two different messages with the same hash value.

So with hash functions, you can:

* Prove that you have a message without disclosing the content of the message, for instance:
    * To prove you know your password;
    * To prove you previously wrote a message.
* Rest assured the message was not altered.
* Index your messages.

<HighlightBox type="tip">

You can see hashing in action to get the feel for it on the [OnlineMD5 website](http://onlinemd5.com/). As you type in the text box the hash updates automatically. Even a minuscule change to the input creates a completely different hash.

</HighlightBox>

Cryptographic hash functions are used for digital signature and file integrity verification and find application in areas such as credit card transactions and software updates. Their reliability is of the utmost importance as they are so central to our digital security and verification. Reassessing them is of importance to early detect if a cryptographic hash function can be re-generated. Testing a hash function's robustness when creating unique hashes is done with **collision attacks**. In a collision attack, one tries to find two sets of inputs that produce the same hash function.

In 2017, Google conducted a collision attack on [SHA-1](https://shattered.io/). It was considered a relatively insecure hash function but was still widely used and no one had actually proved it made duplicate hashes. Google managed to create a successful collision attack which cost roughly $110,000.

<HighlightBox type="info">

Bitcoin uses `SHA-256` and Ethereum uses `Keccak-256`and `Keccak-512` as hash functions.

</HighlightBox>

### Merkle trees

A **Merkle tree** is _a tree with leaf nodes labeled with a hash of a data block and with non-leaf nodes labeled with a cryptographic hash of its child nodes_. Merkle or hash trees, named after Ralph Merkle who patented the concept in 1979, are useful because they allow the **efficient and secure verification of large amounts of data**.

<!--Title: What is a Merkle Tree?, URL:https://youtu.be/DeektoaH7vE--> 

The term Merkle tree describes a tree where:

* Each **"leaf" (node)** contains a hash of a data block;
* The hashes of the leaf nodes are then hashed by non-leaf nodes further up the tree;
* The nodes further up the tree, the **parent nodes**, always keep the computed hash of its child nodes;
* At the top of the tree is the **Merkle root**, or master hash, root hash, or top hash, which is the final, single hash of the series of hashes of the leaves below it, i.e. its child nodes;
* Comparing this single parent or Merkle root with another Merkle root will tell you if all the data in the entire tree is the same;
* Any change to any of the data will create a new hash, which will filter up the tree to the root.

![Merkle tree](images/Merkle_Tree.png)

With this type of tree, you can verify the integrity of huge amounts of data very quickly:

* Download and verify the integrity of data pieces as they come in random order because each branch of a Merkle tree can be downloaded individually and verified immediately even though the whole tree is not yet available.
* Identify quickly which piece of data has been corrupted by following the trail of "incorrect" hashes. Then this small block can be re-downloaded quickly and order restored.

The ability to verify the integrity of huge amounts of data is what makes a Merkle tree attractive for blockchain networks: **in a blockchain, each block header keeps one or more hash(es) of the root, i.e. top leaf, of one or more Merkle tree(s).**

### Digital signatures and certificate authority

The concept of **digital signatures** is simple: if a given message is first hashed and then encrypted by a private key, you can verify the signature by decrypting with the corresponding public key. Hashing the message avoids the creation of signatures by mixing the messages and corresponding signatures. This way, you know that the sender has the private key to the given public key. However, this is not truly an identification.

It is time for a **certificate authority (CA)**. The CA signs a certificate to prove the identity of the owner of a public key. Such certificates usually include the subject name, which must be verified by the CA. The identity is proven if you can verify the CA's signature and trust the CA.

**Digital certificates** are used among other things to prove identity. They are given by a recognized Certification Authority. A widespread procedure is a public-key certificate proving ownership of a public key.

## Next up
