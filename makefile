clean:
	-rm -rf build
	mkdir -p build

install:
	npm install

build: clean install
	node_modules/.bin/browserify --standalone Newton index.js -o build/newton.js

watch: clean install
	node_modules/.bin/watchify --standalone Newton index.js -o build/newton.js

dist: install
	-rm -rf dist
	mkdir -p dist
	node_modules/.bin/browserify --standalone Newton index.js > dist/newton.js
	cat dist/newton.js | node_modules/.bin/uglifyjs > dist/newton.min.js

test: install
	npm test

.phony: build docs examples lib node_modules old spec
