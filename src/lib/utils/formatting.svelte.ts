/**
 * Dynamically formats a cryptocurrency price for display.
 * Adjusts decimal places based on magnitude and includes currency symbol.
 *
 * @param price The price as a number.
 * @param currency The currency code (e.g., 'USD', 'EUR'). Defaults to 'USD'.
 * @param locale The BCP 47 language tag (e.g., 'en-US', 'de-DE'). Defaults to 'en-US'.
 * @returns Formatted price string (e.g., "-$0.00000123", "-$1,234.56").
 */
export function formatCryptoPrice(
	price: number | null | undefined,
	currency: string = 'USD',
	locale: string = 'en-US'
): string {
	if (price === null || price === undefined || isNaN(price)) {
		return 'N/A';
	}

	let minimumFractionDigits: number;
	let maximumFractionDigits: number;

	if (price === 0) {
		minimumFractionDigits = 2;
		maximumFractionDigits = 2;
	} else if (Math.abs(price) < 0.00000001) {
		minimumFractionDigits = 8;
		maximumFractionDigits = 12;
	} else if (Math.abs(price) < 0.00001) {
		minimumFractionDigits = 6;
		maximumFractionDigits = 8;
	} else if (Math.abs(price) < 0.01) {
		minimumFractionDigits = 4;
		maximumFractionDigits = 6;
	} else if (Math.abs(price) < 1) {
		minimumFractionDigits = 2;
		maximumFractionDigits = 4;
	} else {
		minimumFractionDigits = 2;
		maximumFractionDigits = 2;
	}

	const formatted = new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: currency,
		minimumFractionDigits: minimumFractionDigits,
		maximumFractionDigits: maximumFractionDigits
	}).format(price);

	// --- FIX FOR NEGATIVE SIGN PLACEMENT ---
	if (price < 0) {
		// Check if the minus sign is NOT at the beginning (e.g., "$-123.45" or "€-123,45")
		if (formatted.charAt(0) !== '-' && formatted.includes('-')) {
			// Find the minus sign, remove it, and prepend it to the string.
			// This is safer than just charAt(1) because currency symbols can be multi-char
			// and locales can vary.
			return '-' + formatted.replace('-', '');
		}
	}
	return formatted;
}

/**
 * Formats general numeric values (like market cap, volume) with commas and fixed decimals,
 * and optional abbreviations for large numbers.
 *
 * @param value The numeric value.
 * @param decimals The number of decimal places. Defaults to 2.
 * @param abbreviate Whether to abbreviate large numbers (e.g., K, M, B). Defaults to false.
 * @param currencySymbol The currency symbol (e.g., '$'). Used if abbreviate is true OR if value is negative and not abbreviated.
 * @param locale The BCP 47 language tag. Defaults to 'en-US'.
 * @returns Formatted string.
 */
export function formatLargeNumber(
	value: number | null | undefined,
	decimals: number = 2,
	abbreviate: boolean = false,
	currencySymbol: string = '', // Can be '$', '€', etc. - used for manual prepending
	locale: string = 'en-US'
): string {
	if (value === null || value === undefined || isNaN(value)) {
		return 'N/A';
	}

	const isNegative = value < 0;
	const absValue = Math.abs(value);
	let formattedNumber: string;

	if (abbreviate) {
		let abbreviation = '';
		let divisor = 1;

		if (absValue >= 1_000_000_000) {
			abbreviation = 'B';
			divisor = 1_000_000_000;
		} else if (absValue >= 1_000_000) {
			abbreviation = 'M';
			divisor = 1_000_000;
		} else if (absValue >= 1_000) {
			abbreviation = 'K';
			divisor = 1_000;
		}

		formattedNumber = new Intl.NumberFormat(locale, {
			minimumFractionDigits: 0,
			maximumFractionDigits: 2
		}).format(absValue / divisor); // Format absolute value first

		// Prepend negative sign if needed, then currency, then formatted number, then abbreviation
		return (isNegative ? '-' : '') + currencySymbol + formattedNumber + abbreviation;
	} else {
		// Standard number formatting with commas
		formattedNumber = new Intl.NumberFormat(locale, {
			minimumFractionDigits: decimals,
			maximumFractionDigits: decimals
		}).format(absValue); // Format absolute value first

		// Prepend negative sign, then currency symbol (if provided), then formatted number
		return (isNegative ? '-' : '') + currencySymbol + formattedNumber;
	}
}

/**
 * Formats a percentage value.
 *
 * @param value The percentage value (e.g., 0.15 for 15%).
 * @param decimals The number of decimal places. Defaults to 2.
 * @param locale The BCP 47 language tag. Defaults to 'en-US'.
 * @returns Formatted percentage string (e.g., "+15.00%", "-2.55%").
 */
export function formatPercentage(
	value: number | null | undefined,
	decimals: number = 2,
	locale: string = 'en-US'
): string {
	if (value === null || value === undefined || isNaN(value)) {
		return 'N/A';
	}

	// Use Intl.NumberFormat for percentage style
	return new Intl.NumberFormat(locale, {
		style: 'percent',
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
		signDisplay: 'exceptZero' // Always show sign for non-zero numbers
	}).format(value / 100); // Divide by 100 because Intl.NumberFormat expects fractions for 'percent' style
}
