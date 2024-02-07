import { Observable, last, switchMap } from 'rxjs';

import { ColorDescriptor, IOutboundMessenger, IRgbLightFeature, PortCommandExecutionStatus } from '../../hub';
import { IRgbLightCommandsFactory } from './i-rgb-light-commands-factory';
import { WELL_KNOWN_PORT_MODE_IDS } from '../../constants';
import { IPortInputFormatSetupMessageFactory } from '../i-port-input-format-setup-message-factory';

export class RgbLightFeature implements IRgbLightFeature {
    constructor(
        private readonly messenger: IOutboundMessenger,
        private readonly ledCommandsFactory: IRgbLightCommandsFactory,
        private readonly portInputSetupMessageFactory: IPortInputFormatSetupMessageFactory
    ) {
    }

    setRgbColor(
        portId: number,
        color: ColorDescriptor,
        modeId: number = WELL_KNOWN_PORT_MODE_IDS.rgbLightRgbColor
    ): Observable<PortCommandExecutionStatus> {
        const setPortModeMessage = this.portInputSetupMessageFactory.createMessage(portId, modeId, false);
        const message = this.ledCommandsFactory.createSetRgbColorCommand(portId, modeId, color);
        return this.messenger.sendWithoutResponse(setPortModeMessage).pipe(
            last(),
            switchMap(() => this.messenger.sendPortOutputCommand(message))
        );
    }
}
