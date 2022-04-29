# k6-kibana-benchmarking
Space time benchmarking project with k6 tool

## Adding new tests
 - The test code is located in src folder
 - The entry points for the tests need to have "test" word in the name to distinguish them from auxiliary files.

## Running tests

### Prerequisites

 - Make sure Kibana is running and eCommerce sample data is loaded

### Directly with k6

 - Install dependencies and transpile typescript code into JS and bundle the project: `make build`
 - Run your test:
    - using kibana.json in assets folder: `k6 run -e USE_KIBANA_JSON=1 dist/login_test.js`
    - by passing values directly: `k6 run -e KIBANA_USERNAME=elastic -e KIBANA_PASSWORD=changeme -e KIBANA_URL="http://localhost:5620" -e KIBANA_VERSION=8.3.0 dist/login_test.js`
## Running tests directly with k6

 - Ensure that Vault is properly setup
 - Ensure that Go 1.17 or better is installed and `GOPATH` is on your path (add `export PATH=$PATH:$(go env GOPATH)/bin` to `~/.profile` or `~/.zprofile`).
 - Run your test:
    - Running all load tests: `./k6.sh`
    - Running only a specific test: `./k6.sh login_test`. Note that the test name must be passed without any file extension (i.e. pass `login_test` but not `login_test.ts`).

The file `assets/kibana.json` defines the connection parameters to Kibana.