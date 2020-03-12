/** Creates a new typed_term tagged list. */
// TODO: clarify value
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

/** Gets a new type variable number upon function call. State-ful. */
const fresh_type_var = init_fresh_type_var();

// Type Definitions
function is_type(stmt) {
    return is_tagged_list(stmt, "type");
}
const bool_type = list("type", "bool");
const number_type = list("type", "number");
const undefined_type = list("type", "undefined");
/** A var type is the type of a bounded name */
const var_type = list("type", "var");
const let_type = list("type", "let");

function new_function_type(param_types, return_type) {
    // TODO: support multiple params
    return list("type", "function", param_types, return_type);
}

function new_let

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
    : is_constant_declaration(stmt, env)
    ? 

}

function annotate_name(stmt, env) {
    // TODO: complete this

}

function annotate_constant_declaration(stmt, env) {
    const name = constant_declaration_name(stmt);
    const val = constant_declaration_value(stmt);

    if (is_function_definition(val)) {
        const parameters = function_definition_parameters(val);
        const body = function_definition_body(val);

        const typed_params = map(
            x=>make_typed_term(fresh_type_var(), var_type,x),
            parameters);

        // extend env to evaluate function body
        const locals = local_names(body);
        const extended_env = extend_environment(
            locals,
            map(x => no_type_yet, locals),
            extend_environment(parameters, typed_params, env) );
        
        const function_def_type = make_typed_term(
            fresh_type_var(), new_function_type(
                annotate(parameters, env),
                annotate(body, extended_env)));

        set_type(name, function_def_type, env);
        return make_typed_term(fresh_type_var, let_type, function_def_type);
    } else {
        // bind that variable in the env
        const value_type = annotate(val,env);
        set_type(
            name_of_name(type_declaration_name(stmt)),
            value_type,
            env
        )
        return make_typed_term(fresh_type_var(), let_type, value_type);
    }
}
