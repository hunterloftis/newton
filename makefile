# Set up for local development
setup:
	bower install

# Build newton.js then watch source files for changes
dev:
	grunt dev

# Build newton.js
build:
	grunt build




# Publish to github, npm, & bower
publish:
	git push --set-upstream github master
	git config push.default upstream
	grunt publish

# Publish github pages
gh-pages:
	@git commit -m "publish" || true
	@git push github master:gh-pages --force

# Publish readme
readme:
	@git commit -am 'updated readme' || true
	@git push github master
