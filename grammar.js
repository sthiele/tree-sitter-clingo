module.exports = grammar({
  name: 'clingo',
  extras: $ => [$.single_comment,$.multi_comment, /\s/],

  rules: {

    source_file: $ => repeat($.statement),

    // http://stackoverflow.com/questions/13014947/regex-to-match-a-c-style-multiline-comment/36328890#36328890
    // Taken from tree-sitter-prolog
    single_comment: $ => token(choice(
      seq('%', /[^*]/, /.*/),
      '%'
    )),
    multi_comment: $ => token(
      seq(
        '%*',
        /[^*]*\*+([^%*][^*]*\*+)*/,
        '%'
      ),
    ),

    // token
    ADD: $ => '+',
    AND: $ => '&',
    EQ: $ => '=',
    AT: $ => '@',
    BNOT: $ => '~',
    COLON: $ => ':',
    COMMA: $ => ',',
    CONST: $ => '#const',
    COUNT: $ => '#count',
    CSP: $ => '$',
    CSP_ADD: $ => '$+',
    CSP_SUB: $ => '$-',
    CSP_MUL: $ => '$*',
    CSP_LEQ: $ => '$<=',
    CSP_LT: $ => '$<',
    CSP_GT: $ => '$>',
    CSP_GEQ: $ => '$>=',
    CSP_EQ: $ => '$=',
    CSP_NEQ: $ => '$!=',
    DISJOINT: $ => '#disjoint',
    DOT: $ => '.',
    DOTS: $ => '..',
    EXTERNAL: $ => '#external',
    DEFINED: $ => '#defined',
    FALSE: $ => '#false',
    GEQ: $ => '>=',
    GT: $ => '>',
    IF: $ => ':-',
    INCLUDE: $ => '#include',
    INFIMUM: $ => choice(
      '#inf',
      '#infimum'
    ),
    LBRACE: $ => '{',
    LBRACK: $ => '[',
    LEQ: $ => '<=',
    LPAREN: $ => '(',
    LT: $ => '<',
    MAX: $ => '#max',
    MAXIMIZE: $ => choice(
      '#maximize',
      '#maximise'
    ),
    MIN: $ => '#min',
    MINIMIZE: $ => choice(
      '#minimize',
      '#minimise'
    ),
    MOD: $ => '\\',
    MUL: $ => '*',
    NEQ: $ => '!=',
    POW: $ => '**',
    QUESTION: $ => '?',
    RBRACE: $ => '}',
    RBRACK: $ => ']',
    RPAREN: $ => ')',
    SEM: $ => ';',
    SHOW: $ => '#show',
    EDGE: $ => '#edge',
    PROJECT: $ => '#project',
    HEURISTIC: $ => '#heuristic',
    SLASH: $ => '/',
    SUB: $ => '-',
    SUM: $ => '#sum',
    SUMP: $ => '#sum+',
    SUPREMUM: $ => choice(
      '#sup',
      '#supremum'
    ),
    TRUE: $ => '#true',
    BLOCK: $ => '#program',
    VBAR: $ => '|',
    WIF: $ => ':~',
    XOR: $ => '^',
    ANY: $ => 'any',
    UNARY: $ => 'unary',
    BINARY: $ => 'binary',
    LEFT: $ => 'left',
    RIGHT: $ => 'right',
    HEAD: $ => 'head',
    BODY: $ => 'body',
    DIRECTIVE: $ => 'directive',
    THEORY: $ => '#theory',
    NUMBER: $ => choice(
      $.dec,
      $.hex,
      $.oct,
      $.bin,
    ),
    dec: $ => choice('0', /([1-9][0-9]*)/),
    hex: $ => token(seq('0x', /([0-9A-Fa-f]+)/)),
    oct: $ => token(seq('0o', /([1-7]+)/)),
    bin: $ => token(seq('0b', /([0-1]+)/)),

    ANONYMOUS: $ => '_',
    identifier: $ => token(seq(repeat('_'), /[a-z']/, repeat(/[A-Za-z0-9_']/))),
    //Introduced to disallow white space after identifier followed by a bracket ie. not 'bla ()' but 'bla()'
    _widentifier: $ => seq($.identifier, alias(token.immediate('('), $.LPAREN)),

    SCRIPT: $ => '#script',
    CODE: $ => token(choice(
      seq(/[^#]*/, /(#+[^e][^#]*)*/, /(#+e*[^n][^#]*)*/, /(#+e*n*[^d][^#]*)*/, '#end'),
    )),
    VARIABLE: $ => token(seq(repeat('_'), /[A-Z]/, repeat(/[A-Za-z0-9_']/))),
    THEORY_OP: $ => /[/!<=>+\-*\\?&@|:;~\^\.]+/,
    NOT: $ => 'not',
    DEFAULT: $ => 'default',
    OVERRIDE: $ => 'override',

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
      seq($.LPAREN, $.RPAREN),
      seq($.LPAREN, $.consttermvec, $.RPAREN),
      seq($.LPAREN, $.consttermvec, $.COMMA, $.RPAREN),
      seq($._widentifier, $.RPAREN),
      seq($._widentifier, $.constargvec, $.RPAREN),
      seq($.AT, $._widentifier, $.RPAREN),
      seq($.AT, $._widentifier, $.constargvec, $.RPAREN),
      seq($.VBAR, $.constterm, $.VBAR),
      $.identifier,
      seq($.AT, $.identifier,),
      $.NUMBER,
      $.STRING,
      $.INFIMUM,
      $.SUPREMUM,
    ),

    consttermvec: $ => choice(
      $.constterm,
      seq($.consttermvec, $.COMMA, $.constterm),
    ),

    constargvec: $ =>
      $.consttermvec,

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
      seq($.LPAREN, $.RPAREN),
      seq($.LPAREN, $.tuplevec, $.RPAREN),
      seq($._widentifier, $.RPAREN),
      seq($._widentifier, $.argvec, $.RPAREN),
      seq($.AT, $._widentifier, $.RPAREN),
      seq($.AT, $._widentifier, $.argvec, $.RPAREN),
      seq($.VBAR, $.unaryargvec, $.VBAR),
      $.identifier,
      seq($.AT, $.identifier,),
      $.NUMBER,
      $.STRING,
      $.INFIMUM,
      $.SUPREMUM,
      $.VARIABLE,
      $.ANONYMOUS,
    ),

    unaryargvec: $ => choice(
      $.term,
      seq($.unaryargvec, $.SEM, $.term)
    ),

    termvec: $ => choice(
      $.term,
      seq($.termvec, $.COMMA, $.term)
    ),

    tuple: $ => choice(
      seq($.termvec, $.COMMA),
      $.termvec,
      $.COMMA
    ),

    tuplevec_sem: $ => choice(
      seq($.SEM),
      seq($.tuple, $.SEM),
      seq($.tuplevec_sem, $.SEM),
      seq($.tuplevec_sem, $.tuple, $.SEM),
    ),

    tuplevec: $ => choice(
      seq($.tuple),
      seq($.tuplevec_sem, $.tuple),
    ),

    argvec: $ => choice(
      $.termvec,
      seq($.argvec, $.SEM, $.termvec,),
    ),

    binaryargvec: $ => choice(
      seq($.term, $.COMMA, $.term),
      seq($.binaryargvec, $.SEM, $.term, $.COMMA, $.term),
    ),

    // TODO: I might have to create tuples differently
    //       parse a tuple as a list of terms
    //       each term is either a tuple or a term -> which afterwards is turned into a pool!

    cmp: $ => choice(
      $.GT,
      $.LT,
      $.GEQ,
      $.LEQ,
      '==',//EQ
      $.EQ, //EQ
      $.NEQ
    ),

    atom: $ => choice(
      $.identifier,
      seq($._widentifier, $.RPAREN),
      seq($._widentifier, $.argvec, $.RPAREN),
      seq($.SUB, $.identifier),
      seq($.SUB, $._widentifier, $.RPAREN),
      seq($.SUB, $._widentifier, $.argvec, $.RPAREN),
    ),

    rellitvec: $ => choice(
      seq($.cmp , $.term),
      seq($.cmp, $.term, $.rellitvec)
    ),

    literal: $ => choice(
      $.TRUE,
      seq($.NOT, $.TRUE),
      seq($.NOT, $.NOT, $.TRUE),
      $.FALSE,
      seq($.NOT, $.FALSE),
      seq($.NOT, $.NOT, $.FALSE),
      $.atom,
      seq($.NOT, $.atom),
      seq($.NOT, $.NOT, $.atom),
      seq($.term, $.rellitvec),
      seq($.NOT, $.term, $.rellitvec),
      seq($.NOT, $.NOT, $.term, $.rellitvec),
      $.csp_literal
    ),

    csp_mul_term: $ => choice(
      seq($.CSP, $.term, $.CSP_MUL, $.term),
      seq($.term, $.CSP_MUL, $.CSP, $.term),
      seq($.CSP, $.term),
      $.term
    ),

    csp_add_term: $ => choice(
      seq($.csp_add_term, $.CSP_ADD, $.csp_mul_term),
      seq($.csp_add_term, $.CSP_SUB, $.csp_mul_term),
      $.csp_mul_term
    ),

    csp_rel: $ => choice(
      $.CSP_GT,
      $.CSP_LT,
      $.CSP_GEQ,
      $.CSP_LEQ,
      $.CSP_EQ,
      $.CSP_NEQ
    ),

    csp_literal: $ => choice(
      seq($.csp_literal, $.csp_rel, $.csp_add_term),
      seq($.csp_add_term, $.csp_rel, $.csp_add_term),
    ),

    litvec: $ => choice(
      $.literal,
      seq($.litvec, $.COMMA, $.literal)
    ),

    optcondition: $ => choice(
      seq($.COLON),
      seq($.COLON, $.litvec),
    ),

    aggregatefunction: $ => choice(
      $.SUM,
      $.SUMP,
      $.MIN,
      $.MAX,
      $.COUNT
    ),

    bodyaggrelem: $ => choice(
      seq($.COLON,),
      seq($.COLON, $.litvec),
      seq($.termvec,),
      seq($.termvec, $.optcondition),
    ),

    bodyaggrelemvec: $ => choice(
      $.bodyaggrelem,
      seq($.bodyaggrelemvec, $.SEM, $.bodyaggrelem),
    ),

    // Note: alternative syntax (without weight)
    altbodyaggrelem: $ => choice(
      seq($.literal,),
      seq($.literal, $.optcondition),
    ),

    altbodyaggrelemvec: $ => choice(
      $.altbodyaggrelem,
      seq($.altbodyaggrelemvec, $.SEM),
      seq($.altbodyaggrelemvec, $.SEM, $.altbodyaggrelem),
    ),

    bodyaggregate: $ => choice(
      seq($.LBRACE, $.RBRACE),
      seq($.LBRACE, $.altbodyaggrelemvec, $.RBRACE),
      seq($.aggregatefunction, $.LBRACE, $.RBRACE),
      seq($.aggregatefunction, $.LBRACE, $.bodyaggrelemvec, $.RBRACE),
    ),

    upper: $ => choice(
      $.term,
      seq($.cmp, $.term),
    ),

    lubodyaggregate: $ => choice(
      seq($.term, $.bodyaggregate),
      seq($.term, $.bodyaggregate, $.upper),
      seq($.term, $.cmp, $.bodyaggregate),
      seq($.term, $.cmp, $.bodyaggregate, $.upper),
      seq($.bodyaggregate),
      seq($.bodyaggregate, $.upper),
      $.theory_atom
    ),

    headaggrelemvec: $ => choice(
      seq($.headaggrelemvec, $.SEM, $.COLON, $.literal,),
      seq($.headaggrelemvec, $.SEM, $.termvec, $.COLON, $.literal,),
      seq($.headaggrelemvec, $.SEM, $.COLON, $.literal, $.optcondition),
      seq($.headaggrelemvec, $.SEM, $.termvec, $.COLON, $.literal, $.optcondition),
      seq($.COLON, $.literal,),
      seq($.termvec, $.COLON, $.literal,),
      seq($.COLON, $.literal, $.optcondition),
      seq($.termvec, $.COLON, $.literal, $.optcondition),
    ),

    altheadaggrelemvec: $ => choice(
      seq($.literal,),
      seq($.literal, $.optcondition),
      seq($.altheadaggrelemvec, $.SEM, $.literal,),
      seq($.altheadaggrelemvec, $.SEM, $.literal, $.optcondition),
    ),

    headaggregate: $ => choice(
      seq($.aggregatefunction, $.LBRACE, $.RBRACE),
      seq($.aggregatefunction, $.LBRACE, $.headaggrelemvec, $.RBRACE),
      seq($.LBRACE, $.RBRACE),
      seq($.LBRACE, $.altheadaggrelemvec, $.RBRACE),
    ),

    luheadaggregate: $ => choice(
      seq($.term, $.headaggregate),
      seq($.term, $.headaggregate, $.upper),
      seq($.term, $.cmp, $.headaggregate),
      seq($.term, $.cmp, $.headaggregate, $.upper),
      seq($.headaggregate),
      seq($.headaggregate, $.upper),
      $.theory_atom,
    ),

    cspelemvec: $ => choice(
      seq($.COLON, $.csp_add_term,),
      seq($.COLON, $.csp_add_term, $.optcondition),
      seq($.termvec, $.COLON, $.csp_add_term,),
      seq($.termvec, $.COLON, $.csp_add_term, $.optcondition),
      seq($.cspelemvec, $.SEM, $.COLON, $.csp_add_term,),
      seq($.cspelemvec, $.SEM, $.COLON, $.csp_add_term, $.optcondition),
      seq($.cspelemvec, $.SEM, $.termvec, $.COLON, $.csp_add_term,),
      seq($.cspelemvec, $.SEM, $.termvec, $.COLON, $.csp_add_term, $.optcondition),
    ),

    disjoint: $ => choice(
      seq($.DISJOINT, $.LBRACE, $.RBRACE),
      seq($.DISJOINT, $.LBRACE, $.cspelemvec, $.RBRACE),
      seq($.NOT, $.DISJOINT, $.LBRACE, $.RBRACE),
      seq($.NOT, $.DISJOINT, $.LBRACE, $.cspelemvec, $.RBRACE),
      seq($.NOT, $.NOT, $.DISJOINT, $.LBRACE, $.RBRACE),
      seq($.NOT, $.NOT, $.DISJOINT, $.LBRACE, $.cspelemvec, $.RBRACE),
    ),

    conjunction: $ => choice(
      seq($.literal, $.COLON,),
      seq($.literal, $.COLON, $.litvec)
    ),

    dsym: $ => choice(
      $.SEM,
      $.VBAR
    ),

    // NOTE: this is so complicated because VBAR is also used as the absolute function for terms
    //       due to limited lookahead I found no reasonable way to parse p(X):|q(X)
    disjunctionsep: $ => choice(
      seq($.disjunctionsep, $.literal, $.COMMA),
      seq($.disjunctionsep, $.literal, $.dsym),
      seq($.disjunctionsep, $.literal, $.COLON, $.SEM),
      seq($.disjunctionsep, $.literal, $.COLON, $.litvec, $.dsym),
      seq($.literal, $.COMMA),
      seq($.literal, $.dsym),
      seq($.literal, $.COLON, $.litvec, $.dsym),
      seq($.literal, $.COLON, $.SEM),
    ),

    disjunction: $ => choice(
      seq($.disjunctionsep, $.literal),
      seq($.disjunctionsep, $.literal, $.optcondition),
      seq($.literal, $.COLON),
      seq($.literal, $.COLON, $.litvec)
    ),

    bodycomma: $ => choice(
      seq($.literal, $.COMMA),
      seq($.bodycomma, $.literal, $.COMMA),
      seq($.literal, $.SEM),
      seq($.bodycomma, $.literal, $.SEM),
      seq($.lubodyaggregate, $.COMMA),
      seq($.bodycomma, $.lubodyaggregate, $.COMMA),
      seq($.lubodyaggregate, $.SEM),
      seq($.bodycomma, $.lubodyaggregate, $.SEM),
      seq($.NOT, $.lubodyaggregate, $.COMMA),
      seq($.bodycomma, $.NOT, $.lubodyaggregate, $.COMMA),
      seq($.NOT, $.lubodyaggregate, $.SEM),
      seq($.bodycomma, $.NOT, $.lubodyaggregate, $.SEM),
      seq($.NOT, $.NOT, $.lubodyaggregate, $.COMMA),
      seq($.bodycomma, $.NOT, $.NOT, $.lubodyaggregate, $.COMMA),
      seq($.NOT, $.NOT, $.lubodyaggregate, $.SEM),
      seq($.bodycomma, $.NOT, $.NOT, $.lubodyaggregate, $.SEM),
      seq($.conjunction, $.SEM),
      seq($.bodycomma, $.conjunction, $.SEM),
      seq($.disjoint, $.SEM),
      seq($.bodycomma, $.disjoint, $.SEM),
    ),

    bodydot: $ => choice(
      seq($.literal, $.DOT),
      seq($.bodycomma, $.literal, $.DOT),
      seq($.lubodyaggregate, $.DOT),
      seq($.bodycomma, $.lubodyaggregate, $.DOT),
      seq($.NOT, $.lubodyaggregate, $.DOT),
      seq($.bodycomma, $.NOT, $.lubodyaggregate, $.DOT),
      seq($.NOT, $.NOT, $.lubodyaggregate, $.DOT),
      seq($.bodycomma, $.NOT, $.NOT, $.lubodyaggregate, $.DOT),
      seq($.conjunction, $.DOT),
      seq($.bodycomma, $.conjunction, $.DOT),
      seq($.disjoint, $.DOT),
      seq($.bodycomma, $.disjoint, $.DOT),
    ),

    bodyconddot: $ => choice(
      $.DOT,
      seq($.COLON, $.DOT),
      seq($.COLON, $.bodydot),
    ),

    head: $ => choice(
      $.literal,
      $.disjunction,
      $.luheadaggregate
    ),

    statement: $ => choice(
      seq($.head, $.DOT),
      seq($.head, $.IF, $.DOT),
      seq($.head, $.IF, $.bodydot),
      seq($.IF, $.bodydot),
      seq($.IF, $.DOT),
      seq($.disjoint, $.IF, $.bodydot),
      seq($.disjoint, $.IF, $.DOT),
      seq($.disjoint, $.DOT),
      seq($.WIF, $.bodydot, $.LBRACK, $.optimizeweight, $.RBRACK),
      seq($.WIF, $.bodydot, $.LBRACK, $.optimizeweight, $.optimizetuple, $.RBRACK),
      seq($.MINIMIZE, $.LBRACE, $.RBRACE, $.DOT),
      seq($.MAXIMIZE, $.LBRACE, $.RBRACE, $.DOT),
      seq($.MINIMIZE, $.LBRACE, $.minelemlist, $.RBRACE, $.DOT),
      seq($.MAXIMIZE, $.LBRACE, $.maxelemlist, $.RBRACE, $.DOT),
      prec(8, seq($.SHOW, $.identifier, $.SLASH, $.NUMBER, $.DOT)),
      prec(8, seq($.SHOW, $.SUB, $.identifier, $.SLASH, $.NUMBER, $.DOT)),
      seq($.SHOW, $.DOT),
      seq($.SHOW, $.term, $.COLON, $.bodydot),
      seq($.SHOW, $.term, $.DOT),
      prec(8, seq($.SHOW, $.CSP, $.identifier, $.SLASH, $.NUMBER, $.DOT)),
      seq($.SHOW, $.CSP, $.term, $.COLON, $.bodydot),
      seq($.SHOW, $.CSP, $.term, $.DOT),
      seq($.DEFINED, $.identifier, $.SLASH, $.NUMBER, $.DOT),
      seq($.DEFINED, $.SUB, $.identifier, $.SLASH, $.NUMBER, $.DOT),
      seq($.EDGE, $.LPAREN, $.binaryargvec, $.RPAREN, $.bodyconddot),
      seq($.HEURISTIC, $.atom, $.bodyconddot, $.LBRACK, $.term, $.AT, $.term, $.COMMA, $.term, $.RBRACK),
      seq($.HEURISTIC, $.atom, $.bodyconddot, $.LBRACK, $.term, $.COMMA, $.term, $.RBRACK),
      seq($.PROJECT, $.identifier, $.SLASH, $.NUMBER, $.DOT),
      seq($.PROJECT, $.SUB, $.identifier, $.SLASH, $.NUMBER, $.DOT),
      seq($.PROJECT, $.atom, $.bodyconddot),
      seq($.CONST, $.identifier, $.EQ, $.constterm, $.DOT),
      seq($.CONST, $.identifier, $.EQ, $.constterm, $.DOT, $.LBRACK, $.DEFAULT, $.RBRACK),
      seq($.CONST, $.identifier, $.EQ, $.constterm, $.DOT, $.LBRACK, $.OVERRIDE, $.RBRACK),
      seq($.SCRIPT, $.LPAREN, $.identifier, $.RPAREN, $.CODE, $.DOT),
      seq($.INCLUDE, $.STRING, $.DOT),
      seq($.INCLUDE, $.LT, $.identifier, $.GT, $.DOT),
      seq($.BLOCK, $.identifier, $.LPAREN, $.RPAREN, $.DOT),
      seq($.BLOCK, $.identifier, $.LPAREN, $.idlist, $.RPAREN, $.DOT),
      seq($.BLOCK, $.identifier, $.DOT),
      seq($.EXTERNAL, $.atom, $.COLON, $.bodydot),
      seq($.EXTERNAL, $.atom, $.COLON, $.DOT),
      seq($.EXTERNAL, $.atom, $.DOT),
      seq($.EXTERNAL, $.atom, $.COLON, $.bodydot, $.LBRACK, $.term, $.RBRACK),
      seq($.EXTERNAL, $.atom, $.COLON, $.DOT, $.LBRACK, $.term, $.RBRACK),
      seq($.EXTERNAL, $.atom, $.DOT, $.LBRACK, $.term, $.RBRACK),
      seq($.THEORY, $.theory_identifier, $.LBRACE, $.RBRACE, $.DOT),
      seq($.THEORY, $.theory_identifier, $.LBRACE, $.theory_definition_nlist, $.RBRACE, $.DOT)
    ),


    optimizetuple: $ =>
      seq($.COMMA, $.termvec),

    optimizeweight: $ => choice(
      seq($.term, $.AT, $.term),
      $.term
    ),


    optimizelitvec: $ => choice(
      $.literal,
      seq($.optimizelitvec, $.COMMA, $.literal),
    ),

    optimizecond: $ => choice(
      seq($.COLON, $.optimizelitvec),
      $.COLON,
    ),

    maxelemlist: $ => choice(
      seq($.optimizeweight,),
      seq($.optimizeweight, $.optimizecond),
      seq($.optimizeweight, $.optimizetuple,),
      seq($.optimizeweight, $.optimizetuple, $.optimizecond),
      seq($.maxelemlist, $.SEM, $.optimizeweight,),
      seq($.maxelemlist, $.SEM, $.optimizeweight, $.optimizecond),
      seq($.maxelemlist, $.SEM, $.optimizeweight, $.optimizetuple,),
      seq($.maxelemlist, $.SEM, $.optimizeweight, $.optimizetuple, $.optimizecond),
    ),

    minelemlist: $ => choice(
      seq($.optimizeweight,),
      seq($.optimizeweight, $.optimizecond),
      seq($.optimizeweight, $.optimizetuple,),
      seq($.optimizeweight, $.optimizetuple, $.optimizecond),
      seq($.minelemlist, $.SEM, $.optimizeweight,),
      seq($.minelemlist, $.SEM, $.optimizeweight, $.optimizecond),
      seq($.minelemlist, $.SEM, $.optimizeweight, $.optimizetuple,),
      seq($.minelemlist, $.SEM, $.optimizeweight, $.optimizetuple, $.optimizecond),
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
      seq($.theory_opterm_nlist, $.optcondition),
      seq($.COLON),
      seq($.COLON, $.litvec),
    ),

    theory_atom_element_nlist: $ => choice(
      seq($.theory_atom_element_nlist, $.SEM, $.theory_atom_element),
      $.theory_atom_element,
    ),

    theory_atom_name: $ => choice(
      $.identifier,
      seq($._widentifier, $.RPAREN),
      seq($._widentifier, $.argvec, $.RPAREN),

    ),

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
    unescaped_double_string_fragment: $ =>
      token.immediate(prec(1, /[^"\\]+/)),

    escape_sequence: $ => token.immediate(seq(
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
