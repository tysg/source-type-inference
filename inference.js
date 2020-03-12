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

const undefined_type = list("type", "undefined");

function new_bool_type(bool) {
    return list("type", "bool", bool);
}

function new_number_type(number)  {
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


function annotate(stmt, env) {
    return is_number(stmt)
    ? make_typed_term(fresh_type_var(), number_type, stmt)
    : is_boolean(stmt)
    ? make_typed_term(fresh_type_var(), bool_type, stmt)
    : is_undefined(stmt) // TODO: how does undefined types in the system
    ? make_typed_term(fresh_type_var(), undefined_type, stmt)
    : is_name(stmt)
    ? annotate_name(stmt, env)
    : is_constant_declaration(stmt, env)
    ? annotate_constant_declaration(stmt, env)
    : is_conditional_expression(stmt, env)
    ? annotate_conditional_expression(stmt, env)

}

function annotate_name(stmt, env) {
    // TODO: complete this

}

function annotate_conditional_expression(stmt, env) {
    const pred_type = type(cond_expr_pred(stmt), env);
    const cons_type = type(cond_expr_cons(stmt), env);
    const alt_type = type(cond_expr_alt(stmt), env);


}

/**
 * Returns a TypedTerm
 */
function annotate_constant_declaration(stmt, env) {
    const name = constant_declaration_name(stmt);
    const val = constant_declaration_value(stmt);

    if (is_function_definition(val)) {
        const parameters = function_definition_parameters(val);
        const body = function_definition_body(val);

        const typed_params = map(
            x=>make_typed_term(fresh_type_var(), new_var_type(x)),
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
        return make_typed_term(fresh_type_var(), new_let_type(name, function_def_type));
    } else {
        // bind that variable in the env
        const value_typed_term = annotate(val,env);
        set_type(
            name,
            value_typed_term,
            env
        )
        return make_typed_term(fresh_type_var(), new_let_type(name, value_typed_term));
    }
}
