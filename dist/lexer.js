"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lexer = void 0;
const token_1 = require("./token");
class Lexer {
    source;
    position = 0;
    line = 1;
    col = 1;
    constructor(source) {
        this.source = source;
    }
    advance(amount = 1) {
        this.position += amount;
        this.col += amount;
    }
    peek() {
        return this.source[this.position] || '';
    }
    peekNext() {
        return this.source[this.position + 1] || '';
    }
    isAlpha(char) {
        return /^[a-zA-Z_]$/.test(char);
    }
    isAlphanumeric(char) {
        return /^[a-zA-Z0-9_]$/.test(char); // and other allowed chars for path like / . - @
    }
    // Specifically for package imports which can be weird: "github.com/..."
    // We will parse strings as standard string literals.
    skipWhitespace() {
        while (this.position < this.source.length) {
            const char = this.peek();
            if (char === ' ' || char === '\t' || char === '\r') {
                this.advance();
            }
            else if (char === '\n') {
                this.line++;
                this.col = 1;
                this.position++; // Don't call advance to avoid double incrementing col logic weirdness
            }
            else if (char === '/' && this.peekNext() === '/') {
                // Comment
                while (this.peek() !== '\n' && this.peek() !== '') {
                    this.advance();
                }
            }
            else {
                break;
            }
        }
    }
    tokenize() {
        const tokens = [];
        while (this.position < this.source.length) {
            this.skipWhitespace();
            if (this.position >= this.source.length)
                break;
            const char = this.peek();
            const startCol = this.col;
            const startLine = this.line;
            // Symbols
            if (char === '{') {
                tokens.push({ type: token_1.TokenType.LBRACE, value: '{', line: startLine, col: startCol });
                this.advance();
                continue;
            }
            if (char === '}') {
                tokens.push({ type: token_1.TokenType.RBRACE, value: '}', line: startLine, col: startCol });
                this.advance();
                continue;
            }
            if (char === '(') {
                tokens.push({ type: token_1.TokenType.LPAREN, value: '(', line: startLine, col: startCol });
                this.advance();
                continue;
            }
            if (char === ')') {
                tokens.push({ type: token_1.TokenType.RPAREN, value: ')', line: startLine, col: startCol });
                this.advance();
                continue;
            }
            if (char === '[') {
                tokens.push({ type: token_1.TokenType.LBRACKET, value: '[', line: startLine, col: startCol });
                this.advance();
                continue;
            }
            if (char === ']') {
                tokens.push({ type: token_1.TokenType.RBRACKET, value: ']', line: startLine, col: startCol });
                this.advance();
                continue;
            }
            if (char === ';') {
                tokens.push({ type: token_1.TokenType.SEMICOLON, value: ';', line: startLine, col: startCol });
                this.advance();
                continue;
            }
            if (char === '.') {
                tokens.push({ type: token_1.TokenType.DOT, value: '.', line: startLine, col: startCol });
                this.advance();
                continue;
            }
            if (char === ',') {
                tokens.push({ type: token_1.TokenType.COMMA, value: ',', line: startLine, col: startCol });
                this.advance();
                continue;
            }
            if (char === '=') {
                if (this.peekNext() === '=') {
                    tokens.push({ type: token_1.TokenType.EQUALS, value: '==', line: startLine, col: startCol });
                    this.advance(2);
                }
                else {
                    tokens.push({ type: token_1.TokenType.ASSIGN, value: '=', line: startLine, col: startCol });
                    this.advance();
                }
                continue;
            }
            if (char === '!') {
                if (this.peekNext() === '=') {
                    tokens.push({ type: token_1.TokenType.NOT_EQUALS, value: '!=', line: startLine, col: startCol });
                    this.advance(2);
                }
                else {
                    tokens.push({ type: token_1.TokenType.BANG, value: '!', line: startLine, col: startCol });
                    this.advance();
                }
                continue;
            }
            if (char === '@') {
                tokens.push({ type: token_1.TokenType.AT, value: '@', line: startLine, col: startCol });
                this.advance();
                continue;
            }
            if (char === '<') {
                if (this.peekNext() === '=') {
                    tokens.push({ type: token_1.TokenType.LESS_EQUALS, value: '<=', line: startLine, col: startCol });
                    this.advance(2);
                }
                else {
                    tokens.push({ type: token_1.TokenType.LESS_THAN, value: '<', line: startLine, col: startCol });
                    this.advance();
                }
                continue;
            }
            if (char === '>') {
                if (this.peekNext() === '=') {
                    tokens.push({ type: token_1.TokenType.GREATER_EQUALS, value: '>=', line: startLine, col: startCol });
                    this.advance(2);
                }
                else {
                    tokens.push({ type: token_1.TokenType.GREATER_THAN, value: '>', line: startLine, col: startCol });
                    this.advance();
                }
                continue;
            }
            if (char === '+') {
                tokens.push({ type: token_1.TokenType.PLUS, value: '+', line: startLine, col: startCol });
                this.advance();
                continue;
            }
            if (char === '-') {
                if (this.peekNext() === '>') {
                    tokens.push({ type: token_1.TokenType.ARROW, value: '->', line: startLine, col: startCol });
                    this.advance(2);
                }
                else {
                    tokens.push({ type: token_1.TokenType.MINUS, value: '-', line: startLine, col: startCol });
                    this.advance();
                }
                continue;
            }
            if (char === '*') {
                tokens.push({ type: token_1.TokenType.STAR, value: '*', line: startLine, col: startCol });
                this.advance();
                continue;
            }
            // Slash handled below for comments
            // Strings
            if (char === '"') {
                this.advance();
                let value = '';
                while (this.peek() !== '"' && this.peek() !== '') {
                    value += this.peek();
                    this.advance();
                }
                if (this.peek() === '"')
                    this.advance(); // consume closing quote
                tokens.push({ type: token_1.TokenType.STRING_LITERAL, value, line: startLine, col: startCol });
                continue;
            }
            // Numbers
            if (/[0-9]/.test(char)) {
                let value = '';
                while (/[0-9]/.test(this.peek())) {
                    value += this.peek();
                    this.advance();
                }
                tokens.push({ type: token_1.TokenType.NUMBER_LITERAL, value, line: startLine, col: startCol });
                continue;
            }
            // Keywords & Identifiers
            if (this.isAlpha(char)) {
                let value = '';
                while (this.isAlphanumeric(this.peek()) || this.peek() === '.') {
                    // Allowing dots in identifiers for simplicity for now (e.g. System.out.println)
                    // ACTUALLY NO. Dots are tokens.
                    if (this.peek() === '.')
                        break;
                    value += this.peek();
                    this.advance();
                }
                let type = token_1.TokenType.IDENTIFIER;
                switch (value) {
                    case 'package':
                        type = token_1.TokenType.PACKAGE;
                        break;
                    case 'import':
                        type = token_1.TokenType.IMPORT;
                        break;
                    case 'public':
                        type = token_1.TokenType.PUBLIC;
                        break;
                    case 'private':
                        type = token_1.TokenType.PRIVATE;
                        break;
                    case 'protected':
                        type = token_1.TokenType.PROTECTED;
                        break;
                    case 'final':
                        type = token_1.TokenType.FINAL;
                        break;
                    case 'class':
                        type = token_1.TokenType.CLASS;
                        break;
                    case 'extends':
                        type = token_1.TokenType.EXTENDS;
                        break;
                    case 'implements':
                        type = token_1.TokenType.IMPLEMENTS;
                        break;
                    case 'static':
                        type = token_1.TokenType.STATIC;
                        break;
                    case 'void':
                        type = token_1.TokenType.VOID;
                        break;
                    case 'throws':
                        type = token_1.TokenType.THROWS;
                        break;
                    case 'throw':
                        type = token_1.TokenType.THROW;
                        break;
                    case 'new':
                        type = token_1.TokenType.NEW;
                        break;
                    case 'if':
                        type = token_1.TokenType.IF;
                        break;
                    case 'else':
                        type = token_1.TokenType.ELSE;
                        break;
                    case 'try':
                        type = token_1.TokenType.TRY;
                        break;
                    case 'catch':
                        type = token_1.TokenType.CATCH;
                        break;
                    case 'finally':
                        type = token_1.TokenType.FINALLY;
                        break;
                    case 'return':
                        type = token_1.TokenType.RETURN;
                        break;
                }
                tokens.push({ type, value, line: startLine, col: startCol });
                continue;
            }
            // Unknown
            console.warn(`Unknown character: ${char} at ${startLine}:${startCol}`);
            this.advance();
        }
        tokens.push({ type: token_1.TokenType.EOF, value: '', line: this.line, col: this.col });
        return tokens;
    }
}
exports.Lexer = Lexer;
