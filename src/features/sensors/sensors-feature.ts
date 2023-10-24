import { Observable, map } from 'rxjs';

import { IRawPortValueProvider, ISensorsFeature, TiltData } from '../../hub';
import { IVoltageValueTransformer } from './i-voltage-value-transformer';
import { HubType } from '../../constants';
import { ITiltValueTransformer } from './i-tilt-value-transformer';

export class SensorsFeature implements ISensorsFeature {
    constructor(
        private readonly rawPortValueProvider: IRawPortValueProvider,
        private readonly voltageValueTransformer: IVoltageValueTransformer,
        private readonly tiltValueTransformer: ITiltValueTransformer
    ) {
    }

    public getVoltage(
        portId: number,
        modeId: number,
        hubType: HubType = HubType.Unknown
    ): Observable<number> {
        return this.rawPortValueProvider.getRawPortValue(portId, modeId).pipe(
            map((r) => this.voltageValueTransformer.fromRawValue(r, hubType))
        );
    }

    public voltageChanges(
        portId: number,
        modeId: number,
        threshold: number,
        hubType: HubType = HubType.Unknown
    ): Observable<number> {
        const rawValueThreshold = this.voltageValueTransformer.toRawValue(threshold, hubType);
        return this.rawPortValueProvider.rawPortValueChanges(portId, modeId, rawValueThreshold).pipe(
            map((r) => this.voltageValueTransformer.fromRawValue(r, hubType))
        );
    }

    public getTilt(
        portId: number,
        modeId: number
    ): Observable<TiltData> {
        return this.rawPortValueProvider.getRawPortValue(portId, modeId).pipe(
            map((r) => this.tiltValueTransformer.fromRawValue(r))
        );
    }

    public tiltChanges(
        portId: number,
        modeId: number,
        threshold: number
    ): Observable<TiltData> {
        return this.rawPortValueProvider.rawPortValueChanges(portId, modeId, threshold).pipe(
            map((r) => this.tiltValueTransformer.fromRawValue(r))
        );
    }
}
