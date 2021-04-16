import '@marcellejs/core/dist/marcelle.css';
import * as marcelle from '@marcellejs/core';
import { adversary, origin, mobilenetAttacker, mobilenet } from './modules';

const imgToURL = (img) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL();
};

const white2transparent = (img) => {
  for (let p = 0; p < img.data.length; p += 4) {
    if (img.data[p] == 255 && img.data[p + 1] == 255 && img.data[p + 2] == 255) {
      img.data[p + 3] = 0;
    }
  }
}

const overlayImgs = async (top, bottom) => {
  white2transparent(top);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = bottom.width;
  canvas.height = bottom.height;
  const topBitmap = await createImageBitmap(top, 0, 0, top.width, top.height, {
    resizeWidth: bottom.width,
    resizeHeight: bottom.height,
    resizeQuality: 'high',
  });
  ctx.putImageData(bottom, 0, 0);
  ctx.drawImage(topBitmap, 0, 0);
  return ctx.getImageData(0, 0, bottom.width, bottom.height);
};

// Dashboard Interface
const myDashboard = marcelle.dashboard({
  title: 'XAI',
  author: 'Group E',
});

const input = marcelle.webcam();
const label = marcelle.textfield();
label.name = 'Instance label';

const advLabel = marcelle.textfield();
advLabel.name = 'Correct label';

const capture = marcelle.button({ text: 'Click to record instances' });
capture.name = 'Capture instances to the training set';

const advCapture = marcelle.button({ text: 'Add adversarial to dataset' });

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
  .useLeft(trainButton)
  .use(params, prog, plotTraining);

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


const sketchpad = marcelle.sketchpad();

const adversarialAttack = adversary();

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
    originImage.update(imgToURL(img));
  });

const origPredictions = capturedImages
  .filter(() => mlp.ready)
  .map(async (img) => (classifier.predict(img)))
  .awaitPromises();

const originImage = origin(advCaptureButton);
const origConfidence = marcelle.classificationPlot(origPredictions);

const advImages = adversarialAttack.adverClass.$value
  .combine((x, y) => {
    return classifier.attack.bind(classifier)(x, y, true);
  }, capturedImages)
  .merge(adversarialAttack.moreNoise.$click
    .map(() => (classifier.attack.bind(classifier)(
      capturedImages.value,
      adversarialAttack.adverClass.$value.value,
    )))
  )
  .merge(adversarialAttack.lessNoise.$click
    .map(() => (classifier.undo.bind(classifier)(capturedImages.value)))
  )
  .awaitPromises()
  .combine(overlayImgs, sketchpad.$images)
  .awaitPromises();

adversarialAttack.viewNoise.$checked
  .combine(
    async (img, checked) => (checked ? classifier.visNoise.bind(classifier)() : img),
    advImages
  )
  .awaitPromises()
  .subscribe((img) => {
    adversarialAttack.update(imgToURL(img));
  });

const advPredictions = advImages
  .map(async (img) => (classifier.predict(img)))
  .awaitPromises();

origPredictions.subscribe((pred) => {
  advLabel.$text.set(pred.label);
});

const attackConfidence = marcelle.classificationPlot(advPredictions);

myDashboard
  .page('Adversarial Attacks')
  .useLeft(input, sketchpad)
  .use([trainButton, prog, advLabel, advCapture], [originImage, adversarialAttack], [origConfidence, attackConfidence]);

const advInstances = advCapture.$click
  .sample(advImages)
  .map(async (img) => ({
    type: "image",
    data: img,
    label: advLabel.$text.value,
    thumbnail: input.$thumbnails.value,
    features: await featureExtractor.process(img)
  }))
  .awaitPromises();

const allInstances = instances.merge(advInstances);
trainingSet.capture(allInstances);

myDashboard.start();
