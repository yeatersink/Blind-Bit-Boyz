
/** @type {import('./$types').PageServerLoad} */
export const load = async ({ params }) => {
	const coinAddress = params.address;
//gets chainid and pairid from url
const chainId = params.chainid;
const pairAddress = params.pairid;

const response = await fetch(`https://api.dexscreener.com/latest/dex/pairs/${chainId}/${pairAddress}`);
	if (!response.ok) {
		return { status: response.status };
	}
	const data = await response.json();
	const pair = data.pairs[0];
	return {status: 200, pair};
}
