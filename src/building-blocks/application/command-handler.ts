import { Transaction } from '@building-blocks/infrastructure';

export type CommandHandlerResult = void | string | string[] | object;

export interface CommandHandler<
  Command,
  Result extends CommandHandlerResult = void,
> {
  handle(argument: Command, tx?: Transaction): Promise<Result> | Result;
}
