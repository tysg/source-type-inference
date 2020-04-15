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
    return index === 0 || is_null(lst)
        ? pair(val, lst)
        : pair(head(lst), list_add(tail(lst), index - 1, val));
}

/**
 * Sets the element at index in the lst to val. Mutates the list.
 * Returns true when the value is successfully set.
 * @param {[a]} lst
 * @param {number} index
 * @param {a} val
 * @returns {boolean}
 */
function list_set(lst, index, val) {
    if (is_null(lst)) {
        return false;
    } else {
        if (index === 0) {
            set_head(lst, val);
            return true;
        } else {
            return list_set(tail(lst), index - 1, val);
        }
    }
}

/**
 * Applies a function to the specified element in the list. Mutates the list.
 * Returns true when the value is successfully set.
 * @param {[a]} lst
 * @param {number} index
 * @param {a} val
 * @returns {boolean}
 */
function list_map_at(lst, index, f) {
    if (is_null(lst)) {
        return false;
    } else {
        if (index === 0) {
            set_head(lst, f(head(lst)));
            return true;
        } else {
            return list_map_at(tail(lst), index - 1, f);
        }
    }
}
