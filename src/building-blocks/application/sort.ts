export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export type Sort<T> = {
  field: keyof T;
  direction: SortDirection;
}
