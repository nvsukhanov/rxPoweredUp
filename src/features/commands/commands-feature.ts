import { MonoTypeOperatorFunction, Observable, OperatorFunction, Subscription, filter, take } from 'rxjs';

import { IInboundMessageListener, OutputCommandOutboundMessageFactory } from '../../messages';
import { MOTOR_ACC_DEC_DEFAULT_PROFILE_ID, MOTOR_LIMITS, MessageType, MotorProfile, MotorServoEndState, } from '../../constants';
import { ICommandsFeature, PortCommandExecutionStatus } from './i-commands-feature';
import { PortOutputCommandFeedbackInboundMessage, RawMessage } from '../../types';
import { IOutboundMessenger } from '../i-outbound-messenger';

export class CommandsFeature implements ICommandsFeature {
    constructor(
        private readonly messenger: IOutboundMessenger,
        private readonly portOutputCommandOutboundMessageFactoryService: OutputCommandOutboundMessageFactory,
        private readonly messageListener: IInboundMessageListener<MessageType.portOutputCommandFeedback>,
    ) {
    }

    public setAccelerationTime(
        portId: number,
        time: number,
        profileId: number = MOTOR_ACC_DEC_DEFAULT_PROFILE_ID
    ): Observable<PortCommandExecutionStatus> {
        const message = this.portOutputCommandOutboundMessageFactoryService.setAccelerationTime(
            portId,
            time,
            profileId
        );
        return this.execute(message, portId);
    }

    public setDecelerationTime(
        portId: number,
        time: number,
        profileId: number = MOTOR_ACC_DEC_DEFAULT_PROFILE_ID
    ): Observable<PortCommandExecutionStatus> {
        const message = this.portOutputCommandOutboundMessageFactoryService.setDecelerationTime(
            portId,
            time,
            profileId
        );
        return this.execute(message, portId);
    }

    public setSpeed(
        portId: number,
        speed: number,
        power: number = MOTOR_LIMITS.maxPower,
        profile: MotorProfile = MotorProfile.dontUseProfiles,
    ): Observable<PortCommandExecutionStatus> {
        const message = this.portOutputCommandOutboundMessageFactoryService.startRotation(
            portId,
            speed,
            power,
            profile,
        );
        return this.execute(message, portId);
    }

    public goToAbsoluteDegree(
        portId: number,
        absoluteDegree: number,
        speed: number = MOTOR_LIMITS.maxSpeed,
        power: number = MOTOR_LIMITS.maxPower,
        endState: MotorServoEndState = MotorServoEndState.hold,
        profile: MotorProfile = MotorProfile.dontUseProfiles,
    ): Observable<PortCommandExecutionStatus> {
        const message = this.portOutputCommandOutboundMessageFactoryService.goToAbsolutePosition(
            portId,
            absoluteDegree,
            speed,
            power,
            endState,
            profile,
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
            this.messageListener.replies$.pipe(
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
                        remainingRepliesSubscription = this.messageListener.replies$.pipe(
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
