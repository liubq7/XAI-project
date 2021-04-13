import {
  load as loadMobilenet,
} from '@tensorflow-models/mobilenet';
import { io, tidy } from '@tensorflow/tfjs-core';
import { logger, Model } from '@marcellejs/core';


export class Mobilenet extends Model {
  title = 'mobilenet';

  parameters = {};
  serviceName = 'undefined';

  mobilenet;
  version;
  alpha;

  constructor(options = { version: 1, alpha: 1 }) {
    super();
    const { version, alpha } = options;
    if (![1, 2].includes(version)) {
      throw new Error('Mobilenet version must be 1 or 2');
    }
    if (![0.25, 0.5, 0.75, 1.0].includes(alpha)) {
      throw new Error('Mobilenet alpha must be 0.25 | 0.50 | 0.75 | 1.0');
    }
    this.version = version;
    this.alpha = alpha;
    this.setup();
  }

  async setup() {
    const cachedModels = await io.listModels();
    const cachedMobilenet = Object.keys(cachedModels).filter((x) => x.includes('mobilenet'));
    try {
      this.mobilenet = await loadMobilenet({
        modelUrl: `indexeddb://mobilenet-v${this.version}-${this.alpha}`,
        version: this.version,
        alpha: this.alpha,
      });
    } catch (error) {
      if (cachedMobilenet.length > 0) {
        await io.removeModel(cachedMobilenet[0]);
      }
      this.mobilenet = await loadMobilenet({
        version: this.version,
        alpha: this.alpha,
      });
      await this.mobilenet.model.save(`indexeddb://mobilenet-v${this.version}-${this.alpha}`);
    }
    logger.info(`Mobilenet v${this.version} loaded with alpha = ${this.alpha}`);
    this.start();
    return this;
  }

  async process(image) {
    if (!this.mobilenet) return [];
    return tidy(() => {
      const x = this.mobilenet.infer(image, true).arraySync();
      return x;
    });
  }

  async predict(image) {
    if (!this.mobilenet) {
      throw new Error('Mobilenet is not loaded');
    }
    const results = await this.mobilenet.classify(image, 5);
    return {
      label: results[0].className,
      confidences: results.reduce((x, y) => ({ ...x, [y.className]: y.probability }), {}),
    };
  }

}
