const fs = require('fs');

const file = fs.readFileSync(process.argv[2]);
const map = {};

file.toString().split('\n').forEach((line, index) => {
	if (index === 0) {
		return;
	}

	if (!line.split(',') || line.split(',').length < 6) {
		return;
	}

	const block = line.split(',')[1].trim();
	const address = line.split(',')[2].trim();
	const balance = line.split(',')[3].trim();
	const IA = line.split(',')[4].trim();
	const LA = line.split(',')[5].trim();
	const IB = line.split(',')[6].trim();
	const LB = line.split(',')[7].trim();

	if (!parseInt(block)) {
		return;
	}

	if (!parseInt(balance)) {
		return;
	}

	if (!map[address]) {
		map[address] = {
			balance,
			block,
			IA,
			LA,
			IB,
			LB
		};
	}

	if (parseInt(block) > parseInt(map[address].block)) {
		map[address] = {
			balance,
			block,
			IA,
			LA,
			IB,
			LB
		};
	}
});

console.log('Address,Balance,Identity A,Logo A,Identity B,Logo B');

let T = 0;

let LA = 0;
let LB = 0;
let IA = 0;
let IB = 0;

for (let address in map) {
	console.log(`${address},${map[address].balance},${map[address].IA},${map[address].LA},${map[address].IB},${map[address].LB}`);
	const vote = map[address];

	const pow = Math.sqrt(parseInt(vote.balance)/10000000000);

	LA += pow * parseInt(vote.LA)/100;
	LB += pow * parseInt(vote.LB)/100;

	IA += pow * parseInt(vote.IA)/100;
	IB += pow * parseInt(vote.IB)/100;

	T += pow;
}


console.log('LA', LA*100/T);
console.log('LB', LB*100/T);
console.log('IA', IA*100/T);
console.log('IB', IB*100/T);
