function set_insert(s, p) {
    return set_contain(s, p) ? s : pair(p, s);
    // list_add(s, length(s) - 1, p);
}

function set_contain(s, p) {
    return is_null(s)
        ? false
        : equal(head(s), p)
        ? true
        : set_contain(tail(s), p);
}

/** Return the key-value pair, null if not found*/
function set_find_key(s, h) {
    const res = filter((p) => equal(head(p), h), s);
    return is_null(res) ? null : head(res);
}

/** Return the key-value pair, null if not found */
function set_find_val(s, v) {
    const res = filter((p) => equal(tail(p), v), s);
    return is_null(res) ? null : head(res);
}
