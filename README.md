# k6-kibana-benchmarking
Space time benchmarking project with k6 tool

## Adding new tests
 - The test code is located in src folder
 - The entry points for the tests need to have "test" word in the name to distinguish them from auxiliary files.

## Running tests
 - Make sure Kibana is running
 - Transpile typescript code into JS and bundle the project: `yarn webpack`
 - Run your test e.g. `k6 run dist/login-test.js`
