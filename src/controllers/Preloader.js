import { AssetLoader, Assets, Device, FontLoader, MultiLoader } from 'alien.js';

import { Config } from '../config/Config.js';

export class Preloader {
    static async init() {
        if (!Device.webgl) {
            return location.href = 'fallback.html';
        }

        Assets.path = Config.CDN;
        Assets.crossOrigin = 'anonymous';

        Assets.options = {
            mode: 'cors',
            // credentials: 'include'
        };

        // Assets.cache = true;

        this.initLoader();
    }

    static async initLoader() {
        this.loader = new MultiLoader();
        this.loader.load(new FontLoader(['Roboto Mono']));
        this.loader.load(new AssetLoader(Config.ASSETS));

        const { App } = await import('./App.js');
        this.app = App;

        await this.app.init(this.loader);
        this.onComplete();
    }

    /**
     * Event handlers
     */

    static onComplete = async () => {
        this.loader = this.loader.destroy();

        this.app.start();
    };
}
