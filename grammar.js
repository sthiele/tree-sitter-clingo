module.exports = grammar({
    name: 'clingo',
    extras: $ => [$.single_comment, $.multi_comment, /\s/],

    // Note that the ambiguity between signature and term in show statements
    // does not necessarily have to be resolved in the grammar. It could also
    // be left to the user of the parser. Then, we could simply delete the
    // "show signature" part of the statement production.
    conflicts: $ => [[$.signature, $.term]],

    rules: {

        source_file: $ => repeat($.statement),

        // http://stackoverflow.com/questions/13014947/regex-to-match-a-c-style-multiline-comment/36328890#36328890
        // Taken from tree-sitter-prolog
        single_comment: _$ => token(choice(
            seq('%', /[^*]/, /.*/),
            '%'
        )),
        // TODO: clingo counts nested %* *% blocks
        multi_comment: _$ => token(
            seq(
                '%*',
                /[^*]*\*+([^%*][^*]*\*+)*/,
                '%'
            ),
        ),

        // tokens
        ADD: _$ => '+',
        AND: _$ => '&',
        EQ: _$ => '=',
        AT: _$ => '@',
        BNOT: _$ => '~',
        COLON: _$ => ':',
        COMMA: _$ => ',',
        CONST: _$ => '#const',
        COUNT: _$ => '#count',
        DOT: _$ => '.',
        DOTS: _$ => '..',
        EXTERNAL: _$ => '#external',
        DEFINED: _$ => '#defined',
        FALSE: _$ => '#false',
        GEQ: _$ => '>=',
        GT: _$ => '>',
        IF: _$ => ':-',
        INCLUDE: _$ => '#include',
        INFIMUM: _$ => choice(
            '#inf',
            '#infimum'
        ),
        LBRACE: _$ => '{',
        LBRACK: _$ => '[',
        LEQ: _$ => '<=',
        LPAREN: _$ => '(',
        LT: _$ => '<',
        MAX: _$ => '#max',
        MAXIMIZE: _$ => choice(
            '#maximize',
            '#maximise'
        ),
        MIN: _$ => '#min',
        MINIMIZE: _$ => choice(
            '#minimize',
            '#minimise'
        ),
        MOD: _$ => '\\',
        MUL: _$ => '*',
        NEQ: _$ => '!=',
        POW: _$ => '**',
        QUESTION: _$ => '?',
        RBRACE: _$ => '}',
        RBRACK: _$ => ']',
        RPAREN: _$ => ')',
        SEM: _$ => ';',
        SHOW: _$ => '#show',
        EDGE: _$ => '#edge',
        PROJECT: _$ => '#project',
        HEURISTIC: _$ => '#heuristic',
        SLASH: _$ => '/',
        SUB: _$ => '-',
        SUM: _$ => '#sum',
        SUMP: _$ => '#sum+',
        SUPREMUM: _$ => choice(
            '#sup',
            '#supremum'
        ),
        TRUE: _$ => '#true',
        BLOCK: _$ => '#program',
        VBAR: _$ => '|',
        WIF: _$ => ':~',
        XOR: _$ => '^',
        ANY: _$ => 'any',
        UNARY: _$ => 'unary',
        BINARY: _$ => 'binary',
        LEFT: _$ => 'left',
        RIGHT: _$ => 'right',
        HEAD: _$ => 'head',
        BODY: _$ => 'body',
        DIRECTIVE: _$ => 'directive',
        THEORY: _$ => '#theory',
        NUMBER: $ => choice(
            $.dec,
            $.hex,
            $.oct,
            $.bin,
        ),
        dec: _$ => choice('0', /([1-9][0-9]*)/),
        hex: _$ => token(seq('0x', /([0-9A-Fa-f]+)/)),
        oct: _$ => token(seq('0o', /([1-7]+)/)),
        bin: _$ => token(seq('0b', /([0-1]+)/)),

        ANONYMOUS: _$ => '_',
        identifier: _$ => token(seq(repeat('_'), /[a-z']/, repeat(/[A-Za-z0-9_']/))),
        //Introduced to disallow white space after identifier followed by a bracket ie. not 'bla ()' but 'bla()'
        _widentifier: $ => seq($.identifier, alias(token.immediate('('), $.LPAREN)),

        SCRIPT: _$ => '#script',
        CODE: _$ => token(choice(
            seq(/[^#]*/, /(#+[^e][^#]*)*/, /(#+e*[^n][^#]*)*/, /(#+e*n*[^d][^#]*)*/, '#end'),
        )),
        VARIABLE: _$ => token(seq(repeat('_'), /[A-Z]/, repeat(/[A-Za-z0-9_']/))),
        THEORY_OP: _$ => /[/!<=>+\-*\\?&@|:;~\^\.]+/,
        NOT: _$ => 'not',
        DEFAULT: _$ => 'default',
        OVERRIDE: _$ => 'override',

        constterm: $ => choice(
            prec.left(7, seq($.constterm, $.XOR, $.constterm)),
            prec.left(6, seq($.constterm, $.QUESTION, $.constterm)),
            prec.left(5, seq($.constterm, $.AND, $.constterm)),
            prec.left(4, seq($.constterm, $.ADD, $.constterm)),
            prec.left(4, seq($.constterm, $.SUB, $.constterm)),
            prec.left(3, seq($.constterm, $.MUL, $.constterm)),
            prec.left(3, seq($.constterm, $.SLASH, $.constterm)),
            prec.left(3, seq($.constterm, $.MOD, $.constterm)),
            prec.right(2, seq($.constterm, $.POW, $.constterm)),
            prec.left(1, seq($.SUB, $.constterm)),
            prec.left(1, seq($.BNOT, $.constterm)),
            seq($.identifier, optional(seq($.LPAREN, optional($._constterm_tuple), $.RPAREN))),
            seq($.LPAREN, optional($._constterm_tuple_comma), $.RPAREN),
            seq($.AT, $.identifier, optional(seq($.LPAREN, optional($._constterm_tuple), $.RPAREN))),
            seq($.VBAR, $.constterm, $.VBAR),
            $.NUMBER,
            $.STRING,
            $.INFIMUM,
            $.SUPREMUM,
        ),

        _constterm_tuple: $ => seq($.constterm, repeat(seq($.COMMA, $.constterm))),
        _constterm_tuple_comma: $ => seq($.constterm, repeat(seq($.COMMA, $.constterm)), optional($.COMMA)),

        term: $ => choice(
            prec.left(8, seq($.term, $.DOTS, $.term)),
            prec.left(7, seq($.term, $.XOR, $.term)),
            prec.left(6, seq($.term, $.QUESTION, $.term)),
            prec.left(5, seq($.term, $.AND, $.term)),
            prec.left(4, seq($.term, $.ADD, $.term)),
            prec.left(4, seq($.term, $.SUB, $.term)),
            prec.left(3, seq($.term, $.MUL, $.term)),
            prec.left(3, seq($.term, $.SLASH, $.term)),
            prec.left(3, seq($.term, $.MOD, $.term)),
            prec.right(2, seq($.term, $.POW, $.term)),
            prec.left(1, seq($.SUB, $.term)),
            prec.left(1, seq($.BNOT, $.term)),
            $.term_pool_trail,
            seq(optional($.AT), $.identifier, optional($.term_pool)),
            seq($.VBAR, $.term_pool_unary, $.VBAR),
            $.NUMBER,
            $.STRING,
            $.INFIMUM,
            $.SUPREMUM,
            $.VARIABLE,
            $.ANONYMOUS,
        ),

        term_tuple: $ => seq($.term, repeat(seq($.COMMA, $.term))),
        term_tuple_trail: $ => seq($.term, repeat(seq($.COMMA, $.term)), optional($.COMMA)),

        term_pool: $ => seq($.LPAREN, optional($.term_tuple), repeat(seq(';', $.term_tuple)), $.RPAREN),
        term_pool_unary: $ => seq($.term, repeat(seq($.SEM, $.term))),
        term_pool_binary: $ => seq($.term, $.COMMA, $.term, repeat(seq($.SEM, $.term, $.COMMA, $.term))),
        term_pool_trail: $ => seq($.LPAREN, optional($.term_tuple_trail), repeat(seq(';', $.term_tuple_trail)), $.RPAREN),

        relation: $ => choice(
            $.GT,
            $.LT,
            $.GEQ,
            $.LEQ,
            $.EQ,
            $.NEQ
        ),

        symbolic_atom: $ => seq(optional($.SUB), $.identifier, optional($.term_pool)),

        comparison: $ => seq($.term, $.relation, $.term, repeat(seq($.relation, $.term))),

        _simple_atom: $ => choice(
            $.symbolic_atom,
            $.comparison,
            $.TRUE,
            $.FALSE,
        ),

        sign: $ => seq($.NOT, optional($.NOT)),

        simple_literal: $ => seq(optional($.sign), $._simple_atom),

        literal_tuple: $ => seq($.simple_literal, repeat(seq($.COMMA, $.simple_literal))),

        condition: $ => seq($.COLON, optional($.literal_tuple)),

        aggregate_function: $ => choice(
            $.SUM,
            $.SUMP,
            $.MIN,
            $.MAX,
            $.COUNT
        ),

        // Note: alternative syntax (without weight)
        aggrelem: $ => seq($.simple_literal, optional($.condition)),
        aggrelemvec: $ => seq($.aggrelem, repeat(seq($.SEM, $.aggrelem))),

        bodyaggrelem: $ => choice(
            $.condition,
            seq($.term_tuple, optional($.condition)),
        ),
        bodyaggrelemvec: $ => seq($.bodyaggrelem, repeat(seq($.SEM, $.bodyaggrelem))),

        upper: $ => seq(optional($.relation), $.term),
        lower: $ => seq($.term, optional($.relation)),

        _bodyaggregate: $ => choice(
            seq($.LBRACE, optional($.aggrelemvec), $.RBRACE),
            seq($.aggregate_function, $.LBRACE, optional($.bodyaggrelemvec), $.RBRACE),
        ),
        bodyaggregate: $ => seq(optional($.lower), $._bodyaggregate, optional($.upper)),

        headaggrelem: $ => seq(optional($.term_tuple), $.COLON, $.simple_literal, optional($.condition)),

        headaggrelemvec: $ => seq($.headaggrelem, repeat(seq($.SEM, $.headaggrelem))),

        _headaggregate: $ => choice(
            seq($.LBRACE, optional($.aggrelemvec), $.RBRACE),
            seq($.aggregate_function, $.LBRACE, optional($.headaggrelemvec), $.RBRACE),
        ),

        headaggregate: $ => choice(
            seq(optional($.lower), $._headaggregate, optional($.upper)),
        ),

        conjunction: $ => seq($.simple_literal, $.condition),

        dsym: $ => choice(
            $.SEM,
            $.VBAR
        ),

        // NOTE: this is so complicated because VBAR is also used as the absolute function for terms
        //       due to limited lookahead I found no reasonable way to parse p(X):|q(X)
        disjunctionsep: $ => choice(
            seq($.disjunctionsep, $.simple_literal, $.COMMA),
            seq($.disjunctionsep, $.simple_literal, $.dsym),
            seq($.disjunctionsep, $.simple_literal, $.COLON, $.SEM),
            seq($.disjunctionsep, $.simple_literal, $.COLON, $.literal_tuple, $.dsym),
            seq($.simple_literal, $.COMMA),
            seq($.simple_literal, $.dsym),
            seq($.simple_literal, $.COLON, $.literal_tuple, $.dsym),
            seq($.simple_literal, $.COLON, $.SEM),
        ),

        disjunction: $ => choice(
            seq($.disjunctionsep, $.simple_literal),
            seq($.disjunctionsep, $.simple_literal, $.condition),
            seq($.simple_literal, $.COLON),
            seq($.simple_literal, $.COLON, $.literal_tuple)
        ),

        _bodyliteral: $ => seq(optional($.sign), choice(
            $.bodyaggregate,
            $.theory_atom,
            $._simple_atom
        )),

        body_literal: $ => choice(
            seq($._bodyliteral, choice($.SEM, $.COMMA)),
            seq($.conjunction, $.SEM),
        ),

        body_literal_dot: $ => seq(choice($._bodyliteral, $.conjunction), $.DOT),

        body: $ => choice($.DOT, seq(repeat($.body_literal), alias($.body_literal_dot, $.body_literal_dot))),

        colon_body: $ => choice(
            $.DOT,
            seq($.COLON, $.body),
        ),

        head: $ => choice(
            $.simple_literal,
            $.disjunction,
            $.headaggregate,
            $.theory_atom,
        ),

        signature: $ => prec.dynamic(1, seq(optional($.SUB), $.identifier, $.SLASH, $.NUMBER)),

        statement: $ => choice(
            seq($.head, choice($.DOT, seq($.IF, $.body))),
            seq($.IF, $.body),
            seq($.WIF, $.body, $.LBRACK, $.optimizeweight, optional($.optimizetuple), $.RBRACK),
            seq(choice($.MAXIMIZE, $.MINIMIZE), $.LBRACE, optional($.opt_elems), $.RBRACE, $.DOT),
            seq($.SHOW, $.DOT),
            seq($.SHOW, $.term, $.colon_body),
            seq($.SHOW, $.signature, $.DOT),
            seq($.DEFINED, $.signature, $.DOT),
            seq($.EDGE, $.LPAREN, $.term_pool_binary, $.RPAREN, $.colon_body),
            seq($.HEURISTIC, $.symbolic_atom, $.colon_body, $.LBRACK, $.term, optional(seq($.AT, $.term)), $.COMMA, $.term, $.RBRACK),
            seq($.PROJECT, $.signature, $.DOT),
            seq($.PROJECT, $.symbolic_atom, $.colon_body),
            seq($.CONST, $.identifier, $.EQ, $.constterm, $.DOT, optional(seq($.LBRACK, $.DEFAULT, $.RBRACK))),
            seq($.SCRIPT, $.LPAREN, $.identifier, $.RPAREN, $.CODE, $.DOT),
            seq($.INCLUDE, choice($.STRING, seq($.LT, $.identifier, $.GT)), $.DOT),
            seq($.BLOCK, $.identifier, optional(seq($.LPAREN, optional($.idlist), $.RPAREN)), $.DOT),
            seq($.EXTERNAL, $.symbolic_atom, $.colon_body, optional(seq($.LBRACK, $.term, $.RBRACK))),
            seq($.THEORY, $.theory_identifier, $.LBRACE, optional($.theory_definition_nlist), $.RBRACE, $.DOT)
        ),

        optimizetuple: $ =>
            seq($.COMMA, $.term_tuple),

        optimizeweight: $ => choice(
            seq($.term, $.AT, $.term),
            $.term
        ),

        optimizeliteral_tuple: $ => choice(
            $.simple_literal,
            seq($.optimizeliteral_tuple, $.COMMA, $.simple_literal),
        ),

        optimizecond: $ => choice(
            seq($.COLON, $.optimizeliteral_tuple),
            $.COLON,
        ),

        opt_elems: $ => choice(
            seq($.optimizeweight,),
            seq($.optimizeweight, $.optimizecond),
            seq($.optimizeweight, $.optimizetuple,),
            seq($.optimizeweight, $.optimizetuple, $.optimizecond),
            seq($.opt_elems, $.SEM, $.optimizeweight,),
            seq($.opt_elems, $.SEM, $.optimizeweight, $.optimizecond),
            seq($.opt_elems, $.SEM, $.optimizeweight, $.optimizetuple,),
            seq($.opt_elems, $.SEM, $.optimizeweight, $.optimizetuple, $.optimizecond),
        ),

        idlist: $ => choice(
            seq($.idlist, $.COMMA, $.identifier),
            $.identifier,
        ),

        theory_identifier: $ => $.identifier,

        theory_op: $ => choice(
            $.THEORY_OP,
            $.NOT
        ),

        theory_op_list: $ => choice(
            seq($.theory_op_list, $.theory_op),
            $.theory_op
        ),

        theory_term: $ => choice(
            seq($.LBRACE, $.RBRACE),
            seq($.LBRACE, $.theory_opterm_nlist, $.RBRACE),
            seq($.LBRACK, $.RBRACK),
            seq($.LBRACK, $.theory_opterm_nlist, $.RBRACK),
            seq($.LPAREN, $.RPAREN),
            seq($.LPAREN, $.theory_opterm, $.RPAREN),
            seq($.LPAREN, $.theory_opterm, $.COMMA, $.RPAREN),
            seq($.LPAREN, $.theory_opterm, $.COMMA, $.theory_opterm_nlist, $.RPAREN),
            seq($.identifier, $.LPAREN, $.RPAREN),
            seq($.identifier, $.LPAREN, $.theory_opterm_nlist, $.RPAREN),
            $.identifier,
            $.NUMBER,
            $.STRING,
            $.INFIMUM,
            $.SUPREMUM,
            $.VARIABLE,
        ),

        theory_opterm: $ => choice(
            seq($.theory_opterm, $.theory_op_list, $.theory_term),
            seq($.theory_op_list, $.theory_term),
            $.theory_term
        ),

        theory_opterm_nlist: $ => choice(
            seq($.theory_opterm_nlist, $.COMMA, $.theory_opterm),
            $.theory_opterm
        ),

        theory_atom_element: $ => choice(
            seq($.theory_opterm_nlist),
            seq($.theory_opterm_nlist, $.condition),
            seq($.COLON),
            seq($.COLON, $.literal_tuple),
        ),

        theory_atom_element_nlist: $ => choice(
            seq($.theory_atom_element_nlist, $.SEM, $.theory_atom_element),
            $.theory_atom_element,
        ),

        theory_atom_name: $ => seq($.identifier, optional($.term_pool)),

        theory_atom: $ => choice(
            seq($.AND, $.theory_atom_name),
            seq($.AND, $.theory_atom_name, $.LBRACE, $.RBRACE),
            seq($.AND, $.theory_atom_name, $.LBRACE, $.theory_atom_element_nlist, $.RBRACE),
            seq($.AND, $.theory_atom_name, $.LBRACE, $.RBRACE, $.theory_op, $.theory_opterm),
            seq($.AND, $.theory_atom_name, $.LBRACE, $.theory_atom_element_nlist, $.RBRACE, $.theory_op, $.theory_opterm),
        ),

        theory_operator_nlist: $ => choice(
            $.theory_op,
            seq($.theory_operator_nlist, $.COMMA, $.theory_op)
        ),

        theory_operator_definition: $ => choice(
            seq($.theory_op, $.COLON, $.NUMBER, $.COMMA, $.UNARY),
            seq($.theory_op, $.COLON, $.NUMBER, $.COMMA, $.BINARY, $.COMMA, $.LEFT),
            seq($.theory_op, $.COLON, $.NUMBER, $.COMMA, $.BINARY, $.COMMA, $.RIGHT),
        ),

        theory_operator_definition_nlist: $ => choice(
            $.theory_operator_definition,
            seq($.theory_operator_definition_nlist, $.SEM, $.theory_operator_definition)
        ),

        theory_definition_identifier: $ => choice(
            $.identifier,
            $.LEFT,
            $.RIGHT,
            $.UNARY,
            $.BINARY,
            $.HEAD,
            $.BODY,
            $.ANY,
            $.DIRECTIVE
        ),

        theory_term_definition: $ => choice(
            seq($.theory_definition_identifier, $.LBRACE, $.RBRACE),
            seq($.theory_definition_identifier, $.LBRACE, $.theory_operator_definition_nlist, $.RBRACE)),

        theory_atom_type: $ => choice(
            $.HEAD,
            $.BODY,
            $.ANY,
            $.DIRECTIVE
        ),

        theory_atom_definition: $ => choice(
            seq($.AND, $.theory_definition_identifier, $.SLASH, $.NUMBER, $.COLON, $.theory_definition_identifier, $.COMMA, $.LBRACE, $.RBRACE, $.COMMA, $.theory_definition_identifier, $.COMMA, $.theory_atom_type),
            seq($.AND, $.theory_definition_identifier, $.SLASH, $.NUMBER, $.COLON, $.theory_definition_identifier, $.COMMA, $.LBRACE, $.theory_operator_nlist, $.RBRACE, $.COMMA, $.theory_definition_identifier, $.COMMA, $.theory_atom_type),
            seq($.AND, $.theory_definition_identifier, $.SLASH, $.NUMBER, $.COLON, $.theory_definition_identifier, $.COMMA, $.theory_atom_type)
        ),

        theory_definition_nlist: $ => choice(
            $.theory_atom_definition,
            $.theory_term_definition,
            seq($.theory_atom_definition, $.SEM, $.theory_definition_nlist),
            seq($.theory_term_definition, $.SEM, $.theory_definition_nlist),
        ),

        ////////// TODO: This is taken from tree-sitter-java! ////////////
        // Here we tolerate unescaped newlines in double-quoted and
        // single-quoted string literals.
        // This is legal in typescript as jsx/tsx attribute values (as of
        // 2020), and perhaps will be valid in javascript as well in the
        // future.
        //
        STRING: $ => choice(
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
        //
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
    }
});
