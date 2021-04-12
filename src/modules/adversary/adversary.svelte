<script>
  import { ModuleBase } from '@marcellejs/core';

  export let title;
  // export let options;

</script>

<style>

  #sketchImage {
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 5px;
    width: 250px;
    height: 250px;
  }

</style>

<svelte:options accessors />

<ModuleBase {title}>

  <img id='sketchImage' />

  <!-- <div>This is a <span class="my-color">custom</span> module with the following options:</div>
  <p>{JSON.stringify(options)}</p> -->
</ModuleBase>
