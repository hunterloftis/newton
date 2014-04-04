# Set up for local development
setup:
	npm install

# Build newton.js then watch source files for changes
dev:
	node_modules/.bin/watchify index.js -o build/newton.js

# Build newton.js
build:
	grunt build

# Unit tests
test-unit:
	node_modules/.bin/mocha test/unit/*.test.js

# Performance tests
test-perf:
	node_modules/.bin/matcha

# All tests
test: test-unit test-perf

# Publish to github, npm, & bower
publish:
	git push --set-upstream github master
	git config push.default upstream
	grunt publish

# Publish github pages
gh-pages:
	@git commit -m "publish" || true
	@git push github master:gh-pages --force

# Publish readme & API reference
readme:
	@git commit -am 'updated docs' || true
	@git push github master
