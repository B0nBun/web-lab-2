.PHONY: start build deploy
.PHONY: check check.css check.js

# Build the project and deploy it to wildfly standalone
build: check
	mvn clean package && cp target/*.war $$JBOSS_HOME/standalone/deployments

# Start the wildfly server
start:
	bash $$JBOSS_HOME/bin/standalone.sh

# Send the files to helios
deploy: build
	helios send target/*.war /home/studs/s367181/custom/wildfly/standalone/deployments

# Check the .js and .css files
check: check.js check.css

SCRIPTS_DIR = src/main/resources/scripts/
JSFILES = $(wildcard $(SCRIPTS_DIR)*.js)
JSFILES += $(wildcard $(SCRIPTS_DIR)*.d.ts)
TSFLAGS = --strict true --noEmit --checkJs --lib 'esnext, dom, dom.iterable' --target 'esnext'

check.js:
	tsc $(TSFLAGS) $(JSFILES)
	npx prettier --tab-width 4 --write $(JSFILES)

CSSFILES = $(filter-out %pico.css, $(wildcard src/main/resources/styles/*.css))

check.css:
	npx stylelint $(CSSFILES);