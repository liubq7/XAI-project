import { Module } from '@marcellejs/core';
import Component from './origin.svelte';

export class Origin extends Module {
  constructor(options) {
    super();
    this.title = 'Original Image';
    this.options = options;
  }

  update(image) {
    document.getElementById("uploadImage").src = image;
  }

  mount(target) {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new Component({
      target: t,
      props: {
        title: this.title,
        options: this.options,
      },
    });

    this.options.mount(t);

  }
}
