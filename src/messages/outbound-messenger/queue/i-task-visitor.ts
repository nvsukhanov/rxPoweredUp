import type { TaskPortOutputCommand, TaskWithResponse, TaskWithoutResponse } from '../queue-tasks';

export interface ITaskVisitor {
    visitTaskWithResponse<TResponse>(task: TaskWithResponse<TResponse>): void;

    visitTaskWithoutResponse(task: TaskWithoutResponse): void;

    visitTaskPortOutputCommand(task: TaskPortOutputCommand): void;
}
