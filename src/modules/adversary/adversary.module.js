import { Module } from '@marcellejs/core';
import * as marcelle from '@marcellejs/core';
import Component from './adversary.svelte';

export class Adversary extends Module {
  constructor(options) {
    super();
    this.title = 'Adversarial Image';
    this.options = options;
    this.mySlider = marcelle.slider();
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
        mySlider: this.mySlider,
      },
    });
    console.log(this.mySlider);
    this.mySlider.mount(t);
  }
}
