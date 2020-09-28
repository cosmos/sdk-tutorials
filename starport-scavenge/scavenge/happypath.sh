scavengeCLI tx scavenge create-scavenge "What's brown and sticky?" "A stick" 69token --from user1 -y  | jq ".txhash" |  xargs $(sleep 5) scavengeCLI q tx
scavengeCLI tx scavenge commit-solution "A stick" --from user2 -y | jq ".txhash" |  xargs $(sleep 5) scavengeCLI q tx
scavengeCLI tx scavenge reveal-solution "A stick" --from user2 -y | jq ".txhash" |  xargs $(sleep 5) scavengeCLI q tx
scavengeCLI query scavenge list-scavenge | jq ".[].solutionHash" | xargs -I {} scavengeCLI query scavenge get-scavenge {}