
/** @type {import('./$types').PageServerLoad} */
export const load = async ({ params }) => {
	const coinAddress = params.address;
const response = await fetch(`https://api.scan.pulsechain.com/api?module=token&action=getToken&contractaddress=${coinAddress}`);
	if (!response.ok) {
		return { status: response.status };
	}
	const data = await response.json();
//Gets price
	const price = await fetch(`https://api.scan.pulsechain.com/api?module=stats&action=coinprice&contractaddress=${coinAddress}`);
console.log(await price.json());
	return {status: 200, data};
}
