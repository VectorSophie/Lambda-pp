export enum TokenType {
    // Keywords
    PACKAGE = 'PACKAGE',
    IMPORT = 'IMPORT',
    PUBLIC = 'PUBLIC',
    PRIVATE = 'PRIVATE',
    PROTECTED = 'PROTECTED',
    FINAL = 'FINAL',
    CLASS = 'CLASS',
    EXTENDS = 'EXTENDS',
    IMPLEMENTS = 'IMPLEMENTS',
    STATIC = 'STATIC',
    VOID = 'VOID',
    THROWS = 'THROWS',
    THROW = 'THROW', // throw keyword
    NEW = 'NEW',
    IF = 'IF',
    ELSE = 'ELSE',
    TRY = 'TRY',
    CATCH = 'CATCH',
    FINALLY = 'FINALLY',
    RETURN = 'RETURN',
    OVERRIDE = 'OVERRIDE', // @Override is a bit special, but we treat the annotation separately usually. 
                           // Actually, let's treat @Identifier as an ANNOTATION token.

    // Types & Identifiers
    IDENTIFIER = 'IDENTIFIER',
    STRING_LITERAL = 'STRING_LITERAL',
    NUMBER_LITERAL = 'NUMBER_LITERAL',

    // Symbols
    LBRACE = 'LBRACE', // {
    RBRACE = 'RBRACE', // }
    LPAREN = 'LPAREN', // (
    RPAREN = 'RPAREN', // )
    LBRACKET = 'LBRACKET', // [
    RBRACKET = 'RBRACKET', // ]
    SEMICOLON = 'SEMICOLON', // ;
    DOT = 'DOT', // .
    COMMA = 'COMMA', // ,
    ASSIGN = 'ASSIGN', // =
    EQUALS = 'EQUALS', // ==
    NOT_EQUALS = 'NOT_EQUALS', // !=
    LESS_EQUALS = 'LESS_EQUALS', // <=
    GREATER_EQUALS = 'GREATER_EQUALS', // >=
    AT = 'AT', // @ (for annotations)
    
    // Operators
    LESS_THAN = 'LESS_THAN', // < (for generics)
    GREATER_THAN = 'GREATER_THAN', // >
    
    PLUS = 'PLUS', // +
    BANG = 'BANG', // !
    MINUS = 'MINUS', // -
    STAR = 'STAR', // *
    SLASH = 'SLASH', // /
    ARROW = 'ARROW', // ->

    // EOF
    EOF = 'EOF'
}

export interface Token {
    type: TokenType;
    value: string;
    line: number;
    col: number;
}
