import {
    DeviceStatus,
    NextFunction,
    RouteHandlerRequest,
    RouteHandlerResponse,
    UnisonHT,
    UnisonHTDevice,
} from '@unisonht/unisonht';
import { PigpioIr, Remote } from 'pigpio-ir';

export class PigpioIrDevice implements UnisonHTDevice {
    private readonly pigpioIr: PigpioIr;
    private readonly deviceName: string;
    private readonly remote: Remote;

    constructor(pigpioIr: PigpioIr, deviceName: string) {
        this.pigpioIr = pigpioIr;
        this.deviceName = deviceName;
        this.remote = pigpioIr.options.remotes[deviceName];
        if (!this.remote) {
            throw new Error(`Could not find remote '${deviceName}'`);
        }
        for (const buttonName of Object.keys(this.remote.buttons)) {
            const button = this.remote.buttons[buttonName];
        }
    }

    public async initialize(unisonht: UnisonHT): Promise<void> {
        if (!this.pigpioIr.started) {
            this.pigpioIr.start();
        }
    }

    public getDeviceName(): string {
        return this.deviceName;
    }

    public async getStatus(): Promise<DeviceStatus> {
        return {};
    }

    public handleKeyPress(
        key: string,
        request: RouteHandlerRequest,
        response: RouteHandlerResponse,
        next: NextFunction,
    ): Promise<void> {
        return Promise.resolve(undefined);
    }
}
