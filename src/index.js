import '@marcellejs/core/dist/marcelle.css';
import * as marcelle from '@marcellejs/core';

const imgUpload = marcelle.imageUpload();
const sketchpad = marcelle.sketchpad();
const webcam = marcelle.webcam();

const select = marcelle.select({
  options: [
    'cat',
    'dog'
  ]
});

const slider = marcelle.slider();

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
  title: 'Adversarial attacks',
  author: 'Group E',
});

myDashboard
  .page('Adversarial attacks')
  .useLeft(imgUpload, origConfidence)
  .use([sketchpad, select], slider, attackConfidence);

myDashboard.start();
