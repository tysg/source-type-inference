/* Types definition, type variables, and typed syntax tree nodes. */

/* Primitive Types */
const bool_type = list("primitive", "bool");
const number_type = list("primitive", "number");
const undefined_type = list("primitive", "undefined");
const string_type = list("primitive", "string");

function make_function_type(param_types, return_type) {
    return list("function", param_types, return_type);
}
