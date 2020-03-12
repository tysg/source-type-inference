/*
This is a type checker for a language that lets you 
declare functions and constants, apply functions, 
and carry out simple arithmetic calculations, 
conditionals and boolean operations.

The language requires all declared names to be typed.
Examples are at the end of this program.

The covered Typed Source language is:

stmt    ::= name = type ; 
         |  const name = expr ; 
         |  function name(params) { 
                 stmt
            }
         |  expr ;
         |  return expr ;
         |  stmt stmt
type    ::= bool | number 
         |  ( type (* type)... | null ) > type 
expr    ::= expr ? expr : expr
         |  expr binop expr
         |  unop expr
         |  name
         |  number
         |  expr(expr, expr, ...)
binop   ::= + | - | * | / | % | < | > | <= | >= 
         | === | !== |  && | ||
unop    ::= !

Restrictions: 
* Every declaration (const or function) of a name must
  be preceded in the same block by a type declaration.
* Every occurrence of a name must be preceded by a
  type declaration of that name.

*/

/* CONSTANTS: NUMBERS, STRINGS, TRUE, FALSE */

// constants (numbers, booleans) represent
// themselves in the syntax tree, and
// have the obvious type.

// is_boolean checks for a boolean literal
// is_number checks for a number literal

// all other statements and expressions are
// tagged lists. Their tag tells us what
// kind of statement/expression they are

function is_tagged_list(stmt, the_tag) {
    return is_pair(stmt) && head(stmt) === the_tag;
}

/* TYPE DECLARATIONS */

// type declarations are tagged with "assignment"
// (a bit strangely) and have a "name" (whose type is
// being declared) and a "type" (which is the declared
// type of the name).

// The underlying representation of types is quite
// idiosyncratic (inherited from the Source §4 parser),
// so it is important to access types only using the
// functions below.

function is_type_declaration(stmt) {
    return is_tagged_list(stmt, "assignment");
}
function type_declaration_name(stmt) {
    return head(tail(stmt));
}
function type_declaration_type(stmt) {
    return head(tail(tail(stmt)));
}

const bool_type = list("name", "bool");
function is_bool_type(type) {
    return equal_type(type, bool_type);
}

const number_type = list("name", "number");
function is_number_type(type) {
    return equal_type(type, number_type);
}
const undefined_type = list("name", "undefined");
function is_undefined_type(type) {
    return equal_type(type, undefined_type);
}
function make_binary_function_type(
    first_arg_type,
    second_arg_type,
    result_type
) {
    return list(
        "application",
        list("name", ">"),
        list(
            list(
                "application",
                list("name", "*"),
                list(first_arg_type, second_arg_type)
            ),
            result_type
        )
    );
}
function make_unary_function_type(arg_type, result_type) {
    return list("application", list("name", ">"), list(arg_type, result_type));
}
function is_function_type(type) {
    return is_application(type);
}
function argument_types_of_function_type(function_type) {
    // we don't allow parentheses in the
    // list of argument types t1 * ... * tn
    // and therefore can just flatten the *-expressions
    function flatten(type) {
        return is_null(type)
            ? null
            : is_application(type) && name_of_name(operator(type)) === "*"
            ? append(
                  flatten(list_ref(operands(type), 0)),
                  flatten(list_ref(operands(type), 1))
              )
            : is_list(type) && length(type) === 1 && is_name(list_ref(type, 0))
            ? list(list_ref(type, 0))
            : list(type);
    }
    return flatten(head(head(tail(tail(function_type)))));
}
function result_type_of_function_type(function_type) {
    return head(tail(head(tail(tail(function_type)))));
}
function is_return_type(type) {
    return is_tagged_list(type, "return");
}
function type_of_return_type(type) {
    return list_ref(type, 1);
}
function make_return_type(type) {
    return list("return", type);
}
const no_type_yet = list("name", "no_type_yet");
function is_no_type_yet(type) {
    return equal_type(type, no_type_yet);
}

function print_args(ts) {
    return is_null(ts)
        ? "null"
        : length(ts) === 1
        ? print_type(head(ts))
        : print_type(head(ts)) + " * " + print_args(tail(ts));
}

function print_type(type) {
    return head(type) === "name"
        ? head(tail(type))
        : "(" +
              print_args(argument_types_of_function_type(type)) +
              " > " +
              print_type(result_type_of_function_type(type)) +
              ")";
}

function equal_types(types1, types2) {
    return (
        (is_null(types1) && is_null(types2)) ||
        (is_pair(types1) &&
            is_pair(types2) &&
            equal_type(head(types1), head(types2)) &&
            equal_types(tail(types1), tail(types2)))
    );
}

function equal_type(type1, type2) {
    return (
        (is_name(type1) &&
            is_name(type2) &&
            name_of_name(type1) === name_of_name(type2)) ||
        (is_function_type(type1) &&
            is_function_type(type2) &&
            equal_types(
                argument_types_of_function_type(type1),
                argument_types_of_function_type(type2)
            ) &&
            equal_type(
                result_type_of_function_type(type1),
                result_type_of_function_type(type2)
            ))
    );
}

function handle_type_declaration(stmt, env) {
    set_type(
        name_of_name(type_declaration_name(stmt)),
        type_declaration_type(stmt),
        env
    );
    return undefined_type;
}

/* NAMES */

// In this evaluator, the operators are referred
// to as "names" in expressions.

// Names are tagged with "name".
// In this language, typical names
// are
// list("name", "+")
// list("name", "factorial")
// list("name", "n")

function is_name(stmt) {
    return is_tagged_list(stmt, "name");
}
function name_of_name(stmt) {
    return head(tail(stmt));
}

function type_of_name(name, env) {
    return lookup_type(name, env);
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

// typing of a constant declaration returns
// either undefined_type or shows an error

function type_constant_declaration(stmt, env) {
    const name = constant_declaration_name(stmt);
    const val = constant_declaration_value(stmt);
    const declared_type = lookup_type(name, env);

    if (is_function_definition(val)) {
        const body = function_definition_body(val);
        const parameters = function_definition_parameters(val);
        if (is_function_type(declared_type)) {
            const arg_types = argument_types_of_function_type(declared_type);

            const result_type = result_type_of_function_type(declared_type);
            if (length(arg_types) === length(parameters)) {
                const locals = local_names(body);
                const extended_env = extend_environment(
                    locals,
                    map(x => no_type_yet, locals),
                    extend_environment(parameters, arg_types, env)
                );
                const body_type = type(body, extended_env);
                if (is_return_type(body_type)) {
                    return equal_type(
                        type_of_return_type(body_type),
                        result_type
                    )
                        ? undefined_type
                        : error(name, "type error in function");
                } else {
                    return is_undefined_type(result_type)
                        ? undefined_type
                        : error(name, "return statement missing");
                }
            } else {
                error(name, "number of arguments not as declared");
            }
        } else {
            error(name, "must be declared as function");
        }
    } else {
        return equal_type(type(val, env), lookup_type(name, env))
            ? undefined_type
            : error(name, "type error");
    }
}

/* CONDITIONAL EXPRESSIONS */

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

// the typing of conditional expressions finds the type
// of the predicate, which must be bool. The types of
// the consequent and alternative expression must be equal.

function type_conditional_expression(stmt, env) {
    const pred_type = type(cond_expr_pred(stmt), env);
    const cons_type = type(cond_expr_cons(stmt), env);
    const alt_type = type(cond_expr_alt(stmt), env);
    return is_bool_type(pred_type)
        ? equal_type(cons_type, alt_type)
            ? cons_type
            : error(
                  "conditional consequent and \
alternative must have the same type"
              )
        : error("conditional predicate must have bool type");
}

/* FUNCTION DEFINITION EXPRESSIONS */

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

/* SEQUENCES */

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

// to find the type of a sequence, we need to find the
// type of its statements one after the other, and
// return the type of the last statement.
// An exception to this rule is when a return
// statement is encountered. In that case, the
// remaining statements are ignored and the
// return type is the type of the sequence.

function type_sequence(stmts, env) {
    if (is_empty_sequence(stmts)) {
        return undefined;
    } else if (is_last_statement(stmts)) {
        return type(first_statement(stmts), env);
    } else {
        const first_stmt_type = type(first_statement(stmts), env);
        if (is_return_type(first_stmt_type)) {
            display("unreachable statement detected");
            type(rest_statements(stmts), env);
            return first_stmt_type;
        } else {
            return type_sequence(rest_statements(stmts), env);
        }
    }
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
function no_operands(ops) {
    return is_null(ops);
}
function first_operand(ops) {
    return head(ops);
}
function rest_operands(ops) {
    return tail(ops);
}

function type_application(fun_type, arg_types) {
    return equal_types(arg_types, argument_types_of_function_type(fun_type))
        ? result_type_of_function_type(fun_type)
        : error("arguments do not match type of function");
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

// since return statements can occur anywhere in the
// body, we need to identify them during the typing
// process

function type_return_statement(stmt, env) {
    return make_return_type(type(return_statement_expression(stmt), env));
}

/* TYPING */

// list_of_types returns for a given list of expressions
// the corresponding list of types, with respect to a
// given environment

function list_of_types(exps, env) {
    if (no_operands(exps)) {
        return null;
    } else {
        return pair(
            type(first_operand(exps), env),
            list_of_types(rest_operands(exps), env)
        );
    }
}

// The workhorse of our type checker is the type function.
// It dispatches on the kind of statement at hand, and
// invokes the appropriate implementations of their
// type checking, as described above, always using
// a current type environment

function type(stmt, env) {
    return is_type_declaration(stmt)
        ? handle_type_declaration(stmt, env)
        : is_number(stmt)
        ? number_type
        : is_boolean(stmt)
        ? bool_type
        : is_undefined(stmt)
        ? undefined_type
        : is_name(stmt)
        ? lookup_type(name_of_name(stmt), env)
        : is_constant_declaration(stmt)
        ? type_constant_declaration(stmt, env)
        : is_conditional_expression(stmt)
        ? type_conditional_expression(stmt, env)
        : is_sequence(stmt)
        ? type_sequence(sequence_statements(stmt), env)
        : is_return_statement(stmt)
        ? type_return_statement(stmt, env)
        : is_application(stmt)
        ? type_application(
              type(operator(stmt), env),
              list_of_types(operands(stmt), env)
          )
        : error(stmt, "Unknown statement type in evaluate: ");
}

// at the toplevel (outside of functions), return statements
// are not allowed. The function type_toplevel detects
// return types and displays an error in when it encounters one.

function type_toplevel(stmt) {
    const toplevel_names = local_names(stmt);
    const program_env = extend_environment(
        toplevel_names,
        map(n => no_type_yet, toplevel_names),
        the_global_environment
    );
    const the_type = type(stmt, program_env);
    if (is_return_type(the_type)) {
        error("return not allowed " + "outside of function definitions");
    } else {
        return the_type;
    }
}

/* THE GLOBAL TYPE ENVIRONMENT */

const the_empty_environment = null;

// the global environment has bindings for all
// primitive functions, including the operators

const primitive_unary_functions = list(list("!", bool_type, bool_type));
const primitive_binary_functions = list(
    list("+", number_type, number_type, number_type),
    list("-", number_type, number_type, number_type),
    list("*", number_type, number_type, number_type),
    list("/", number_type, number_type, number_type),
    list("===", number_type, number_type, bool_type),
    list("!==", number_type, number_type, bool_type),
    list("<", number_type, number_type, bool_type),
    list("<=", number_type, number_type, bool_type),
    list(">", number_type, number_type, bool_type),
    list(">=", number_type, number_type, bool_type),
    list("&&", bool_type, bool_type, bool_type),
    list("||", bool_type, bool_type, bool_type)
);

// the global environment also has bindings for all
// primitive non-function values, such as undefined and
// math_PI

const primitive_constants = list(
    list("undefined", undefined_type),
    list("math_PI", number_type)
);

// setup_environment makes an environment that has
// one single frame, and adds a binding of all names
// listed as primitive_functions and primitive_values.
// The values of primitive functions are "primitive"
// objects, see line 281 how such functions are applied

function setup_environment() {
    const primitive_unary_function_names = map(
        f => head(f),
        primitive_unary_functions
    );
    const primitive_unary_function_types = map(
        f => make_unary_function_type(list_ref(f, 1), list_ref(f, 2)),
        primitive_unary_functions
    );
    const primitive_binary_function_names = map(
        f => head(f),
        primitive_binary_functions
    );
    const primitive_binary_function_types = map(
        f =>
            make_binary_function_type(
                list_ref(f, 1),
                list_ref(f, 2),
                list_ref(f, 3)
            ),
        primitive_binary_functions
    );
    const primitive_constant_names = map(f => head(f), primitive_constants);
    const primitive_constant_types = map(
        f => head(tail(f)),
        primitive_constants
    );
    return extend_environment(
        append(
            primitive_constant_names,
            append(
                primitive_unary_function_names,
                primitive_binary_function_names
            )
        ),
        append(
            primitive_constant_types,
            append(
                primitive_unary_function_types,
                primitive_binary_function_types
            )
        ),
        the_empty_environment
    );
}

function parse_and_type(str) {
    return type_toplevel(parse(str));
}
