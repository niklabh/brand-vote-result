var { ApiPromise, WsProvider } = require("@polkadot/api");
var { encodeAddress } = require("@polkadot/util-crypto");

// Main function which needs to run at start
async function main() {
	// Substrate node we are connected to and listening to remarks
	const provider = new WsProvider("wss://rpc.polkadot.io");
	//const provider = new WsProvider("wss://kusama-rpc.polkadot.io/");

	const api = await ApiPromise.create({ provider });

	// Get general information about the node we are connected to
	const [chain, nodeName, nodeVersion] = await Promise.all([
		api.rpc.system.chain(),
		api.rpc.system.name(),
		api.rpc.system.version()
	]);
	console.error(
		`You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`
	);

	let limit = 1000;

	let last_key = "";

	while (true) {
		let query = await api.query.system.account.entriesPaged({ args: [], pageSize: limit, startKey: last_key });

		if (query.length == 0) {
			break;
		}

		for (let user of query) {

			let account_id = encodeAddress(user[0].slice(-32));
			let free_balance = user[1].data.free.toString();
			let reserved_balance = user[1].data.reserved.toString();

			console.log(account_id, free_balance, reserved_balance);

			last_key = user[0];
		}
	}

	console.error("Snapshot finished");
}

main().catch(console.error);
