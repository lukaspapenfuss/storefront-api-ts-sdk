import {BapiCall} from '../../helpers/execute';
import {ProductWith, productWithQueryParameterValues} from '../../types/ProductWith';
import {Product} from '../../types/Product';
import {Category} from '../../types/Category';

export interface SearchSuggestionsEndpointParameters {
  term: string;

  campaignKey?: string;

  with?: {
    brands?: 'all';
    categories?: 'all';
    productNames?: 'all';
    products?: 'all' | ProductWith;
  };
}

export type SearchSuggestionsEndpointResponseData = {
  brands: Array<{
    id: number;
    label: string;
    value: string;
  }>;

  categories: Array<Category>;

  productNames: Array<{
    term: string;
  }>;

  products: Array<Product>;
};

function suggetionsWithQueryParameter(
  suggestionsWith: Exclude<SearchSuggestionsEndpointParameters['with'], undefined>,
): string[] {
  const withParams = [];

  if (suggestionsWith.products && typeof suggestionsWith.products === 'object') {
    withParams.push(...productWithQueryParameterValues(suggestionsWith.products).map(value => `products.${value}`));
  }

  return withParams;
}

export function createSearchSuggestionsEndpointRequest(
  parameters: SearchSuggestionsEndpointParameters,
): BapiCall<SearchSuggestionsEndpointResponseData> {
  const topLevelIncludes: string[] = [];
  if (parameters.with) {
    if (parameters.with.brands) {
      topLevelIncludes.push('brands');
    }
    if (parameters.with.categories) {
      topLevelIncludes.push('categories');
    }
    if (parameters.with.productNames) {
      topLevelIncludes.push('productNames');
    }
    if (parameters.with.products) {
      topLevelIncludes.push('products');
    }
  }

  return {
    method: 'GET',
    endpoint: `/v1/search/suggestions`,
    params: {
      term: parameters.term,

      ...(parameters.campaignKey ? {campaignKey: parameters.campaignKey} : undefined),

      with: [topLevelIncludes, ...(parameters.with ? suggetionsWithQueryParameter(parameters.with) : [])].join(`,`),
    },
  };
}
