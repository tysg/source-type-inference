// Typed Term

/** Creates a new typed_term tagged list.
 * Like, Tau1 = BOOL
 */
function make_typed_term(type_var, type) {
    return list("typed_term", type_var, type);
}

function is_typed_term(stmt) {
    return is_tagged_list(stmt, "typed_term");
}
function type_var_of_typed_term(term) {
    return list_ref(term, 1);
}
function type_of_typed_term(term) {
    return list_ref(term, 2);
}

// Type Definitions
function is_type(stmt) {
    return is_tagged_list(stmt, "type");
}

const undefined_type = list("type", "undefined");

function new_bool_type(bool) {
    return list("type", "bool", bool);
}

function new_number_type(number) {
    return list("type", "number", number);
}

function new_if_type(pred_typed_term, cons_typed_term, alt_typed_term) {
    return list("type", "if", pred_typed_term, cons_typed_term, alt_typed_term);
}

function new_function_type(param_typed_term, return_typed_term) {
    // TODO: support multiple params
    return list("type", "function", param_typed_term, return_typed_term);
}

function new_let_type(name, value_typed_term) {
    return list("type", "let", name, value_typed_term);
}

/** A var type is the type of a bounded name */
function new_var_type(name) {
    return list("type", "var", name);
}
