"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenType = void 0;
var TokenType;
(function (TokenType) {
    // Keywords
    TokenType["PACKAGE"] = "PACKAGE";
    TokenType["IMPORT"] = "IMPORT";
    TokenType["PUBLIC"] = "PUBLIC";
    TokenType["PRIVATE"] = "PRIVATE";
    TokenType["PROTECTED"] = "PROTECTED";
    TokenType["FINAL"] = "FINAL";
    TokenType["CLASS"] = "CLASS";
    TokenType["EXTENDS"] = "EXTENDS";
    TokenType["IMPLEMENTS"] = "IMPLEMENTS";
    TokenType["STATIC"] = "STATIC";
    TokenType["VOID"] = "VOID";
    TokenType["THROWS"] = "THROWS";
    TokenType["THROW"] = "THROW";
    TokenType["NEW"] = "NEW";
    TokenType["IF"] = "IF";
    TokenType["ELSE"] = "ELSE";
    TokenType["TRY"] = "TRY";
    TokenType["CATCH"] = "CATCH";
    TokenType["FINALLY"] = "FINALLY";
    TokenType["RETURN"] = "RETURN";
    TokenType["OVERRIDE"] = "OVERRIDE";
    // Actually, let's treat @Identifier as an ANNOTATION token.
    // Types & Identifiers
    TokenType["IDENTIFIER"] = "IDENTIFIER";
    TokenType["STRING_LITERAL"] = "STRING_LITERAL";
    TokenType["NUMBER_LITERAL"] = "NUMBER_LITERAL";
    // Symbols
    TokenType["LBRACE"] = "LBRACE";
    TokenType["RBRACE"] = "RBRACE";
    TokenType["LPAREN"] = "LPAREN";
    TokenType["RPAREN"] = "RPAREN";
    TokenType["LBRACKET"] = "LBRACKET";
    TokenType["RBRACKET"] = "RBRACKET";
    TokenType["SEMICOLON"] = "SEMICOLON";
    TokenType["DOT"] = "DOT";
    TokenType["COMMA"] = "COMMA";
    TokenType["ASSIGN"] = "ASSIGN";
    TokenType["EQUALS"] = "EQUALS";
    TokenType["NOT_EQUALS"] = "NOT_EQUALS";
    TokenType["LESS_EQUALS"] = "LESS_EQUALS";
    TokenType["GREATER_EQUALS"] = "GREATER_EQUALS";
    TokenType["AT"] = "AT";
    // Operators
    TokenType["LESS_THAN"] = "LESS_THAN";
    TokenType["GREATER_THAN"] = "GREATER_THAN";
    TokenType["PLUS"] = "PLUS";
    TokenType["BANG"] = "BANG";
    TokenType["MINUS"] = "MINUS";
    TokenType["STAR"] = "STAR";
    TokenType["SLASH"] = "SLASH";
    TokenType["ARROW"] = "ARROW";
    // EOF
    TokenType["EOF"] = "EOF";
})(TokenType || (exports.TokenType = TokenType = {}));
