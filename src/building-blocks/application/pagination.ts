export interface PaginatedList<T> {
  items: T[];
  hasMore: boolean;
  totalPages: number;
  totalItems: number;
}

type PaginationArgs = {
  page: number;
  perPage: number;
};

export class Pagination {
  private readonly page: number;
  private readonly perPage: number;

  private constructor({ page, perPage }: PaginationArgs) {
    this.page = page;
    this.perPage = perPage;
  }

  static from(args: PaginationArgs) {
    if (args.page <= 0) {
      throw new Error('Page must be greater than or equal to 1');
    }

    return new Pagination(args);
  }

  static default() {
    return new Pagination({ page: 1, perPage: 100 });
  }

  static unlimited() {
    return new Pagination({ page: 1, perPage: Number.MAX_SAFE_INTEGER });
  }

  next(): Pagination {
    return new Pagination({
      page: this.page + 1,
      perPage: this.perPage,
    });
  }

  getPage(): number {
    return this.page;
  }

  getPerPage(): number {
    return this.perPage;
  }

  getOffset(): number {
    return (this.page - 1) * this.perPage;
  }

  getTotalPages(total: number): number {
    return this.perPage === 0
      ? 1
      : Math.max(Math.ceil(total / this.perPage), 1);
  }

  hasMore(total: number): boolean {
    return this.page < this.getTotalPages(total);
  }

  getPaginatedList<Model>(items: Model[], total: number): PaginatedList<Model> {
    return {
      items,
      totalItems: total,
      totalPages: this.getTotalPages(total),
      hasMore: this.hasMore(total),
    };
  }

  getEmptyPaginatedList<Model>(): PaginatedList<Model> {
    return {
      items: [],
      totalItems: 0,
      totalPages: 1,
      hasMore: false,
    };
  }
}
