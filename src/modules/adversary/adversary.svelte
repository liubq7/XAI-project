<script>
  import { ModuleBase } from '@marcellejs/core';

  export let title;
  // export let options;

</script>

<style>

  #sketchImage {
    border: 1px solid rgb(185, 183, 183);
    width: 250px;
    height: 250px;
  }

</style>

<svelte:options accessors />

<ModuleBase {title}>

  <!-- svelte-ignore a11y-missing-attribute -->
  <img id='sketchImage' />

  <!-- <div>This is a <span class="my-color">custom</span> module with the following options:</div>
  <p>{JSON.stringify(options)}</p> -->
</ModuleBase>
