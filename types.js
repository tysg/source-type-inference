/* Types definition, type variables, and typed syntax tree nodes. */

/* Type Variables */

function init_fresh_type_var_counter() {
    let val = 0;
    function get_fresh_type_var() {
        val = val + 1;
        return val;
    }
    return get_fresh_type_var;
}

/** Gets a new type variable number upon function call. State-ful. */
const fresh_T_var = init_fresh_type_var_counter();
const fresh_A_var = init_fresh_type_var_counter();

function make_new_T_type(num) {
    return list("type_variable", "T", num);
}

function make_new_A_type(num) {
    return list("type_variable", "A", num);
}

/* meta types */
const T_type = list("meta", "T");
const A_type = list("meta", "A");

/* Primitive Types */
const bool_type = list("primitive", "bool");
const number_type = list("primitive", "number");
const undefined_type = list("primitive", "undefined");
const string_type = list("primitive", "string");

/* function type */
function make_function_type(param_types, return_type) {
    return list("function", param_types, return_type);
}

function param_types_of_fn_type(fn_type) {
    return list_ref(fn_type, 1);
}

function return_type_of_fn_type(fn_type) {
    return list_ref(fn_type, 2);
}
