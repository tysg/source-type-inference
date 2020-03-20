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
        ? make_number_node(stmt)
        : is_boolean(stmt)
        ? make_boolean_node(stmt)
        : is_undefined(stmt)
        ? make_undefined_node()
        : is_string(stmt)
        ? make_string_node(stmt)
        : is_name(stmt)
        ? annotate_name(stmt, env)
        : is_constant_declaration(stmt)
        ? annotate_constant_declaration(stmt, env)
        : // TODO
        ;
}

function annotate_name(stmt, env) {
    // assume name is declared before being called
    const type_var = lookup_type(name_of_name(stmt), env);
    return list_add(stmt, 2, type_var);
}

function annotate_constant_declaration(stmt, env) {
    set_type(
        constant_declaration_name(stmt),
        fresh_type_var(),
        env
    );
    return list(
        "constant_declaration",
        annotate(constant_declaration_name(stmt)),
        annotate(constant_declaration_value(stmt))
    );
}