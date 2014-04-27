JADE = ./node_modules/.bin/jade

clean:
	-rm -rf build
	mkdir -p build
	-rm -rf node_modules

install:
	npm install

serve:
	node_modules/.bin/static -p 8000 -c 1 build

watch: install
	node_modules/.bin/watchify -d -v --standalone Newton index.js -o build/newton.js

version: clean install test bump docs

bump:
	@if [ "$(VERSION)" == "" ]; then echo "Error: must set VERSION=a.b.c\n"; exit 1; fi
	npm version $(VERSION)
	mkdir -p dist/$(VERSION)
	node_modules/.bin/browserify --standalone Newton index.js > dist/$(VERSION)/newton.js
	cat dist/$(VERSION)/newton.js | node_modules/.bin/uglifyjs > dist/$(VERSION)/newton.min.js
	cp dist/$(VERSION)/* dist/current/

docs:
	mkdir -p dist/docs && cp -r docs/styles dist/docs
	$(JADE) --path docs/guide.jade --pretty < docs/guide.jade > dist/docs/guide.html
	$(JADE) --path docs/landing.jade --pretty -O package.json < docs/landing.jade > dist/index.html

publish:
	-git push
	-git subtree push --prefix dist github gh-pages
	@echo "Pushed to github. Use 'npm publish' to push to npm."

test: install
	npm test

.PHONY: build docs examples lib node_modules old spec
