/** @type {import('./$types').PageServerLoad} */
export const load = async ({ params, url }) => {
	const coinAddress = params.address;
	//gets chainId and pairAddress from url params
	const chainId = url.searchParams.get('chainId');
	const pairAddress = url.searchParams.get('pairAddress');

	const response = await fetch(
		`https://api.dexscreener.com/latest/dex/pairs/${chainId}/${pairAddress}`
	);
	if (!response.ok) {
		return { status: response.status };
	}
	const data = await response.json();
	const pair = data.pairs[0];
	return { status: 200, pair };
};
