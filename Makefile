include .env
export
.PHONY: pack run

pack:
	mkdir -p build
	python3 scripts/pack.py

run:
	node $(JS_SLANG) ./build/type_inferred_source.js
