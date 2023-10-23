import { Observable, map } from 'rxjs';

import { IRawPortValueProvider, ISensorsFeature } from '../../hub';
import { IVoltageValueParser } from './i-voltage-value-parser';
import { HubType } from '../../constants';

export class SensorsFeature implements ISensorsFeature {
    constructor(
        private readonly rawPortValueProvider: IRawPortValueProvider,
        private readonly voltageValueParser: IVoltageValueParser
    ) {
    }

    public getVoltage(
        portId: number,
        modeId: number,
        hubType: HubType = HubType.Unknown
    ): Observable<number> {
        return this.rawPortValueProvider.getRawPortValue(portId, modeId).pipe(
            map((r) => this.voltageValueParser.fromRawValue(r, hubType))
        );
    }

    public voltageChanges(
        portId: number,
        modeId: number,
        threshold: number,
        hubType: HubType = HubType.Unknown
    ): Observable<number> {
        const rawValueThreshold = this.voltageValueParser.toRawValue(threshold, hubType);
        return this.rawPortValueProvider.rawPortValueChanges(portId, modeId, rawValueThreshold).pipe(
            map((r) => this.voltageValueParser.fromRawValue(r, hubType))
        );
    }
}
