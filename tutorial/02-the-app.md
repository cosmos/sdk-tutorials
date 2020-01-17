# The App
 The app we're buildig today can be used in many different ways, but I'll be talking about it as scavenger hunt game. Scavenger hunts are all about someone setting up tasks or questions that challenge a participant to find solutions that come with some sort of a prize. The basic mechanics of this app are as follows:
 * Anyone can post a question with an encrypted answer.
 * This question comes paired with a bounty of coins.
 * Anyone else can post an answer to this question, if they get it right they receive the bounty of coins.

 Something to note here is that when dealing with a public network with latency, it is possible that a sort of "man-in-the-middle" attack could take place. That would mean that if you post the answer, someone else might be able to see you posting the answer and post it themselves at the same time or even right before you. This is generally called "Front-Running" and appears as a problem especially in trading systems.

 To prevent Front-Running, we will implent a **commit-reveal** scheme. A commit-reveal scheme converts a single exploitable interaction and turns it into two safe interactions.

 The first interaction is the commit. This is where you "commit" to posting an answer in a follow-up interaction. This commit consists of a cryptographic hash of your name combined with the answer that you think is correct. Now the app saves that value and essentially knows that sowho they aremeone knows the answer but that they haven't revealed their identity yet.

 The next interaction is the reveal. This is where you post the answer in plaintext with your name in plaintext. The application will take your answer and your name and cryptographically hash them. If the result matches what the app previously saved during the commit stage, then it will be proof that it is you who has actually posted the correct answer, and not someone who just saw you post it and copied you. If someone else saw the answer at this stage and posted it with their own name, the hash would be different and the app would have no record of it, so the interaction would fail.

 A system like this could be used in tandem with any kind of gaming platform in a **trustless** way. Imagine you were playing the legend of Zelda and the game was compiled with all the answers to different scavenger hunts already included. When you beat a level the game could reveal the secret answer. Then either explicitly or behind the scenes, this answer could be combined with your name, hashed, submitted and subsequently revealed. Your name would be rewarded and you would have more points in the game.

 Another way of achieving this would be to have an Access Control List where there was an admin account that the video game company controlled. This admin account could confirm that you beat the level and then give you points. The problem with this is that it creates a single point of failure and a single target for trying to attack the system. If there is one key that rules the castle then the whole system is broken if that key is found. It also creates a problem with coordination if that Admin account has to be online all the time in order for players to get their points. If you use a commit reveal system then you have a more trustless architecture where you don't need permission to play. This design decisions has benefits and drawbacks, but paired with a careful implementation it can allow your game to scale without a single bottle neck or point of failure.

 Now that we know what we're building we can [get started]("./03-get-started").