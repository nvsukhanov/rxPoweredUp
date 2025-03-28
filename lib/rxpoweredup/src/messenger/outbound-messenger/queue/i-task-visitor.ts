import type { TaskPortOutputCommand, TaskWithResponse, TaskWithoutResponse } from '../queue-tasks';
import { IDisposable } from '../../../types';

export interface ITaskVisitor extends IDisposable {
  visitTaskWithResponse<TResponse>(task: TaskWithResponse<TResponse>): void;

  visitTaskWithoutResponse(task: TaskWithoutResponse): void;

  visitTaskPortOutputCommand(task: TaskPortOutputCommand): void;
}
