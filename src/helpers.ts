import { check  } from 'k6';
import { RefinedResponse, ResponseType } from 'k6/http';
//@ts-ignore
import { URL } from 'https://jslib.k6.io/url/1.0.0/index.js';
import kibanaJson from './../assets/kibana.json';

export const checkStatus = (response: RefinedResponse<ResponseType | undefined>, status: number, message: string) => {
  check(response, {[message]: () => response.status === status});
}

const readMandatoryEnvVar = (envName: string) => {
  const value = __ENV[envName];
  if (!value) {
    throw Error(`Set '${envName}' env var`);
  }
  return value;
}

export const getAuth = () => {
  if (__ENV.USE_KIBANA_JSON) {
    return kibanaJson;
  }
  return {
    baseUrl: readMandatoryEnvVar('KIBANA_URL'), 
    username: readMandatoryEnvVar('KIBANA_USERNAME'),
    password: readMandatoryEnvVar('KIBANA_PASSWORD'),
    version: readMandatoryEnvVar('KIBANA_VERSION')
  }
}

interface Auth {
  baseUrl: string,
  username: string,
  password: string,
  version: string,
}

export const getAuthBody = (auth: Auth) => {
  const provider = auth.baseUrl.includes('localhost') ? 'basic' : 'cloud-basic';
  return JSON.stringify({
    providerType: 'basic',
    providerName: provider,
    currentURL: `${auth.baseUrl}/login?next=%2F`,
    params: { username: auth.username, password: auth.password },
  });
}

export const getAuthHeaders = (version: string) => {
  return {
    'content-type': 'application/json',
    'kbn-version': version,
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
  };
}

interface SearchParam {
  [key: string]: string | string [];
}

export const buildUrlWithQuery = (baseUrl: string, params: Array<SearchParam>): string  => {
  const url = new URL(baseUrl);
  params.forEach(obj => Object.keys(obj).forEach(key => url.searchParams.append(key, obj[key])));
  return url.toString();
}