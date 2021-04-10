<script>
  import { ModuleBase } from '@marcellejs/core';

  export let title;
  export let options;

  export let mySlider;

</script>

<style>
  .my-color {
    color: seagreen;
  }
</style>

<svelte:options accessors />

<ModuleBase {title}>
  <div>This is a <span class="my-color">custom</span> module with the following options:</div>
  <p>{JSON.stringify(options)}</p>

  <label for="class-select">Turn this image into a:</label>
  <select name="class" id="class-select">
    <option value="dog">Dog</option>
    <option value="cat">Cat</option>
    <option value="goldfish">Goldfish</option>
  </select>

  <div>
    <input type="range" id="noise" name="noise" min="0" max="100">
    <label for="noise">Noise</label>
  </div>

  <button>View noise</button>

</ModuleBase>
