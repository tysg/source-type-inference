function sigma(t, sfs) {
    const find_res = set_find_key(sfs, t);
    if (is_base_type(t) || is_null(find_res)) {
        return t;
    } else if (!is_null(find_res)) {
        return sigma(tail(find_res), sfs);
    } else {
        // TODO: add function type
        error("sigma not found");
    }
}

/**
 * Includes a constraint to $\Sigma$, the set of constraints in
 * solved form. Throw error when encounters one.
 * Returns a set.
 * @param {Pair} cons
 * @param {*} solved_form_set
 */
function solve(cons, solved_form_set) {
    // display(cons);
    // TODO: implement rules in 1.5 Type Constraints

    const rules_list = list(check_rule_1, check_rule_2);

    function solve_rules(r_list) {
        if (is_null(r_list)) {
            error("type error: no rules matched");
        }
        // check_rule(cons, sfs) -> (bool, sfs)
        const result = head(r_list)(cons, solved_form_set);
        // (true, sfs) : if matched, and return the sfs
        // (false, _) : not matched, go to the next rule
        return head(result) ? tail(result) : solve_rules(tail(r_list));
    }

    return solve_rules(rules_list);
}

// all function has the signature: check_rule(cons, sfs) -> (bool, sfs)

function rule_1(cons, sfs) {
    return equal(head(cons), tail(cons)) && head(head(cons)) === "primitive"
        ? pair(true, sfs) // do nothing
        : pair(false, null);
}

function rule_2(cons, sfs) {
    const t = head(cons);
    const ta = tail(cons);
    return head(t) !== "type_variable" && head(ta) === "type_variable"
        ? pair(true, solve(pair(ta, t), sfs))
        : pair(false, null);
}

function rule_3(cons, sfs) {
    const t = head(cons);
    const ta = tail(cons);
    const sig_ta = sigma(ta, sfs);

    return is_type_var(t) && equal(sig_ta, t)
        ? pair(true, sfs)
        : pair(false, null);
}

function rule_4(cons, sfs) {
    const t = head(cons);
    const ta = tail(cons);
    const sig_ta = sigma(ta, sfs);

    if (is_type_var(t) && is_function_type(sig_ta)) {
        // continue
    } else {
        return pair(false, null);
    }

    // list("function", param_types, return_type)
    // check if t is contained in Σ(t′)
    if (
        equal(return_type_of_fn_type(sig_ta), t) ||
        !is_null(
            filter((param) => equal(param, t), param_types_of_fn_type(sig_ta))
        )
    ) {
        error("type error: rule 4 broken");
    } else {
        return pair(false, null);
    }
}

function rule_5(cons, sfs) {
    const t = head(cons);
    const ta = tail(cons);
    const sig_ta = sigma(ta, sfs);

    const is_t_Ai = is_type_var(t) && head(tail(t)) === "A";

    const is_sig_ta_addable =
        equal(sig_ta, number_type) || equal(sig_ta, string_type);

    if (is_t_Ai && !is_type_var(sig_ta) && !is_sig_ta_addable) {
        error("type error: rule 5 broken");
    } else {
        return pair(false, null);
    }
}

function rule_6(cons, sfs) {
    const t = head(cons);
    const ta = tail(cons);

    const t_eq_taa = set_find_key(sfs, t);
    if (is_type_var(t) && !is_null(t_eq_taa)) {
        return pair(true, solve(pair(ta, tail(t_eq_taa)), sfs));
    } else {
        return pair(false, null);
    }
}

function rule_7(cons, sfs) {
    const t = head(cons);
    const ta = tail(cons);
    const sig_ta = sigma(ta, sfs);
    const sig_t = sigma(t, sfs);

    if (is_type_var(t) && is_null(set_find_key(sfs, t))) {
        return pair(true, set_insert(sfs, pair(t, sig_ta)));
    } else {
        return pair(false, null);
    }
}

function is_type_var(t) {
    return head(t) === "type_variable";
}

function is_base_type(t) {
    return head(t) === "primitive";
}

function is_function_type(t) {
    return head(t) === "function";
}
