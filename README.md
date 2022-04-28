# k6-kibana-benchmarking
Space time benchmarking project with k6 tool

## Adding new tests
 - The test code is located in src folder
 - The entry points for the tests need to have "test" word in the name to distinguish them from auxiliary files.

## Running tests
 - Make sure Kibana is running and eCommerce sample data is loaded
 - Install dependencies and transpile typescript code into JS and bundle the project: `yarn install && yarn webpack`
 - Run your test:
    - using kibana.json in assets folder: `k6 run -e USE_KIBANA_JSON=1 dist/login_test.js`
    - by passing values directly: `k6 run -e KIBANA_USERNAME=elastic -e KIBANA_PASSWORD=changeme -e KIBANA_URL="http://localhost:5620" -e KIBANA_VERSION=8.3.0 dist/login_test.js`
