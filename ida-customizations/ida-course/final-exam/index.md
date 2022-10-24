---
title: Final Exam
order:
description: 
tag: 
---

# Final Exam

Congratulations for getting this far. You are now ready to take the exam.

The exam is composed of two parts:

* One **coding project** that involves the Cosmos SDK, Ignite CLI, and CosmJS.
* One **IBC relayer operations** exercise.

## Coding project

An experienced developer can tackle the coding project in 4 hours or less. We have created a repository for you to upload your work on `git.academy.b9lab.com`. You can find your own repository [here](https://git.academy.b9lab.com/ida-p2-final-exam/student-projects). It was forked from [another repository](https://git.academy.b9lab.com/ida-p2-final-exam/exam-code) to which you have read-only access.

The detailed steps you need to do are described in its own `readme.md` file.

This server runs a Gitlab instance that we manage internally. It runs a CI/CD pipeline that grades your submission as soon as you push it to your repository. You can push as many times as you want and, we hope, see your score increase with every push (more details in the `readme`). 

Please do not modify the [`.gitlab-ci.yml`](https://git.academy.b9lab.com/ida-p2-final-exam/exam-code/-/blob/main/.gitlab-ci.yml) file as that would invalidate your score.

The coding project counts for 90% of your overall exam score. This means that if the grading pipeline yields the line `FS_SCORE:100%`, congratulations, you already have reached 90% for the overall exam.

## IBC operations

An experienced developer can tackle the IBC operations exercise in 2 hours or less.

This part of the exam counts for 10% of your overall exam score. Unlike the coding project there are no partial scores. That is, you either achieve the goal, or you do not. So in terms of impact to your overall exam score, it either adds 0% or it adds 10%.

You should have received an email that gives you the two pieces of information that are **unique to you**:

1. The recipient address.
2. The origin denomination.

Head [here](https://git.academy.b9lab.com/ida-p2-final-exam/exam-ibc-operation/-/blob/main/exercise-description.md) for the complete exercise description. Take note of the parts where it mentions the identifiers that are unique to you.

We have a service that runs on a schedule and checks if you completed the expected transfer. So, after you have completed this part, give or take a few hours, you should receive an email confirming that our server could detect the transfer you made.

## Overall exam score

To calculate your overall exam score, we combine:

1. Your score from the coding project, with a weight of `0.9`.
2. And your score from the IBC operations, with a weight of `0.1`.

If your overall score is 80% or higher, then, congratulations you have passed.

## Email schedule

There are a number of emails that you have received or will receive or could receive with regards to the exam.

1. The _exam is open_ email, which:
   1. Invites you to our Gitlab server.
   2. Mentions the two pieces of information that are unique to you, for the IBC operations part.
2. An email that congratulates you on passing the IBC operations part of the exam if and when our server detects your correct transfer.
3. A deadline reminder email one week before the deadline.
4. The _you passed_ or _you failed_ email that you will receive after the deadline.

Good luck.