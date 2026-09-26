<svelte:head>
	<title>Instructions — Blind Bit Boys</title>
	<meta
		name="description"
		content="How to use Search and the Technical Analysis tab. Educational. Not financial advice."
	/>
</svelte:head>

<div class="learn-shell">
	<h1>Instructions</h1>
	<p>
		This page is educational. It is not financial advice, and it is not an offer to buy or sell any
		asset.
	</p>

	<h2>How to use Search</h2>
	<p>
		With JAWS or NVDA, the results are headings. Data source and Chain are labeled combo boxes. Move to a
		combo box, open it, and choose a value. Then move to the search field.
	</p>
	<ol>
		<li>Open <a class="story-link" href="/search">Search</a>.</li>
		<li>Choose Data source: Gecko Terminal or Moralis.</li>
		<li>Choose Chain. PulseChain is one of the choices.</li>
		<li>Type a name, symbol, or contract address.</li>
		<li>Press Search.</li>
		<li>
			Results are headings under the heading Results. Activate a heading to open that token or pair.
		</li>
		<li>
			The default page is Overview: name, ticker, price, liquidity, volume, the contract address, and
			the pair address.
		</li>
		<li>Use the Pairs tab for pools.</li>
		<li>Use the Technical Analysis tab for charts.</li>
	</ol>
	<p>
		Verified, boost verified, sort, and limit appear only when the data source is Moralis. They are
		inside an Advanced disclosure.
	</p>

	<p>
		Overview and the Technical Analysis tab are unchanged: Overview is still the default token or pair
		page, and Technical Analysis is still a tab on that page.
	</p>

	<h2>How to use Technical Analysis (Highcharts)</h2>
	<p>
		The chart is a tab on a token page or a pair page. It is not a separate address. This page does
		not play sound.
	</p>
	<ol>
		<li>From a token or pair page, open the Technical Analysis tab.</li>
		<li>
			Data source is Gecko Terminal or Moralis, the same choice as Search. Currency is a separate
			labeled combo box.
		</li>
		<li>Chart type is Candlestick or Line. Those are radio buttons.</li>
		<li>
			Candle size is the width of each bar. Some sizes are disabled when that source cannot serve
			them. The option text says which source is missing.
		</li>
		<li>Show last is how much history to load.</li>
		<li>
			Date range uses the native Start date and time and End date and time fields. After you change
			them, press Generate Chart. Zooming inside the Highcharts chart is not the same as downloading
			a new range.
		</li>
		<li>
			Indicators are checkboxes. Overlays sit on the price. Oscillators sit below it. Each checked
			indicator can have its own instrument.
		</li>
		<li>
			Sonification starts with Price instrument. Order is Sequential or Simultaneous. Play all plays
			the chart. Play price only plays the price. Stop ends the sound.
		</li>
		<li>
			The chart’s hamburger control is named Chart menu. It includes print, image downloads, and
			Download CSV.
		</li>
	</ol>

	<h2>Troubleshooting</h2>
	<ul>
		<li>Empty chart: try Gecko Terminal, a candle size that source can serve, and a shorter Show last.</li>
		<li>Dates ignored: press Generate Chart after changing Start date and time or End date and time.</li>
		<li>No sound: press Play all, check the system volume, and try another Price instrument.</li>
	</ul>

	<p>
		<a class="story-link" href="/search">Search</a>
		and
		<a class="story-link" href="/official-links">Official Links</a>.
	</p>
</div>
