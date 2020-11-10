import axios from "axios";
import {
    createWalletFromMnemonic,
    signTx,
    createBroadcastTx,
} from "@tendermint/sig";

const API = "http://localhost:8010/proxy";

const mnemonic = "solid play vibrant paper clinic talent people employ august camp april reduce";

const wallet = createWalletFromMnemonic(mnemonic);

const init = () => {
    fetchPosts();
    document.getElementById("button").addEventListener("click", createPost);
};

const fetchPosts = () => {
    axios.get(`${API}/blog/posts`).then(({ data }) => {
        const posts = JSON.stringify(data.result);
        document.getElementById("posts").innerText = posts;
    });
};

const createPost = () => {
    // Getting a post title value from text input
    const title = document.getElementById("input").value;
    // Fetching account parameters: sequence and account_number
    axios.get(`${API}/auth/accounts/${wallet.address}`).then(({ data }) => {
        const account = data.result.value;
        const chain_id = "blog";
        const meta = {
            // Making sure both sequence and account_number are strings
            // Sequence number changes every time we submit a new transaction
            sequence: `${account.sequence}`,
            // Account number stays the same
            account_number: `${account.account_number}`,
            chain_id,
        };
        const req = {
            base_req: {
                chain_id,
                from: wallet.address,
            },
            creator: wallet.address,
            title,
        };
        // Fetching am unsigned transaction
        axios.post(`${API}/blog/post`, req).then(({ data }) => {
            const tx = data.value;
            // Signing the transaction with the private key and meta info
            const stdTx = signTx(tx, meta, wallet);
            // Preparing transaction for broadcasting
            // "block" will make sure we get the response after
            // the transaction is included in the block
            const txBroadcast = createBroadcastTx(stdTx, "block");
            const params = {
                headers: {
                    "Content-Type": "application/json",
                },
            };
            // Sending our post to be processed by the server
            axios.post(`${API}/txs`, txBroadcast, params).then(() => {
                // Fetch a new list of posts after we've successfully
                // created a new post
                fetchPosts();
            });
        });
    });
};

init()