#!/usr/bin/env bash

# fail this script immediately if any command fails with a non-zero exit code
set -eu

LOAD_TEST_ENV="${LOAD_TEST_ENV:-local}"

run_single_test () {
        load_test=$1
        execution_id=$(uuidgen)

        echo "Running $load_test in $LOAD_TEST_ENV (id: $execution_id)..."
        # Phase 1 - warmup with a single user
        .k6/k6 run -e USE_KIBANA_JSON=1 "$load_test" --quiet --vus 1 -o output-elasticsearch --tag user=$USER --tag run-id=${execution_id} --tag env=${LOAD_TEST_ENV} --tag phase=warmup
        # Phase 2 - actual measurement
        .k6/k6 run -e USE_KIBANA_JSON=1 "$load_test" -o output-elasticsearch --tag user=$USER --tag run-id=${execution_id} --tag env=${LOAD_TEST_ENV} --tag phase=measure
}


run_load_tests () {
    export K6_ELASTICSEARCH_CLOUD_ID="$(vault read -field=cloud_id /secret/performance/employees/cloud/k6-metrics)"
    export K6_ELASTICSEARCH_USER="$(vault read -field=es_username /secret/performance/employees/cloud/k6-metrics)"
    export K6_ELASTICSEARCH_PASSWORD="$(vault read -field=es_password /secret/performance/employees/cloud/k6-metrics)"

    # run all tests if no arguments are provided or run a specific test
    if [[ $# -eq 1 ]]; then
        run_single_test "dist/$1.js"
    else
        for load_test in dist/*.js; do
            run_single_test $load_test
        done
    fi
}

make
run_load_tests $@
