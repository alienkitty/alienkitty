import { AssetLoader, Stage } from '@alienkitty/space.js/three';

export class Preloader {
    static async init() {
        this.initStage();
        this.initLoader();
    }

    static initStage() {
        Stage.init();
    }

    static async initLoader() {
        this.loader = new AssetLoader();
        this.loader.loadAll([
            'assets/images/alienkitty.svg',
            'assets/images/alienkitty_eyelid.svg',
            'assets/fonts/Roboto-Bold.png',
            'assets/fonts/Roboto-Bold.json'
        ]);

        const { App } = await import('./App.js');
        this.app = App;

        await this.app.init(this.loader);
        this.onComplete();
    }

    // Event handlers

    static onComplete = async () => {
        this.loader = this.loader.destroy();

        this.app.start();
    };
}
