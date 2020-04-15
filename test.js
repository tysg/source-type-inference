// testing
function argument_types_of_function_type(function_type) {
    // we don't allow parentheses in the
    // list of argument types t1 * ... * tn
    // and therefore can just flatten the *-expressions
    function flatten(type) {
        return is_null(type) 
                ? null
            : is_application(type) && 
              name_of_name(operator(type)) === "*"
                ? append(flatten(list_ref(operands(type), 0)),
                     flatten(list_ref(operands(type), 1)))
            : is_list(type) && length(type) === 1 && is_name(list_ref(type, 0))
                ? list(list_ref(type, 0))
            : list(type);
    }
    return flatten(head(head(tail(tail(function_type)))));
}
function result_type_of_function_type(function_type) {
    return head(tail(head(tail(tail(function_type)))));
}

function print_type(type) {
    function print_args(ts) {
        return is_null(ts) ? "null" 
            : length(ts) === 1
            ? print_type(head(ts))
            : print_type(head(ts)) + " * " + print_args(tail(ts));
    }

    return is_base_type(type)
        ? head(tail(type))
        : is_function_type(type)
        ? "(" + print_args(argument_types_of_function_type(type)) +
          ") > " +
          print_type(result_type_of_function_type(type))
        : is_type_var(type)
        ? head(tail(type)) + stringify(head(tail(tail(type))))
        : error("Unknown type: " + stringify(type));
}

function test_1() {
    display("================================================================");
    const sigma_set = null;
    const program = parse("1;");
    const annotated = annotate_top_level(program);
    // display(annotated);
    const transformed = transform_top_level(annotated);
    const solved_form = collect(transformed, sigma_set);
    display("Test:");
    display("1; (T1)");
    display("T1 : " + print_type(sigma(make_new_A_type(1), solved_form)));
}

function test_2() {
    display("================================================================");
    const sigma_set = null;
    const program = parse("true ? 1 : 2;");
    const annotated = annotate_top_level(program);
    // display(annotated);
    const transformed = transform_top_level(annotated);
    const solved_form = collect(transformed, sigma_set);
    display("Test:");
    display("true (T1) ? 1 (T2): 2 (T3); (T4)");
    display("T1 : " + print_type(sigma(make_new_T_type(1), solved_form)));
    display("T2 : " + print_type(sigma(make_new_A_type(2), solved_form)));
    display("T3 : " + print_type(sigma(make_new_A_type(3), solved_form)));
    display("T4 : " + print_type(sigma(make_new_T_type(4), solved_form)));
}

// test_1();
test_2();
