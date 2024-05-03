#!/bin/bash
set -eux

source ./vars.sh

pkill -f exampled &> /dev/null || true
sleep 1
rm -rf ${NODES_ROOT_DIR}

# Beacon creates genesis
BEACON_DIR=${NODES_ROOT_DIR}/${BEACON_MONIKER}
BEACON_DIR_KEY=${BEACON_MONIKER}-key
BEACON_LISTEN_ADDR=tcp://${NODE_IP}:${RPC_LADDR_BASEPORT}

# Create Account Balances
for index in "${!MONIKERS[@]}"
do
    MONIKER=${MONIKERS[$index]}
    # validator key
    KEY=${MONIKER}-key

    # home directory of this validator
    NODE_DIR=${NODES_ROOT_DIR}/${MONIKER}

    # Build genesis file and node directory structure
    $BINARY init $MONIKER --chain-id $CHAIN_ID --home ${NODE_DIR} --default-denom uatom
    jq ".app_state.gov.voting_params.voting_period = \"10s\" | .app_state.staking.params.unbonding_time = \"86400s\"" \
    ${NODE_DIR}/config/genesis.json > \
    ${NODE_DIR}/edited_genesis.json && mv ${NODE_DIR}/edited_genesis.json ${NODE_DIR}/config/genesis.json


    sleep 1

    # Create account keypair
#    echo "Adding key to ${NODE_DIR}"
#    echo ${KEY}
    $BINARY keys add $KEY --home ${NODE_DIR} --keyring-backend test --output json > ${NODE_DIR}/${KEY}.json 2>&1
    sleep 1

     if [ $MONIKER == $BEACON_MONIKER ]; then
          for USER in "${USERS[@]}"
          do
              USERKEY=${USER}
              $BINARY keys add $USERKEY --home ${NODE_DIR} --keyring-backend test --output json > ${NODE_DIR}/${USERKEY}.json 2>&1
              sleep 1

              ACC_ADDR=$(jq -r '.address' ${NODE_DIR}/${USERKEY}.json)
              $BINARY genesis add-genesis-account $ACC_ADDR $USER_COINS --home ${NODE_DIR} --keyring-backend test
          done
      fi

    # copy genesis in, unless this validator is the beacon
    if [ $MONIKER != $BEACON_MONIKER ]; then
      cp ${BEACON_DIR}/config/genesis.json ${NODE_DIR}/config/genesis.json
    fi

    # Add stake to user
    ACCOUNT_ADDR=$(jq -r '.address' ${NODE_DIR}/${KEY}.json)
    $BINARY genesis add-genesis-account $ACCOUNT_ADDR $USER_COINS --home ${NODE_DIR} --keyring-backend test
    sleep 1

    # copy genesis out, unless this validator is the beacon
    if [ $MONIKER != $BEACON_MONIKER ]; then
        cp ${NODE_DIR}/config/genesis.json ${BEACON_DIR}/config/genesis.json
    fi

    PPROF_LADDR=${NODE_IP}:$(($PPROF_LADDR_BASEPORT + $index))
    P2P_LADDR_PORT=$(($P2P_LADDR_BASEPORT + $index))

    # adjust configs of this node
    sed -i -r 's/timeout_commit = "5s"/timeout_commit = "3s"/g' ${NODE_DIR}/config/config.toml
    sed -i -r 's/timeout_propose = "3s"/timeout_propose = "1s"/g' ${NODE_DIR}/config/config.toml

    # make address book non-strict. necessary for this setup
    sed -i -r 's/addr_book_strict = true/addr_book_strict = false/g' ${NODE_DIR}/config/config.toml

    # avoid port double binding
    sed -i -r  "s/pprof_laddr = \"localhost:6060\"/pprof_laddr = \"${PPROF_LADDR}\"/g" ${NODE_DIR}/config/config.toml

    # allow duplicate IP addresses (all nodes are on the same machine)
    sed -i -r  's/allow_duplicate_ip = false/allow_duplicate_ip = true/g' ${NODE_DIR}/config/config.toml
done

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

# Create Validators
for MONIKER in "${MONIKERS[@]}"
do
    # validator key
    KEY=${MONIKER}-key

    # home directory of this validator
    NODE_DIR=${NODES_ROOT_DIR}/${MONIKER}

    # copy genesis in, unless this validator is the beacon
    if [ $MONIKER != $BEACON_MONIKER ]; then
        cp ${BEACON_DIR}/config/genesis.json* ${NODE_DIR}/config/genesis.json
    fi

    # Stake 1/1000 user's coins
    $BINARY genesis gentx $KEY $STAKE --chain-id $CHAIN_ID --home ${NODE_DIR} --keyring-backend test --moniker $MONIKER
    sleep 1

    # Copy gentxs to the beacon for possible future collection.
    # Obviously we don't need to copy the first validator's gentx to itself
    if [ $MONIKER != $BEACON_MONIKER ]; then
        cp ${NODE_DIR}/config/gentx/* ${BEACON_DIR}/config/gentx/
    fi
done

# Collect genesis transactions with beacon
$BINARY genesis collect-gentxs --home ${BEACON_DIR} --gentx-dir ${BEACON_DIR}/config/gentx/

sleep 1

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

# Create node config

for index in "${!MONIKERS[@]}"
do
    MONIKER=${MONIKERS[$index]}

    PERSISTENT_PEERS=""

    for peer_index in "${!MONIKERS[@]}"
    do
        if [ $index == $peer_index ]; then
            continue
        fi
        PEER_MONIKER=${MONIKERS[$peer_index]}

        PEER_NODE_DIR=${NODES_ROOT_DIR}/${PEER_MONIKER}

        PEER_NODE_ID=$($BINARY comet show-node-id --home ${PEER_NODE_DIR})

        PEER_P2P_LADDR_PORT=$(($P2P_LADDR_BASEPORT + $peer_index))
        PERSISTENT_PEERS="$PERSISTENT_PEERS,$PEER_NODE_ID@${NODE_IP}:${PEER_P2P_LADDR_PORT}"
    done

    # remove trailing comma from persistent peers
    PERSISTENT_PEERS=${PERSISTENT_PEERS:1}

    # validator key
    KEY=${MONIKER}-key

    # home directory of this validator on provider
    NODE_DIR=${NODES_ROOT_DIR}/${MONIKER}

    # Set min gas prices in app config
    sed -i.bak'' 's/minimum-gas-prices = ""/minimum-gas-prices = "0.025uatom"/' ${NODE_DIR}/config/app.toml

    # Enable Vote Extensions for H-1
    jq '.consensus.params.abci.vote_extensions_enable_height = "2"' ${NODE_DIR}/config/genesis.json > output.json && mv output.json ${NODE_DIR}/config/genesis.json

    # copy genesis in, unless this validator is already the lead validator and thus it already has its genesis
    if [ $MONIKER != $BEACON_MONIKER ]; then
        cp ${BEACON_DIR}/config/genesis.json ${NODE_DIR}/config/genesis.json
    fi

    RPC_LADDR_PORT=$(($RPC_LADDR_BASEPORT + $index))
    P2P_LADDR_PORT=$(($P2P_LADDR_BASEPORT + $index))
    GRPC_LADDR_PORT=$(($GRPC_LADDR_BASEPORT + $index))
    NODE_ADDRESS_PORT=$(($NODE_ADDRESS_BASEPORT + $index))

    RUN_PROV=false
    if [ $MONIKER == $BEACON_MONIKER ]; then
      RUN_PROV=true
    fi

    # Start nodes
    $BINARY start \
        --home ${NODE_DIR} \
        --val-key ${KEY} \
        --run-provider ${RUN_PROV} \
        --p2p.persistent_peers ${PERSISTENT_PEERS} \
        --rpc.laddr tcp://${NODE_IP}:${RPC_LADDR_PORT} \
        --grpc.address ${NODE_IP}:${GRPC_LADDR_PORT} \
        --address tcp://${NODE_IP}:${NODE_ADDRESS_PORT} \
        --p2p.laddr tcp://${NODE_IP}:${P2P_LADDR_PORT} \
        --grpc-web.enable=false &> ${NODE_DIR}/logs &

    sleep 5
done
