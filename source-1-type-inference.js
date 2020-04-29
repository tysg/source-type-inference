// apply types

function apply(stmt, sfs) {
    return is_primitive_node(stmt)
        ? stmt
        : is_name(stmt)
        ? apply_name(stmt, sfs)
        : is_constant_declaration(stmt)
        ? apply_constant_declaration(stmt, sfs)
        : is_conditional_expression(stmt)
        ? apply_conditional_expression(stmt, sfs)
        : is_conditional_statement(stmt)
        ? apply_conditional_statement(stmt, sfs)
        : is_sequence(stmt)
        ? apply_sequence(stmt, sfs)
        : is_application(stmt)
        ? apply_application(stmt, sfs)
        : is_function_definition(stmt)
        ? apply_function_definition(stmt, sfs)
        : is_block(stmt)
        ? apply_block(stmt, sfs)
        : is_return_statement(stmt)
        ? apply_return_statement(stmt, sfs)
        : error(stmt, "Unknown statement type in apply: ");
}

function apply_name(stmt, sfs) {
    const t = type_of_name(stmt);
    if (is_type_var(t)) {
        return list_set(stmt, 2, sigma(t, sfs));
    } else {
        return stmt;
    }
}

function apply_block(stmt, sfs) {
    return list(
        "block",
        apply(block_body(stmt), sfs),
        sigma(list_ref(stmt, 2), sfs)
    );
}

function apply_return_statement(stmt, sfs) {
    return list(
        "return_statement",
        apply(return_statement_expression(stmt), sfs),
        sigma(list_ref(stmt, 2), sfs)
    );
}

function apply_function_definition(stmt, sfs) {
    const parameters = function_definition_parameters(stmt);
    const body = function_definition_body(stmt);
    return list(
        "function_definition",
        map((name) => apply(name, sfs), parameters),
        apply(body, sfs),
        sigma(list_ref(stmt, 3), sfs)
    );
}

function apply_application(stmt, sfs) {
    return list(
        "application",
        apply(operator(stmt), sfs),
        map((opd) => apply(opd, sfs), operands(stmt)),
        sigma(list_ref(stmt, 3), sfs)
    );
}

function apply_conditional_expression(stmt, sfs) {
    return list(
        "conditional_expression",
        apply(cond_pred(stmt), sfs),
        apply(cond_cons(stmt), sfs),
        apply(cond_alt(stmt), sfs),
        sigma(list_ref(stmt, 4), sfs)
    );
}

function apply_conditional_statement(stmt, sfs) {
    return list(
        "conditional_statement",
        apply(cond_pred(stmt), sfs),
        apply(cond_cons(stmt), sfs),
        apply(cond_alt(stmt), sfs),
        sigma(list_ref(stmt, 4), sfs)
    );
}

function apply_sequence(stmt, sfs) {
    const number_of_statements = length(sequence_statements(stmt));
    const applied_exprs = map(
        (stmt) => apply(stmt, sfs),
        sequence_statements(stmt)
    );

    return list(
        "sequence",
        applied_exprs,
        sigma(list_ref(stmt, 2), sfs) // the type of the entire sequence
    );
}

function apply_constant_declaration(stmt, sfs) {
    return list(
        "constant_declaration",
        apply(list_ref(stmt, 1), sfs),
        apply(list_ref(stmt, 2), sfs),
        sigma(list_ref(stmt, 3), sfs)
    );
}
/* annotate.js */

function annotate(stmt) {
    return is_number(stmt) // prim
        ? make_number_node(stmt)
        : is_boolean(stmt) // prim
        ? make_boolean_node(stmt)
        : is_undefined(stmt) // prim
        ? make_undefined_node()
        : is_string(stmt) // prim
        ? make_string_node(stmt)
        : is_name(stmt)
        ? annotate_name(stmt)
        : is_constant_declaration(stmt)
        ? annotate_constant_declaration(stmt)
        : is_conditional_expression(stmt)
        ? annotate_conditional_expression(stmt)
        : is_conditional_statement(stmt)
        ? annotate_conditional_statement(stmt)
        : is_sequence(stmt)
        ? annotate_sequence(stmt)
        : is_application(stmt)
        ? annotate_application(stmt)
        : is_function_definition(stmt)
        ? annotate_function_definition(stmt)
        : is_block(stmt)
        ? annotate_block(stmt)
        : is_return_statement(stmt)
        ? annotate_return_statement(stmt)
        : error(stmt, "Unknown statement type in annotate: ");
}

function annotate_name(stmt) {
    return list_add(stmt, 2, make_new_T_type(fresh_T_var()));
}

function annotate_block(stmt) {
    const body = block_body(stmt);
    return list("block", annotate(body), make_new_T_type(fresh_T_var()));
}

function annotate_return_statement(stmt) {
    return list(
        "return_statement",
        annotate(return_statement_expression(stmt)),
        make_new_T_type(fresh_T_var())
    );
}

function annotate_function_definition(stmt) {
    const parameters = function_definition_parameters(stmt);
    const body = function_definition_body(stmt);

    return list(
        "function_definition",
        map(annotate, parameters),
        annotate(body),
        make_new_T_type(fresh_T_var())
    );
}

function annotate_application(stmt) {
    let annotated_operator = annotate(operator(stmt));

    // HACK: explicitly handling minus operator
    // TODO: retain minus sign line number and loc
    if (
        name_of_name(annotated_operator) === "-" &&
        length(operands(stmt)) === 1
    ) {
        annotated_operator = annotate(list("name", "-1"));
    } else {
    }

    return list(
        "application",
        annotated_operator,
        map(annotate, operands(stmt)),
        make_new_T_type(fresh_T_var())
    );
}

function annotate_conditional_expression(stmt) {
    return list(
        "conditional_expression",
        annotate(cond_pred(stmt)),
        annotate(cond_cons(stmt)),
        annotate(cond_alt(stmt)),
        make_new_T_type(fresh_T_var())
    );
}

function annotate_conditional_statement(stmt) {
    return list(
        "conditional_statement",
        annotate(cond_pred(stmt)),
        annotate(cond_cons(stmt)),
        annotate(cond_alt(stmt)),
        make_new_T_type(fresh_T_var())
    );
}

function annotate_sequence(stmt) {
    return list(
        "sequence",
        map(annotate, sequence_statements(stmt)),
        make_new_T_type(fresh_T_var()) // the type of the entire sequence
    );
}

function annotate_constant_declaration(stmt) {
    return list(
        "constant_declaration",
        annotate(list_ref(stmt, 1)),
        annotate(list_ref(stmt, 2)),
        make_new_T_type(fresh_T_var()) // essentially undefined, left for compatibility
    );
}
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
const global_type_var_getter = init_fresh_type_var_counter();
let fresh_T_var = global_type_var_getter;
let fresh_A_var = global_type_var_getter;

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

function make_forall_type(body) {
    return list("for_all", body);
}

function for_all_body(t) {
    return head(tail(t));
}

function param_types_of_fn_type(fn_type) {
    return list_ref(fn_type, 1);
}

function return_type_of_fn_type(fn_type) {
    return list_ref(fn_type, 2);
}

function is_forall(t) {
    return head(t) === "for_all";
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

function is_meta_type(t) {
    return head(t) === "meta";
}

function equal_type(t1, t2) {
    // display(t1, "equaling: ");
    // display(t2, "equaling: ");
    return is_null(t1) || is_null(t2)
        ? false
        : head(t1) !== head(t2)
        ? false
        : is_type_var(t1)
        ? list_ref(t1, 2) === list_ref(t2, 2) // type var are equated by the number
        : equal(t1, t2);
}

function change_type_var_to_addable(type_var) {
    if (!is_type_var(type_var)) {
        error("is not a type var", type_var);
    } else {
        return make_new_A_type(head(tail(tail(type_var))));
    }
}

// function instantiate_poly_function(meta_fn) {

// }
// testing
function print_type(type) {
    function print_args(ts) {
        return is_null(ts)
            ? "null"
            : length(ts) === 1
            ? print_type(head(ts))
            : print_type(head(ts)) + " * " + print_args(tail(ts));
    }

    return is_base_type(type)
        ? head(tail(type))
        : is_function_type(type)
        ? "(" +
          print_args(param_types_of_fn_type(type)) +
          ") > " +
          print_type(return_type_of_fn_type(type))
        : is_type_var(type)
        ? head(tail(type)) + stringify(head(tail(tail(type))))
        : error("Unknown type: " + stringify(type));
}

function check_type_var(number, sfs) {
    return sigma(make_new_T_type(number), sfs);
}

function iterate_sigma(sfs, n) {
    const m = build_list(n, (x) => x + 1);
    for_each(
        (num) =>
            display(
                stringify(num) + ": " + print_type(check_type_var(num, sfs))
            ),
        m
    );
}

function test_2() {
    display("================================================================");
    const program = "(()=>1)();";
    const solved_form = infer_program(program);
    display("Program: " + program);
    display("Annotated program: " + "((() => (1 (T1)) (T2)) (T3))() (T4);");
    display("Types:");
    display("T1 : " + print_type(sigma(make_new_A_type(1), solved_form)));
    display("T2 : " + print_type(sigma(make_new_T_type(2), solved_form)));
    display("T3 : " + print_type(sigma(make_new_T_type(3), solved_form)));
    display("T4 : " + print_type(sigma(make_new_T_type(4), solved_form)));
}

function test_3() {
    display("================================================================");
    const program = "true ? 1 : 2;";
    const solved_form = infer_program(program);
    display("Program: " + program);
    display("Annotated program: " + "(true (T1) ? 1 (T2): 2 (T3)) (T4);");
    display("Types:");
    display("T1 : " + print_type(sigma(make_new_T_type(1), solved_form)));
    display("T2 : " + print_type(sigma(make_new_A_type(2), solved_form)));
    display("T3 : " + print_type(sigma(make_new_A_type(3), solved_form)));
    display("T4 : " + print_type(sigma(make_new_T_type(4), solved_form)));
}

function test_4() {
    display("================================================================");
    const program = "1 + 1;";
    const solved_form = infer_program(program);
    display("Program: " + program);
    display("Annotated program: " + "(1 (T1) + 1 (T2)) (T3);");
    display("Types:");
    display("T1 : " + print_type(sigma(make_new_A_type(1), solved_form)));
    display("T2 : " + print_type(sigma(make_new_A_type(2), solved_form)));
    display("T3 : " + print_type(sigma(make_new_T_type(3), solved_form)));
}

function test_5() {
    display("================================================================");
    const program = "1 + 3 * 4;";
    const solved_form = infer_program(program);
    display("Program: " + program);
    display("Annotated program: " + "(1 (T1) + (3 (T2) * 4 (T3)) (T4)) (T5);");
    display("Types:");
    display("T1 : " + print_type(sigma(make_new_A_type(1), solved_form)));
    display("T2 : " + print_type(sigma(make_new_A_type(2), solved_form)));
    display("T3 : " + print_type(sigma(make_new_A_type(3), solved_form)));
    display("T4 : " + print_type(sigma(make_new_T_type(4), solved_form)));
    display("T5 : " + print_type(sigma(make_new_T_type(5), solved_form)));
}

function test_6() {
    display("================================================================");
    const program = "(1 + 3) * 4;";
    const solved_form = infer_program(program);
    display("Program: " + program);
    display("Annotated program: " + "(1 (T1) + 3 (T2)) (T3) * 4 (T4)) (T5);");
    display("Types:");
    display("T1 : " + print_type(sigma(make_new_A_type(1), solved_form)));
    display("T2 : " + print_type(sigma(make_new_A_type(2), solved_form)));
    display("T3 : " + print_type(sigma(make_new_T_type(3), solved_form)));
    display("T4 : " + print_type(sigma(make_new_A_type(4), solved_form)));
    display("T5 : " + print_type(sigma(make_new_T_type(5), solved_form)));
}

function test_7() {
    display("================================================================");
    const program = "! (1 === 1);";
    const solved_form = infer_program(program);
    display("Program: " + program);
    display("Annotated program: " + "! ((1 (T1) === 1 (T2)) (T3)) (T4);");
    display("Types:");
    display("T1 : " + print_type(sigma(make_new_A_type(1), solved_form)));
    display("T2 : " + print_type(sigma(make_new_A_type(2), solved_form)));
    display("T3 : " + print_type(sigma(make_new_T_type(3), solved_form)));
    display("T4 : " + print_type(sigma(make_new_T_type(4), solved_form)));
}

function test_8() {
    display("================================================================");
    const program = "(! (1 === 1)) ? 1 : 2;";
    const solved_form = infer_program(program);
    display("Program: " + program);
    display("((! ((1 (T1) === infer_program(program);");
    display("Types:");
    display("T1 : " + print_type(sigma(make_new_A_type(1), solved_form)));
    display("T2 : " + print_type(sigma(make_new_A_type(2), solved_form)));
    display("T3 : " + print_type(sigma(make_new_T_type(3), solved_form)));
    display("T4 : " + print_type(sigma(make_new_T_type(4), solved_form)));
    display("T5 : " + print_type(sigma(make_new_A_type(5), solved_form)));
    display("T6 : " + print_type(sigma(make_new_A_type(6), solved_form)));
    display("T7 : " + print_type(sigma(make_new_T_type(7), solved_form)));
}

function test_9() {
    display("================================================================");
    const program = "const x = 1; x;";
    const solved_form = infer_program(program);
    display("Program: " + program);
    display(
        "Annotated program: " + "((const x (T1) = 1 (T2)) (T3); x (T1);) (T4)"
    );
    display("Types:");
    display("T1 : " + print_type(sigma(make_new_T_type(1), solved_form)));
    display("T2 : " + print_type(sigma(make_new_A_type(2), solved_form)));
    display("T3 : " + print_type(sigma(make_new_T_type(3), solved_form)));
    display("T4 : " + print_type(sigma(make_new_T_type(4), solved_form)));
}

function test_10() {
    display("================================================================");
    const program =
        "function f(x, y) { return x; }  " + "f;                              ";
    const solved_form = infer_program(program);
    display("Program: ");
    display("function f(x, y) { return x; }  ");
    display("f;                              ");
    display("Annotated program: ");
    display(
        "((function (f (T1))(x (T3), y (T2)) { (return x (T3)) (T4); } (T5)) (T6)"
    );
    display(
        " f (T1);) (T7)                                                          "
    );
    display("Types:");
    display("T1 : " + print_type(sigma(make_new_T_type(1), solved_form)));
    display("T2 : " + print_type(sigma(make_new_T_type(2), solved_form)));
    display("T3 : " + print_type(sigma(make_new_T_type(3), solved_form)));
    display("T4 : " + print_type(sigma(make_new_T_type(4), solved_form)));
    display("T5 : " + print_type(sigma(make_new_T_type(5), solved_form)));
    display("T6 : " + print_type(sigma(make_new_T_type(6), solved_form)));
    display("T7 : " + print_type(sigma(make_new_T_type(7), solved_form)));
}

function test_11() {
    display("================================================================");
    const program =
        "function factorial(n) {         " +
        "    return n === 1 ? 1          " +
        "        : n * factorial(n - 1); " +
        "}                               " +
        "factorial(4);                   ";
    const solved_form = infer_program(program);
    display("Program: ");
    display("function factorial(n) {         ");
    display("    return n === 1 ? 1          ");
    display("        : n * factorial(n - 1); ");
    display("}                               ");
    display("factorial(4);                   ");
    display("Annotated program: ");
    display(
        "((function (factorial (T1))(n (T2)) {                                                  "
    );
    display(
        "    (return ((n (T2) === 1 (T3)) (T4) ? 1 (T5)                                         "
    );
    display(
        "        : (n (T2) * (factorial (T1))((n (T2) - 1 (T6)) (T7)) (T8)) (T9)) (T10)) (T11); "
    );
    display(
        " } (T12)) (T13)                                                                        "
    );
    display(
        "(factorial (T1))(4 (T14)) (T15);) (T16)                                                "
    );
    display("Types:");
    display("T1 : " + print_type(sigma(make_new_T_type(1), solved_form)));
    display("T2 : " + print_type(sigma(make_new_T_type(2), solved_form)));
    display("T3 : " + print_type(sigma(make_new_A_type(3), solved_form)));
    display("T4 : " + print_type(sigma(make_new_T_type(4), solved_form)));
    display("T5 : " + print_type(sigma(make_new_A_type(5), solved_form)));
    display("T6 : " + print_type(sigma(make_new_A_type(6), solved_form)));
    display("T7 : " + print_type(sigma(make_new_T_type(7), solved_form)));
    display("T8 : " + print_type(sigma(make_new_T_type(8), solved_form)));
    display("T9 : " + print_type(sigma(make_new_T_type(9), solved_form)));
    display("T10: " + print_type(sigma(make_new_T_type(10), solved_form)));
    display("T11: " + print_type(sigma(make_new_T_type(11), solved_form)));
    display("T12: " + print_type(sigma(make_new_T_type(12), solved_form)));
    display("T13: " + print_type(sigma(make_new_T_type(13), solved_form)));
    display("T14: " + print_type(sigma(make_new_A_type(14), solved_form)));
    display("T15: " + print_type(sigma(make_new_T_type(15), solved_form)));
    display("T16: " + print_type(sigma(make_new_T_type(16), solved_form)));
}

function test_12() {
    display("================================================================");
    const program =
        "const about_pi = 3;             " +
        "function square(x) {            " +
        "    return x * x;               " +
        "}                               " +
        "4 * about_pi * square(6371);    ";
    const solved_form = infer_program(program);
    display("Program: ");
    display("const about_pi = 3;             ");
    display("function square(x) {            ");
    display("    return x * x;               ");
    display("}                               ");
    display("4 * about_pi * square(6371);    ");
    display("Annotated program: ");
    display(
        "((const about_pi (T1) = 3 (T2)) (T3);                                                 "
    );
    display(
        " (function (square (T4))(x (T5)) {                                                    "
    );
    display(
        "    (return (x (T5) * x (T5)) (T6)) (T7);                                             "
    );
    display(
        " } (T8)) (T9)                                                                         "
    );
    display(
        " (4 (T10) * about_pi (T1) (T11)) * ((square (T4))(6371 (T12)) (T13)) (T14);) (T15)    "
    );
    display("Types:");
    display("T1 : " + print_type(sigma(make_new_T_type(1), solved_form)));
    display("T2 : " + print_type(sigma(make_new_A_type(2), solved_form)));
    display("T3 : " + print_type(sigma(make_new_T_type(3), solved_form)));
    display("T4 : " + print_type(sigma(make_new_T_type(4), solved_form)));
    display("T5 : " + print_type(sigma(make_new_T_type(5), solved_form)));
    display("T6 : " + print_type(sigma(make_new_T_type(6), solved_form)));
    display("T7 : " + print_type(sigma(make_new_T_type(7), solved_form)));
    display("T8 : " + print_type(sigma(make_new_T_type(8), solved_form)));
    display("T9 : " + print_type(sigma(make_new_T_type(9), solved_form)));
    display("T10: " + print_type(sigma(make_new_A_type(10), solved_form)));
    display("T11: " + print_type(sigma(make_new_T_type(11), solved_form)));
    display("T12: " + print_type(sigma(make_new_A_type(12), solved_form)));
    display("T13: " + print_type(sigma(make_new_T_type(13), solved_form)));
    display("T14: " + print_type(sigma(make_new_T_type(14), solved_form)));
    display("T15: " + print_type(sigma(make_new_T_type(15), solved_form)));
}

function test_13() {
    display("================================================================");
    const program = '"hello" + 1;';
    display("Program: " + program);
    display("Annotated program: " + '("hello" (T1) + 1 (T2)) (T3);');
    display("Test should throw type error.");
    const solved_form = infer_program(program);
}

function test_14() {
    display("================================================================");
    const program = "true + 1;";
    display("Program: " + program);
    display("Annotated program: " + "(true (T1) + 1 (T2)) (T3);");
    display("Test should throw type error.");
    const solved_form = infer_program(program);
    iterate_sigma(solved_form, 4);
}

function test_15() {
    display("================================================================");
    const program = '"hello" ? 1 : 2;';
    display("Program: " + program);
    display("Annotated program: " + '("hello" (T1) ? 1 (T2): 2 (T3)) (T4);');
    display("Test should throw type error.");
    const solved_form = infer_program(program);

    display("Types:");
    display("T1 : " + print_type(sigma(make_new_T_type(1), solved_form)));
    display("T2 : " + print_type(sigma(make_new_A_type(2), solved_form)));
    display("T3 : " + print_type(sigma(make_new_A_type(3), solved_form)));
    display("T4 : " + print_type(sigma(make_new_T_type(4), solved_form)));
}

function test_16() {
    display("================================================================");
    const program =
        "function f(x) {return x + 1;}" + "f(true);                     ";
    display("Program: ");
    display("function f(x) {return x + 1;}");
    display("f(true);                     ");
    display("Annotated program: ");
    display(
        "((function (f (T1))(x (T2)) {(return (x (T2) + 1 (T3)) (T4)) (T5);} (T6)) (T7)    "
    );
    display(
        " (f (T1))(true (T8)) (T9);) (T10)                                                 "
    );
    display("Test should throw type error.");
    const solved_form = infer_program(program);
    display("Types:");
    display("T1 : " + print_type(sigma(make_new_T_type(1), solved_form)));
    display("T2 : " + print_type(sigma(make_new_T_type(2), solved_form)));
    display("T3 : " + print_type(sigma(make_new_A_type(3), solved_form)));
    display("T4 : " + print_type(sigma(make_new_T_type(4), solved_form)));
    display("T5 : " + print_type(sigma(make_new_T_type(5), solved_form)));
    display("T6 : " + print_type(sigma(make_new_T_type(6), solved_form)));
    display("T7 : " + print_type(sigma(make_new_T_type(7), solved_form)));
    display("T8 : " + print_type(sigma(make_new_T_type(8), solved_form)));
    display("T9 : " + print_type(sigma(make_new_T_type(9), solved_form)));
    display("T10: " + print_type(sigma(make_new_T_type(10), solved_form)));
}
/* Syntax tree nodes (typed and untyped) */

function is_tagged_list(stmt, the_tag) {
    return is_pair(stmt) && head(stmt) === the_tag;
}

/* CONSTANT DECLARATIONS */

// constant declarations are tagged with "constant_declaration"
// and have "name" and "value" properties

function is_constant_declaration(stmt) {
    return is_tagged_list(stmt, "constant_declaration");
}
/**
 * Returns the name of name of the constant declaration. NOT returning
 * the second element of the tagged list.
 * @param {} stmt
 */

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
function is_conditional_statement(stmt) {
    return is_tagged_list(stmt, "conditional_statement");
}
function cond_pred(stmt) {
    return list_ref(stmt, 1);
}
function cond_cons(stmt) {
    return list_ref(stmt, 2);
}
function cond_alt(stmt) {
    return list_ref(stmt, 3);
}
function cond_type(stmt) {
    return list_ref(stmt, 4);
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

/**
 * Gets the names of the parameters, e.g. [a,b,c]
 */
function function_definition_parameters_names(stmt) {
    return map((x) => name_of_name(x), head(tail(stmt)));
}

/**
 * Gets the list of parameters, i.e. a list of "names"-tagged list, e.g. [["name", "a"], ["name", "b"]]
 */
function function_definition_parameters(stmt) {
    return head(tail(stmt));
}
function function_definition_body(stmt) {
    return head(tail(tail(stmt)));
}

function function_definition_type(stmt) {
    return list_ref(stmt, 3);
}

function is_name(stmt) {
    return is_tagged_list(stmt, "name");
}
function name_of_name(stmt) {
    return head(tail(stmt));
}

function type_of_name(stmt) {
    return list_ref(stmt, 2);
}

// added tagged list for primitive types
function is_primitive_node(stmt) {
    return is_tagged_list(stmt, "prim_node");
}

function make_number_node(value) {
    return list(
        "prim_node",
        number_type,
        value,
        make_new_A_type(fresh_A_var())
    );
}

function make_boolean_node(value) {
    return list("prim_node", bool_type, value, make_new_T_type(fresh_T_var()));
}

function make_undefined_node() {
    return list(
        "prim_node",
        undefined_type,
        undefined,
        make_new_T_type(fresh_T_var())
    );
}

function make_string_node(value) {
    return list(
        "prim_node",
        string_type,
        value,
        make_new_A_type(fresh_A_var())
    );
}

function type_var_of_primitive_node(stmt) {
    return list_ref(stmt, 3);
}

function value_of_primitive_node(stmt) {
    return list_ref(stmt, 2);
}
function type_of_primitive_node(stmt) {
    return list_ref(stmt, 1);
}
/* FUNCTION APPLICATION */

// applications are tagged with "application"
// and have "operator" and "operands". We compare
// the actual argument types with the declared
// argument types of the function being applied.

function is_application(stmt) {
    return is_tagged_list(stmt, "application");
}
function operator(stmt) {
    return head(tail(stmt));
}
function operands(stmt) {
    return head(tail(tail(stmt)));
}

function type_of_application_result(stmt) {
    return list_ref(stmt, 3);
}
function no_operands(ops) {
    return is_null(ops);
}
function first_operand(ops) {
    return head(ops);
}
function rest_operands(ops) {
    return tail(ops);
}

/* RETURN STATEMENTS */

// functions return the value that results from
// evaluating return statements

function is_return_statement(stmt) {
    return is_tagged_list(stmt, "return_statement");
}
function return_statement_expression(stmt) {
    return head(tail(stmt));
}

// blocks are tagged with "block"
function is_block(stmt) {
    return is_tagged_list(stmt, "block");
}

function block_body(stmt) {
    return head(tail(stmt));
}
/* constraint.js */

function get_type_var(stmt) {
    return is_primitive_node(stmt) // prim
        ? type_var_of_primitive_node(stmt)
        : is_name(stmt)
        ? type_of_name(stmt)
        : is_conditional_expression(stmt) || is_conditional_statement(stmt)
        ? cond_type(stmt)
        : list_ref(stmt, length(stmt) - 1);
}

/**
 * Traverses the syntax tree, generates constraints from
 * the program and collects them in a solved form.
 * Returns the set of constrains in solved form.
 * @param {} stmt
 * @param {*} solved_form_set
 */
function collect(stmt, sfs, env) {
    // display(stmt, "now collecting:");
    // WIP
    return is_name(stmt)
        ? collect_name(stmt, sfs, env)
        : is_primitive_node(stmt) // prim
        ? collect_primitive(stmt, sfs)
        : is_conditional_expression(stmt)
        ? collect_conditional_expression(stmt, sfs, env)
        : is_application(stmt)
        ? collect_application(stmt, sfs, env)
        : is_function_definition(stmt)
        ? collect_function_definition(stmt, sfs, env)
        : is_sequence(stmt)
        ? collect_sequence(stmt, sfs, env)
        : is_return_statement(stmt)
        ? collect_return_statement(stmt, sfs, env)
        : is_block(stmt)
        ? collect_block(stmt, sfs, env)
        : error(stmt, "Unknown statement type in collect: ");
}

function collect_primitive(stmt, solved_form_set) {
    // primitive nodes: type var = their base types (primitive types)
    return solve(
        pair(type_var_of_primitive_node(stmt), type_of_primitive_node(stmt)),
        solved_form_set
    );
}

function collect_conditional_expression(stmt, solved_form_set, env) {
    const pred = cond_pred(stmt);
    const cons = cond_cons(stmt);
    const alt = cond_alt(stmt);

    // t0 = bool
    const s10 = solve(pair(get_type_var(pred), bool_type), solved_form_set);

    // t = t1
    const s11 = solve(pair(cond_type(stmt), get_type_var(cons)), s10);

    // t1 = t2
    const s12 = solve(pair(get_type_var(cons), get_type_var(alt)), s11);

    const s1 = collect(pred, s12, env);
    const s2 = collect(cons, s1, env);
    const s3 = collect(alt, s2, env);
    return s3;
}

function collect_application(stmt, sfs, env) {
    const opd = operands(stmt);
    const opr = operator(stmt);
    const result_type = type_of_application_result(stmt);

    // TODO: may need to check whether op param types and operand types correspond
    const opd_types = map(get_type_var, opd);
    const intended_opr_type = make_function_type(opd_types, result_type);

    // collect operands 1 by 1
    const s0 = accumulate((op, solved) => collect(op, solved, env), sfs, opd);

    // t0 = (t1..tn) -> t
    const s10 = solve(pair(get_type_var(opr), intended_opr_type), s0);
    const s1 = collect(opr, s10, env);
    return s1;
}

function collect_block(stmt, sfs, env) {
    /** A sequence */
    const body = block_body(stmt);
    let stmt_list = null;
    if (is_sequence(body)) {
        /** List of statements */
        stmt_list = sequence_statements(body);
    } else {
        // only 1 statement
        stmt_list = list(body);
    }

    function unpack_if_return(stmt) {
        if (is_return_statement(stmt)) {
            return return_statement_expression(stmt);
        } else {
            return stmt;
        }
    }

    // extract a list of const declr
    const const_declarations = filter(
        (s) => is_constant_declaration(unpack_if_return(s)),
        stmt_list
    );
    const names = map(
        (s) => constant_declaration_name(unpack_if_return(s)),
        const_declarations
    );
    const names_types = map(
        (s) => get_type_var(constant_declaration_value(unpack_if_return(s))),
        const_declarations
    );
    // gamma prime
    const Gp = extend_environment(names, names_types, env);
    const sig_10 = solve(pair(get_type_var(body), get_type_var(stmt)), sfs);
    const sig_1 = accumulate(
        (dec, solved) => solve(pair(get_type_var(dec), undefined_type), solved),
        sig_10,
        const_declarations
    );
    const sig_np1 = accumulate(
        (dec, solved) => collect(constant_declaration_value(dec), solved, Gp),
        sig_1,
        const_declarations
    );
    const poly_types = map(
        (t) => make_forall_type(sigma(t, sig_np1)),
        names_types
    );
    const Gpp = extend_environment(names, poly_types, Gp);

    // repackage sequence
    const rest_stmts = filter((s) => !is_constant_declaration(s), stmt_list);
    const filtered_seq = list("sequence", rest_stmts, get_type_var(body));
    return collect(filtered_seq, sig_np1, Gpp);
}

function collect_sequence(stmt, sfs, env) {
    const stmts = sequence_statements(stmt);
    const last_stmt = list_ref(stmts, length(stmts) - 1);

    // t3 = t2
    const s20 = solve(pair(get_type_var(stmt), get_type_var(last_stmt)), sfs);
    const res = accumulate((s, solved) => collect(s, solved, env), s20, stmts);
    return res;
}

function collect_return_statement(stmt, sfs, env) {
    const ret_exp = return_statement_expression(stmt);
    const s10 = solve(pair(get_type_var(stmt), get_type_var(ret_exp)), sfs);
    return collect(ret_exp, s10, env);
}

function collect_function_definition(stmt, sfs, env) {
    const params = function_definition_parameters(stmt);
    const body = function_definition_body(stmt);

    const param_names = function_definition_parameters_names(stmt);
    const param_types = map(get_type_var, params);

    const func_env = extend_environment(param_names, param_types, env);

    const fn_type = make_function_type(param_types, get_type_var(body));

    const s0 = solve(pair(get_type_var(stmt), fn_type), sfs);
    return collect(body, s0, func_env);
}

function collect_name(stmt, sfs, env) {
    const ta = lookup_type(name_of_name(stmt), env);
    if (is_forall(ta)) {
        return solve(pair(get_type_var(stmt), replace_with_fresh(ta)), sfs);
    } else {
        return solve(pair(get_type_var(stmt), ta), sfs);
    }
}

function replace_with_fresh(forall_type) {
    let lut = null;
    function replace(fa_type) {
        if (is_function_type(fa_type)) {
            return make_function_type(
                map(replace, param_types_of_fn_type(fa_type)),
                replace(return_type_of_fn_type(fa_type))
            );
        } else if (is_base_type(fa_type)) {
            return fa_type;
        } else if (is_type_var(fa_type) || is_meta_type(fa_type)) {
            const res = set_find_key_type(lut, fa_type);
            if (is_null(res)) {
                const fresh_type =
                    head(tail(fa_type)) === "T"
                        ? make_new_T_type(fresh_T_var())
                        : make_new_A_type(fresh_A_var());
                lut = set_insert_cons(lut, pair(fa_type, fresh_type));
                return fresh_type;
            } else {
                return tail(res);
            }
        } else {
            error("fatal: unknown type in replace_with_fresh");
        }
    }
    return replace(list_ref(forall_type, 1));
}
/**
 * Returns a clean string representation of a list. Experimental.
 * @param {'a list} lst
 */
function display_list(lst) {
    if (is_null(lst)) {
        return "";
    } else if (
        is_number(lst) ||
        is_boolean(lst) ||
        is_undefined(lst) ||
        is_string(lst)
    ) {
        return stringify(lst);
    } else {
        let result = display_list(head(lst));
        let ptr = tail(lst);
        while (!is_null(ptr)) {
            result = result + ", " + display_list(head(ptr));
            ptr = tail(ptr);
        }

        return "[" + result + "]";
    }
}

/**
 * Adds val to location at index in lst. Returns a new list.
 * @param {[a]} lst
 * @param {number} index
 * @param {a} val
 */
function list_add(lst, index, val) {
    return index === 0 || is_null(lst)
        ? pair(val, lst)
        : pair(head(lst), list_add(tail(lst), index - 1, val));
}

/**
 * Sets the element at index in the lst to val. Mutates the list.
 * Returns true when the value is successfully set.
 * @param {[a]} lst
 * @param {number} index
 * @param {a} val
 * @returns {boolean}
 */
function list_set(lst, index, val) {
    if (is_null(lst)) {
        return false;
    } else {
        if (index === 0) {
            set_head(lst, val);
            return true;
        } else {
            return list_set(tail(lst), index - 1, val);
        }
    }
}

/**
 * Applies a function to the specified element in the list. Mutates the list.
 * Returns true when the value is successfully set.
 * @param {[a]} lst
 * @param {number} index
 * @param {a} val
 * @returns {boolean}
 */
function list_map_at(lst, index, f) {
    if (is_null(lst)) {
        return false;
    } else {
        if (index === 0) {
            set_head(lst, f(head(lst)));
            return true;
        } else {
            return list_map_at(tail(lst), index - 1, f);
        }
    }
}

/**
 * Creates a list of pairs, which each pair contains elements in
 * both lists at the same index. Assumes equal length lists. The output
 * list reverses the sequence of elements in the input list.
 * @param {} l1
 * @param {*} l2
 */
function zip_list(l1, l2) {
    function zip_list_helper(l1, l2, res) {
        if (is_null(l1) && is_null(l2)) {
            return res;
        } else if (is_null(l1) || is_null(l2)) {
            error("zipping list not equal length");
        } else {
            return zip_list_helper(
                tail(l1),
                tail(l2),
                pair(pair(head(l1), head(l2)), res)
            );
        }
    }
    return zip_list_helper(l1, l2, null);
}
function sigma(t, sfs) {
    if (is_base_type(t)) {
        return t;
    } else if (is_function_type(t)) {
        const params = param_types_of_fn_type(t);
        const res = return_type_of_fn_type(t);
        const sig_params = map((param) => sigma(param, sfs), params);
        const sig_res = sigma(res, sfs);
        return make_function_type(sig_params, sig_res);
    } else {
        const find_res = set_find_key_type(sfs, t);
        if (is_null(find_res)) {
            return t;
        } else {
            return sigma(tail(find_res), sfs);
        }
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
    const rules_list = list(
        rule_1,
        rule_2,
        rule_3,
        rule_4,
        rule_5,
        rule_6,
        rule_7,
        rule_8
    );

    function solve_rules(r_list) {
        if (is_null(r_list)) {
            error("type error: no rules matched");
        } else {
        }

        // rule_*(cons, sfs) -> (bool, sfs)
        const result = head(r_list)(cons, solved_form_set);
        // (true, sfs) : if matched, and return the sfs
        // (false, _) : not matched, go to the next rule
        return head(result) ? tail(result) : solve_rules(tail(r_list));
    }

    return solve_rules(rules_list);
}

// all function has the signature: rule_*(cons, sfs) -> (bool, sfs)
function rule_1(cons, sfs) {
    return equal_type(head(cons), tail(cons)) &&
        head(head(cons)) === "primitive"
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

    return is_type_var(t) && equal_type(sig_ta, t)
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

    // check if t is contained in Σ(t′)
    if (
        equal_type(return_type_of_fn_type(sig_ta), t) ||
        !is_null(
            filter(
                (param) => equal_type(param, t),
                param_types_of_fn_type(sig_ta)
            )
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
        equal_type(sig_ta, number_type) || equal_type(sig_ta, string_type);

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
    let sig_ta = sigma(ta, sfs);

    if (is_type_var(t) && is_null(set_find_key(sfs, t))) {
        // addable conversion
        const sig_t = sigma(t, sfs);
        if (
            is_type_var(sig_t) &&
            head(tail(sig_t)) === "A" &&
            is_type_var(sig_ta) &&
            head(tail(sig_ta)) === "T"
        ) {
            sig_ta = change_type_var_to_addable(sig_ta);
        } else {
        }

        return pair(true, set_insert(sfs, pair(t, sig_ta)));
    } else {
        return pair(false, null);
    }
}

function rule_8(cons, sfs) {
    const t = head(cons);
    const ta = tail(cons);
    if (is_function_type(t) && is_function_type(ta)) {
        const t_params = param_types_of_fn_type(t);
        const ta_params = param_types_of_fn_type(ta);
        if (length(t_params) !== length(ta_params)) {
            return pair(false, null);
        } else {
            // creating n constraints
            const fn_cons = pair(
                pair(return_type_of_fn_type(t), return_type_of_fn_type(ta)),
                zip_list(t_params, ta_params)
            );
            return pair(true, accumulate(solve, sfs, fn_cons));
        }
    } else {
        return pair(false, null);
    }
}
/* transform.js */

function transform(stmt) {
    return is_primitive_node(stmt) || is_name(stmt)
        ? stmt
        : is_constant_declaration(stmt)
        ? transform_constant_declaration(stmt)
        : is_conditional_expression(stmt)
        ? transform_conditional_expression(stmt)
        : is_conditional_statement(stmt)
        ? transform_conditional_statement(stmt)
        : is_sequence(stmt)
        ? transform_sequence(stmt)
        : is_application(stmt)
        ? transform_application(stmt)
        : is_function_definition(stmt)
        ? transform_function_definition(stmt)
        : is_block(stmt)
        ? transform_block(stmt)
        : is_return_statement(stmt)
        ? transform_return_statement(stmt)
        : error(stmt, "Unknown statement type in transform: ");
}

function transform_block(stmt) {
    const body = block_body(stmt);
    return list("block", transform(body), list_ref(stmt, 2));
}

function transform_return_statement(stmt) {
    return list(
        "return_statement",
        transform(return_statement_expression(stmt)),
        list_ref(stmt, 2)
    );
}

function transform_function_definition(stmt) {
    const parameters = function_definition_parameters(stmt);
    const body = function_definition_body(stmt);
    return list(
        "function_definition",
        map((name) => transform(name), parameters),
        transform(body),
        list_ref(stmt, 3)
    );
}

function transform_application(stmt) {
    return list(
        "application",
        transform(operator(stmt)),
        map((opd) => transform(opd), operands(stmt)),
        list_ref(stmt, 3)
    );
}

function transform_conditional_expression(stmt) {
    return list(
        "conditional_expression",
        transform(cond_pred(stmt)),
        transform(cond_cons(stmt)),
        transform(cond_alt(stmt)),
        list_ref(stmt, 4)
    );
}

function transform_conditional_statement(stmt) {
    return list(
        "conditional_statement",
        transform(cond_pred(stmt)),
        transform(cond_cons(stmt)),
        transform(cond_alt(stmt)),
        list_ref(stmt, 4)
    );
}
function transform_sequence(stmt) {
    const number_of_statements = length(sequence_statements(stmt));
    const transformed_exprs = map(
        (stmt) => transform(stmt),
        sequence_statements(stmt)
    );

    // add return to the last statement
    list_map_at(transformed_exprs, number_of_statements - 1, (s) =>
        list("return_statement", s, make_new_T_type(fresh_T_var()))
    );

    return list(
        "sequence",
        transformed_exprs,
        list_ref(stmt, 2) // the type of the entire sequence
    );
}

function transform_constant_declaration(stmt) {
    return list(
        "constant_declaration",
        transform(list_ref(stmt, 1)),
        transform(list_ref(stmt, 2)),
        list_ref(stmt, 3)
    );
}

function transform_top_level(stmt) {
    return list("block", transform(stmt), make_new_T_type(fresh_T_var()));
}
function set_insert(s, p) {
    return set_contain(s, p) ? s : pair(p, s);
}

function set_insert_cons(s, cons) {
    return set_contain_cons(s, cons) ? s : pair(cons, s);
}

function set_contain(s, p) {
    return is_null(s)
        ? false
        : equal(head(s), p)
        ? true
        : set_contain(tail(s), p);
}

function set_contain_cons(s, cons) {
    return is_null(s)
        ? false
        : equal_type(head(cons), head(head(s))) &&
          equal_type(tail(cons), tail(head(s)))
        ? true
        : set_contain_cons(tail(s), cons);
}

function set_find_key_type(s, type) {
    // type variable are equated only by the number
    const res = filter((p) => equal_type(head(p), type), s);
    return is_null(res) ? null : head(res);
}

/** Return the key-value pair, null if not found*/
function set_find_key(s, h) {
    const res = filter((p) => equal(head(p), h), s);
    return is_null(res) ? null : head(res);
}

/** Return the key-value pair, null if not found */
function set_find_val(s, v) {
    const res = filter((p) => equal(tail(p), v), s);
    return is_null(res) ? null : head(res);
}
/* TYPE ENVIRONMENTS */

// // auxillary type
// const no_type_yet = list("name", "no_type_yet");
// function is_no_type_yet(type) {
//     return equal_type(type, no_type_yet);
// }

// type frames are pairs with a list of names as head
// an a list of pairs as tail (types).

function make_frame(names, types) {
    return pair(names, types);
}
function frame_names(frame) {
    return head(frame);
}
function frame_types(frame) {
    return tail(frame);
}

// The first frame in a type environment is the
// "innermost" frame. The tail operation takes
// you to the "enclosing" type environment

function first_frame(env) {
    return head(env);
}
function enclosing_environment(env) {
    return tail(env);
}
function enclose_by(frame, env) {
    return pair(frame, env);
}
function is_empty_environment(env) {
    return is_null(env);
}

// type lookup proceeds from the innermost
// frame and continues to look in enclosing
// environments until the name is found

function lookup_type(name, env) {
    function env_loop(env) {
        function scan(names, types) {
            return is_null(names)
                ? env_loop(enclosing_environment(env))
                : name === head(names)
                ? head(types)
                : scan(tail(names), tail(types));
        }
        if (is_empty_environment(env)) {
            error(name, "Unbound name: ");
        } else {
            const frame = first_frame(env);
            const type = scan(frame_names(frame), frame_types(frame));
            if (type === no_value_yet) {
                error(name, "Name used before declaration: ");
            } else {
                return type;
            }
        }
    }
    return env_loop(env);
}

// set_type is used for type declarations to
// set the type of a given name in the first
// (innermost) frame of the given environment

function set_type(name, type, env) {
    function scan(names, types) {
        return is_null(names)
            ? error("internal error: name not found")
            : name === head(names)
            ? set_head(types, type)
            : scan(tail(names), tail(types));
    }
    const frame = first_frame(env);
    return scan(frame_names(frame), frame_types(frame));
}

// the type checking of a compound function will
// lead to the type checking of its body with respect
// to of a new type environment, in which every parameter
// (names) refers to the declared types of the function

function extend_environment(names, types, base_env) {
    if (length(names) === length(types)) {
        return enclose_by(make_frame(names, types), base_env);
    } else if (length(names) < length(types)) {
        error(
            "Too many arguments supplied: " +
                stringify(names) +
                ", " +
                stringify(types)
        );
    } else {
        error(
            "Too few arguments supplied: " +
                stringify(names) +
                ", " +
                stringify(types)
        );
    }
}

// We use a nullary function as temporary value for names whose
// declaration has not yet been evaluated. The purpose of the
// function definition is purely to create a unique identity;
// the function will never be applied and its return value
// (null) is irrelevant.
const no_value_yet = () => null;

// The function local_names collects all names declared in the
// body statements. For a name to be included in the list of
// local_names, it needs to be declared outside of any other
// block or function.

function insert_all(xs, ys) {
    return is_null(xs)
        ? ys
        : is_null(member(head(xs), ys))
        ? pair(head(xs), insert_all(tail(xs), ys))
        : error(head(xs), "multiple declarations of: ");
}

const the_empty_environment = null;

// TODO: add built-in function types
const non_overloaded_prim_ops = list(
    list("-", list(number_type, number_type), number_type),
    list("*", list(number_type, number_type), number_type),
    list("/", list(number_type, number_type), number_type),
    list("%", list(number_type, number_type), number_type),
    list("&&", list(bool_type, T_type), T_type),
    list("||", list(bool_type, T_type), T_type),
    list("!", list(bool_type), bool_type),
    list("!", list(bool_type), bool_type),
    list("-1", list(number_type), number_type) // handled explicitly in annotate_application
);

const overloaded_bin_prim_ops = list(
    list("+", list(A_type, A_type), A_type),
    list("===", list(A_type, A_type), bool_type),
    list("!==", list(A_type, A_type), bool_type),
    list(">", list(A_type, A_type), bool_type),
    list("<", list(A_type, A_type), bool_type),
    list(">=", list(A_type, A_type), bool_type),
    list("<=", list(A_type, A_type), bool_type)
);

// // the global environment also has bindings for all
// // primitive non-function values, such as undefined and
// // math_PI

// const primitive_constants = list(
//     list("undefined", undefined),
//     list("math_PI", math_PI)
// );

// setup_environment makes an environment that has
// one single frame, and adds a binding of all names
// listed as primitive_functions and primitive_values.
// The values of primitive functions are "primitive"
// objects, see line 281 how such functions are applied

function setup_environment() {
    const non_overloaded_prim_ops_names = map(
        (l) => head(l),
        non_overloaded_prim_ops
    );

    const non_overloaded_prim_ops_values = map(
        (l) =>
            make_forall_type(
                make_function_type(head(tail(l)), head(tail(tail(l))))
            ),
        non_overloaded_prim_ops
    );

    const overloaded_bin_prim_ops_names = map(
        (l) => head(l),
        overloaded_bin_prim_ops
    );

    const overloaded_bin_prim_ops_values = map(
        (l) =>
            make_forall_type(
                make_function_type(head(tail(l)), head(tail(tail(l))))
            ),
        overloaded_bin_prim_ops
    );

    return extend_environment(
        append(non_overloaded_prim_ops_names, overloaded_bin_prim_ops_names),
        append(non_overloaded_prim_ops_values, overloaded_bin_prim_ops_values),
        the_empty_environment
    );
}
/**
 * Packed at the end of the output script
 */
const power_test_prog = parse(
    "function power(x, y) {            \
    return y === 0                \
        ? 1                       \
        : x * power(x, y - 1);    \
}                                 \
power(17, 3);                     "
);

const simple_test_prog = parse(
    "function test(a) { \
        return a * 1; \
    } \
    test;\
    test(2); \
        "
);

const minus_op_test_prog = parse(
    "const a_negative_number = -999; \
    const a_minus_expr = 888 - 777; \
    "
);

const top_level_transformation_test_prog = parse(
    " if (true) { \
        const x = 1; \
        x + 2; \
    } else { \
        const y = 3; \
        y + 4; \
    } "
);

const conditional_expr_test_prog = "true ? 1 : 2;";
const ultra_simple_fn_prog = "(()=>1)();";
const monomorphic_name_prog = "const a = 1;a;";
const polymorphic_func_prog = "function x(a) {return a;} x(1); x(true);";

function infer_program(prog) {
    const new_counter = init_fresh_type_var_counter();
    fresh_A_var = new_counter;
    fresh_T_var = new_counter;
    const sigma_set = null;
    const type_env = setup_environment();
    const annotated = annotate(parse(prog));
    const transformed = transform_top_level(annotated);
    // display(transformed);
    return collect(transformed, sigma_set, type_env);
}
