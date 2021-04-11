<script>
  import { ModuleBase } from '@marcellejs/core';

  export let title;
  // export let options;
  export let img;
  export let test;

</script>

<style>
  /* .my-color {
    color: seagreen;
  } */
</style>

<svelte:options accessors />

<ModuleBase {title}>
  <div>{$img}</div>
  <div>{$test}</div>

  {#if img}<img id='sketchImage' alt="sketchImage" src={$img} />{/if}

  <!-- <div>This is a <span class="my-color">custom</span> module with the following options:</div>
  <p>{JSON.stringify(options)}</p> -->
</ModuleBase>
