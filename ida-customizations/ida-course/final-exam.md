---
title: Final Exam
order:
description: 
tag: 
---

# Final Exam

Congratulations for getting this far. You are now ready to take the exam.

The exam is composed of two parts:

* One coding project that involves the Cosmos SDK, Ignite CLI, and CosmJS.
* One IBC relayer operations exercise.

## Coding project

An experienced developer can tackle the coding project in 4 hours or less. We have created a repository for you to upload your work on `git.academy.b9lab.com`. You can find your own repository [here](https://git.academy.b9lab.com/ida-p2-final-exam/student-projects). It was forked from [another repository](https://git.academy.b9lab.com/ida-p2-final-exam/exam-code) to which you have read-only access.

The detailed steps you need to do are described in its own `readme.md` file.

This server runs a Gitlab instance that we manage internally. It runs a CI/CD pipeline that grades your submission as soon as you push it to your repository. You can push as many times as you want and, we hope, see your score increase with every push (more details in the `readme`). 

The coding project counts for 90% of your overall exam score. This means that if the grading pipeline yields the line `FS_SCORE:100%`, congratulations, you already have 90% for the overall exam.

## IBC operations

An experienced developer can tackle the IBC operations exercise in 2 hours or less.

This part of the exam counts for 10% of your overall exam score. Unlike the coding project there are no partial scores. That is, you either achieve the goal, or you do not. So in terms of impact to your overall exam score, it either adds 0% or it adds 10%.

You should have received an email that details what you have to do. And, this is important, the recipient address and origin denominations that are specific to you. Below is a repeat of this email with generic values.

For this exercise, you have to:

1. Set up an IBC relayer between a Cosmos blockchain on your local computer and the Cosmos Hub's Theta public testnet (`theta-testnet-001`).
2. Send tokens from your local chain across to a precise recipient on Theta.

To test that you have completed the task:

1. We use identifiers that are unique to you. The identifiers are:
   1. The **recipient on Theta** to which you have to send some tokens is **<StudentInfo.addressRecipient>**. This is where you have to send the tokens.
   2. On your **local blockchain**, the **denomination** of the token you have to send to the recipient is **<StudentInfo.homeDenom>**. This is one of the denoms on your local blockchain.
2. We only check the recipient's balances on the testnet. This means you are free to decide how you reach this goal.
   1. We are looking for a balance with a denom that is `ibc/${sha256Of("transfer/channel-A-NUMBER/<StudentInfo.homeDenom>")}` and an amount strictly greater than 0.
   2. We are agnostic as to what channel number you are using as long as it is between 1 and 10,000 inclusive. If your channel number is any different, you should alert us, for instance on Discord.

Some pointers to assist you along the way:

* Your local chain has to declare a token with the <StudentInfo.homeDenom> denom. This token does not need to be the staking token.
* Your local chain can declare other denoms such as `stake` too, but that is irrelevant for the exercise.
* If you use Ignite to start your local blockchain, have a look at `config.yml` to declare new denoms.
* If you use a compiled version, like `simd`, have a look at the genesis to declare new denoms.
* To get testnet tokens, ask the faucet [here](https://discord.com/channels/669268347736686612/953697793476821092). You need an account on the testnet in order to pay the fees.
* To find a Theta testnet RPC end point, look [here](https://github.com/cosmos/testnets/tree/master/public#endpoints). At the time of writing, `sentry--02` was working well.
* We recommend the use of the Hermes relayer for this assignment. You can use the `ws://rpc.state-sync-02.theta-testnet.polypore.xyz:26657/websocket` endpoint for the `websocker_addr` in the Hermes configuration. Remember to adjust the gas prices to be `uatom`.
* To see the balances of your recipient, and confirm your success, head to a block explorer, for instance [here](https://explorer.theta-testnet.polypore.xyz/account/<StudentInfo.addressRecipient>).
* When you have established the IBC channel, and have its `channelId`, you can find out the denom that will be created when you transfer tokens. Go [here](https://emn178.github.io/online-tools/sha256.html) and input the string `transfer/channel-channelId/<StudentInfo.homeDenom>`.

## Overall exam score

To calculate your overall exam score, we combine:

1. Your score from the coding project, with a weight of `0.9`.
2. And your score from the IBC operations, with a weight of `0.1`.

If your overall score is 80% or higher, then, congratulations you have passed.

Good luck.