// testing
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
		? "(" + print_args(param_types_of_fn_type(type)) +
		  ") > " +
		  print_type(return_type_of_fn_type(type))
		: is_type_var(type)
		? head(tail(type)) + stringify(head(tail(tail(type))))
		: error("Unknown type: " + stringify(type));
}

function test_1() {
	display("================================================================");
	const sigma_set = null;
	const program = "1;";
	display("Program: " + program);
	const annotated = annotate_top_level(parse(program));
	// display(annotated);
	display("Annotated program: " + "1 (T1);");
	const transformed = transform_top_level(annotated);
	const solved_form = collect(transformed, sigma_set);
	display("Types:");
	display("T1 : " + print_type(sigma(make_new_A_type(1), solved_form)));
}

function test_2() {
	display("================================================================");
	const sigma_set = null;
	const program = "(()=>1)();";
	display("Program: " + program);
	const annotated = annotate_top_level(parse(program));
	// display(annotated);
	display("Annotated program: " + "((() => (1 (T1)) (T2)) (T3))() (T4);");
	const transformed = transform_top_level(annotated);
	const solved_form = collect(transformed, sigma_set);
	// display(solved_form);
	display("Types:");
	display("T1 : " + print_type(sigma(make_new_A_type(1), solved_form)));
	display("T2 : " + print_type(sigma(make_new_T_type(2), solved_form)));
	display("T3 : " + print_type(sigma(make_new_T_type(3), solved_form)));
	display("T4 : " + print_type(sigma(make_new_T_type(4), solved_form)));
}

function test_3() {
	display("================================================================");
	const sigma_set = null;
	const program = "true ? 1 : 2;";
	display("Program: " + program);
	const annotated = annotate_top_level(parse(program));
	// display(annotated);
	display("Annotated program: " + "(true (T1) ? 1 (T2): 2 (T3)) (T4);");
	const transformed = transform_top_level(annotated);
	const solved_form = collect(transformed, sigma_set);
	display("Types:");
	display("T1 : " + print_type(sigma(make_new_T_type(1), solved_form)));
	display("T2 : " + print_type(sigma(make_new_A_type(2), solved_form)));
	display("T3 : " + print_type(sigma(make_new_A_type(3), solved_form)));
	display("T4 : " + print_type(sigma(make_new_T_type(4), solved_form)));
}

function test_4() {
	display("================================================================");
	const sigma_set = null;
	const program = "1 + 1;";
	display("Program: " + program);
	const annotated = annotate_top_level(parse(program));
	// display(annotated);
	display("Annotated program: " + "(1 (T1) + 1 (T2)) (T3);");
	const transformed = transform_top_level(annotated);
	const solved_form = collect(transformed, sigma_set);
	display("Types:");
	display("T1 : " + print_type(sigma(make_new_A_type(1), solved_form)));
	display("T2 : " + print_type(sigma(make_new_A_type(2), solved_form)));
	display("T3 : " + print_type(sigma(make_new_T_type(3), solved_form)));
}

function test_5() {
	display("================================================================");
	const sigma_set = null;
	const program = "1 + 3 * 4;";
	display("Program: " + program);
	const annotated = annotate_top_level(parse(program));
	// display(annotated);
	display("Annotated program: " + "(1 (T1) + (3 (T2) * 4 (T3)) (T4)) (T5);");
	const transformed = transform_top_level(annotated);
	const solved_form = collect(transformed, sigma_set);
	display("Types:");
	display("T1 : " + print_type(sigma(make_new_A_type(1), solved_form)));
	display("T2 : " + print_type(sigma(make_new_A_type(2), solved_form)));
	display("T3 : " + print_type(sigma(make_new_A_type(3), solved_form)));
	display("T4 : " + print_type(sigma(make_new_T_type(4), solved_form)));
	display("T5 : " + print_type(sigma(make_new_T_type(5), solved_form)));
}

function test_6() {
	display("================================================================");
	const sigma_set = null;
	const program = "(1 + 3) * 4;";
	display("Program: " + program);
	const annotated = annotate_top_level(parse(program));
	// display(annotated);
	display("Annotated program: " + "(1 (T1) + 3 (T2)) (T3) * 4 (T4)) (T5);");
	const transformed = transform_top_level(annotated);
	const solved_form = collect(transformed, sigma_set);
	display("Types:");
	display("T1 : " + print_type(sigma(make_new_A_type(1), solved_form)));
	display("T2 : " + print_type(sigma(make_new_A_type(2), solved_form)));
	display("T3 : " + print_type(sigma(make_new_T_type(3), solved_form)));
	display("T4 : " + print_type(sigma(make_new_A_type(4), solved_form)));
	display("T5 : " + print_type(sigma(make_new_T_type(5), solved_form)));
}

function test_7() {
	display("================================================================");
	const sigma_set = null;
	const program = "! (1 === 1);";
	display("Program: " + program);
	const annotated = annotate_top_level(parse(program));
	// display(annotated);
	display("Annotated program: " + "! ((1 (T1) === 1 (T2)) (T3)) (T4);");
	const transformed = transform_top_level(annotated);
	const solved_form = collect(transformed, sigma_set);
	display("Types:");
	display("T1 : " + print_type(sigma(make_new_A_type(1), solved_form)));
	display("T2 : " + print_type(sigma(make_new_A_type(2), solved_form)));
	display("T3 : " + print_type(sigma(make_new_T_type(3), solved_form)));
	display("T4 : " + print_type(sigma(make_new_T_type(4), solved_form)));
}

function test_8() {
	display("================================================================");
	const sigma_set = null;
	const program = "(! (1 === 1)) ? 1 : 2;";
	display("Program: " + program);
	const annotated = annotate_top_level(parse(program));
	// display(annotated);
	display("Annotated program: " + "((! ((1 (T1) === 1 (T2)) (T3)) (T4)) ? 1 (T5) : 2 (T6)) (T7);");
	const transformed = transform_top_level(annotated);
	const solved_form = collect(transformed, sigma_set);
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
	const sigma_set = null;
	const program = "const x = 1; x;";
	display("Program: " + program);
	const annotated = annotate_top_level(parse(program));
	display(annotated);
	display("Annotated program: " + "((const x (T1) = 1 (T2)) (T3); x (T1);) (T4)");
	const transformed = transform_top_level(annotated);
	const solved_form = collect(transformed, sigma_set);
	display("Types:");
	display("T1 : " + print_type(sigma(make_new_T_type(1), solved_form)));
	display("T2 : " + print_type(sigma(make_new_A_type(2), solved_form)));
	display("T3 : " + print_type(sigma(make_new_T_type(3), solved_form)));
	display("T4 : " + print_type(sigma(make_new_T_type(4), solved_form)));
}

function test_10() {
	display("================================================================");
	const sigma_set = null;
	const program = "function f(x, y) { return x; }  " +
					"f;                              ";
	display("Program: ");
	display("function f(x, y) { return x; }  ");
	display("f;                              ");
	const annotated = annotate_top_level(parse(program));
	// display(annotated);
	display("Annotated program: ");
	display("((function (f (T1))(x (T3), y (T2)) { (return x (T3)) (T4); } (T5)) (T6)");
	display(" f (T1);) (T7)                                                          ");
	const transformed = transform_top_level(annotated);
	const solved_form = collect(transformed, sigma_set);
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
	const sigma_set = null;
	const program = "function factorial(n) {         " +
					"    return n === 1 ? 1          " +
					"        : n * factorial(n - 1); " +
					"}                               " +
					"factorial(4);                   ";
	display("Program: ");
	display("function factorial(n) {         ");
	display("    return n === 1 ? 1          ");
	display("        : n * factorial(n - 1); ");
	display("}                               ");
	display("factorial(4);                   ");
	const annotated = annotate_top_level(parse(program));
	display(annotated);
	display("Annotated program: ");
	display("((function (factorial (T1))(n (T2)) {                                                  ");
	display("    (return ((n (T2) === 1 (T3)) (T4) ? 1 (T5)                                         ");
	display("        : (n (T2) * (factorial (T1))((n (T2) - 1 (T6)) (T7)) (T8)) (T9)) (T10)) (T11); ");
	display(" } (T12)) (T13)                                                                        ");
	display("(factorial (T1))(4 (T14)) (T15);) (T16)                                                ");
	const transformed = transform_top_level(annotated);
	const solved_form = collect(transformed, sigma_set);
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
	const sigma_set = null;
	const program = "const about_pi = 3;             " +
					"function square(x) {            " +
					"    return x * x;               " +
					"}                               " +
					"4 * about_pi * square(6371);    ";
	display("Program: ");
	display("const about_pi = 3;             ");
	display("function square(x) {            ");
	display("    return x * x;               ");
	display("}                               ");
	display("4 * about_pi * square(6371);    ");
	const annotated = annotate_top_level(parse(program));
	display(annotated);
	display("Annotated program: ");
	display("((const about_pi (T1) = 3 (T2)) (T3);                                                 ");
	display(" (function (square (T4))(x (T5)) {                                                    ");
	display("    (return (x (T5) * x (T5)) (T6)) (T7);                                             ");
	display(" } (T8)) (T9)                                                                         ");
	display(" (4 (T10) * about_pi (T1) (T11)) * ((square (T4))(6371 (T12)) (T13)) (T14);) (T15)    ");
	const transformed = transform_top_level(annotated);
	const solved_form = collect(transformed, sigma_set);
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


// test_1();
// test_2();
// test_3();
// test_4();
// test_5();
// test_6();
// test_7();
// test_8();
// test_9();
// test_10();
// test_11();
test_12();
