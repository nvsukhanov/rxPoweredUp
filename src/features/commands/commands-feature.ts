import { MonoTypeOperatorFunction, Observable, OperatorFunction, Subscription, filter, take } from 'rxjs';

import { MOTOR_ACC_DEC_DEFAULT_PROFILE_ID, MOTOR_LIMITS, MessageType, MotorServoEndState, MotorUseProfile, } from '../../constants';
import {
    GoToAbsoluteDegreeOptions,
    IOutboundMessenger,
    IPortOutputCommandsFeature,
    PortCommandExecutionStatus,
    SetAccelerationTimeOptions,
    SetDecelerationTimeOptions,
    SetSpeedOptions
} from '../../hub';
import { PortOutputCommandFeedbackInboundMessage, RawMessage } from '../../types';
import { IPortOutputCommandOutboundMessageFactory } from './i-port-output-command-outbound-message-factory';

export class CommandsFeature implements IPortOutputCommandsFeature {
    constructor(
        private readonly messenger: IOutboundMessenger,
        private readonly portOutputCommandOutboundMessageFactoryService: IPortOutputCommandOutboundMessageFactory,
        private readonly inboundMessages: Observable<PortOutputCommandFeedbackInboundMessage>
    ) {
    }

    public setAccelerationTime(
        portId: number,
        time: number,
        options?: SetAccelerationTimeOptions
    ): Observable<PortCommandExecutionStatus> {
        const message = this.portOutputCommandOutboundMessageFactoryService.setAccelerationTime(
            portId,
            time,
            options?.profileId ?? MOTOR_ACC_DEC_DEFAULT_PROFILE_ID
        );
        return this.execute(message, portId);
    }

    public setDecelerationTime(
        portId: number,
        time: number,
        options?: SetDecelerationTimeOptions
    ): Observable<PortCommandExecutionStatus> {
        const message = this.portOutputCommandOutboundMessageFactoryService.setDecelerationTime(
            portId,
            time,
            options?.profileId ?? MOTOR_ACC_DEC_DEFAULT_PROFILE_ID
        );
        return this.execute(message, portId);
    }

    public setSpeed(
        portId: number,
        speed: number,
        options?: SetSpeedOptions
    ): Observable<PortCommandExecutionStatus> {
        const message = this.portOutputCommandOutboundMessageFactoryService.startRotation(
            portId,
            speed,
            options?.power ?? MOTOR_LIMITS.maxPower,
            options?.useProfile ?? MotorUseProfile.dontUseProfiles,
        );
        return this.execute(message, portId);
    }

    public goToAbsoluteDegree(
        portId: number,
        absoluteDegree: number,
        options?: GoToAbsoluteDegreeOptions
    ): Observable<PortCommandExecutionStatus> {
        const message = this.portOutputCommandOutboundMessageFactoryService.goToAbsolutePosition(
            portId,
            absoluteDegree,
            options?.speed ?? MOTOR_LIMITS.maxSpeed,
            options?.power ?? MOTOR_LIMITS.maxPower,
            options?.endState ?? MotorServoEndState.hold,
            options?.useProfile ?? MotorUseProfile.dontUseProfiles,
        );
        return this.execute(message, portId);
    }

    // sets absolute zero degree position of motor (relative to current position)
    public setAbsoluteZeroRelativeToCurrentPosition(
        portId: number,
        absolutePosition: number,
    ): Observable<PortCommandExecutionStatus> {
        const message = this.portOutputCommandOutboundMessageFactoryService.presetEncoder(
            portId,
            // We use negative value here because:
            // 1. presetting encoder sets absolute zero relative to current absolute motor position
            //      e.g. if current position is 100 and absolutePosition is 50, then absolute zero will be set to 150
            // 2. somehow hub treats absolute zero in an unusual way - while positive motor angle increase treated as clockwise rotation,
            //      incrementing absolute zero by positive value shifts absolute zero in counter-clockwise direction
            // so we invert value here to have an expected behavior of API.
            // Also, we invert value here (and not in presetEncoder method) in order to keep message factories as close
            // to original documentation as possible.
            -absolutePosition,
        );

        return this.execute(message, portId);
    }

    private execute(
        message: RawMessage<MessageType.portOutputCommand>,
        portId: number
    ): Observable<PortCommandExecutionStatus> {
        return this.messenger.sendWithResponse(
            message,
            this.inboundMessages.pipe(
                // here we provide a single message (filtered by port id) to messenger and then wait for a single reply
                this.prepareSignalForMessenger(portId),
            )
        ).pipe(
            // then we map-and-forward this reply to the caller and then switch to replies stream in order to provide
            // command completion status
            this.capturePortCommandFeedbackReplies(portId)
        );
    }

    private prepareSignalForMessenger(
        portId: number,
    ): MonoTypeOperatorFunction<PortOutputCommandFeedbackInboundMessage> {
        return (source: Observable<PortOutputCommandFeedbackInboundMessage>) => source.pipe(
            filter((message: PortOutputCommandFeedbackInboundMessage) => message.portId === portId),
            take(1)
        );
    }

    // this method is used to capture command completion status from messenger, and then switch to message listener
    // in order to provide command completion status to the caller and complete the stream when command has reached its terminal state
    private capturePortCommandFeedbackReplies(
        portId: number,
    ): OperatorFunction<PortOutputCommandFeedbackInboundMessage, PortCommandExecutionStatus> {
        return (source: Observable<PortOutputCommandFeedbackInboundMessage>) => new Observable<PortCommandExecutionStatus>((observer) => {
            let remainingRepliesSubscription: Subscription;
            const originalStreamSubscription = source.subscribe({
                // this reply comes from messenger
                next: (message: PortOutputCommandFeedbackInboundMessage) => {
                    if (message.feedback.bufferEmptyCommandInProgress) {
                        observer.next(PortCommandExecutionStatus.InProgress);
                        originalStreamSubscription.unsubscribe();

                        // all following replies come from message listener
                        // this complicated logic is used to mitigate race condition that could happen if we just feed filtered replies
                        // directly to messenger. Maybe there is a better way to do this?
                        remainingRepliesSubscription = this.inboundMessages.pipe(
                            filter((r) => r.portId === portId),
                        ).subscribe((remainingReply) => {
                            if (remainingReply.feedback.executionError) {
                                observer.next(PortCommandExecutionStatus.ExecutionError);
                                observer.complete();
                            } else if (remainingReply.feedback.currentCommandDiscarded) {
                                observer.next(PortCommandExecutionStatus.Discarded);
                                observer.complete();
                            } else if (remainingReply.feedback.bufferEmptyCommandCompleted || remainingReply.feedback.busyOrFull) {
                                observer.next(PortCommandExecutionStatus.Completed);
                                observer.complete();
                            }
                        });
                    } else if (message.feedback.bufferEmptyCommandCompleted) {
                        observer.next(PortCommandExecutionStatus.Completed);
                        observer.complete();
                    }
                },
                error: (error) => observer.error(error)
            });
            return () => {
                remainingRepliesSubscription?.unsubscribe();
                originalStreamSubscription.unsubscribe();
            };
        });
    }
}
