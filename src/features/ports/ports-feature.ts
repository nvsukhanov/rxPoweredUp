import { MonoTypeOperatorFunction, Observable, Subscription, filter, last, map, switchMap, take } from 'rxjs';

import { AttachIoEvent, PortModeInformationType } from '../../constants';
import {
    AttachedIOAttachVirtualInboundMessage,
    AttachedIODetachInboundMessage,
    AttachedIOInboundMessage,
    AttachedIoAttachInboundMessage,
    PortInputSetupSingleHandshakeInboundMessage,
    PortModeInboundMessage,
    PortModeInformationInboundMessage,
    PortValueInboundMessage
} from '../../types';
import { IOutboundMessenger, IPortsFeature, IRawPortValueProvider, OnIoAttachFilter, OnIoDetachFilter } from '../../hub';
import { IPortInformationRequestMessageFactory } from './i-port-information-request-message-factory';
import { IPortModeInformationRequestMessageFactory } from './i-port-mode-information-request-message-factory';
import { IPortInputFormatSetupMessageFactory } from './i-port-input-format-setup-message-factory';
import { IVirtualPortSetupMessageFactory } from './i-virtual-port-setup-message-factory';

export class PortsFeature implements IPortsFeature, IRawPortValueProvider {
    constructor(
        private readonly portModeReplies$: Observable<PortModeInboundMessage>,
        private readonly attachedIoReplies$: Observable<AttachedIOInboundMessage>,
        private readonly attachedIoCachedReplies$: Observable<AttachedIOInboundMessage>,
        private readonly portModeInformationReplies$: Observable<PortModeInformationInboundMessage>,
        private readonly portValueSetupSingleHandshakeReplies$: Observable<PortInputSetupSingleHandshakeInboundMessage>,
        private readonly portInformationRequestMessageFactory: IPortInformationRequestMessageFactory,
        private readonly rawPortValueReplies: Observable<PortValueInboundMessage>,
        private readonly portModeInformationMessageFactory: IPortModeInformationRequestMessageFactory,
        private readonly portInputFormatSetupMessageFactory: IPortInputFormatSetupMessageFactory,
        private readonly virtualPortSetupMessageFactory: IVirtualPortSetupMessageFactory,
        private readonly messenger: IOutboundMessenger,
    ) {
    }

    public onIoAttach(
        filterOptions: OnIoAttachFilter = {
            eventTypes: [ AttachIoEvent.Attached, AttachIoEvent.AttachedVirtual ]
        }
    ): Observable<AttachedIoAttachInboundMessage | AttachedIOAttachVirtualInboundMessage> {
        const filters: Array<MonoTypeOperatorFunction<AttachedIOInboundMessage>> = [];

        if (filterOptions.ports !== undefined) {
            const portIdsSet = new Set(filterOptions.ports);
            filters.push(filter((message) => portIdsSet.has(message.portId)));
        }
        if (filterOptions.eventTypes !== undefined) {
            const eventTypesSet: ReadonlySet<AttachIoEvent> = new Set(filterOptions.eventTypes);
            filters.push(filter((message) => eventTypesSet.has(message.event)));
        }
        if (filterOptions.ioTypes !== undefined) {
            const ioTypesSet = new Set(filterOptions.ioTypes);
            filters.push(filter((message) => ioTypesSet.has((message as AttachedIoAttachInboundMessage | AttachedIOAttachVirtualInboundMessage).ioTypeId)));
        }
        return filters.reduce((acc, filterOperator) => acc.pipe(filterOperator),
            this.attachedIoCachedReplies$
        ) as Observable<AttachedIoAttachInboundMessage | AttachedIOAttachVirtualInboundMessage>;
    }

    public onIoDetach(
        filterOptions?: OnIoDetachFilter
    ): Observable<AttachedIODetachInboundMessage> {
        const filters: Array<MonoTypeOperatorFunction<AttachedIOInboundMessage>> = [
            filter((message) => message.event === AttachIoEvent.Detached)
        ];
        if (filterOptions?.ports !== undefined) {
            const portIdsSet = new Set(filterOptions.ports);
            filters.push(filter((message) => portIdsSet.has(message.portId)));
        }

        return filters.reduce((acc, filterOperator) => acc.pipe(filterOperator),
            this.attachedIoCachedReplies$
        ) as Observable<AttachedIODetachInboundMessage>;
    }

    public getRawPortValue(
        portId: number,
        modeId: number,
    ): Observable<number[]> {
        const setPortInputFormatMessage = this.portInputFormatSetupMessageFactory.createMessage(
            portId,
            modeId,
            false,
        );
        const portValueRequestMessage = this.portInformationRequestMessageFactory.createPortValueRequest(portId);

        const portValueHandshakeReplies$ = this.portValueSetupSingleHandshakeReplies$.pipe(
            filter((r) => r.portId === portId && r.modeId === modeId),
            take(1)
        );

        const portValuesReplies$ = this.rawPortValueReplies.pipe(
            filter((r) => r.portId === portId),
        );

        return this.messenger.sendWithResponse(
            { message: setPortInputFormatMessage, reply: portValueHandshakeReplies$ },
            { message: portValueRequestMessage, reply: portValuesReplies$ }
        ).pipe(
            map((r) => r.value)
        );
    }

    public rawPortValueChanges(
        portId: number,
        modeId: number,
        deltaThreshold?: number
    ): Observable<number[]> {
        let notificationsRequestSent = false;
        let subscribersCount = 0;

        const portValueHandshakeReplies$ = this.portValueSetupSingleHandshakeReplies$.pipe(
            filter((r) => r.portId === portId && r.modeId === modeId),
            take(1)
        );

        const teardownLogic = (sub: Subscription): void => {
            subscribersCount--;
            if (subscribersCount === 0) {
                const disableNotificationsMessage = this.portInputFormatSetupMessageFactory.createMessage(
                    portId,
                    modeId,
                    false,
                );
                this.messenger.sendWithResponse(
                    { message: disableNotificationsMessage, reply: portValueHandshakeReplies$ }
                ).pipe(
                    take(1)
                ).subscribe();
            }
            sub.unsubscribe();
        };

        return new Observable<number[]>((subscriber) => {
            subscribersCount++;
            const portValuesReplies$ = this.rawPortValueReplies.pipe(
                filter((r) => r.portId === portId),
            );

            if (!notificationsRequestSent) {
                const setPortInputFormatMessage = this.portInputFormatSetupMessageFactory.createMessage(
                    portId,
                    modeId,
                    true,
                    deltaThreshold
                );

                const sub = this.messenger.sendWithResponse(
                    { message: setPortInputFormatMessage, reply: portValueHandshakeReplies$ }
                ).pipe(
                    last(),
                    switchMap(() => portValuesReplies$),
                    map((r) => r.value)
                ).subscribe(subscriber);
                notificationsRequestSent = true;
                return () => teardownLogic(sub);
            } else {
                const sub = portValuesReplies$.pipe(
                    map((r) => r.value)
                ).subscribe(subscriber);
                return () => teardownLogic(sub);
            }
        });
    }

    public getPortModes(
        portId: number
    ): Observable<PortModeInboundMessage> {
        return this.messenger.sendWithResponse({
            message: this.portInformationRequestMessageFactory.createPortModeRequest(portId),
            reply: this.portModeReplies$.pipe(
                filter((r) => r.portId === portId)
            )
        });
    }

    public getPortModeInformation<T extends PortModeInformationType>(
        portId: number,
        mode: number,
        modeInformationType: T
    ): Observable<PortModeInformationInboundMessage & { modeInformationType: T }> {
        const message = this.portModeInformationMessageFactory.createPortModeInformationRequest(
            portId,
            mode,
            modeInformationType
        );

        const reply = (this.portModeInformationReplies$ as Observable<PortModeInformationInboundMessage & { modeInformationType: T }>).pipe(
            filter((r) => r.modeInformationType === modeInformationType && r.portId === portId && r.mode === mode),
        );

        return this.messenger.sendWithResponse({ message, reply });
    }

    public createVirtualPort(
        portIdA: number,
        portIdB: number
    ): Observable<AttachedIOAttachVirtualInboundMessage> {
        const replies = this.attachedIoReplies$.pipe(
            filter((r) => r.event === AttachIoEvent.AttachedVirtual && r.portIdA === portIdA && r.portIdB === portIdB),
        );
        return this.messenger.sendWithResponse({
            message: this.virtualPortSetupMessageFactory.createVirtualPort(portIdA, portIdB),
            reply: replies
        });
    }

    public deleteVirtualPort(
        virtualPortId: number
    ): Observable<AttachedIODetachInboundMessage> {
        const replies = this.attachedIoReplies$.pipe(
            filter((r) => r.event === AttachIoEvent.Detached && r.portId === virtualPortId),
        );
        return this.messenger.sendWithResponse({
            message: this.virtualPortSetupMessageFactory.deleteVirtualPort(virtualPortId),
            reply: replies
        });
    }
}
