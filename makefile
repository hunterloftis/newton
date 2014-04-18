install:
	npm install

watch: install
	watchify index.js > build/newton.js

dist: install
	browserify index.js > dist/newton.js
	cat dist/newton.js > uglify > dist/newton.min.js

test: install
	node_modules/.bin/mocha spec/*.spec.js

.phony: build docs examples lib node_modules old spec
