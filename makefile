setup:
	bower install

build:
	grunt

gh-pages:
	@git commit -m "publish" || true
	@git push github master:gh-pages --force

readme:
	@git commit -am 'updated readme' || true
	@git push github master
