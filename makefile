gh-pages:
	@git commit -m "publish" || true
	@git push github gh-pages --force
