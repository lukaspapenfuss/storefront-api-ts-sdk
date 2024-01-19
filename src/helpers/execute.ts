import {BapiCall} from '../interfaces/BapiCall';
import {ObjectMap} from '../types/ObjectMap';
import * as queryString from 'query-string';
import {BapiAuthentication} from './BapiClient';
import {FetchError} from './FetchError';

export const getParamsString = (params?: Partial<Record<string, any>>) => {
  if (!params) {
    return '';
  }

  const query = queryString.stringify(
    params as object,
    {
      arrayFormat: 'bracket',
      sort: false,
    } as any,
  );

  if (query) {
    return '?' + query;
  }

  return '';
};

function prepareUrl(
  apiBase: string,
  endpoint: string,
  params: Partial<Record<string, string>> | undefined,
) {
  if (endpoint.includes('/v2/')) {
    return apiBase.replace('/v1/', '') + endpoint + getParamsString(params);
  }
  return apiBase + endpoint + getParamsString(params);
}

export interface BapiResponse<T> {
  statusCode: number;
  headers: {[key: string]: string | undefined};
  url: string;
  data: T;
}

export async function execute<SuccessResponseT>(
  apiLocation: string,
  shopId: number,
  bapiCall: BapiCall<SuccessResponseT>,
  acceptAllResponseCodes = false,
  shopIdPlacement: 'header' | 'query' = 'query',
  auth?: BapiAuthentication,
  additionalHeaders?: ObjectMap<string>,
): Promise<BapiResponse<SuccessResponseT>> {
  const params =
    shopIdPlacement === 'query'
      ? {...bapiCall.params, shopId: shopId}
      : bapiCall.params;

  const url = prepareUrl(apiLocation, bapiCall.endpoint, params);

  const shopIdHeader =
    shopIdPlacement === 'header' ? {'X-Shop-Id': `${shopId}`} : undefined;

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(typeof window === 'undefined'
        ? {'accept-encoding': 'gzip, deflate'}
        : undefined),
      ...shopIdHeader,
      ...additionalHeaders,
      ...(auth && auth.type === 'token' ? {'X-Access-Token': auth.token} : {}),
      ...(auth && auth.type === 'basic'
        ? {Authorization: 'Basic ' + btoa(auth.username + ':' + auth.password)}
        : {}),
    },
    method: bapiCall.method,
    body:
      bapiCall.method === 'POST' || bapiCall.method === 'PATCH'
        ? JSON.stringify(bapiCall.data)
        : undefined,
  });

  if (!response.ok && !acceptAllResponseCodes) {
    throw new FetchError(response);
  }

  const headers: {[key: string]: string | undefined} = {};
  response.headers.forEach((val, key) => (headers[key] = val));

  // Hack for 204 responses
  if (response.status === 204) {
    return {
      data: undefined as SuccessResponseT,
      statusCode: response.status,
      url: response.url || url,
      headers,
    };
  }

  const data = await response.json();

  if (bapiCall.responseValidator && !bapiCall.responseValidator(data)) {
    throw new Error(`Invalid response data`);
  }

  return {
    data,
    statusCode: response.status,
    url: response.url || url,
    headers,
  };
}
