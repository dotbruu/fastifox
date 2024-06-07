import { BadRequestException } from "./http-exception.helper"

export interface IPaginateListPayload<T = any> {
  list: Array<T>
  count: number
  page: number
  pageSize: number
}

export interface IPaginateListResponse<T = any> {
  list: Array<T>
  pagination: {
    total: number
    currentPage: number
    totalPages: number
  }
}

export interface IPaginateFilters {
  page?: number;
  pageSize?: number;
}

export class PaginationHelper {
  static build<T>({ list, count, page, pageSize }: 
    IPaginateListPayload<T>): IPaginateListResponse<T> {
    const totalPages = Math.ceil(count / pageSize);
    const currentPage = Math.min(page, totalPages);

    return {
      list,
      pagination: {
        total: count,
        currentPage,
        totalPages,
      },
    }
  }

  static resolve({ page, pageSize }: IPaginateFilters){
    if(page! < 1 || pageSize! < 1)
      throw new BadRequestException('The page must be greater than 1')
  }
}