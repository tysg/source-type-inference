include .env
export
.PHONY: pack run

format:
	./node_modules/.bin/prettier --write . --tab-width 4 "*.js"

pack:
	mkdir -p build
	python3 scripts/pack.py

run:
	node $(JS_SLANG) ./build/type_inferred_source
