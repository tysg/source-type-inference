/**
 * Packed at the end of the output script
 */
const power_test_prog =
    "function power(x, y) {            \
    return y === 0                \
        ? 1                       \
        : x * power(x, y - 1);    \
}                                 \
power(17, 3);                     ";

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
    // display(annotated);
    const transformed = transform_top_level(annotated);
    return collect(transformed, sigma_set, type_env);
}

function check_type_var(number, sfs) {
    return sigma(make_new_T_type(number), sfs);
}

const solved = infer_program(polymorphic_func_prog);
display(check_type_var(9, solved));
