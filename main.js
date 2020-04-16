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

function infer_program(prog) {
    const sigma_set = null;
    const type_env = setup_environment();
    const annotated = annotate_top_level(parse(prog));
    const transformed = transform_top_level(annotated);
    return collect(transformed, sigma_set, type_env);
}

// const conditional_expr_test_prog = parse("true ? 1 : 2;");
// const ultra_simple_fn_prog = parse("(()=>1)();");
// const monomorphic_name_prog = parse("const a = 1;a;");

// const polymorphic_func_prog = parse("function x(a) {return a;} x(1); x(true);");
// const annotate_top_level = annotate;

// const annotated = annotate(polymorphic_func_prog);
// const transformed = transform_top_level(annotated);
// const solved_form = collect(transformed, sigma_set, type_env);
// // display(solved_form);
// // display_list(transformed);
// display_list(sigma(make_new_T_type(14), solved_form));

test_1();
test_2();
test_3();
test_4();
test_5();
test_6();
test_7();
test_8();
test_9();
