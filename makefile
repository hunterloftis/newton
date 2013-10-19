gh-pages:
	@git commit -m "publish" || true
	@git push github master:gh-pages --force
