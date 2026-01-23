import { Token, TokenType } from './token';

export class Lexer {
    private source: string;
    private position: number = 0;
    private line: number = 1;
    private col: number = 1;

    constructor(source: string) {
        this.source = source;
    }

    private advance(amount: number = 1) {
        this.position += amount;
        this.col += amount;
    }

    private peek(): string {
        return this.source[this.position] || '';
    }

    private peekNext(): string {
        return this.source[this.position + 1] || '';
    }

    private isAlpha(char: string): boolean {
        return /^[a-zA-Z_]$/.test(char);
    }

    private isAlphanumeric(char: string): boolean {
        return /^[a-zA-Z0-9_]$/.test(char); // and other allowed chars for path like / . - @
    }
    
    // Specifically for package imports which can be weird: "github.com/..."
    // We will parse strings as standard string literals.
    
    private skipWhitespace() {
        while (this.position < this.source.length) {
            const char = this.peek();
            if (char === ' ' || char === '\t' || char === '\r') {
                this.advance();
            } else if (char === '\n') {
                this.line++;
                this.col = 1;
                this.position++; // Don't call advance to avoid double incrementing col logic weirdness
            } else if (char === '/' && this.peekNext() === '/') {
                // Comment
                while (this.peek() !== '\n' && this.peek() !== '') {
                    this.advance();
                }
            } else {
                break;
            }
        }
    }

    public tokenize(): Token[] {
        const tokens: Token[] = [];
        
        while (this.position < this.source.length) {
            this.skipWhitespace();
            if (this.position >= this.source.length) break;

            const char = this.peek();
            const startCol = this.col;
            const startLine = this.line;

            // Symbols
            if (char === '{') { tokens.push({ type: TokenType.LBRACE, value: '{', line: startLine, col: startCol }); this.advance(); continue; }
            if (char === '}') { tokens.push({ type: TokenType.RBRACE, value: '}', line: startLine, col: startCol }); this.advance(); continue; }
            if (char === '(') { tokens.push({ type: TokenType.LPAREN, value: '(', line: startLine, col: startCol }); this.advance(); continue; }
            if (char === ')') { tokens.push({ type: TokenType.RPAREN, value: ')', line: startLine, col: startCol }); this.advance(); continue; }
            if (char === '[') { tokens.push({ type: TokenType.LBRACKET, value: '[', line: startLine, col: startCol }); this.advance(); continue; }
            if (char === ']') { tokens.push({ type: TokenType.RBRACKET, value: ']', line: startLine, col: startCol }); this.advance(); continue; }
            if (char === ';') { tokens.push({ type: TokenType.SEMICOLON, value: ';', line: startLine, col: startCol }); this.advance(); continue; }
            if (char === '.') { tokens.push({ type: TokenType.DOT, value: '.', line: startLine, col: startCol }); this.advance(); continue; }
            if (char === ',') { tokens.push({ type: TokenType.COMMA, value: ',', line: startLine, col: startCol }); this.advance(); continue; }
            if (char === '=') { 
                if (this.peekNext() === '=') {
                    tokens.push({ type: TokenType.EQUALS, value: '==', line: startLine, col: startCol });
                    this.advance(2);
                } else {
                    tokens.push({ type: TokenType.ASSIGN, value: '=', line: startLine, col: startCol }); 
                    this.advance();
                }
                continue; 
            }
            if (char === '!') { 
                if (this.peekNext() === '=') {
                    tokens.push({ type: TokenType.NOT_EQUALS, value: '!=', line: startLine, col: startCol });
                    this.advance(2);
                } else {
                    tokens.push({ type: TokenType.BANG, value: '!', line: startLine, col: startCol }); 
                    this.advance();
                }
                continue; 
            }
            if (char === '@') { tokens.push({ type: TokenType.AT, value: '@', line: startLine, col: startCol }); this.advance(); continue; }
            if (char === '<') { 
                if (this.peekNext() === '=') {
                    tokens.push({ type: TokenType.LESS_EQUALS, value: '<=', line: startLine, col: startCol });
                    this.advance(2);
                } else {
                    tokens.push({ type: TokenType.LESS_THAN, value: '<', line: startLine, col: startCol }); 
                    this.advance();
                }
                continue; 
            }
            if (char === '>') { 
                if (this.peekNext() === '=') {
                    tokens.push({ type: TokenType.GREATER_EQUALS, value: '>=', line: startLine, col: startCol });
                    this.advance(2);
                } else {
                    tokens.push({ type: TokenType.GREATER_THAN, value: '>', line: startLine, col: startCol }); 
                    this.advance();
                }
                continue; 
            }
            if (char === '+') { tokens.push({ type: TokenType.PLUS, value: '+', line: startLine, col: startCol }); this.advance(); continue; }
            if (char === '-') { 
                if (this.peekNext() === '>') {
                    tokens.push({ type: TokenType.ARROW, value: '->', line: startLine, col: startCol });
                    this.advance(2);
                } else {
                    tokens.push({ type: TokenType.MINUS, value: '-', line: startLine, col: startCol }); 
                    this.advance();
                }
                continue; 
            }
            if (char === '*') { tokens.push({ type: TokenType.STAR, value: '*', line: startLine, col: startCol }); this.advance(); continue; }
            // Slash handled below for comments

            // Strings
            if (char === '"') {
                this.advance();
                let value = '';
                while (this.peek() !== '"' && this.peek() !== '') {
                    value += this.peek();
                    this.advance();
                }
                if (this.peek() === '"') this.advance(); // consume closing quote
                tokens.push({ type: TokenType.STRING_LITERAL, value, line: startLine, col: startCol });
                continue;
            }

            // Numbers
            if (/[0-9]/.test(char)) {
                let value = '';
                while (/[0-9]/.test(this.peek())) {
                    value += this.peek();
                    this.advance();
                }
                tokens.push({ type: TokenType.NUMBER_LITERAL, value, line: startLine, col: startCol });
                continue;
            }

            // Keywords & Identifiers
            if (this.isAlpha(char)) {
                let value = '';
                while (this.isAlphanumeric(this.peek()) || this.peek() === '.') { 
                    // Allowing dots in identifiers for simplicity for now (e.g. System.out.println)
                    // ACTUALLY NO. Dots are tokens.
                    if (this.peek() === '.') break;
                    value += this.peek();
                    this.advance();
                }

                let type = TokenType.IDENTIFIER;
                switch (value) {
                    case 'package': type = TokenType.PACKAGE; break;
                    case 'import': type = TokenType.IMPORT; break;
                    case 'public': type = TokenType.PUBLIC; break;
                    case 'private': type = TokenType.PRIVATE; break;
                    case 'protected': type = TokenType.PROTECTED; break;
                    case 'final': type = TokenType.FINAL; break;
                    case 'class': type = TokenType.CLASS; break;
                    case 'extends': type = TokenType.EXTENDS; break;
                    case 'implements': type = TokenType.IMPLEMENTS; break;
                    case 'static': type = TokenType.STATIC; break;
                    case 'void': type = TokenType.VOID; break;
                    case 'throws': type = TokenType.THROWS; break;
                    case 'throw': type = TokenType.THROW; break;
                    case 'new': type = TokenType.NEW; break;
                    case 'if': type = TokenType.IF; break;
                    case 'else': type = TokenType.ELSE; break;
                    case 'try': type = TokenType.TRY; break;
                    case 'catch': type = TokenType.CATCH; break;
                    case 'finally': type = TokenType.FINALLY; break;
                    case 'return': type = TokenType.RETURN; break;
                }
                tokens.push({ type, value, line: startLine, col: startCol });
                continue;
            }

            // Unknown
            console.warn(`Unknown character: ${char} at ${startLine}:${startCol}`);
            this.advance();
        }

        tokens.push({ type: TokenType.EOF, value: '', line: this.line, col: this.col });
        return tokens;
    }
}
