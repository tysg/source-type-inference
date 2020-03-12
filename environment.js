/* TYPE ENVIRONMENTS */

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
            if (is_no_type_yet(type)) {
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
