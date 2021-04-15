import * as tf from '@tensorflow/tfjs-core';
import { Module } from '@marcellejs/core';

export class MobilenetAttacker extends Module {
  constructor(options) {
    super();
    this.title = 'mobilenet-attacker [custom module 🤖]';
    this.options = options;
    this.featureExtractor = options.featureExtractor;
    this.classifier = options.classifier;
  }

  async predict(x) {
    const features = await this.featureExtractor.process(x);
    return this.classifier.predict(features);
  }

  async tensorToImg(x) {
    const clipped = tf.clipByValue(x, 0, 255).cast('int32');
    const xArray = await tf.browser.toPixels(clipped);
    return new ImageData(xArray, x.shape[0], x.shape[1]);
  }

  async visNoise() {
    const enhanced = tf.mul(this.noises[this.noises.length - 1], tf.scalar(10.0));
    const centered = tf.add(enhanced, tf.scalar(127.0));
    return this.tensorToImg(centered);
  }

  async attack(img, label, resetNoise = false) {
    const labelIdx = this.classifier.labels.indexOf(label);
    const imgTensor = tf.browser.fromPixels(img);
    if (resetNoise) {
      this.noises = [tf.zerosLike(imgTensor)];
    }

    const getLabelProb = (x) => {
      const features = this.featureExtractor.mobilenet.infer(x, true);
      const preds = this.classifier.model.predict(features).gather(0);
      return preds.gather(labelIdx)
    }

    const noise = this.noises[this.noises.length - 1];
    const addNoise = tf.tidy(() => {
      const noisyImg = tf.add(imgTensor, noise);
      const gradF = tf.grad(getLabelProb);
      const grad = gradF(noisyImg)
      return tf.div(grad, grad.abs().max());
    });
    this.noises.push(tf.add(noise, addNoise));
    return this.tensorToImg(tf.add(imgTensor, this.noises[this.noises.length - 1]));
  }

  async undo(img) {
    const imgTensor = tf.browser.fromPixels(img);
    if (this.noises.length > 1) {
      this.noises.pop();
    }
    return this.tensorToImg(tf.add(imgTensor, this.noises[this.noises.length - 1]));
  }
}
