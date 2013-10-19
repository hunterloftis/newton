gh-pages:
	@git commit -m "dist build" 2>/dev/null
	@git push github --delete gh-pages
	@git subtree push --prefix dist github gh-pages

