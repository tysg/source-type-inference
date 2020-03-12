function init_fresh_type_var() {
    let val = 0;
    function get_fresh_type_var() {
        val = val + 1;
        return val;
    }
    return get_fresh_type_var;
}

/** Gets a new type variable number upon function call. State-ful. */
const fresh_type_var = init_fresh_type_var();

function annotate(stmt, env) {
    return is_number(stmt)
        ? make_typed_term(fresh_type_var(), new_number_type(stmt))
        : is_boolean(stmt)
        ? make_typed_term(fresh_type_var(), new_bool_type(stmt))
        : is_undefined(stmt) // TODO: how does undefined types in the system
        ? make_typed_term(fresh_type_var(), undefined_type)
        : // : is_name(stmt)
        // ? annotate_name(stmt, env)
        is_constant_declaration(stmt)
        ? annotate_constant_declaration(stmt, env)
        : is_conditional_expression(stmt)
        ? annotate_conditional_expression(stmt, env)
        : error(stmt, "Unknown statement type in evaluate: ");
}

function annotate_name(stmt, env) {
    // TODO: complete this
}

function annotate_conditional_expression(stmt, env) {
    const pred_typed_term = annotate(cond_expr_pred(stmt), env);
    const cons_typed_term = annotate(cond_expr_cons(stmt), env);
    const alt_typed_term = annotate(cond_expr_alt(stmt), env);

    return make_typed_term(
        fresh_type_var(),
        new_if_type(pred_typed_term, cons_typed_term, alt_typed_term)
    );
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
            x => make_typed_term(fresh_type_var(), new_var_type(x)),
            parameters
        );

        // extend env to evaluate function body
        const locals = local_names(body);
        const extended_env = extend_environment(
            locals,
            map(x => no_type_yet, locals),
            extend_environment(parameters, typed_params, env)
        );

        const function_def_type = make_typed_term(
            fresh_type_var(),
            new_function_type(
                annotate(parameters, env),
                annotate(body, extended_env)
            )
        );

        set_type(name, function_def_type, env);
        return make_typed_term(
            fresh_type_var(),
            new_let_type(name, function_def_type)
        );
    } else {
        // bind that variable in the env
        const value_typed_term = annotate(val, env);
        set_type(name, value_typed_term, env);
        return make_typed_term(
            fresh_type_var(),
            new_let_type(name, value_typed_term)
        );
    }
}
