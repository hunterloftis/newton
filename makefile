clean:
	-rm -rf build
	mkdir -p build

install:
	npm install

build: clean install
	node_modules/.bin/browserify -d --standalone Newton index.js -o build/newton.js

watch: clean install
	node_modules/.bin/watchify -d --standalone Newton index.js -o build/newton.js

publish: install test
	@if [ "$(VERSION)" == "" ]; then echo "Error: try make publish VERSION=a.b.c\n"; exit 1; fi
	npm version $(VERSION)
	mkdir -p dist/$(VERSION)
	mkdir -p dist/current
	node_modules/.bin/browserify --standalone Newton index.js > dist/$(VERSION)/newton.js
	cat dist/newton.js | node_modules/.bin/uglifyjs > dist/$(VERSION)/newton.min.js
	cp dist/$(VERSION)/* dist/current/
	sed -i '' 's/Download .*)/Download \($(VERSION)\)/g' index.html
	npm publish

test: install
	npm test

.phony: build docs examples lib node_modules old spec
