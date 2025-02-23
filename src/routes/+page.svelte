<script lang="ts">
	import { onMount } from 'svelte';
  
	let videoElement: HTMLVideoElement;
	let isPlaying: boolean = false;
  
	function togglePlay(): void {
	  if (videoElement) {
		if (videoElement.paused) {
		  videoElement.play();
		} else {
		  videoElement.pause();
		}
	  }
	}
  
	function fastForward(): void {
	  if (videoElement) {
		videoElement.currentTime += 10; // Fast forward 10 seconds
	  }
	}
  
	function rewind(): void {
	  if (videoElement) {
		videoElement.currentTime -= 10; // Rewind 10 seconds
	  }
	}
  
	onMount(() => {
	  if (videoElement) {
		videoElement.addEventListener('play', () => {
		  isPlaying = true;
		});
  
		videoElement.addEventListener('pause', () => {
		  isPlaying = false;
		});
	  }
	});
  </script>
	  
<svelte:head>
	<title>The Blind Bit Boyz Crypto Initiative</title>
	<meta
		name="description"
		content="The Blind Bit Boyz Crypto Initiative is a website that is designed to bring accessibility to the ever expanding crypto market for users who are blind."
	/>
	<meta name="author" content="The Blind Bit Boyz" />
</svelte:head>

<section class="bg-gray-800 px-6 py-16 text-center">
	<h1 class="mb-4 text-3xl font-bold uppercase text-gold-500">
		Welcome to The Blind Bit Boyz Crypto initiative!
	</h1>

	<p class="text-xl">
		This is a website that is designed to bring education and accessibility to the ever expanding crypto market
		for users who are blind.
	</p>
</section>

<section class="bg-gray-900 px-6 py-16">
	
	
<div class="video-container">
	<video bind:this={videoElement}>
	  <source src="introduction.mp4" type="video/mp4">
	  <track kind="captions" src="captions.VTT" srclang="en" label="English" default>
	  Your browser does not support the video tag.
	</video>
  </div>
  
  <div class="controls">
	<button on:click={rewind}>⏪</button>
	<button on:click={togglePlay}>
	  {#if isPlaying}
		⏸️
	  {:else}
		▶️
	  {/if}
	</button>
	<button on:click={fastForward}>⏩</button>
  </div>
  <style>
	.video-container {
	  width: 576px; /* 6 inches * 96 pixels/inch */
	  height: 480px; /* 5 inches * 96 pixels/inch */
	  margin: 0 auto;
	  border: 32px solid silver; /* Approximately 1/3 inch silver border */
	  box-sizing: content-box;
	}
  
	video {
	  width: 100%;
	  height: 100%;
	  object-fit: cover;
	  cursor: pointer;
	  display: block;
	}
  
	.controls {
	  display: flex;
	  justify-content: center;
	  margin-top: 20px;
	}
  
	button {
	  padding: 10px 20px;
	  background-color: silver;
	  color: black;
	  border: none;
	  cursor: pointer;
	  margin: 0 5px;
	  font-size: 18px;
	  transition: background-color 0.3s, color 0.3s;
	}
  
	button:hover, button:active {
	  background-color: white;
	  color: gold;
	}
  </style>
  
  
</section>

<section class="bg-gray-900 px-6 py-16 pt-24">


	<h2 class="mb-4 text-2xl font-semibold text-gray-100">Our Partners</h2>
	<p class="text-gray-400">
		A Proud Product developed in partnership with :

		<a
			class="border-b border-gray-300 hover:border-gold-400 hover:text-gold-500 focus:border-gold-400 focus:text-gold-500"
			href="https://envisionly.tech">Envisionly</a
		>
		and
		<a
			class="border-b border-gray-300 hover:border-gold-400 hover:text-gold-500 focus:border-gold-400 focus:text-gold-500"
			href="https://x.com/yeatersink">Yeatersink</a
		>.
	</p>
</section>
