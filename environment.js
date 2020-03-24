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
function setup_environment() {
    return the_empty_environment;
}
