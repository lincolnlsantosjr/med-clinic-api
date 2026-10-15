import { PageQuery, PageResult, Paginated } from '../domain/types';

export function paginate<T>(result: PageResult<T>, query: PageQuery): Paginated<T> {
  return {
    data: result.items,
    meta: {
      total: result.total,
      page: query.page,
      pageSize: query.pageSize,
      totalPages: Math.ceil(result.total / query.pageSize),
    },
  };
}