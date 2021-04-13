import '@marcellejs/core/dist/marcelle.css';
import * as tf from '@tensorflow/tfjs-core';
import * as marcelle from '@marcellejs/core';
import { adversary, origin, mobilenetAttacker, mobilenet } from './modules';

const imgToUri = (img) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL();
}

// Dashboard Interface
const myDashboard = marcelle.dashboard({
  title: 'XAI',
  author: 'Group E',
});

const input = marcelle.webcam();
const label = marcelle.textfield();
label.name = 'Instance label';

const capture = marcelle.button({ text: 'Click to record instances' });
capture.name = 'Capture instances to the training set';

const featureExtractor = mobilenet();
const mlp = marcelle.mlp({ layers: [32, 32], epochs: 5 });

const classifier = mobilenetAttacker({
  featureExtractor: featureExtractor,
  classifier: mlp,
});

// Create and store instances
const instances = capture.$click
  .sample(input.$images)
  .map(async (img) => ({
    type: "image",
    data: img,
    label: label.$text.value,
    thumbnail: input.$thumbnails.value,
    features: await featureExtractor.process(img)
  }))
  .awaitPromises();

const store = marcelle.dataStore({ location: 'localStorage' });
const trainingSet = marcelle.dataset({ name: 'TrainingSet', dataStore: store });
trainingSet.capture(instances);

const trainingSetBrowser = marcelle.datasetBrowser(trainingSet);

myDashboard
  .page('Data Management')
  .useLeft(input)
  .use([label, capture], trainingSetBrowser);

const params = marcelle.parameters(mlp);
const prog = marcelle.trainingProgress(mlp);
const plotTraining = marcelle.trainingPlot(mlp);

const trainButton = marcelle.button({ text: 'Train' });
trainButton.$click.subscribe(() => mlp.train(trainingSet));

myDashboard
  .page('Training')
  .useLeft(trainingSetBrowser)
  .use(params, trainButton, prog, plotTraining);

const tog = marcelle.toggle({ text: "toggle prediction" });
tog.$checked.subscribe(checked => {
  if (checked && !mlp.ready) {
    marcelle.throwError(new Error("No classifier has been trained"));
    setTimeout(() => {
      tog.$checked.set(false);
    }, 500);
  }
});

const predictionStream = input.$images
  .filter(() => tog.$checked.value && mlp.ready)
  .map(async (img) => (classifier.predict(img)))
  .awaitPromises();

const plotResults = marcelle.classificationPlot(predictionStream);

myDashboard
  .page("Real-time Prediction")
  .useLeft(input)
  .use(tog, plotResults);

const imgUpload = marcelle.imageUpload();
const sketchpad = marcelle.sketchpad();

const adversarialAttack = adversary();
sketchpad.$thumbnails.subscribe((thumbnail) => {
  console.log(thumbnail);
  adversarialAttack.update(thumbnail);
});

trainingSet.$labels.subscribe(labels => adversarialAttack.adverClass.$options.set(labels));

const advCaptureButton = marcelle.button({ text: 'Take photo' });
const capturedImages = advCaptureButton.$click
  .tap(() => {
    if (!mlp.ready) {
      marcelle.throwError(new Error("No classifier has been trained"));
    }
  })
  .filter(() => mlp.ready)
  .sample(input.$images)
  .tap((img) => {
    originImage.update(imgToUri(img));
  });

const origPredictions = capturedImages
  .filter(() => mlp.ready)
  .map(async (img) => (classifier.predict(img)))
  .awaitPromises();

const originImage = origin(imgUpload);
const origConfidence = marcelle.classificationPlot(origPredictions);

const advImages = adversarialAttack.adverClass.$value
  .combine((x, y) => {
    return classifier.attack.bind(classifier)(x, y, true);
  }, capturedImages)
  .merge(adversarialAttack.increaseConfButton.$click
    .map(() => (classifier.attack.bind(classifier)(
      capturedImages.value,
      adversarialAttack.adverClass.$value.value,
    )))
  )
  .awaitPromises()
  .tap((img) => {
    adversarialAttack.update(imgToUri(img));
  });

const advPredictions = advImages
  .map(async (img) => (classifier.predict(img)))
  .awaitPromises();

const attackConfidence = marcelle.classificationPlot(advPredictions);

myDashboard
  .page('Adversarial Attacks')
  .useLeft(input, advCaptureButton, sketchpad)
  .use([originImage, adversarialAttack], [origConfidence, attackConfidence]);

myDashboard.start();
