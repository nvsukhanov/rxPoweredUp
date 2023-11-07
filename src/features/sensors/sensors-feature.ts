import { Observable } from 'rxjs';

import { IPortValueTransformer, IRawPortValueProvider, ISensorsFeature, TiltData } from '../../hub';
import { HubType, WELL_KNOWN_PORT_MODE_IDS } from '../../constants';
import { IVoltageValueTransformerFactory } from './i-voltage-value-transformer-factory';

export class SensorsFeature implements ISensorsFeature {
    constructor(
        private readonly rawPortValueProvider: IRawPortValueProvider,
        private readonly voltageValueTransformerFactory: IVoltageValueTransformerFactory,
        private readonly tiltValueTransformer: IPortValueTransformer<TiltData>,
        private readonly temperatureValueTransformer: IPortValueTransformer<number>
    ) {
    }

    public getVoltage(
        portId: number,
        modeId: number = WELL_KNOWN_PORT_MODE_IDS.voltage,
        hubType: HubType = HubType.Unknown
    ): Observable<number> {
        const transformer = this.voltageValueTransformerFactory.createForHubType(hubType);
        return this.rawPortValueProvider.getRawPortValue(portId, modeId, transformer);
    }

    public voltageChanges(
        portId: number,
        modeId: number = WELL_KNOWN_PORT_MODE_IDS.voltage,
        threshold: number = 0.01,
        hubType: HubType = HubType.Unknown
    ): Observable<number> {
        const transformer = this.voltageValueTransformerFactory.createForHubType(hubType);
        const rawValueThreshold = threshold * transformer.toValueThreshold(threshold);
        return this.rawPortValueProvider.rawPortValueChanges(portId, modeId, rawValueThreshold, transformer);
    }

    public getTilt(
        portId: number,
        modeId: number = WELL_KNOWN_PORT_MODE_IDS.tilt
    ): Observable<TiltData> {
        return this.rawPortValueProvider.getRawPortValue(portId, modeId, this.tiltValueTransformer);
    }

    public tiltChanges(
        portId: number,
        modeId: number = WELL_KNOWN_PORT_MODE_IDS.tilt,
        threshold: number = 1
    ): Observable<TiltData> {
        const rawThreshold = this.tiltValueTransformer.toValueThreshold({ yaw: threshold, pitch: threshold, roll: threshold });
        return this.rawPortValueProvider.rawPortValueChanges(portId, modeId, rawThreshold, this.tiltValueTransformer);
    }

    public getTemperature(
        portId: number,
        modeId: number = WELL_KNOWN_PORT_MODE_IDS.temperature
    ): Observable<number> {
        return this.rawPortValueProvider.getRawPortValue(portId, modeId, this.temperatureValueTransformer);
    }

    public temperatureChanges(
        portId: number,
        modeId: number = WELL_KNOWN_PORT_MODE_IDS.temperature,
        threshold: number = 1
    ): Observable<number> {
        const rawValueThreshold = threshold * this.temperatureValueTransformer.toValueThreshold(threshold);
        return this.rawPortValueProvider.rawPortValueChanges(portId, modeId, rawValueThreshold, this.temperatureValueTransformer);
    }
}
