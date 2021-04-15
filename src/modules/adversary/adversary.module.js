import { Module, Stream } from '@marcellejs/core';
import * as marcelle from '@marcellejs/core';
import Component from './adversary.svelte';


const adverClass = marcelle.select({
  options: []
});
adverClass.title = "Turn this image into a:";

const moreNoise = marcelle.button({ text: "More noise" });
moreNoise.title = "Confidence control";

const lessNoise = marcelle.button({ text: "Less noise" });
lessNoise.title = "Confidence control";

const viewNoise = marcelle.toggle({ text: "View image / noise" });

export class Adversary extends Module {
  constructor(options) {
    super();
    this.title = 'Adversarial Image';
    // this.options = options;
    // this.$img = options;

    this.adverClass = adverClass;
    this.moreNoise = moreNoise;
    this.lessNoise = lessNoise;
    this.viewNoise = viewNoise;
  }

  update(image) {
    // this.$img = image;
    document.getElementById("sketchImage").src = image;
    // console.log(this.$img);
  }

  mount(target) {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new Component({
      target: t,
      props: {
        title: this.title,
        // img: this.$img,
        // options: this.options,
        // adverClass: this.adverClass,
        // noiseSlider: this.noiseSlider,
        // viewNoise: this.viewNoise,
      },
    });

    this.adverClass.mount(t);
    this.moreNoise.mount(t);
    this.lessNoise.mount(t);
    this.viewNoise.mount(t);
  }
}
