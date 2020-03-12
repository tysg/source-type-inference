function is_tagged_list(stmt, the_tag) {
    return is_pair(stmt) && head(stmt) === the_tag;
}

/* CONSTANT DECLARATIONS */

// constant declarations are tagged with "constant_declaration"
// and have "name" and "value" properties

function is_constant_declaration(stmt) {
    return is_tagged_list(stmt, "constant_declaration");
}
function constant_declaration_name(stmt) {
    return head(tail(head(tail(stmt))));
}
function constant_declaration_value(stmt) {
    return head(tail(tail(stmt)));
}

// find the names that are declared (at top-level) in
// the given statement

function local_names(stmt) {
    if (is_sequence(stmt)) {
        const stmts = sequence_statements(stmt);
        return is_empty_sequence(stmts)
            ? null
            : append(
                  local_names(first_statement(stmts)),
                  local_names(make_sequence(rest_statements(stmts)))
              );
    } else {
        return is_constant_declaration(stmt)
            ? list(constant_declaration_name(stmt))
            : null;
    }
}

// conditional expressions are tagged
// with "conditional_expression"

function is_conditional_expression(stmt) {
    return is_tagged_list(stmt, "conditional_expression");
}
function cond_expr_pred(stmt) {
    return list_ref(stmt, 1);
}
function cond_expr_cons(stmt) {
    return list_ref(stmt, 2);
}
function cond_expr_alt(stmt) {
    return list_ref(stmt, 3);
}

// sequences of statements are just represented
// by tagged lists of statements by the parser.

function is_sequence(stmt) {
    return is_tagged_list(stmt, "sequence");
}
function make_sequence(stmts) {
    return list("sequence", stmts);
}
function sequence_statements(stmt) {
    return head(tail(stmt));
}
function is_empty_sequence(stmts) {
    return is_null(stmts);
}
function is_last_statement(stmts) {
    return is_null(tail(stmts));
}
function first_statement(stmts) {
    return head(stmts);
}
function rest_statements(stmts) {
    return tail(stmts);
}

// function definitions are tagged with "function_definition"
// have a list of "parameters" and a "body" statement
// Note that in this language, function definitions only occur
// in constant declarations, as a result of parsing
// statements of the form: function f(x) {...}
// Therefore, we do not need a function type_function_definition.

function is_function_definition(stmt) {
    return is_tagged_list(stmt, "function_definition");
}
function function_definition_parameters(stmt) {
    return map(x => name_of_name(x), head(tail(stmt)));
}
function function_definition_body(stmt) {
    return head(tail(tail(stmt)));
}

function is_name(stmt) {
    return is_tagged_list(stmt, "name");
}
function name_of_name(stmt) {
    return head(tail(stmt));
}

function type_of_name(name, env) {
    return lookup_type(name, env);
}
