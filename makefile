setup:
	git branch --set-upstream github
	git config push.default upstream
	bower install

dev:
	grunt dev

build:
	grunt build

publish:
	grunt publish

gh-pages:
	@git commit -m "publish" || true
	@git push github master:gh-pages --force

readme:
	@git commit -am 'updated readme' || true
	@git push github master
