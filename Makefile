MAKEFLAGS += --silent

YARN_MISSING_HELP = "\033[0;31mIMPORTANT\033[0m: Couldn't find yarn. Please install it first.\033[0m\n"

YARN := $(shell command -v yarn 2> /dev/null)

all: clean build install-k6-es

## check-prereq: Checks that required sofware is installed
check-prereq:
ifndef YARN
	printf $(YARN_MISSING_HELP)
	exit 1
endif


## help: Prints a list of available build targets.
help:
	echo "Usage: make <OPTIONS> ... <TARGETS>"
	echo ""
	echo "Available targets are:"
	echo ''
	sed -n 's/^##//p' ${PWD}/Makefile | column -t -s ':' | sed -e 's/^/ /'
	echo
	echo "Targets run by default are: `sed -n 's/^all: //p' ./Makefile | sed -e 's/ /, /g' | sed -e 's/\(.*\), /\1, and /'`"

## clean: Removes any previously created build artifacts.
clean:
	rm -rf .k6 dist

## install-k6-es: Installs k6 with the Elasticsearch connector
install-k6-es:
	@if [[ ! -d ".k6" ]]; then \
		git clone git@github.com:elastic/xk6-output-elasticsearch.git .k6 ; \
	else \
		git -C .k6 pull --rebase ; \
	fi;
	cd .k6 && $(MAKE)

## build: Builds load tests
build: check-prereq
	yarn install
	yarn webpack

.PHONY: check-prereq build install-k6-es clean help
