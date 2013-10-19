gh-pages:
	@git commit -m "dist build" || true
	@git push github --delete gh-pages || true
	@git push github gh-pages

