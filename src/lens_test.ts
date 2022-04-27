import { Options } from 'k6/options';
import http from 'k6/http';
import { checkStatus, getAuth, buildUrlWithQuery, getAuthBody, getAuthHeaders } from './helpers';
//@ts-ignore
import { uuidv4 } from "https://jslib.k6.io/k6-utils/1.0.0/index.js";

export let options:Options = {
  vus: 1,
  duration: '2s'
};

const auth = getAuth();

const loginUrl = auth.baseUrl + '/internal/security/login';
const bulkResolveUrl = auth.baseUrl + '/api/saved_objects/_bulk_resolve';
const indexPatternFieldsUrl = auth.baseUrl + '/api/index_patterns/_fields_for_wildcard';
const lensExistingFieldsUrl = auth.baseUrl + '/api/lens/existing_fields';
const bsearchUrl = auth.baseUrl + '/internal/bsearch';
const visId = 'c762b7a0-f5ea-11eb-a78e-83aac3c38a60';
const indexPatternId = 'ff959d40-b880-11e8-a6d9-e546fe2bba5f';

export default () => {
  const authRes = http.post(loginUrl, getAuthBody(auth), {headers: getAuthHeaders(auth.version)});
  checkStatus(authRes, 200, `POST '${loginUrl}' passed`);

  const soVizRes = http.post(bulkResolveUrl, `[{\"id\":\"${visId}\",\"type\":\"lens\"}]`, {headers: {'kbn-xsrf':'xsrf'}});
  checkStatus(soVizRes, 200, `POST '${bulkResolveUrl} visId' passed`);

  const soIPRes = http.post(bulkResolveUrl, `[{\"id\":\"${indexPatternId}\",\"type\":\"index-pattern\"}]`, {headers: {'kbn-xsrf':'xsrf'}});
  checkStatus(soIPRes, 200, `POST '${bulkResolveUrl} indexPatternId' passed`);

  const urlWithQueryParams = buildUrlWithQuery(indexPatternFieldsUrl,
    [
      {'pattern': 'kibana_sample_data_ecommerce'},
      {'meta_fields': '_source'},
      {'meta_fields': '_id'},
      {'meta_fields': '_type'},
      {'meta_fields': '_index'},
      {'meta_fields': '_score'},
    ]
  ); 
  const ipFieldsRes = http.get(urlWithQueryParams);
  checkStatus(ipFieldsRes, 200, `GET '${indexPatternFieldsUrl}' passed`);

  const endTime = new Date();
  const startTime = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate() - 7);
  const lensBody =
  `{
    "dslQuery":{
      "bool":{
        "must":[
  
        ],
        "filter":[
  
        ],
        "should":[
  
        ],
        "must_not":[
  
        ]
      }
    },
    "fromDate":"${startTime.toISOString()}",
    "toDate":"${endTime.toISOString()}",
    "timeFieldName":"order_date"
  }`
  const lensFieldsRes = http.post(`${lensExistingFieldsUrl}/${indexPatternId}`, lensBody, {headers: {'kbn-xsrf':'xsrf'}});
  checkStatus(lensFieldsRes, 200, `POST '${lensExistingFieldsUrl}/${indexPatternId}' passed`);

  const sessionId = uuidv4();
  console.log(sessionId);
  const bsearchBody =
  `{
    "batch":[
      {
        "request":{
          "params":{
            "index":"kibana_sample_data_ecommerce",
            "body":{
              "aggs":{
                "0":{
                  "date_histogram":{
                    "field":"order_date",
                    "calendar_interval":"1d",
                    "time_zone":"Europe/Berlin"
                  },
                  "aggs":{
                    "1":{
                      "sum":{
                        "field":"taxful_total_price"
                      }
                    }
                  }
                }
              },
              "size":0,
              "fields":[
                {
                  "field":"customer_birth_date",
                  "format":"date_time"
                },
                {
                  "field":"order_date",
                  "format":"date_time"
                },
                {
                  "field":"products.created_on",
                  "format":"date_time"
                }
              ],
              "script_fields":{
  
              },
              "stored_fields":[
                "*"
              ],
              "runtime_mappings":{
  
              },
              "_source":{
                "excludes":[
  
                ]
              },
              "query":{
                "bool":{
                  "must":[
  
                  ],
                  "filter":[
                    {
                      "range":{
                        "order_date":{
                          "gte":"${startTime}",
                          "lte":"${endTime}",
                          "format":"strict_date_optional_time"
                        }
                      }
                    }
                  ],
                  "should":[
  
                  ],
                  "must_not":[
  
                  ]
                }
              }
            },
            "preference":1629196319331
          }
        },
        "options":{
          "sessionId":"${sessionId}",
          "isRestore":false,
          "strategy":"ese",
          "isStored":false
        }
      },
      {
        "request":{
          "params":{
            "index":"kibana_sample_data_ecommerce",
            "body":{
              "aggs":{
                "0":{
                  "sum":{
                    "field":"taxful_total_price"
                  }
                }
              },
              "size":0,
              "fields":[
                {
                  "field":"customer_birth_date",
                  "format":"date_time"
                },
                {
                  "field":"order_date",
                  "format":"date_time"
                },
                {
                  "field":"products.created_on",
                  "format":"date_time"
                }
              ],
              "script_fields":{
  
              },
              "stored_fields":[
                "*"
              ],
              "runtime_mappings":{
  
              },
              "_source":{
                "excludes":[
  
                ]
              },
              "query":{
                "bool":{
                  "must":[
  
                  ],
                  "filter":[
                    {
                      "range":{
                        "order_date":{
                          "gte":"${startTime}",
                          "lte":"${endTime}",
                          "format":"strict_date_optional_time"
                        }
                      }
                    }
                  ],
                  "should":[
  
                  ],
                  "must_not":[
  
                  ]
                }
              }
            },
            "preference":1629196319331
          }
        },
        "options":{
          "sessionId":"${sessionId}",
          "isRestore":false,
          "strategy":"ese",
          "isStored":false
        }
      }
    ]
  }`
  const bsearchRes = http.post(buildUrlWithQuery(bsearchUrl, [{'compress': 'true'}]), bsearchBody, {headers: {'kbn-xsrf':'xsrf'}});
  checkStatus(bsearchRes, 200, `POST '${bsearchUrl}' passed`);
};
