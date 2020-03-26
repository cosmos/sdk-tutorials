#!/bin/bash
scavengeCLI tx scavenge createScavenge 69foo "A stick" "What's brown and sticky?" --from me -y
scavengeCLI tx scavenge commitSolution "A stick" --from you -y
scavengeCLI tx scavenge revealSolution "A stick" --from you -y
scavengeCLI query scavenge list | jq ".[]" | xargs -I {} scavengeCLI query scavenge get {}