// implementation of union find set
/*
set() -> set
	returns an empty set.
get_key(x) -> str
	input: a (key, value) pair
	returns the key of x.
get_value(x) -> value
	input: a (key, value) pair
	returns the value of x.
set_insert(s, k, v) -> set
	returns a set that inserts (k, v) into s.
set_find(s, k) -> (key,value)
	returns the first (key, value) pair in s that has the same key as k.
set_remove(s, k) -> set
	returns a set that removes the first (key, value) pair in s that has the same key as k.
set_update(s, k, v) -> set
	returns a set that applies s[k] = v.
set_search(s, k) -> set
	finds the type of k and updates the set
set_union(s, v, t) -> set
	returns the union of v and t.
*/

function set() {
	return list();
}

function get_key(x) {
	if (head(head(x)) === "key") {
		return tail(head(x));
	}
	else {
		error("Input does not have a key");
	}
}

function get_value(x) {
	if (head(tail(x)) === "value") {
		return tail(tail(x));
	}
	else {
		error("Input does not have a value");
	}
}

function equal_variable(v1, v2) {
	if (head(v1) === "type_variable" && head(v2) === "type_variable") {
		return head(tail(tail(v1))) === head(tail(tail(v2)));
	}
	else {
		return false;
	}
}

function set_find(s, k) {
	if (is_null(s)) {
		return null;
	}
	else {
		if (equal_variable(get_key(head(s)), k)) {
			return head(s);
		}
		else {
			return set_find(tail(s), k);
		}
	}
}

function set_insert(s, k, v) {
	if (set_find(s, k) === null) {
		const key = pair("key", k);
		const value = pair("value", v);
		const element = pair(key, value);
		return append(s, list(element));
	}
	else {}
}

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

function set_update(s, k, v) {
	return set_insert(set_remove(s, k), k, v);
}

function set_search(s, k) {
	const pair = set_find(s, k);
	const v = get_key(pair);
	const t = get_value(pair);
	if (head(t) === "primitive" || equal_variable(v, t)) {
		return s;
	}
	else {
		const new_s = set_search(s, t);
		const new_t = get_value(set_find(new_s, t));
		return set_update(new_s, v, new_t);
	}
}

function set_union(s, v, t) {
// 	let union = s1;
// 	for (let i = s2; !is_null(i); i = tail(i)) {
// 		if (set_find(union, get_key(head(i))) === null) {
// 			union = set_insert(union, get_key(head(i)), get_value(head(i)));
// 		}
// 		else {
// 			if (get_value(head(i)) !== 
// 				get_value(set_find(union, get_key(head(i))))) {
// 				error("Different values for key: " +
// 					  get_key(head(i)));
// 			}
// 			else {}
// 		}
// 	}
	return set_update(s, v, t);
}

