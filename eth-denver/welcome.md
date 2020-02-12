 # Eth Denver Cosmos Burner Chain

Welcome to the first official Cosmos Burner Chain! Following in the tradition of the Burner Wallet project (and other temporary low-security chains) we've built and launched a game chain to be used for the duration of the Eth Denver Hackathon. The goal of this chain is to provide a blueprint for your own application specific blockchain that interacts with other EVM based networks like Ethereum and xDai.

The Eth Denver Cosmos Burner Chain consists of a few moving pieces. The first of which is the Cosmos SDK itself. This is a framework, much like Ruby-on-Rails, for building new blockchains. It comes with a set of standard modules that handles a common set of features: Bank (Fungible Tokens like ERC-20), Auth (Accounts secured by public key cryptography), Proof-of-Stake + Slashing (together these modules handle a proof of stake validator set utilizing Tendermint Consensus with slashing conditions for equivocation and downtime) as well as Params (live updates to the chain) and Gov (a governance module that can be used for text proposals, param changes and directing a community pool of funds).

Out of the core SDK modules, our Burner Chain uses Bank, Auth, Proof-of-Stake and Slashing. Outside of the standard fare it also uses Peggy, a new Module that was developed by Swish Labs with support from the Intechain Foundation. This module is essentially a bridge between EVM chains like Ethereum and xDai. It is used to transport Fungible Tokens and has recently been extended to support the transport of Non-Fungible Tokens as well (an integration with the Ethermint EVM module would allow arbitrary message transportation if you're looking for a cool hackathon project!). Our burner chain also uses the NFT Module which is in the "incubator" stage and hosted within the cosmos/modules repository. The final piece of our chain is the Scavenge Module, which is part of the sdk-tutorials repo. This module allows you to post a riddle with a bounty for whoever can solve it (You can also check out the Scavenge tutorial to learn how to build a custom module for the Cosmos SDK.)

In summary the pieces that are included are:
 * Bank
 * Auth
 * Proof-of-Stake
 * Slashing
 * NFT
 * Peggy (oracle, ethbridge, nftbridge)
 * Scavenge

The purpose of the chain is to extend the Scavenger hunt game in order to interact with the Eth Denver BuffiDai game (If you haven't heard about BuffiDai take a look here). Cosmos has 1200 XP to give out and 2 NFT badges (Big Brain and Cosmos Brain). We have locked all of them up within a peggy bridge contrat deployed to the xDai chain. This contract is controlled by the validators of the Burner Chain which relay transactions between the two chains. In order to claim XP on the Cosmos Burner Chain you must sign up for our newsletter. Afterwards you will receive a balance of XP on the Cosmos burner chain where you will be able to move the XP back to the BuffiDai contract on xDai using the Peggy ETH bridge.

To win the Cosmos NFTs you must play the Scavenge game! This is a series of riddles which results in a secret answer that is submitted via commit-reveal to the Cosmos Chain. Correct results are rewarded with an NFT that can be sent back to xDai via the Peggy NFT bridge. 

To get the XP begin by signing up for our newsletter at our Sponsor Booth. To claim the XP you'll need to build the Command Line Client for interacting with the Eth Denver Cosmos Burner Chain. First make sure that you have golang v13.0 or newer and that your `$GOPATH` and `$GOHOME` are correctly configured.
```sh
which go
echo GOPATH
echo GOHOME
```
Now you can `go get` the package like:
```sh
go get github.com/cosmos/peggy@nft-scavenge
```
You could also try cloning the repo directly like:
```sh
git clone github.com/cosmos/peggy@nft-scavenge
```
Either way, afterwards you'll need to navigate into the newly downloaded directory and run:
```sh
make install
```
This should result in building three binaries:
```sh
# TODO
```
The first binary (`ebd`) is used for running a node within the network (if you're interested in joining the network you can read more about doing so here). The second binary (`ebrelayer`) is for running a relayer between the burner chain and xDai. You won't be allowed to do this unless you also run a validator so we won't look further into it at this point. The third binary (`ebcli`) is the one we want. Try running the help command to see what it can do:
```sh
ebcli --help
```
The first thing we'll want to do is add some values to the config of our CLI so you don't need to include them as flags with every other command. W'' add formatting the CLI results as well as point our CLI to the active burner node at https://eth-denver.okw.me where it is running with the `chain-id` of `den-burner`
```sh
ebcli config indent true
ebcli config format JSON
ebcli config chain-id den-burner
ebcli config node https://eth-denver.okw.me:443
```
Next you'll want to generate a new account for this chain. You should come up with a nickname for this account that you can use to reference it while making other commands later on. This will also show you the mnemonic phrase that secures the account as well as the public key and your address as a bech32 encoded version of your public key with a cosmos prefix (the prefix can be modified per chain).
```sh
ebcli keys add new nickname
```
This is your new account! Now that you know your account address, you need to send it to us so we can give you your XP! Go to this google form `TODO` to submit your email address and your bech32 `cosmos` prefix account address. We'll confirm you've signed up for our newsletter and send you the XP on the burner chain. Once you've received the XP you should be able to check your balance like this:
```sh
ebcli query account $(ebcli keys show nickname -a)
```
This command uses the `ebcli keys` command to grab your account address and uses it as a parameter in the `ebcli query` command. If you have not yet received your XP tokens, you will see an error that your account does not exist. That's because accounts are not registered within the chain's memory until they execute their first transaction or receive a balance in some token.

Once you have some XP you can send it back to your Ethereum address on the BuffiDai xDai chain. To do this use the following command:
```sh
# ebcli peggy transfer .... #TODO
```
You should be able to see the balance show up in your BuffiDai wallet!

If you are ready to try earning the NFT Badge you should begin interacting with the Scavenge module. To get the first hint try printing out the questions being asked. These are stored by hashes of the answers. This means that once you think you know the answer, you can try hashing it to see if it matches the one recorded on the blockchain. To retrieve a list of all answer hashes use the following command:
```sh
ebcli query scavenge list
```
This will show you a list of hashes. Take each of the hashes and request more information about that specific question with the following command:
```
ebcli query scavenge show <scavengeHash>
```
This will give you the description of the challenge and start you on your journey to solving the problem. It will also show you whether someone has already beat you to the punch and solved the riddle ahead of you. If you'd like to combine these two command you can use some bash-jitsu as follows:
```sh
# TODO bashjitsu
```
This should get you ready to begin solving the riddle! Once you think you have the answer you can submit it with a commit reveal scheme. This means that you first submit a hash of your address and your answer so that no one can see what you think the answer is. Following this is the plain text submssion of your answer. At this point the app will hash your submission with your address to make sure you have already commited it. This prevents someone else from submitting your answer by watching the mempool of pending transactions.

Your commit command should look like the following:
```sh
ebcli scavenge commit "your answer" --from nickname
```
This command will hash it on your behalf and submit the transaction after asking you to sign with the key you generated earlier. Once submitted you can confirm it was successful by taking the resulting <txhash> (looks like `TODO`) and querying the status of the tx as follows:
```sh
ebcli query tx <txhash>
```
You should be able to see a series of events which were triggered when this transaction was sent. If it was successful you can proceed to reveal your answer and claim your reward:
```sh
ebcli scavenge reveal "your answer" --from nickname
```
This command will build the transaction and submit it after you sign with your key. To check whether the transaction was successful you can run a similar command as we previously did to check the transaction status:
```sh
ebcli query tx <txhash>
```
You could also query the scavange directly to see if your name shows up as the solver:
```sh
ebcli query scavenge show <solutionHash>
```
If you see your name you should be able to confirm that you received the NFT reward as too by using the following command:
```sh
ebcli query nft balance $(ebcli keys show nickname -a)
```
Now that you've earned the NFT you can transfer it back to your Ethereum Address on the xDai chain with the following peggy command:
```
#TODO ebcli peggy transferNFT
```
Congratulations, you've just won XP and/or an NFT on the Eth Denver Cosmos Burner Chain! This chain will shut down after it's purpose at this event but the assets you earned will live on to be used in the DAOStack community voting pool and stay with you on the much less ephemeral xDai and Ethereum blockchains!

If you enjoyed this Tutorial feel free to share to others who may also enjoy it! If you had any issues we'd love to hear about them! This tutorial is hosted on github where you can make a new issue and describe the difficulties you were experiencing. If you want help during the hackathon just look for someone at the Cosmos booth!

If you want to stay up to date with me consider following my twitter, github and/or medium.