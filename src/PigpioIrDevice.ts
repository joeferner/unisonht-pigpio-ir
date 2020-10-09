import {
    DeviceStatus,
    RouteHandlerRequest,
    RouteHandlerResponse,
    UnisonHTDevice,
    SupportedButtons,
} from '@unisonht/unisonht';
import { PigpioIr, Remote } from 'pigpio-ir';
import pigpio from 'pigpio';
import Debug from 'debug';

const debug = Debug('UnisonHT:pigpio-ir:PigpioIrDevice');

export interface PigpioIrDeviceOptions {
    pigpioIr: PigpioIr;
}

export class PigpioIrDevice implements UnisonHTDevice {
    private readonly pigpioIr: PigpioIr;
    private readonly deviceName: string;
    private readonly remote: Remote;
    private readonly buttonMap: SupportedButtons;

    constructor(deviceName: string, options: PigpioIrDeviceOptions) {
        this.deviceName = deviceName;
        this.pigpioIr = options.pigpioIr;
        this.remote = this.pigpioIr.options.remotes[deviceName];
        if (!this.remote) {
            throw new Error(`Could not find remote '${deviceName}'`);
        }

        this.buttonMap = {};
        for (const buttonName of Object.keys(this.remote.buttons)) {
            this.buttonMap[buttonName] = {
                name: buttonName,
                description: `IR: ${deviceName}: ${buttonName}`,
                handleButtonPress: async (
                    button: string,
                    request: RouteHandlerRequest,
                    response: RouteHandlerResponse,
                ): Promise<void> => {
                    await this.pigpioIr.transmit(this.deviceName, buttonName);
                    response.send();
                },
            };
        }
    }

    public async initialize(): Promise<void> {
        if (!this.pigpioIr.started) {
            this.pigpioIr.start();
        }
    }

    public getSupportedButtons(): SupportedButtons {
        return this.buttonMap;
    }

    public getDeviceName(): string {
        return this.deviceName;
    }

    public async getStatus(): Promise<DeviceStatus> {
        if (process.env.NODE_ENV === 'development') {
            debug(`skipping getStatus, NODE_ENV set to development`);
            return {
                tick: new Date().getTime(),
            };
        }

        return {
            tick: pigpio.getTick(),
        };
    }
}
