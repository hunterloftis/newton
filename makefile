gh-pages:
	@git commit -m "dist build" || true
	@git checkout master
	@git checkout -B gh-pages
	@git push github gh-pages --force
	@git checkout master
