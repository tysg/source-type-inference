// /* constraint.js */

// const set_insert_p = (s, p) => set_insert(s, head(p), tail(p));
function get_type_var(stmt) {
    return is_primitive_node(stmt) // prim
        ? type_var_of_primitive_node(stmt)
        : is_name(stmt)
        ? type_of_name(stmt)
        : // : is_constant_declaration(stmt)
        // ? annotate_constant_declaration(stmt, env)
        is_conditional_expression(stmt) || is_conditional_statement(stmt)
        ? cond_type(stmt)
        : list_ref(stmt, length(stmt) - 1);
    // : is_sequence(stmt)
    // ? annotate_sequence(stmt, env)
    // : is_application(stmt)
    // ? annotate_application(stmt, env)
    // : is_function_definition(stmt)
    // ? annotate_function_definition(stmt, env)
    // : is_block(stmt)
    // ? annotate_block(stmt, env)
    // : is_return_statement(stmt)
    // ? annotate_return_statement(stmt, env)
    // : error(stmt, "Unknown statement type in annotate: ");
}

/**
 * Traverses the syntax tree, generates constraints from
 * the program and collects them in a solved form.
 * Returns the set of constrains in solved form.
 * @param {} stmt
 * @param {*} solved_form_set
 */
function collect(stmt, sfs) {
    // display(stmt, "now collecting:");
    // WIP
    return is_primitive_node(stmt) // prim
        ? collect_primitive(stmt, sfs)
        : is_conditional_expression(stmt)
        ? collect_conditional_expression(stmt, sfs)
        : // : is_name(stmt)
        // ? annotate_name(stmt, env)
        // : is_constant_declaration(stmt)
        // ? annotate_constant_declaration(stmt, env)
        is_sequence(stmt)
        ? collect_sequence(stmt, sfs)
        : is_application(stmt)
        ? collect_application(stmt, sfs)
        : // : is_function_definition(stmt)
        // ? annotate_function_definition(stmt, env)
        is_block(stmt)
        ? collect_block(stmt, sfs)
        : is_return_statement(stmt)
        ? collect_return_statement(stmt, sfs)
        : error(stmt, "Unknown statement type in collect: ");
}

function collect_primitive(stmt, solved_form_set) {
    // primitive nodes: type var = their base types (primitive types)
    return solve(
        pair(type_var_of_primitive_node(stmt), type_of_primitive_node(stmt)),
        solved_form_set
    );
}

function collect_conditional_expression(stmt, solved_form_set) {
    const pred = cond_pred(stmt);
    const cons = cond_cons(stmt);
    const alt = cond_alt(stmt);

    // t0 = bool
    const s10 = solve(pair(get_type_var(pred), bool_type), solved_form_set);

    // t = t1
    const s11 = solve(pair(cond_type(stmt), get_type_var(cons)), s10);

    // t1 = t2
    const s12 = solve(pair(get_type_var(cons), get_type_var(alt)), s11);

    const s1 = collect(pred, s12);
    const s2 = collect(cons, s1);
    const s3 = collect(alt, s2);
    return s3;
}

function collect_application(stmt, sfs) {
    const opd = operands(stmt);
    const opr = operator(stmt);
    const result_type = type_of_application_result(stmt);

    const opd_types = map(get_type_var, opd);
    const intended_opr_type = make_function_type(opd_types, result_type);

    // t0 = (t1..tn) -> t
    const s10 = solve(pair(get_type_var(opr), intended_opr_type), sfs);
    const s1 = collect(opr, s10);

    // collect operands 1 by 1
    return accumulate(collect, s1, opd);
}

function collect_block(stmt, sfs) {
    // TODO: remove assumption that no const
    const body = block_body(stmt);
    const sa0 = solve(pair(get_type_var(stmt), get_type_var(body)), sfs);
    return collect(body, sa0);
}

function collect_sequence(stmt, sfs) {
    const stmts = sequence_statements(stmt);
    const last_stmt = list_ref(stmts, length(stmts) - 1);

    // t3 = t2
    const s20 = solve(pair(get_type_var(stmt), get_type_var(last_stmt)), sfs);
    return accumulate(collect, s20, stmts);
}

function collect_return_statement(stmt, sfs) {
    const ret_exp = return_statement_expression(stmt);
    const s10 = solve(pair(get_type_var(stmt), get_type_var(ret_exp)), sfs);
    return collect(ret_exp, s10);
}
