import { Token, TokenType } from './token';
import { Lexer } from './lexer';
import * as AST from './ast';

export class Parser {
    private tokens: Token[];
    private current: number = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    private peek(): Token {
        return this.tokens[this.current];
    }

    private previous(): Token {
        return this.tokens[this.current - 1];
    }

    private isAtEnd(): boolean {
        return this.peek().type === TokenType.EOF;
    }

    private check(type: TokenType): boolean {
        if (this.isAtEnd()) return false;
        return this.peek().type === type;
    }

    private advance(): Token {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    private match(...types: TokenType[]): boolean {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }

    private consume(type: TokenType, message: string): Token {
        if (this.check(type)) return this.advance();
        throw new Error(`${message} at line ${this.peek().line}, col ${this.peek().col}`);
    }

    public parse(): AST.Program {
        let packageName = '';
        if (this.match(TokenType.PACKAGE)) {
            packageName = this.parseQualifiedName();
            this.consume(TokenType.SEMICOLON, "Expect ';' after package name.");
        }

        const imports: AST.Import[] = [];
        while (this.match(TokenType.IMPORT)) {
            const pathToken = this.consume(TokenType.STRING_LITERAL, "Expect import path.");
            imports.push({ type: 'Import', path: pathToken.value });
            this.consume(TokenType.SEMICOLON, "Expect ';' after import.");
        }

        const classes: AST.ClassDeclaration[] = [];
        while (!this.isAtEnd()) {
            classes.push(this.parseClassDeclaration());
        }

        return {
            type: 'Program',
            package: packageName,
            imports,
            body: classes
        };
    }

    private parseQualifiedName(): string {
        let name = this.consume(TokenType.IDENTIFIER, "Expect identifier.").value;
        while (this.match(TokenType.DOT)) {
            name += "." + this.consume(TokenType.IDENTIFIER, "Expect identifier after dot.").value;
        }
        return name;
    }

    private parseClassDeclaration(): AST.ClassDeclaration {
        let metadata: AST.Annotation | null = null;
        if (this.check(TokenType.AT)) {
            metadata = this.parseAnnotation();
        }

        // Modifiers
        while (this.match(TokenType.PUBLIC, TokenType.FINAL, TokenType.CLASS)) {
            // consuming modifiers loosely for now
            if (this.previous().type === TokenType.CLASS) break;
        }

        const name = this.consume(TokenType.IDENTIFIER, "Expect class name.").value;
        
        let superClass: string | null = null;
        if (this.match(TokenType.EXTENDS)) {
            superClass = this.parseQualifiedName();
            // Handle generics in superclass <Type>
            if (this.match(TokenType.LESS_THAN)) {
                 this.consume(TokenType.IDENTIFIER, "Expect type parameter");
                 this.consume(TokenType.GREATER_THAN, "Expect '>'");
            }
        }

        this.consume(TokenType.LBRACE, "Expect '{' before class body.");

        const methods: AST.MethodDeclaration[] = [];
        const fields: AST.FieldDeclaration[] = [];

        while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
            if (this.check(TokenType.AT)) {
                this.parseAnnotation(); // Consume annotation (Override etc)
            }

            // Check if it's a field or method
            // Lookahead is hard here without backtracking, so we'll use a heuristic.
            // modifiers -> type -> name -> ( -> Method
            // modifiers -> type -> name -> = or ; -> Field

            const isStatic = this.matchModifiers();
            
            const typeName = this.parseType();
            const memberName = this.consume(TokenType.IDENTIFIER, "Expect member name.").value;

            if (this.check(TokenType.LPAREN)) {
                methods.push(this.parseMethod(memberName, typeName, isStatic));
            } else {
                fields.push(this.parseField(memberName, typeName, isStatic));
            }
        }

        this.consume(TokenType.RBRACE, "Expect '}' after class body.");

        return {
            type: 'ClassDeclaration',
            name,
            superClass,
            metadata,
            methods,
            fields
        };
    }

    private matchModifiers(): boolean {
        let isStatic = false;
        while (this.match(TokenType.PUBLIC, TokenType.PRIVATE, TokenType.PROTECTED, TokenType.STATIC, TokenType.FINAL)) {
            if (this.previous().type === TokenType.STATIC) isStatic = true;
        }
        return isStatic;
    }

    private parseType(): string {
        if (this.match(TokenType.VOID)) return "void";
        let name = this.parseQualifiedName();
        // Array type
        if (this.match(TokenType.LBRACKET)) {
            this.consume(TokenType.RBRACKET, "Expect ']' after '[' for array type.");
            name += "[]";
        }
        return name;
    }

    private parseAnnotation(): AST.Annotation {
        this.consume(TokenType.AT, "Expect '@'.");
        const name = this.consume(TokenType.IDENTIFIER, "Expect annotation name.").value;
        const properties: { [key: string]: any } = {};

        if (this.match(TokenType.LPAREN)) {
            if (!this.check(TokenType.RPAREN)) {
                do {
                    const key = this.consume(TokenType.IDENTIFIER, "Expect property name.").value;
                    this.consume(TokenType.ASSIGN, "Expect '='.");
                    // Value can be literal or enum access (School.EVOCATION)
                    const value = this.parseLiteralOrEnum();
                    properties[key] = value;
                } while (this.match(TokenType.COMMA));
            }
            this.consume(TokenType.RPAREN, "Expect ')'.");
        }
        return { type: 'Annotation', name, properties };
    }

    private parseLiteralOrEnum(): any {
        if (this.match(TokenType.STRING_LITERAL, TokenType.NUMBER_LITERAL)) {
            return this.previous().value;
        }
        // Enum or boolean
        const name = this.parseQualifiedName();
        if (name === 'true') return true;
        if (name === 'false') return false;
        return name;
    }

    private parseMethod(name: string, returnType: string, isStatic: boolean): AST.MethodDeclaration {
        this.consume(TokenType.LPAREN, "Expect '('.");
        const params: AST.Parameter[] = [];
        if (!this.check(TokenType.RPAREN)) {
            do {
                if (this.match(TokenType.FINAL)) { /* ignore */ }
                const paramType = this.parseType();
                const paramName = this.consume(TokenType.IDENTIFIER, "Expect parameter name.").value;
                params.push({ name: paramName, paramType });
            } while (this.match(TokenType.COMMA));
        }
        this.consume(TokenType.RPAREN, "Expect ')'.");

        if (this.match(TokenType.THROWS)) {
            do {
                this.parseQualifiedName();
            } while (this.match(TokenType.COMMA));
        }

        this.consume(TokenType.LBRACE, "Expect '{' before method body.");
        const body = this.parseBlock();
        return { type: 'MethodDeclaration', name, returnType, params, body, isStatic };
    }

    private parseField(name: string, fieldType: string, isStatic: boolean): AST.FieldDeclaration {
        let value: AST.Expression | null = null;
        if (this.match(TokenType.ASSIGN)) {
            value = this.parseExpression();
        }
        this.consume(TokenType.SEMICOLON, "Expect ';' after field declaration.");
        return { type: 'FieldDeclaration', name, fieldType, value, isStatic };
    }

    private parseBlock(): AST.BlockStatement {
        const statements: AST.Statement[] = [];
        while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
            statements.push(this.parseStatement());
        }
        this.consume(TokenType.RBRACE, "Expect '}' after block.");
        return { type: 'BlockStatement', statements };
    }

    private parseStatement(): AST.Statement {
        if (this.match(TokenType.IF)) return this.parseIfStatement();
        if (this.match(TokenType.TRY)) return this.parseTryStatement();
        if (this.match(TokenType.RETURN)) return this.parseReturnStatement();
        if (this.match(TokenType.THROW)) return this.parseThrowStatement(); 
        // Note: 'throw' keyword is not in TokenType list as THROWS, wait. 
        // Java uses 'throw' for statement and 'throws' for declaration.
        // My token list only has THROWS. I'll reuse THROWS or IDENTIFIER 'throw'.
        // Let's assume IDENTIFIER for now or fix Token list. 
        // Actually, let's treat IDENTIFIER 'throw' as throw statement if strictly needed.
        
        // Block
        if (this.check(TokenType.LBRACE)) {
            this.consume(TokenType.LBRACE, "Expect '{'");
            return this.parseBlock();
        }

        // Variable Decl or Expression
        if (this.check(TokenType.FINAL) || this.check(TokenType.IDENTIFIER)) {
            // Check for VarDecl: Modifiers Type Name ...
            // Or Type Name ...
            
            // This lookahead is getting complex.
            // If it starts with 'final', it's almost certainly a VarDecl (cannot be expression).
            if (this.check(TokenType.FINAL)) {
                return this.parseVariableDeclaration();
            }
            
            const next = this.tokens[this.current + 1];
            if (next && next.type === TokenType.IDENTIFIER) {
                // Type Identifier -> VarDecl
                return this.parseVariableDeclaration();
            }
        }
        
        const expr = this.parseExpression();
        this.consume(TokenType.SEMICOLON, "Expect ';' after expression.");
        return { type: 'ExpressionStatement', expression: expr };
    }

    private parseIfStatement(): AST.IfStatement {
        this.consume(TokenType.LPAREN, "Expect '('.");
        const test = this.parseExpression();
        this.consume(TokenType.RPAREN, "Expect ')'.");
        const consequent = this.parseStatement();
        let alternate: AST.Statement | null = null;
        if (this.match(TokenType.ELSE)) {
            alternate = this.parseStatement();
        }
        return { type: 'IfStatement', test, consequent, alternate };
    }

    private parseTryStatement(): AST.TryStatement {
        this.consume(TokenType.LBRACE, "Expect '{'");
        const block = this.parseBlock();
        let handler: AST.CatchClause | null = null;
        if (this.match(TokenType.CATCH)) {
            this.consume(TokenType.LPAREN, "Expect '('.");
            const type = this.parseQualifiedName();
            const name = this.consume(TokenType.IDENTIFIER, "Expect exception name.").value;
            this.consume(TokenType.RPAREN, "Expect ')'.");
            this.consume(TokenType.LBRACE, "Expect '{'");
            const body = this.parseBlock();
            handler = { type: 'CatchClause', param: { name, paramType: type }, body };
        }
        let finalizer: AST.BlockStatement | null = null;
        if (this.match(TokenType.FINALLY)) {
            this.consume(TokenType.LBRACE, "Expect '{'");
            finalizer = this.parseBlock();
        }
        return { type: 'TryStatement', block, handler, finalizer };
    }

    private parseReturnStatement(): AST.ReturnStatement {
        let argument: AST.Expression | null = null;
        if (!this.check(TokenType.SEMICOLON)) {
            argument = this.parseExpression();
        }
        this.consume(TokenType.SEMICOLON, "Expect ';'.");
        return { type: 'ReturnStatement', argument };
    }

    private parseThrowStatement(): AST.ThrowStatement {
        const arg = this.parseExpression();
        this.consume(TokenType.SEMICOLON, "Expect ';' after throw.");
        return { type: 'ThrowStatement', argument: arg };
    }
    
    private parseVariableDeclaration(): AST.VariableDeclaration {
        if (this.match(TokenType.FINAL)) { /* ignore modifiers for now */ }
        const type = this.parseType();
        const name = this.consume(TokenType.IDENTIFIER, "Expect var name.").value;
        let init: AST.Expression | null = null;
        if (this.match(TokenType.ASSIGN)) {
            init = this.parseExpression();
        }
        this.consume(TokenType.SEMICOLON, "Expect ';'.");
        return { type: 'VariableDeclaration', name, varType: type, init };
    }

    private parseExpression(): AST.Expression {
        return this.parseAssignment();
    }

    private parseAssignment(): AST.Expression {
        const expr = this.parseEquality(); 
        if (this.match(TokenType.ASSIGN)) {
            const value = this.parseAssignment();
            if (expr.type === 'Identifier') {
                return { type: 'AssignmentExpression', left: expr as AST.Identifier, right: value };
            }
            throw new Error("Invalid assignment target.");
        }
        return expr;
    }

    private parseEquality(): AST.Expression {
        let expr = this.parseComparison();
        while (this.match(TokenType.EQUALS, TokenType.NOT_EQUALS)) {
            const operator = this.previous().value;
            const right = this.parseComparison();
            expr = { type: 'BinaryExpression', left: expr, operator, right } as AST.BinaryExpression;
        }
        return expr;
    }

    private parseComparison(): AST.Expression {
        let expr = this.parseTerm();
        while (this.match(TokenType.GREATER_THAN, TokenType.GREATER_EQUALS, TokenType.LESS_THAN, TokenType.LESS_EQUALS)) {
            const operator = this.previous().value;
            const right = this.parseTerm();
            expr = { type: 'BinaryExpression', left: expr, operator, right } as AST.BinaryExpression;
        }
        return expr;
    }

    private parseTerm(): AST.Expression {
        let expr = this.parseFactor();
        while (this.match(TokenType.PLUS, TokenType.MINUS)) {
            const operator = this.previous().value;
            const right = this.parseFactor();
            expr = { type: 'BinaryExpression', left: expr, operator, right } as AST.BinaryExpression;
        }
        return expr;
    }

    private parseFactor(): AST.Expression {
        let expr = this.parseCall();
        while (this.match(TokenType.STAR, TokenType.SLASH)) {
            const operator = this.previous().value;
            const right = this.parseCall();
            expr = { type: 'BinaryExpression', left: expr, operator, right } as AST.BinaryExpression;
        }
        return expr;
    }

    private parseCall(): AST.Expression {
        // Check for Lambda: (param) -> { ... } or () -> ...
        // This is ambiguous with Parenthesized Expression or Casts.
        // We'll use a lookahead heuristic. 
        // If we see '(', we parse comma separated list, then ')'. If next is '->', it's a lambda.
        
        if (this.check(TokenType.LPAREN)) {
            // Try to look ahead for '->'
            let foundArrow = false;
            let parenCount = 0;
            for (let i = this.current; i < this.tokens.length; i++) {
                if (this.tokens[i].type === TokenType.LPAREN) parenCount++;
                if (this.tokens[i].type === TokenType.RPAREN) parenCount--;
                if (parenCount === 0 && this.tokens[i+1]?.type === TokenType.ARROW) {
                    foundArrow = true;
                    break;
                }
                if (parenCount < 0) break;
            }

            if (foundArrow) {
                return this.parseLambda();
            }
        }

        let expr = this.parsePrimary();
        
        while (true) {
            if (this.match(TokenType.LPAREN)) {
                const args: AST.Expression[] = [];
                if (!this.check(TokenType.RPAREN)) {
                    do {
                        args.push(this.parseExpression());
                    } while (this.match(TokenType.COMMA));
                }
                this.consume(TokenType.RPAREN, "Expect ')'.");
                expr = { type: 'CallExpression', callee: expr, arguments: args };
            } else if (this.match(TokenType.DOT)) {
                const name = this.consume(TokenType.IDENTIFIER, "Expect property name after '.'").value;
                expr = { type: 'MemberExpression', object: expr, property: name };
            } else {
                break;
            }
        }
        return expr;
    }

    private parseLambda(): AST.LambdaExpression {
        this.consume(TokenType.LPAREN, "Expect '(' for lambda params.");
        const params: AST.Parameter[] = [];
        if (!this.check(TokenType.RPAREN)) {
            do {
                // In Java/λ++, lambda params can be typed or untyped.
                // (String s) -> ... or (s) -> ...
                // Heuristic: if 2 tokens before comma/paren, it's typed.
                // Simplified: Assume untyped for now or single token name.
                // Or try parseType() then check if next is identifier.
                
                // Let's support simple identifier params for now: (a, b) -> ...
                const name = this.consume(TokenType.IDENTIFIER, "Expect param name.").value;
                params.push({ name, paramType: 'Inferred' });
            } while (this.match(TokenType.COMMA));
        }
        this.consume(TokenType.RPAREN, "Expect ')'.");
        this.consume(TokenType.ARROW, "Expect '->'.");
        
        let body: AST.BlockStatement | AST.Expression;
        if (this.check(TokenType.LBRACE)) {
            this.consume(TokenType.LBRACE, "Expect '{'");
            body = this.parseBlock();
        } else {
            body = this.parseExpression();
        }
        
        return { type: 'LambdaExpression', params, body };
    }

    private parsePrimary(): AST.Expression {
        if (this.match(TokenType.NEW)) {
            const className = this.parseQualifiedName();
            this.consume(TokenType.LPAREN, "Expect '('.");
            const args: AST.Expression[] = [];
            if (!this.check(TokenType.RPAREN)) {
                do {
                    args.push(this.parseExpression());
                } while (this.match(TokenType.COMMA));
            }
            this.consume(TokenType.RPAREN, "Expect ')'.");
            return { type: 'NewExpression', callee: className, arguments: args };
        }

        if (this.match(TokenType.STRING_LITERAL)) return { type: 'Literal', value: this.previous().value, raw: 'string' };
        if (this.match(TokenType.NUMBER_LITERAL)) return { type: 'Literal', value: Number(this.previous().value), raw: 'number' };
        if (this.match(TokenType.IDENTIFIER)) return { type: 'Identifier', name: this.previous().value };
        
        // Handle 'null'
        // Handle 'this'
        
        throw new Error(`Unexpected token: ${this.peek().type} ${this.peek().value} at line ${this.peek().line}`);
    }
}
