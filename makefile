JADE = ./node_modules/.bin/jade

clean:
	-rm -rf build
	mkdir -p build

install:
	npm install

watch: clean install
	node_modules/.bin/watchify -d --standalone Newton index.js -o build/newton.js

dist: install test
	@if [ "$(VERSION)" == "" ]; then echo "Error: try make publish VERSION=a.b.c\n"; exit 1; fi
	npm version $(VERSION)
	mkdir -p dist/$(VERSION)
	node_modules/.bin/browserify --standalone Newton index.js > dist/$(VERSION)/newton.js
	cat dist/$(VERSION)/newton.js | node_modules/.bin/uglifyjs > dist/$(VERSION)/newton.min.js
	cp dist/$(VERSION)/* dist/current/

docs:
	mkdir -p dist/docs && cp -r docs/styles dist/docs
	$(JADE) --path docs/guide.jade --pretty < docs/guide.jade > dist/docs/guide.html
	$(JADE) --path docs/landing.jade --pretty < docs/landing.jade > dist/index.html

pages: docs
	git subtree push --prefix dist github gh-pages

test: install
	npm test

.PHONY: build docs examples lib node_modules old spec
