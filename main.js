/**
 * Packed at the end of the output script
 */
const the_global_environment = setup_environment();
const sigma_set = null;

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

const conditional_expr_test_prog = parse("true ? 1 : 2;");

const annotated = annotate_top_level(conditional_expr_test_prog);
const transformed = transform_top_level(annotated);
const solved_form = collect(transformed, sigma_set);
display(solved_form);
sigma(make_new_T_type(5), solved_form);
