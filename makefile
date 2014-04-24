JADE = ./node_modules/.bin/jade

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
	cat dist/$(VERSION)/newton.js | node_modules/.bin/uglifyjs > dist/$(VERSION)/newton.min.js
	cp dist/$(VERSION)/* dist/current/
	sed -i '' 's/Download .*)/Download \($(VERSION)\)/g' index.html
	git add --all dist
	git add index.html
	git commit -m 'publishing version $(VERSION)'
	npm publish
	make pages

docs:
	mkdir -p dist/docs
	cp -r docs/styles dist/docs
	$(JADE) --path docs/guide.jade --pretty < docs/guide.jade > dist/docs/guide.html

pages:
	git push github master:gh-pages

test: install
	npm test

.PHONY: build docs examples lib node_modules old spec
