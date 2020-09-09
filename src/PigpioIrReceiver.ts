import { DeviceStatus, SupportedButtons, UnisonHT, UnisonHTDevice } from '@unisonht/unisonht';
import { ButtonEventData, PigpioIr } from 'pigpio-ir';
import pigpio from 'pigpio';
import Debug from 'debug';

const debug = Debug('unisonht-pigpio-ir:PigpioIrReceiver');

export type TranslateButton = (remoteName: string, buttonName: string) => string | undefined;

export interface PigpioIrReceiverOptions {
    pigpioIr: PigpioIr;
    translateButton?: TranslateButton;
}

const DEFAULT_TRANSLATE_BUTTON_FN: TranslateButton = (remoteName: string, buttonName: string) => {
    return buttonName;
};

export class PigpioIrReceiver implements UnisonHTDevice {
    private readonly pigpioIr: PigpioIr;
    private readonly deviceName: string;
    private readonly translateButton: TranslateButton;

    constructor(deviceName: string, options: PigpioIrReceiverOptions) {
        this.deviceName = deviceName;
        this.pigpioIr = options.pigpioIr;
        this.translateButton = options.translateButton || DEFAULT_TRANSLATE_BUTTON_FN;
    }

    public async initialize(unisonht: UnisonHT): Promise<void> {
        this.pigpioIr.on('button', (data: ButtonEventData) => {
            this.handleButton(unisonht, data);
        });

        if (!this.pigpioIr.started) {
            this.pigpioIr.start();
        }
    }

    private async handleButton(unisonht: UnisonHT, data: ButtonEventData): Promise<void> {
        const button = this.translateButton(data.remoteName, data.buttonName);
        debug(`received ${data.remoteName} - ${data.buttonName} => posting to ${button || 'NA'}`);
        if (!button) {
            return;
        }
        const url = `/button/${button}`;
        try {
            await unisonht.executePost(url);
        } catch (err) {
            console.error(`failed to execute post: ${url}`, err);
        }
    }

    public getSupportedButtons(): SupportedButtons {
        return {};
    }

    public getDeviceName(): string {
        return this.deviceName;
    }

    public async getStatus(): Promise<DeviceStatus> {
        return {
            tick: pigpio.getTick(),
        };
    }
}
