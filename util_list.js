/**
 * Returns a clean string representation of a list. Experimental.
 * @param {'a list} lst
 */
function display_list(lst) {
    if (is_null(lst)) {
        return "";
    } else if (
        is_number(lst) ||
        is_boolean(lst) ||
        is_undefined(lst) ||
        is_string(lst)
    ) {
        return stringify(lst);
    } else {
        let result = display_list(head(lst));
        let ptr = tail(lst);
        while (!is_null(ptr)) {
            result = result + ", " + display_list(head(ptr));
            ptr = tail(ptr);
        }

        return "[" + result + "]";
    }
}

/**
 * Adds val to location at index in lst. Returns a new list.
 * @param {[a]} lst
 * @param {number} index
 * @param {a} val
 */
function list_add(lst, index, val) {
    return index === 0
        ? pair(val, lst)
        : pair(head(lst), list_add(tail(lst), index - 1, val));
}

list_add;
