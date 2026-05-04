import { Entity, EntityProps } from '@building-blocks/domain';
import { VisionBoardItemStatuses } from './enums';

export interface VisionBoardItemProps<T> extends EntityProps {
  id: string;
  status: VisionBoardItemStatuses;
  data?: T;
}

export interface VisionBoardItemCreateArgs<T> {
  status: VisionBoardItemStatuses;
  id: string;
  data?: T;
}

export class VisionBoardItem<T> extends Entity<VisionBoardItemProps<T>> {
  private readonly id: string;
  private readonly status: VisionBoardItemStatuses;
  private readonly data?: T;

  constructor(props: VisionBoardItemProps<T>) {
    super();

    this.id = props.id;
    this.status = props.status;
    this.data = props.data;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create<T>(args: VisionBoardItemCreateArgs<T>): VisionBoardItem<T> {
    const now = new Date();

    return new VisionBoardItem({
      id: args.id,
      status: args.status,
      data: args.data,
      createdAt: now,
      updatedAt: now,
    });
  }

  getId(): string {
    return this.id;
  }

  getStatus(): VisionBoardItemStatuses {
    return this.status;
  }

  getData(): T | undefined {
    return this.data;
  }

  getProps(): VisionBoardItemProps<T> {
    return {
      id: this.id,
      status: this.status,
      data: this.data,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
