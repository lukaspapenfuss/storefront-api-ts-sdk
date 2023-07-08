import {BapiCall} from '../../helpers/execute';
import {
  InferResponsePagination,
  RequestPagination,
  ResponsePagination,
  buildRequestPaginationParameters,
} from '../../types/Pagination';
import {Product} from '../../types/Product';
import {ProductSearchQuery, queryParamsFromProductSearchQuery} from '../../types/ProductSearchQuery';
import {ProductWith, productWithQueryParameterValues} from '../../types/ProductWith';

export enum APISortOption {
  Price = 'price',
  DateAdded = 'new',
  Reduction = 'reduction',
}

export enum APISortOrder {
  Ascending = 'asc',
  Descending = 'desc',
}

export interface ProductSortConfig {
  by?: APISortOption;
  direction?: APISortOrder;
  score?: 'category_scores' | 'brand_scores';
  channel?: string;
  sortingKey?: string;
}

export interface ProductsSearchEndpointParameters<Pagination extends RequestPagination> {
  where?: ProductSearchQuery;

  sort?: ProductSortConfig;

  campaignKey?: string;

  with?: ProductWith;

  pagination?: Pagination;

  includeSellableForFree?: boolean;

  includeSoldOut?: boolean;

  pricePromotionKey?: string;

  minProductId?: number;
}

export interface ProductsSearchEndpointResponseData<Pagination extends ResponsePagination> {
  entities: Product[];
  pagination: Pagination;
}

export function createProductsSearchEndpointRequest<Pagination extends RequestPagination>(
  parameters: ProductsSearchEndpointParameters<Pagination>,
): BapiCall<ProductsSearchEndpointResponseData<InferResponsePagination<Pagination>>> {
  return {
    method: 'GET',
    endpoint: '/v1/products',
    params: {
      ...(parameters.with ? {with: productWithQueryParameterValues(parameters.with).join(`,`)} : undefined),

      ...queryParamsFromProductSearchQuery(parameters.where),

      ...(parameters.pricePromotionKey
        ? {
            pricePromotionKey: parameters.pricePromotionKey,
          }
        : undefined),

      ...(parameters.sort && parameters.sort.by ? {sort: parameters.sort.by} : undefined),
      ...(parameters.sort && parameters.sort.direction ? {sortDir: parameters.sort.direction} : undefined),
      ...(parameters.sort && parameters.sort.score ? {sortScore: parameters.sort.score} : undefined),
      ...(parameters.sort && parameters.sort.channel ? {sortChannel: parameters.sort.channel} : undefined),
      ...(parameters.sort && parameters.sort.sortingKey ? {sortingKey: parameters.sort.sortingKey} : undefined),

      ...buildRequestPaginationParameters(parameters.pagination),

      ...(parameters.campaignKey ? {campaignKey: parameters.campaignKey} : undefined),

      ...(parameters.includeSellableForFree ? {includeSellableForFree: parameters.includeSellableForFree} : undefined),

      ...(parameters.includeSoldOut ? {includeSoldOut: parameters.includeSoldOut} : undefined),

      ...(parameters.minProductId ? {minProductId: parameters.minProductId} : undefined),
    },
  };
}
