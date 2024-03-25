import { injectable } from 'tsyringe';

import { OutputSubCommand, PortOperationCompletionInformation, PortOperationStartupInformation } from '../../constants';

@injectable()
export class WriteDirectModeDataBuilder {
    public buildWriteDirectModeData({ portId, startupInformation, completionInformation, modeId, payload }: {
        portId: number;
        startupInformation: PortOperationStartupInformation;
        completionInformation: PortOperationCompletionInformation;
        modeId: number;
        payload: number[];
    }): Uint8Array {
        return new Uint8Array([
            portId,
            startupInformation | completionInformation,
            OutputSubCommand.writeDirectModeData,
            modeId,
            ...payload
        ]);
    }
}
