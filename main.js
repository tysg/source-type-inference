/**
 * Packed at the end of the output script
 */
const the_global_environment = setup_environment();
/*
examples:
*/

//parse_and_type("1;");

//parse_and_type("1 + 1;");
//parse_and_type("1 + 3 * 4;");
//parse_and_type("(1 + 3) * 4;");
//parse_and_type("1.4 / 2.3 + 70.4 * 18.3;");
//parse_and_type("!true;");
//parse_and_type("! (1 === 1);");
//parse_and_type("(! (1 === 1)) ? 1 : 2;");

//print_type(parse_and_type("x = number; const x = 1; x;"));

/*
print_type(parse_and_type("     \
f = number * bool > number;     \
function f(x, y) { return x; }  \
f;                              "));
*/

/*
print_type(parse_and_type("     \
f = number * bool > undefined;  \
function f(x, y) { x; }         \
f;                              "));
*/

/*
parse_and_type("                \
factorial = number > number;    \
function factorial(n) {         \
    return n === 1 ? 1          \
        : n * factorial(n - 1); \
}                               \
factorial(4);                   ");
*/

/*
parse_and_type("                \
about_pi = number;              \
const about_pi = 3;             \
square = number > number;       \
function square(x) {            \
    return x * x;               \
}                               \
4 * about_pi * square(6371);    ";
*/

/*
parse_and_type("                  \
power = number * number > number; \
function power(x, y) {            \
    return y === 0                \
        ? 1                       \
        : x * power(x, y - 1);    \
}                                 \
power(17, 3);                     ");
*/

/*
parse_and_type("                                            \
recurse =                                                   \
  number * number * (number * number > number) * number >   \
  number;                                                   \
function recurse(x, y, operation, initvalue) {              \
    return y === 0                                          \
        ? initvalue                                         \
        : operation(x, recurse(x, y - 1,                    \
                    operation, initvalue));                 \
}                                                           \
                                                            \
f = number * number > number;                               \
function f(x, z) { return x * z; }                          \
recurse(2, 3, f, 1);                                        \
g = number * number > number;                               \
function g(x, z) { return x + z; }                          \
recurse(2, 3, g, 0);                                        \
                                                            \
h = number * number > number;                               \
function h(x, z) { return x / z; }                          \
recurse(2, 3, h, 128);                                      ");
*/

/*
parse_and_type("               \
f = number > number;           \
function f(x) { return x; }    \
f ? 1 : 0;                     ");
// expected error: "conditional predicate must have bool type"

/*
parse_and_type("               \
x = number;                    \
const x = 2 * y;               \
y = number;                    \
const y = 4;                   ");
// expected error: Name used before declaration:  "y"
*/

/*
parse_and_type("                 \
x = number; const x = 1;         \
y = number; const y = x; y;");
*/

/*
parse_and_type("              \
f = null > number;            \
function f() { return 7; }    \
f();                          ");
*/

/*
// Newton's method for calculating square roots
parse_and_type("                                \
abs = number > number;                          \
function abs(x) {                               \
    return x >= 0 ? x : 0 - x;                  \
}                                               \
square = number > number;                       \
function square(x) {                            \
    return x * x;                               \
}                                               \
average = number * number > number;             \
function average(x,y) {                         \
    return (x + y) / 2;                         \
}                                               \
sqrt = number > number;                         \
function sqrt(x) {                              \
    good_enough = number * number > bool;       \
    function good_enough(guess, x) {            \
        return abs(square(guess) - x) < 0.001;  \
    }                                           \
    improve = number * number > number;         \
    function improve(guess, x) {                \
        return average(guess, x / guess);       \
    }                                           \
    sqrt_iter = number * number > number;       \
    function sqrt_iter(guess, x) {              \
        return good_enough(guess, x)            \
                   ? guess                      \
                   : sqrt_iter(improve(         \
                                guess, x), x);  \
    }                                           \
   return sqrt_iter(1.0, x);                    \
}                                               \
                                                \
sqrt(5);                                        ");
*/
