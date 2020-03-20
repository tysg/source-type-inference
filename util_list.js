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

// function _test_display_list() {
// }

function list_add(lst, index, val) {
    return index === 0
        ? pair(val, lst)
        : pair(head(lst), list_add(tail(lst), index - 1, val));
}

function test_list_add() {
    let lst = list(1, 2, 3);
    lst = list_add(lst, 3, 4);
    display(lst);
}

const P = parse("const a = 1;");
display_list(P);
