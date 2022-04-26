import { check } from 'k6';
import { Options } from 'k6/options';

import http from 'k6/http';

export let options:Options = {
  vus: 10,
  duration: '5s'
};

const auth = {
  baseUrl: 'http://localhost:5620',
  username: 'elastic',
  password: 'changeme',
  version: '8.3.0-SNAPSHOT',
}

const authHeaders = {
  'content-type': 'application/json',
  'kbn-version': auth.version,
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
};

const loginUrl = auth.baseUrl + '/internal/security/login';
const provider = auth.baseUrl.includes('localhost') ? 'basic' : 'cloud-basic';

const authBody = {
  providerType: 'basic',
  providerName: provider,
  currentURL: `${auth.baseUrl}/login?next=%2F`,
  params: { username: auth.username, password: auth.password },
};



export default () => {
  const res = http.post(loginUrl, JSON.stringify(authBody), {headers: authHeaders});
  check(res, {
    'status is 200': () => res.status === 400,
  });
};