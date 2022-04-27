import { Options } from 'k6/options';
import { checkStatus, getAuth, getAuthBody, getAuthHeaders } from './helpers';
import http from 'k6/http';

const auth = getAuth();
const loginUrl = auth.baseUrl + '/internal/security/login';

export let options:Options = {
  vus: 10,
  duration: '5s'
};

export default () => {
  const authRes = http.post(loginUrl, getAuthBody(auth), {headers: getAuthHeaders(auth.version)});
  checkStatus(authRes, 200, `POST '${loginUrl}' passed`);
};