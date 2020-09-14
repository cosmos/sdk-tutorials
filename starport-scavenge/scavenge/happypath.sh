#!/bin/bash
scavengeCLI tx scavenge createScavenge 69foo "A stick" "What's brown and sticky?" --from me -y  | jq ".txhash" |  xargs $(sleep 5) scavengeCLI q tx
scavengeCLI tx scavenge commitSolution "A stick" --from you -y | jq ".txhash" |  xargs $(sleep 5) scavengeCLI q tx
scavengeCLI tx scavenge revealSolution "A stick" --from you -y | jq ".txhash" |  xargs $(sleep 5) scavengeCLI q tx
scavengeCLI query scavenge list | jq ".[]" | xargs -I {} scavengeCLI query scavenge get {}