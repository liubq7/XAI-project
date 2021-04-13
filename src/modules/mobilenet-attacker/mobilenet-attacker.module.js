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

  async attack(img, label, resetNoise = false) {
    const labelIdx = this.classifier.labels.indexOf(label);
    const imgTensor = tf.browser.fromPixels(img);
    if (resetNoise) {
      this.noise = tf.zerosLike(imgTensor);
    }

    const getLabelProb = (x) => {
      const features = this.featureExtractor.mobilenet.infer(x, true);
      const preds = this.classifier.model.predict(features).gather(0);
      return preds.gather(labelIdx)
    }

    const addNoise = tf.tidy(() => {
      const noisyImg = tf.add(imgTensor, this.noise);
      const gradF = tf.grad(getLabelProb);
      const grad = gradF(noisyImg)
      return tf.div(grad, grad.abs().max());
    });
    this.noise = tf.add(this.noise, addNoise);

    const advImg = tf.clipByValue(tf.add(this.noise, imgTensor), 0, 255).cast('int32');
    const advImgArray = await tf.browser.toPixels(advImg);
    return new ImageData(advImgArray, img.width, img.height);
  }
}
