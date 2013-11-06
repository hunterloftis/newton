setup:
	bower install

dev:
	grunt dev

build:
	grunt build

gh-pages:
	@git commit -m "publish" || true
	@git push github master:gh-pages --force

readme:
	@git commit -am 'updated readme' || true
	@git push github master
