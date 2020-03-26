/**
 * Packed at the end of the output script
 */
const the_global_environment = setup_environment();

// const P = parse(
//     "function power(x, y) {            \
//     return y === 0                \
//         ? 1                       \
//         : x * power(x, y - 1);    \
// }                                 \
// power(17, 3);                     "
// );

const P = parse(
    "function test(a) { \
        return a * 1; \
    } \
    test(2); \
        "
);
display(P);
display_list(annotate_top_level(P));
