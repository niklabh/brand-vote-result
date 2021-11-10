const { ApiPromise, WsProvider } = require("@polkadot/api");
const { encodeAddress } = require("@polkadot/util-crypto");
const moment = require('moment');

// Polkadot's_Future_Brand_IA50_IB50_LA75_LB25

const START = 7442640;
const END = 7577250;

const balance = require('./balance.json');

// Main function which needs to run at start
async function main() {
    console.error('starting');
    // Substrate node we are connected to and listening to remarks
    // const provider = new WsProvider("wss://westend-rpc.polkadot.io");
    const provider = new WsProvider("wss://rpc.polkadot.io");

    const api = await ApiPromise.create({ provider });

    api.on('connected', () => {
        console.error('connected');
    });

    api.on('error', e => {
        console.error('error');
        console.error(e);
        process.exit(1);
    });

    api.on('disconnected', e => {
        console.error('disconnected');
        console.error(e);
        process.exit(1);
    });

    // Get general information about the node we are connected to
    const [chain, nodeName, nodeVersion] = await Promise.all([
        api.rpc.system.chain(),
        api.rpc.system.name(),
        api.rpc.system.version()
    ]);
    console.error(
        `You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`
    );

    const blockNumbers = [];

    for (let i = START; i < END; i++) {
        blockNumbers.push(i);
    }

    console.log(blockNumbers);

    blockNumbers.forEach(async (i) => {
        console.log(i);
        const bHash = await api.rpc.chain.getBlockHash(i);
        await api.rpc.chain.getBlock(bHash, async block => {
            // Try to never crash
            try {
                let blockNumber = block.block.header.number.toNumber();
                console.error("Block is: ", blockNumber);
                // Extrinsics in the block
                let extrinsics = await block.block.extrinsics;

                // Check each extrinsic in the block
                for (let extrinsic of extrinsics) {
                    // This specific call index [0,1] represents `system.remarkWithEvent`
                    if (extrinsic.callIndex[0] == 0 && extrinsic.callIndex[1] == 9) {
                        // Get sender address
                        const sender = encodeAddress(extrinsic.signer.toString());
                        const remark = extrinsic.args[0].toHuman();

                        if (remark.startsWith("Polkadot's_Future_Brand_")) {
                            console.error(sender, remark);

                            const time = moment().utcOffset(200).format('YYYY-MM-DD HH:mm:ss');
                            const IA = remark.split("IA")[1].split("_")[0];
                            const IB = remark.split("IB")[1].split("_")[0];
                            const LA = remark.split("LA")[1].split("_")[0];
                            const LB = remark.split("LB")[1].split("_")[0];

                            console.log([
                                time,
                                blockNumber.toString(),
                                sender,
                                balance[sender] || "",
                                IA,
                                LA,
                                IB,
                                LB
                            ].join(','));
                        }
                    }
                }
            } catch (e) {
                console.error(e);
                process.exit(1);
            }
        });
    });

    console.error('end');
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
