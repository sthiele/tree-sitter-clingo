const binary_expression = function (pre, lhs, op, rhs) {
    if (pre < 0) {
        return prec.right(-pre, seq(field('lhs', lhs), field('op', op), field('rhs', rhs)))
    }
    return prec.left(pre, seq(field('lhs', lhs), field('op', op), field('rhs', rhs)))
}

const unary_expression = function (pre, op, rhs) {
    if (pre < 0) {
        return prec.right(-pre, seq(field('op', op), field('rhs', rhs)))
    }
    return prec.left(pre, seq(field('op', op), field('rhs', rhs)))
}

module.exports = grammar({
    name: 'clingo',
    extras: $ => [$.line_comment, $.block_comment, /\s/],
    // Note that the ambiguity between signature and term in show statements
    // does not necessarily have to be resolved in the grammar. It could also
    // be left to the user of the parser. Then, we could simply delete the
    // "show signature" part of the statement production.
    conflicts: $ => [[$.signature, $.function]],
    rules: {
        source_file: $ => repeat($.statement),

        // comments

        line_comment: _$ => token(choice(
            /%[^*].*/,
            '%'
        )),
        // TODO: clingo counts nested %* *% blocks
        block_comment: _$ => token(
            seq(
                '%*',
                /[^*]*\*+([^%*][^*]*\*+)*/,
                '%'
            ),
        ),

        // terms

        // the stunt here is meant to exclude not
        identifier: _$ => token(choice(
            /[_']+[a-z][A-Za-z0-9_']*/,
            /[a-mo-z][A-Za-z0-9_']*/,
            /n[A-Za-np-z0-9_'][A-Za-z0-9_']*/,
            /no[A-Za-su-z0-9_'][A-Za-z0-9_']*/,
            /not[A-Za-z0-9_']+/,
            /n/,
            /no/,
        )),

        // Tree sitter (imo incorrectly) applies precedences out of scope. We
        // simply workaround this issue by making classical negation part of
        // the identifier token. In practice, this should work well.
        negative_identifier: _$ => token(choice(
            /-[ ]*n/,
            /-[ ]*no/,
            /-[ ]*[_']+[a-z][A-Za-z0-9_']*/,
            /-[ ]*[a-mo-z][A-Za-z0-9_']*/,
            /-[ ]*n[A-Za-np-z0-9_'][A-Za-z0-9_']*/,
            /-[ ]*no[A-Za-su-z0-9_'][A-Za-z0-9_']*/,
            /-[ ]*not[A-Za-z0-9_']+/
        )),

        // TODO: clingo does something simpler!
        string: $ => choice(
            seq(
                '"',
                repeat(choice(
                    alias($.unescaped_double_string_fragment, $.string_fragment),
                    $.escape_sequence
                )),
                '"'
            )
        ),

        // Workaround to https://github.com/tree-sitter/tree-sitter/issues/1156
        // We give names to the token() constructs containing a regexp
        // so as to obtain a node in the CST.
        unescaped_double_string_fragment: _$ =>
            token.immediate(prec(1, /[^"\\]+/)),

        escape_sequence: _$ => token.immediate(seq(
            '\\',
            choice(
                /[^xu0-7]/,
                /[0-7]{1,3}/,
                /x[0-9a-fA-F]{2}/,
                /u[0-9a-fA-F]{4}/,
                /u\{[0-9a-fA-F]+\}/
            )
        )),

        supremum: _$ => choice(
            '#sup',
            '#supremum'
        ),
        infimum: _$ => choice(
            '#inf',
            '#infimum'
        ),
        number: _$ => choice(
            choice('0', /([1-9][0-9]*)/),
            token(seq('0x', /([0-9A-Fa-f]+)/)),
            token(seq('0o', /([1-7]+)/)),
            token(seq('0b', /([0-1]+)/)),
        ),
        anonymous: _$ => '_',
        variable: _$ => /[_']*[A-Z][A-Za-z0-9_']*/,

        const_term: $ => choice(
            $.infimum,
            $.supremum,
            $.number,
            $.string,
            alias($.const_binary, $.binary),
            alias($.const_unary, $.unary),
            alias($.const_abs, $.abs),
            alias($.const_function, $.function),
            alias($.const_tuple, $.tuple),
        ),
        _const_term: $ => alias($.const_term, $.term),

        const_binary: $ => choice(
            binary_expression(7, $._const_term, "^", $._const_term),
            binary_expression(6, $._const_term, "?", $._const_term),
            binary_expression(5, $._const_term, "&", $._const_term),
            binary_expression(4, $._const_term, "+", $._const_term),
            binary_expression(4, $._const_term, "-", $._const_term),
            binary_expression(3, $._const_term, "*", $._const_term),
            binary_expression(3, $._const_term, "/", $._const_term),
            binary_expression(3, $._const_term, "\\", $._const_term),
            binary_expression(-2, $._const_term, "**", $._const_term),
        ),

        const_unary: $ => choice(
            unary_expression(1, "-", $._const_term),
            unary_expression(1, "~", $._const_term),
        ),

        const_abs: $ => seq(
            "|",
            $._const_term,
            "|",
        ),

        const_terms: $ => seq(
            "(",
            optional(seq(
                $._const_term,
                repeat(seq(",", $._const_term)))),
        ),
        const_pool: $ => seq(alias($.const_terms, $.terms), ")"),

        _classical_identifier: $ => choice(
            $.negative_identifier,
            $.identifier,
        ),

        const_function: $ => seq(
            field("name", $._classical_identifier),
            field('arguments', optional(alias($.const_pool, $.pool))),
        ),

        const_terms_trail: $ => seq("(", optional(seq(
            $._const_term,
            repeat(seq(",", $._const_term)),
            optional(",")
        ))),

        const_tuple: $ => seq(alias($.const_terms_trail, $.terms), ")"),

        binary: $ => choice(
            binary_expression(8, $.term, "..", $.term),
            binary_expression(7, $.term, "^", $.term),
            binary_expression(6, $.term, "?", $.term),
            binary_expression(5, $.term, "&", $.term),
            binary_expression(4, $.term, "+", $.term),
            binary_expression(4, $.term, "-", $.term),
            binary_expression(3, $.term, "*", $.term),
            binary_expression(3, $.term, "/", $.term),
            binary_expression(3, $.term, "\\", $.term),
            binary_expression(-2, $.term, "**", $.term),
        ),

        unary: $ => choice(
            unary_expression(1, "-", $.term),
            unary_expression(1, "~", $.term),
        ),

        abs: $ => seq(
            "|",
            $.term,
            repeat(seq(";", $.term)),
            "|"
        ),

        terms: $ => $._terms,
        _terms: $ => seq(
            $.term,
            repeat(seq(",", $.term))
        ),

        // Note: "non-empty" and aliasable to terms
        terms_par: $ => seq("(", optional($._terms)),
        terms_sem: $ => seq(";", optional($._terms)),

        pool: $ => seq(
            alias($.terms_par, $.terms),
            repeat(alias($.terms_sem, $.terms)),
            ")"
        ),
        pool_binary: $ => seq(
            $.term, ",", $.term,
            repeat(seq(";", $.term, ",", $.term))),


        function: $ => seq(
            field("name", $._classical_identifier),
            field('arguments', optional($.pool)),
        ),
        external_function: $ => seq(
            "@",
            field("name", $.identifier),
            field('arguments', optional($.pool)),
        ),

        _terms_trail: $ => seq(
            $.term,
            repeat(seq(",", $.term)),
            optional(",")
        ),

        // Note: "non-empty" and aliasable to terms
        terms_trail_par: $ => seq("(", optional($._terms_trail)),
        terms_trail_sem: $ => seq(";", optional($._terms_trail)),

        tuple: $ => seq(
            alias($.terms_trail_par, $.terms),
            repeat(alias($.terms_trail_sem, $.terms)),
            ")"
        ),

        term: $ => choice(
            $.infimum,
            $.supremum,
            $.number,
            $.string,
            $.anonymous,
            $.variable,
            $.binary,
            $.unary,
            $.abs,
            $.function,
            $.external_function,
            $.tuple,
        ),

        // theory terms

        operator: _$ => choice(
            /[/!<=>+\-*\\?&@|:;~\^\.]+/,
            "not"
        ),
        operators: $ => repeat1($.operator),

        _theory_terms: $ => seq($.theory_term, repeat(seq(",", $.theory_term))),
        theory_terms: $ => $._theory_terms,

        theory_function: $ => seq($.identifier, optional(seq("(", optional($.theory_terms), ")"))),

        _theory_terms_trail: $ => choice(",", seq($.theory_term, repeat(seq(",", $.theory_term)), optional(","))),

        theory_tuple: $ => seq("(", optional($._theory_terms_trail), ")"),
        theory_list: $ => seq("[", optional($._theory_terms), "]"),
        theory_set: $ => seq("{", optional($._theory_terms), "}"),

        theory_unparsed_term: $ => choice(
            repeat1(seq($.operators, alias($.theory_root_term, $.theory_term))),
            seq(alias($.theory_root_term, $.theory_term), repeat1(seq($.operators, alias($.theory_root_term, $.theory_term)))),
        ),

        theory_term: $ => choice(
            $.theory_unparsed_term,
            $._theory_root_term,
        ),

        _theory_root_term: $ => choice(
            $.theory_function,
            $.theory_tuple,
            $.theory_list,
            $.theory_set,
            $.number,
            $.string,
            $.infimum,
            $.supremum,
            $.variable,
            $.anonymous,
        ),
        theory_root_term: $ => $._theory_root_term,

        // Literals

        boolean_constant: _$ => choice("#true", "#false"),

        symbolic_atom: $ => seq(
            field("name", $._classical_identifier),
            field("pool", optional($.pool)),
        ),

        relation: _$ => choice(">", "<", ">=", "<=", "=", "!="),

        comparison: $ => seq($.term, $.relation, $.term, repeat(seq($.relation, $.term))),

        _simple_atom: $ => choice(
            $.symbolic_atom,
            $.comparison,
            $.boolean_constant,
        ),

        default_negation: _$ => "not",

        sign: $ => seq($.default_negation, optional($.default_negation)),

        literal: $ => seq(optional($.sign), $._simple_atom),

        // aggregates

        literal_tuple: $ => seq($.literal, repeat(seq(",", $.literal))),

        _condition: $ => seq(":", optional($.literal_tuple)),

        aggregate_function: _$ => choice(
            "#sum",
            "#sum+",
            "#min",
            "#max",
            "#count"
        ),

        upper: $ => seq(optional($.relation), $.term),
        lower: $ => seq($.term, optional($.relation)),

        set_aggregate_element: $ => seq(
            field("literal", $.literal),
            field("condition", optional($._condition))),
        set_aggregate_elements: $ => seq($.set_aggregate_element, repeat(seq(";", $.set_aggregate_element))),

        _set_aggregate: $ => seq("{", optional($.set_aggregate_elements), "}"),
        set_aggregate: $ => seq(optional($.lower), $._set_aggregate, optional($.upper)),

        // theory atoms

        theory_element: $ => choice(
            seq($.theory_terms, optional($._condition)),
            seq($._condition),
        ),

        theory_elements: $ => seq($.theory_element, repeat(seq(";", $.theory_element))),

        theory_atom_name: $ => seq($.identifier, optional($.pool)),

        theory_atom: $ => seq("&", $.theory_atom_name, optional(seq("{", optional($.theory_elements), "}")), optional(seq($.operator, $.theory_term))),

        // body literals

        body_aggregate_element: $ => choice(
            field("condition", $._condition),
            seq(field("tuple", $.terms), field("condition", optional($._condition))),
        ),
        body_aggregate_elements: $ => seq($.body_aggregate_element, repeat(seq(";", $.body_aggregate_element))),

        _body_aggregate: $ => seq($.aggregate_function, "{", optional($.body_aggregate_elements), "}"),
        body_aggregate: $ => seq(optional($.lower), $._body_aggregate, optional($.upper)),

        body_literal: $ => seq(optional($.sign), choice(
            $.set_aggregate,
            $.body_aggregate,
            $.theory_atom,
            $._simple_atom
        )),

        body_literal_conditional: $ => $.conditional_literal,

        _body_literal_sep: $ => choice(
            seq($.body_literal, choice(";", ",")),
            seq(alias($.body_literal_conditional, $.body_literal), ";"),
        ),

        _body_literal: $ => choice($.body_literal, alias($.body_literal_conditional, $.body_literal)),

        body: $ => seq(optional(seq(repeat($._body_literal_sep), $._body_literal)), "."),
        body_0: _$ => ".",

        _colon_body: $ => choice(
            alias($.body_0, $.body),
            seq(":", $.body),
        ),

        // head literals

        head_aggregate_element: $ => seq(
            field("tuple", optional($.terms)),
            ":",
            field("literal", $.literal),
            field("condition", optional($._condition))),
        head_aggregate_elements: $ => seq($.head_aggregate_element, repeat(seq(";", $.head_aggregate_element))),

        _head_aggregate: $ => seq($.aggregate_function, "{", optional($.head_aggregate_elements), "}"),
        head_aggregate: $ => seq(optional($.lower), $._head_aggregate, optional($.upper)),

        conditional_literal: $ => seq($.literal, $._condition),
        conditional_literal_n: $ => seq($.literal, ":", $.literal_tuple),
        conditional_literal_0: $ => seq($.literal, ":"),

        _disjunction_element_sep: $ => choice(
            seq($.literal, choice(",", ";", "|")),
            seq(alias($.conditional_literal_n, $.conditional_literal), choice(";", "|")),
            seq(alias($.conditional_literal_0, $.conditional_literal), ";"),
        ),

        disjunction: $ => choice(
            seq(repeat1($._disjunction_element_sep), choice($.literal, $.conditional_literal)),
            $.conditional_literal,
        ),

        head: $ => choice(
            $.literal,
            $.disjunction,
            $.set_aggregate,
            $.head_aggregate,
            $.theory_atom,
        ),

        // statements

        rule: $ => seq($.head, choice(".", seq(":-", $.body))),
        integrity_constraint: $ => seq(":-", $.body),

        priority: $ => seq("@", $.term),
        _optimize_tuple: $ => seq(",", $.terms),
        _optimize_weight: $ => seq($.term, optional($.priority)),

        optimize_element: $ => seq(
            field("weight", $._optimize_weight),
            field("tuple", optional($._optimize_tuple)),
            field("condition", optional($._condition))
        ),
        optimize_elements: $ => seq($.optimize_element, repeat(seq(";", $.optimize_element))),

        weak_constraint: $ => seq(":~", $.body, "[", $._optimize_weight, optional($._optimize_tuple), "]"),
        maximize: $ => seq(choice("#maximize", "#maximise"), "{", optional($.optimize_elements), "}", "."),
        minimize: $ => seq(choice("#minimize", "#minimise"), "{", optional($.optimize_elements), "}", "."),

        signature: $ => prec.dynamic(1, seq($._classical_identifier, "/", $.number)),

        show: _$ => seq("#show", "."),
        show_term: $ => seq("#show", $.term, $._colon_body),
        show_signature: $ => seq("#show", $.signature, "."),
        defined: $ => seq("#defined", $.signature, "."),
        project_signature: $ => seq("#project", $.signature, "."),
        project_atom: $ => seq("#project", $.symbolic_atom, $._colon_body),

        identifiers: $ => seq($.identifier, repeat(seq(",", $.identifier))),

        program: $ => seq("#program", $.identifier, optional(seq("(", optional($.identifiers), ")")), "."),

        code: _$ => token(repeat(choice(/[^#]/, /#[^e][^#]/, /#e[^n][^#]/, /#en[^d][^#]/,))),

        script: $ => seq("#script", "(", $.identifier, ")", $.code, "#end", "."),

        const_type: _$ => choice('default', 'override'),

        const: $ => seq("#const", $.identifier, "=", $._const_term, ".", optional(seq("[", $.const_type, "]"))),

        edge: $ => seq("#edge", "(", $.pool_binary, ")", $._colon_body),

        heuristic: $ => seq(
            "#heuristic",
            field("atom", $.symbolic_atom),
            field("body", $._colon_body),
            "[",
            field("weight", $.term),
            field("priority", optional($.priority)),
            ",",
            field("type", $.term),
            "]"
        ),

        include: $ => seq("#include", choice($.string, seq("<", $.identifier, ">")), "."),

        external: $ => seq("#external", $.symbolic_atom, $._colon_body, optional(seq("[", $.term, "]"))),

        theory_operator_arity: _$ => "unary",
        theory_operator_arity_binary: _$ => "binary",

        theory_operator_associativity: _$ => choice("left", "right"),

        theory_operator_definition: $ => choice(
            seq($.operator, ":", $.number, ",", $.theory_operator_arity),
            seq($.operator, ":", $.number, ",", alias($.theory_operator_arity_binary, $.theory_operator_arity), ",", $.theory_operator_associativity),
        ),

        theory_operator_definitions: $ => seq($.theory_operator_definition, repeat(seq(";", $.theory_operator_definition))),

        theory_term_definition: $ => seq($.identifier, "{", optional($.theory_operator_definitions), "}"),

        theory_atom_type: _$ => choice("head", "body", "any", "directive"),

        operators_sep: $ => seq($.operator, repeat(seq(",", $.operator))),

        theory_atom_definition: $ => seq(
            "&",
            field("name", $.identifier),
            "/",
            $.number,
            ":",
            field("term", $.identifier),
            ",",
            optional(seq(
                "{",
                optional(alias($.operators_sep, $.operators)),
                "}",
                ",",
                field("guard", $.identifier),
                ","
            )),
            field("type", $.theory_atom_type)
        ),

        _theory_definitions: $ => choice(
            seq($.theory_atom_definition, repeat(seq(";", $.theory_atom_definition))),
            seq($.theory_term_definition, repeat(seq(";", $.theory_term_definition)), repeat(seq(";", $.theory_atom_definition))),
        ),

        theory: $ => seq("#theory", $.identifier, "{", optional($._theory_definitions), "}", "."),

        statement: $ => choice(
            $.rule,
            $.integrity_constraint,
            $.weak_constraint,
            $.minimize,
            $.maximize,
            $.show,
            $.show_term,
            $.show_signature,
            $.defined,
            $.edge,
            $.heuristic,
            $.project_signature,
            $.project_atom,
            $.const,
            $.script,
            $.include,
            $.program,
            $.external,
            $.theory
        ),
    }
});
