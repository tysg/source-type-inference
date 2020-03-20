/** Creates a new typed_term tagged list. */
function make_typed_term(type_var, type, value) {
    return list("typed_term", type_var, type, value);
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
function value_of_typed_term(term) {
    return list_ref(term, 3);
}

function init_fresh_type_var() {
    let val = 0;
    function get_fresh_type_var() {
        val += 1;
        return val;
    }
    return get_fresh_type_var;
}

/** Gets a new type variable number. State-ful. */
const fresh_type_var = init_fresh_type_var();

// Type Definitions
function is_type(stmt) {
    return is_tagged_list(stmt, "type");
}
const bool_type = list("type", "bool");
const number_type = list("type", "number");
const undefined_type = list("type", "undefined");
function new_var_type() {
    return list("type", "var", fresh_type_var());
}

function new_function_type(param_types, return_type) {
    // TODO: support multiple params
    return list("type", "function", param_types, return_type);
}

function equal_type(type1, type2) {
    return;
}

function annotate(stmt, env) {
    return is_number(stmt)
    ? make_typed_term(fresh_type_var(), number_type, stmt)
    : is_boolean(stmt)
    ? make_typed_term(fresh_type_var(), bool_type, stmt)
    : is_undefined(stmt) // TODO: how does undefined types in the system
    ? make_typed_term(fresh_type_var(), undefined_type, stmt)
    : is_name(stmt)
    ? annotate_name(stmt, env)
    // WIP


}
