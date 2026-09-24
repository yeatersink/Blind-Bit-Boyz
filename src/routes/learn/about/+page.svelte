<script lang="ts">
	import LearnArticle from '$lib/components/story/LearnArticle.svelte';
</script>

<LearnArticle slug="about">
	<p>
		This site is educational. It is not a broker, not an exchange, and not financial advice. Nothing
		here is an offer to buy or sell any asset. The story you came from is the map. This page is the
		longer note on what Blind Bit Boys is for.
	</p>

	<h2>What this site is for</h2>
	<ul>
		<li>Draw awareness to crypto.</li>
		<li>
			Push accessibility and inclusivity, including people who use screen readers such as JAWS and NVDA.
			Pages use real headings and real links so a heading list and the tab key can move through
			them.
		</li>
		<li>
			Introduce helpful tools so blind and low-vision users can inspect tokens and hear market data.
		</li>
	</ul>

	<h2>Tools on this site</h2>
	<p>
		<a class="story-link" href="/search">Token search</a> finds a token or a pair. The next screen is
		the token overview: name, addresses, and the pairs that trade it.
	</p>
	<p>
		Technical analysis uses Highcharts on the token page and the pair page. Open a result from
		search, then choose the Technical Analysis tab. That suite can sonify a chart, add indicators,
		and export. There is no separate chart address. The homepage and these learn pages do not load
		the charts, and they do not play sound.
	</p>
	<p>
		Other tools we point people toward, including wallets and the exchanges this project tests, are
		listed on <a class="story-link" href="/tools">Accessible tools</a>.
	</p>

	<h2>Work in progress</h2>
	<p>
		An upcoming Token Price Watcher is planned to send Telegram messages with a token’s price and
		whether that price is up, down, or flat. It is not finished. There is no signup on this page, and
		no alerts are sent from it.
		<a class="story-link" href="/tools/price-watch">Blind Banker Price Watch Bot</a>
		is the work-in-progress page. When a real bot exists, that page is where its link will go.
	</p>

	<h2>Where to go next</h2>
	<ul>
		<li><a class="story-link" href="/search">Search tokens</a></li>
		<li><a class="story-link" href="/tools">Accessible tools</a></li>
		<li>
			<a class="story-link" href="/tools/price-watch">Blind Banker Price Watch Bot</a>
			— work in progress
		</li>
	</ul>
	<p>Education and inclusion come first. Do your own research. We do not manage funds.</p>
</LearnArticle>
