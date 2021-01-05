scavengecli tx scavenge create-scavenge "What's brown and sticky?" "A stick" 69token --from user1 -y  | jq ".txhash" |  xargs $(sleep 5) scavengecli q tx
scavengecli tx scavenge commit-solution "A stick" --from user2 -y | jq ".txhash" |  xargs $(sleep 5) scavengecli q tx
scavengecli tx scavenge reveal-solution "A stick" --from user2 -y | jq ".txhash" |  xargs $(sleep 5) scavengecli q tx
scavengecli query scavenge list-scavenge | jq ".[].solutionHash" | xargs -I {} scavengecli query scavenge get-scavenge {}