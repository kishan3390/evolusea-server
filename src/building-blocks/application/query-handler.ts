export interface QueryHandler<Query, Result> {
  handle(argument: Query): Promise<Result> | Result | Promise<Result | null>;
}
