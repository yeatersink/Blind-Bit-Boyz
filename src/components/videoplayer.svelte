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

<div class="video-container">
  <video bind:this={videoElement}>
    <source src="test.MP4" type="video/mp4">
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
