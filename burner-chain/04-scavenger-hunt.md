---
order: 4
---

# Scavenger Hunt

If you are ready to try earning more `XP` as well as `brain` in order to win the NFT Badges you should begin interacting with the Scavenge module. To get the first hint try printing out the questions being asked. These are stored by hashes of the answers. This means that once you think you know the answer, you can try hashing it to see if it matches the one recorded on the blockchain. To retrieve a list of all answer hashes use the following command:
```bash
ebcli query scavenge list
[
  "fcde2b2edba56bf408601fb721fe9b5c338d10ee429ea04fae5511b68fbf8fb9",
  "fcde2b2edba56bf408601fb721fe9b5c338d10ee429ea04fae5511b68fbf8fb9",
  "fcde2b2edba56bf408601fb721fe9b5c338d10ee429ea04fae5511b68fbf8fb9",
  "fcde2b2edba56bf408601fb721fe9b5c338d10ee429ea04fae5511b68fbf8fb9",
]
```
This will show you a list of hashes. Take each of the hashes and request more information about that specific question with the following command:
```bash
ebcli query scavenge get fcde2b2edba56bf408601fb721fe9b5c338d10ee429ea04fae5511b68fbf8fb9
{
  "creator": "cosmos17pl55kygvp3gnqf2xqwye9lysgp2mndufzaup6",
  "description": "foo",
  "solutionHash": "fcde2b2edba56bf408601fb721fe9b5c338d10ee429ea04fae5511b68fbf8fb9",
  "reward": [
    {
      "denom": "brain",
      "amount": "1"
    }
  ],
  "solution": "",
  "scavenger": ""
}

```
This will give you the description of the challenge and start you on your journey to solving the problem. It will also show you whether someone has already beat you to the punch and solved the riddle ahead of you. If you'd like to combine these two commands you can install `jq` and use some bash-jitsu as follows:
```bash
ebcli query scavenge list | jq ".[]" | xargs -I {} ebcli query scavenge get {}
```
This should get you ready to begin solving the riddles! Once you think you have the answer you can submit it with a commit reveal scheme. This means that you first submit your answer and it is hashed together with your address (that way no one can see what you think the answer is). Following this is the plain text submssion of your answer. At this point the app will hash your submission with your address to make sure you have already commited it. This prevents someone else from submitting your answer by watching the mempool of pending transactions.

Your commit command should look like the following:
```bash
ebcli tx scavenge commitSolution "your answer" --from your-nickname
```
This command will hash it on your behalf and submit the transaction after asking you to sign with the key you generated earlier. Once submitted you can confirm it was successful by taking the resulting `txhash` (looks like `9E869380BFD482DE05DD19B6DB00E3DB01B3E60F6422C12356D5F27459C8372C`) and querying the status of the tx as follows:
```bash
ebcli query tx 9E869380BFD482DE05DD19B6DB00E3DB01B3E60F6422C12356D5F27459C8372C
```
You should be able to see a series of events which were triggered when this transaction was sent. If it was successful you can proceed to reveal your answer and claim your reward:
```bash
ebcli tx scavenge revealSolution "your answer" --from your-nickname
```
This command will build the transaction and submit it after you sign with your key. To check whether the transaction was successful you can run a similar command as we previously did to check the transaction status:
```bash
ebcli query tx 9E869380BFD482DE05DD19B6DB00E3DB01B3E60F6422C12356D5F27459C8372C
```
You could also query the scavange directly to see if your name shows up as the solver:
```bash
ebcli query scavenge get fcde2b2edba56bf408601fb721fe9b5c338d10ee429ea04fae5511b68fbf8fb9
```
If you see your name you should be able to confirm that you received the NFT reward by using the following command:
```bash
ebcli query account $(ebcli keys show your-nickname -a)
```
Now that you've earned the `XP` or `brain` you can transfer it to your Ethereum Address on the xDai chain. If it is `XP`, it originated on the xDai side so you will `burn` the peggy tokens like we saw before (**note** sadly not possible yet). The `brain` tokens are native to the burner chain so they would be locked and minted as wrapped `brain` on xDai. The following command demonstrated what that would look like:
```
ebcli tx ethbridge lock $(ebcli keys show your-nickname -a) ETHEREUM_ADDRESS_OF_RECIPIENT 10brain \
--from your-nickname \
--ethereum-chain-id 100 \
--token-contract-address 0x164B88D11bD596956b6a7B1f662f11864EC1202e
```
> Notice: You don't have to move the `brain` token to win the NFT. We will see who has the most `brain` at the end of the weekend and reward the NFT to them, but this does not require the `brain` to be on the xDai chain.