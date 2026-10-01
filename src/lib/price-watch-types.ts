/** Off is 0. saveMoversAlertEvery accepts only these seconds. */
export const MOVERS_SEND_OPTIONS = [
	{ value: '0', seconds: 0, label: 'Off' },
	{ value: '15', seconds: 15, label: 'Every 15 seconds' },
	{ value: '30', seconds: 30, label: 'Every 30 seconds' },
	{ value: '45', seconds: 45, label: 'Every 45 seconds' },
	{ value: '60', seconds: 60, label: 'Every 1 minute' },
	{ value: '120', seconds: 120, label: 'Every 2 minutes' },
	{ value: '180', seconds: 180, label: 'Every 3 minutes' },
	{ value: '300', seconds: 300, label: 'Every 5 minutes' },
	{ value: '600', seconds: 600, label: 'Every 10 minutes' },
	{ value: '900', seconds: 900, label: 'Every 15 minutes' }
] as const;

export type MoversSendSeconds = (typeof MOVERS_SEND_OPTIONS)[number]['seconds'];

export function isMoversSendSeconds(seconds: number): seconds is MoversSendSeconds {
	return MOVERS_SEND_OPTIONS.some((item) => item.seconds === seconds);
}
