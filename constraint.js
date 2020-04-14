// constraint.js
function addtoConstraintList(constraints, first, second) {
	return append(constraints, pair(first, second));
}

function generate_constraint(constraints, stmt, env) {
	function get_type_variable(stmt) {
		return list_ref(stmt, length(stmt) - 1);
	}
	
	function is_type_variable(stmt) {
		return head(tail(get_type_variable(stmt))) === "T";
	}
	
	function infer_constant_declaration(constraints, stmt, env) {
		const name = list_ref(stmt, 1);
		const value = list_ref(stmt, 2);
		let newConstraints = addtoConstraintList(
			constraints,
			get_type_variable(stmt),
			get_type_variable(value));
		newConstraints = addtoConstraintList(
			newConstraints,
			get_type_variable(name),
			get_type_variable(value));
		
		newConstraints = generate_constraint(newConstraints, name, env);
		newConstraints = generate_constraint(newConstraints, value, env);
		return newConstraints;
	}
	
	function infer_conditional_expression(constraints, stmt, env) {
		const pred = cond_expr_pred(stmt);
		const cons = cond_expr_cons(stmt);
		const alt = cond_expr_alt(stmt);
		
		let newConstraints = addtoConstraintList(
			constraints,
			get_type_variable(pred),
			bool_type);
		newConstraints = addtoConstraintList(
			newConstraints,
			get_type_variable(stmt),
			get_type_variable(cons));
		newConstraints = addtoConstraintList(
			newConstraints,
			get_type_variable(cons),
			get_type_variable(alt));
		
		newConstraints = generate_constraint(newConstraints, pred, env);
		newConstraints = generate_constraint(newConstraints, cons, env);
		newConstraints = generate_constraint(newConstraints, alt, env);
		
		return newConstraints;
	}
	
	function infer_function_definition(constraints, stmt, env) {
		const parameters = function_definition_parameters(stmt);
		const body = function_definition_body(stmt);
		// to do
	}
	
	function infer_application(constraints, stmt, env) {
		const op = operator(stmt);
		const opr = operands(stmt);
		
		function result_type_of_function_type(function_type) {
			return head(tail(head(tail(tail(function_type)))));
		}
		
		let newConstraints = addtoConstraintList(
			constraints,
			get_type_variable(stmt),
			result_type_of_function_type(lookup_type(name_of_name(op)))); // need to test
			
		for (let i = opr; !no_operands(i); i = rest_operands(i)) {
			newConstraints = generate_constraint(newConstraints, i, env);
		}
		
		return newConstraints;
	}
	
	function infer_sequence(constraints, stmt, env) {
		const stmts = sequence_statements(stmt);
		let iter = stmts;
		let newConstraints = constraints;
		while (tail(iter) !== null && !is_return_statement(head(iter))) {
			newConstraints = generate_constraint(
				newConstraints, 
				head(iter), env);
			iter = tail(iter);
		}
		const last = iter;
		
		newConstraints = addtoConstraintList(
			constraints,
			get_type_variable(stmt),
			get_type_variable(last));
			
		newConstraints = generate_constraint(newConstraints, last, env);
		
		return newConstraints;
	}
	
	function infer_return_statement(constraints, stmt, env) {
		const expr = return_statement_expression;
		
		let newConstraints = addtoConstraintList(
			constraints,
			get_type_variable(stmt),
			get_type_variable(expr));
		
		newConstraints = generate_constraint(newConstraints, expr, env);
		return newConstraints;
	}
	
	function infer_block(constraints, stmt, env) {
		const body = block_body(stmt);
		let newConstraints = addtoConstraintList(
			constraints,
			get_type_variable(stmt),
			get_type_variable(body));
		
		const new_env = env;
		
		newConstraints = generate_constraint(newConstraints, body, new_env);
		return newConstraints;
	}
	
	if (is_type_variable(stmt)) {
		return is_constant_declaration(stmt)
			? infer_constant_declaration(constraints, stmt, env)
			: is_conditional_expression(stmt)
			? // TODO: change the name to conditional_statement
			  infer_conditional_expression(constraints, stmt, env)
			: is_sequence(stmt)
			? infer_sequence(constraints, stmt, env)
			: is_application(stmt)
			? infer_application(constraints, stmt, env)
			: is_function_definition(stmt)
			? annotate_function_definition(constraints, stmt, env)
			: is_block(stmt)
			? infer_block(constraints, stmt, env)
			: is_return_statement(stmt)
			? infer_return_statement(constraints, stmt, env)
			: constraints;
	}
	else {
		return constraints;
	}
}

function unify(constraints) {
	let unified = set();
	for (let i = constraints; i !== null; i = tail(i)) {
		const first = head(head(i));
		const second = tail(head(i));
		if (head(tail(first)) === "T" && set_find(unified, first) === null) {
			unified = set_insert(unified, first, first);
		}
		if (head(tail(second)) === "T" && set_find(unified, second) === null) {
			unified = set_insert(unified, second, second);
		}
		if (head(first) === "type_variable"
			&& head(second) === "type_variable") {
			unified = set_search(unified, second);
			const t = set_find(unified, second);
			unified = set_union(unified, first, t);
		}
		else if (head(first) === "type_variable"
				 && head(second) === "primitive") {
			unified = set_update(unified, first, second);             
		}
		else if (head(first) === "primitive"
				 && head(second) === "type_variable") {
			unified = set_update(unified, second, first);             
		}
	}
	for (let i = 0; i < length(unified); i++) {
		const v = get_key(list_ref(unified, i));
		unified = set_search(unified, v);
	}
	return unified;
}

// let global_constraints = list();
// constraints = generate_constraint(global_constraints, transformed, the_global_environment);
// unified = unify(global_constraints);
