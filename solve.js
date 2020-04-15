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

    if (head(t) !== "type_variable") {
        return pair(false, null);
    } else {
    }

    const find_res = set_find_key(sfs, ta);
    if (!is_null(find_res) && equal(tail(find_res), t)) {
        return pair(true, sfs);
    } else {
        return pair(false, null);
    }
}

function rule_4(cons, sfs) {
    const t = head(cons);
    const ta = tail(cons);

    if (head(t) !== "type_variable") {
        return pair(false, null);
    } else {
    }

    const find_res = set_find_key(sfs, ta);
    if (is_null(find_res) || tail(find_res) !== "function") {
        return pair(false, null);
    }

    const sig_ta = tail(find_res);
    // list("function", param_types, return_type)
    // check if  t is contained in Σ(t′)
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

    const is_t_Ai = head(t) === "type_variable" && head(tail(t)) === "A";

    const find_res = set_find_key(sfs, ta);
    if (is_null(find_res)) {
        return pair(false, null);
    } else {
    }

    const is_sig_ta_type_var = tail(find_res);
    // WIP
}
