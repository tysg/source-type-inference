// implementations of set

/**
 * set() -> set.
 * 	returns an empty set.
 */
function set() {
	return list();
}

/**
 *  get_key(x) -> str.
 * 	input: a (key, value) pair,
 * 	returns the key of x. 
 */
function get_key(x) {
	if (head(head(x)) === "key") {
		return tail(head(x));
	}
	else {
		error("Input does not have a key");
	}
}

/**
 * 
 * get_value(x) -> value.
 * 	input: a (key, value) pair,
 * 	returns the value of x.
 */
function get_value(x) {
	if (head(tail(x)) === "value") {
		return tail(tail(x));
	}
	else {
		error("Input does not have a value");
	}
}

/**
 * set_find(s, k) -> (key,value).
 * 	returns the first (key, value) pair in s that has the same key as k.
 */
function set_find(s, k) {
	if (is_null(s)) {
		return null;
	}
	else if (get_key(head(s)) === k) {
		return head(s);
	}
	else {
		return set_find(tail(s), k);
	}
}

/**
 * 
 *  set_insert(s, k, v) -> set.
 *	returns a set that inserts (k, v) into s.
 * 
 */
function set_insert(s, k, v) {
	if (set_find(s, k) === null) {
		const key = pair("key", k);
		const value = pair("value", v);
		const element = pair(key, value);
		return append(s, list(element));
	}
	else {
		if (get_value(set_find(s, k)) === v) {}
		else {
			error("Already exists '" + k + "' : "
				  + stringify(get_value(set_find(s, k))));
		}
	}
}

/** 
 * set_remove(s, k) -> set
 * 	returns a set that removes the first (key, value) pair in s that has the same key as k.
 */
function set_remove(s, k) {
	if (is_null(s)) {
		return null;
	}
	else if (get_key(head(s)) === k) {
		return tail(s);
	}
	else {
		return append(list(head(s)), set_remove(tail(s), k));
	}
}

/**
 *  set_insert(s, k, v) -> set.
 *	returns a set that inserts (k, v) into s.
 * 
 */
function set_update(s, k, v) {
	return set_insert(set_remove(s, k), k, v);
}

/** 
 * set_union(s1, s2) -> set.
 * 	returns the union of s1 and s2.
 */
function set_union(s1, s2) {
	let union = s1;
	for (let i = s2; !is_null(i); i = tail(i)) {
		if (set_find(union, get_key(head(i))) === null) {
			union = set_insert(union, get_key(head(i)), get_value(head(i)));
		}
		else {
			if (get_value(head(i)) !== 
				get_value(set_find(union, get_key(head(i))))) {
				error("Different values for key: " +
					  get_key(head(i)));
			}
			else {}
		}
	}
	return union;
}

/*
// tests
let x = set();
x = set_insert(x, 'a', 1);
display(x);
x = set_insert(x, 'b', 2);
display(x);
x = set_insert(x, 'c', 3);
display(x);

display(set_find(x, "c"));

x = set_remove(x, "a");
display(x);

x = set_update(x, "c", 4);
display(x);

let y = set();
y = set_insert(y, 'a', 1);
y = set_insert(y, 'd', 3);
display(y);

y = set_union(x, y);
display(y);

y = set_insert(y, 'a', 0);
*/



