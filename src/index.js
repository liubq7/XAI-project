import '@marcellejs/core/dist/marcelle.css';
import * as marcelle from '@marcellejs/core';
import { adversary, origin } from './modules';

const fileUpload = marcelle.fileUpload();
fileUpload.title = 'Upload model files (.json and .bin)';

const imgUpload = marcelle.imageUpload();
const sketchpad = marcelle.sketchpad();
const webcam = marcelle.webcam();

const adversarialAttack = adversary();
sketchpad.$thumbnails.subscribe((thumbnail) => {
  console.log(thumbnail);
  adversarialAttack.update(thumbnail);
});

const originImage = origin(imgUpload);
imgUpload.$thumbnails.subscribe((thumbnail) => {
  console.log(thumbnail);
  originImage.update(thumbnail);
});

// Requires a stream of predictions
// conf = marcelle.classificationPlot();

const origConfidence = marcelle.chart({
  preset: 'bar',
});

const attackConfidence = marcelle.chart({
  preset: 'bar',
});

// Dashboard Interface
const myDashboard = marcelle.dashboard({
  title: 'XAI',
  author: 'Group E',
});

myDashboard
  .page('Adversarial Attacks')
  .useLeft(fileUpload, sketchpad)
  .use([originImage, adversarialAttack], [origConfidence, attackConfidence]);

myDashboard.start();
