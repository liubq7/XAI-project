import '@marcellejs/core/dist/marcelle.css';
import * as marcelle from '@marcellejs/core';
import { adversary } from './modules';

const fileUpload = marcelle.fileUpload();
fileUpload.title = 'Upload model files (.json and .bin)';

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

const adversarialAttack = adversary({ someParam: 'Yes', other: 33 });

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
  .page('Adversarial attacks')
  .useLeft(fileUpload)
  .use([imgUpload, adversarialAttack], [select, slider], [origConfidence, attackConfidence]);

myDashboard.start();
