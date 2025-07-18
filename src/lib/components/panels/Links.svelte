<script lang="ts">
	import '@awesome.me/webawesome/dist/components/card/card.js';
	import '@awesome.me/webawesome/dist/components/button/button.js';
	import '@awesome.me/webawesome/dist/components/icon/icon.js';

	type Links = {
		email: string | null;
		bitbucket: string | null;
		discord: string | null;
		facebook: string | null;
		github: string | null;
		instagram: string | null;
		linkedin: string | null;
		medium: string | null;
		reddit: string | null;
		telegram: string | null;
		tiktok: string | null;
		twitter: string | null;
		website: string | null;
		youtube: string | null;
		slack: string | null;
		twitterPost: string | null;
	};

	let { links }: { links: Links } = $props();
</script>

{#if links}
	<wa-card>
		<div slot="header">
			<h2>Links</h2>
		</div>
		{#if links.email}
			<wa-button appearance="plain" href="mailto:{links.email}">
				<wa-icon family="solid" name="envelope" label="Email"></wa-icon>
			</wa-button>{/if}
		{#if links.bitbucket}<wa-button appearance="plain" href={links.bitbucket}>
				<wa-icon family="brands" name="bitbucket" label="Bitbucket"></wa-icon>
			</wa-button>{/if}
		{#if links.discord}
			<wa-button appearance="plain" href={links.discord}>
				<wa-icon family="brands" name="discord" label="Discord"></wa-icon>
			</wa-button>{/if}
		{#if links.facebook}
			<wa-button appearance="plain" href={links.facebook}>
				<wa-icon family="brands" name="facebook" label="Facebook"></wa-icon>
			</wa-button>{/if}
		{#if links.github}
			<wa-button appearance="plain" href={links.github}>
				<wa-icon family="brands" name="github" label="GitHub"></wa-icon>
			</wa-button>{/if}
		{#if links.instagram}<wa-button appearance="plain" href={links.instagram}>
				<wa-icon family="brands" name="instagram" label="Instagram"></wa-icon>
			</wa-button>{/if}
		{#if links.linkedin}
			<wa-button appearance="plain" href={links.linkedin}>
				<wa-icon family="brands" name="linkedin" label="LinkedIn"></wa-icon>
			</wa-button>{/if}
		{#if links.medium}
			<wa-button appearance="plain" href={links.medium}>
				<wa-icon family="brands" name="medium" label="Medium"></wa-icon>
			</wa-button>{/if}
		{#if links.reddit}
			<wa-button appearance="plain" href={links.reddit}>
				<wa-icon family="brands" name="reddit" label="Reddit"></wa-icon>
			</wa-button>{/if}
		{#if links.telegram}
			<wa-button appearance="plain" href={links.telegram}>
				<wa-icon family="brands" name="telegram" label="Telegram"></wa-icon>
			</wa-button>{/if}
		{#if links.tiktok}
			<wa-button appearance="plain" href={links.tiktok}>
				<wa-icon family="brands" name="tiktok" label="TikTok"></wa-icon>
			</wa-button>{/if}
		{#if links.twitter}
			<wa-button appearance="plain" href={links.twitter}>
				<wa-icon family="brands" name="x-twitter" label="X"></wa-icon>
			</wa-button>{/if}
		{#if links.website}
			<wa-button appearance="plain" href={links.website}>
				<wa-icon family="solid" name="globe" label="Website"></wa-icon>
			</wa-button>{/if}
		{#if links.youtube}
			<wa-button appearance="plain" href={links.youtube}>
				<wa-icon family="brands" name="youtube" label="YouTube"></wa-icon>
			</wa-button>{/if}
		{#if links.slack}
			<wa-button appearance="plain" href={links.slack}>
				<wa-icon family="brands" name="slack" label="Slack"></wa-icon>
			</wa-button>{/if}
		{#if links.twitterPost}<wa-button appearance="plain" href={links.twitterPost}>
				<wa-icon family="brands" name="x-twitter" label="X Post"></wa-icon>
			</wa-button>{/if}
	</wa-card>
{/if}
