"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const token_1 = require("./token");
class Parser {
    constructor(tokens) {
        this.current = 0;
        this.tokens = tokens;
    }
    peek() {
        return this.tokens[this.current];
    }
    previous() {
        return this.tokens[this.current - 1];
    }
    isAtEnd() {
        return this.peek().type === token_1.TokenType.EOF;
    }
    check(type) {
        if (this.isAtEnd())
            return false;
        return this.peek().type === type;
    }
    advance() {
        if (!this.isAtEnd())
            this.current++;
        return this.previous();
    }
    match(...types) {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }
    consume(type, message) {
        if (this.check(type))
            return this.advance();
        throw new Error(`${message} at line ${this.peek().line}, col ${this.peek().col}`);
    }
    parse() {
        let packageName = '';
        if (this.match(token_1.TokenType.PACKAGE)) {
            packageName = this.parseQualifiedName();
            this.consume(token_1.TokenType.SEMICOLON, "Expect ';' after package name.");
        }
        const imports = [];
        while (this.match(token_1.TokenType.IMPORT)) {
            const pathToken = this.consume(token_1.TokenType.STRING_LITERAL, "Expect import path.");
            imports.push({ type: 'Import', path: pathToken.value });
            this.consume(token_1.TokenType.SEMICOLON, "Expect ';' after import.");
        }
        const classes = [];
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
    parseQualifiedName() {
        let name = this.consume(token_1.TokenType.IDENTIFIER, "Expect identifier.").value;
        while (this.match(token_1.TokenType.DOT)) {
            name += "." + this.consume(token_1.TokenType.IDENTIFIER, "Expect identifier after dot.").value;
        }
        return name;
    }
    parseClassDeclaration() {
        let metadata = null;
        if (this.check(token_1.TokenType.AT)) {
            metadata = this.parseAnnotation();
        }
        // Modifiers
        while (this.match(token_1.TokenType.PUBLIC, token_1.TokenType.FINAL, token_1.TokenType.CLASS)) {
            // consuming modifiers loosely for now
            if (this.previous().type === token_1.TokenType.CLASS)
                break;
        }
        const name = this.consume(token_1.TokenType.IDENTIFIER, "Expect class name.").value;
        // Handle Generic Class Declaration <T>
        if (this.match(token_1.TokenType.LESS_THAN)) {
            // Simplified: <T> or <T, U>
            do {
                this.consume(token_1.TokenType.IDENTIFIER, "Expect type parameter.");
            } while (this.match(token_1.TokenType.COMMA));
            this.consume(token_1.TokenType.GREATER_THAN, "Expect '>'.");
        }
        let superClass = null;
        if (this.match(token_1.TokenType.EXTENDS)) {
            superClass = this.parseQualifiedName();
            // Handle generics in superclass <Type>
            if (this.match(token_1.TokenType.LESS_THAN)) {
                this.consume(token_1.TokenType.IDENTIFIER, "Expect type parameter");
                this.consume(token_1.TokenType.GREATER_THAN, "Expect '>'");
            }
        }
        this.consume(token_1.TokenType.LBRACE, "Expect '{' before class body.");
        const methods = [];
        const fields = [];
        while (!this.check(token_1.TokenType.RBRACE) && !this.isAtEnd()) {
            if (this.check(token_1.TokenType.AT)) {
                this.parseAnnotation(); // Consume annotation (Override etc)
            }
            // Check if it's a field or method
            // Lookahead is hard here without backtracking, so we'll use a heuristic.
            // modifiers -> type -> name -> ( -> Method
            // modifiers -> type -> name -> = or ; -> Field
            const isStatic = this.matchModifiers();
            const typeName = this.parseType();
            const memberName = this.consume(token_1.TokenType.IDENTIFIER, "Expect member name.").value;
            if (this.check(token_1.TokenType.LPAREN)) {
                methods.push(this.parseMethod(memberName, typeName, isStatic));
            }
            else {
                fields.push(this.parseField(memberName, typeName, isStatic));
            }
        }
        this.consume(token_1.TokenType.RBRACE, "Expect '}' after class body.");
        return {
            type: 'ClassDeclaration',
            name,
            superClass,
            metadata,
            methods,
            fields
        };
    }
    matchModifiers() {
        let isStatic = false;
        while (this.match(token_1.TokenType.PUBLIC, token_1.TokenType.PRIVATE, token_1.TokenType.PROTECTED, token_1.TokenType.STATIC, token_1.TokenType.FINAL)) {
            if (this.previous().type === token_1.TokenType.STATIC)
                isStatic = true;
        }
        return isStatic;
    }
    parseType() {
        if (this.match(token_1.TokenType.VOID))
            return "void";
        let name = this.parseQualifiedName();
        // Array type
        if (this.match(token_1.TokenType.LBRACKET)) {
            this.consume(token_1.TokenType.RBRACKET, "Expect ']' after '[' for array type.");
            name += "[]";
        }
        return name;
    }
    parseAnnotation() {
        this.consume(token_1.TokenType.AT, "Expect '@'.");
        const name = this.consume(token_1.TokenType.IDENTIFIER, "Expect annotation name.").value;
        const properties = {};
        if (this.match(token_1.TokenType.LPAREN)) {
            if (!this.check(token_1.TokenType.RPAREN)) {
                do {
                    const key = this.consume(token_1.TokenType.IDENTIFIER, "Expect property name.").value;
                    this.consume(token_1.TokenType.ASSIGN, "Expect '='.");
                    // Value can be literal or enum access (School.EVOCATION)
                    const value = this.parseLiteralOrEnum();
                    properties[key] = value;
                } while (this.match(token_1.TokenType.COMMA));
            }
            this.consume(token_1.TokenType.RPAREN, "Expect ')'.");
        }
        return { type: 'Annotation', name, properties };
    }
    parseLiteralOrEnum() {
        if (this.match(token_1.TokenType.STRING_LITERAL, token_1.TokenType.NUMBER_LITERAL)) {
            return this.previous().value;
        }
        // Enum or boolean
        const name = this.parseQualifiedName();
        if (name === 'true')
            return true;
        if (name === 'false')
            return false;
        return name;
    }
    parseMethod(name, returnType, isStatic) {
        this.consume(token_1.TokenType.LPAREN, "Expect '('.");
        const params = [];
        if (!this.check(token_1.TokenType.RPAREN)) {
            do {
                if (this.match(token_1.TokenType.FINAL)) { /* ignore */ }
                const paramType = this.parseType();
                const paramName = this.consume(token_1.TokenType.IDENTIFIER, "Expect parameter name.").value;
                params.push({ name: paramName, paramType });
            } while (this.match(token_1.TokenType.COMMA));
        }
        this.consume(token_1.TokenType.RPAREN, "Expect ')'.");
        if (this.match(token_1.TokenType.THROWS)) {
            do {
                this.parseQualifiedName();
            } while (this.match(token_1.TokenType.COMMA));
        }
        this.consume(token_1.TokenType.LBRACE, "Expect '{' before method body.");
        const body = this.parseBlock();
        return { type: 'MethodDeclaration', name, returnType, params, body, isStatic };
    }
    parseField(name, fieldType, isStatic) {
        let value = null;
        if (this.match(token_1.TokenType.ASSIGN)) {
            value = this.parseExpression();
        }
        this.consume(token_1.TokenType.SEMICOLON, "Expect ';' after field declaration.");
        return { type: 'FieldDeclaration', name, fieldType, value, isStatic };
    }
    parseBlock() {
        const statements = [];
        while (!this.check(token_1.TokenType.RBRACE) && !this.isAtEnd()) {
            statements.push(this.parseStatement());
        }
        this.consume(token_1.TokenType.RBRACE, "Expect '}' after block.");
        return { type: 'BlockStatement', statements };
    }
    parseStatement() {
        if (this.match(token_1.TokenType.IF))
            return this.parseIfStatement();
        if (this.match(token_1.TokenType.TRY))
            return this.parseTryStatement();
        if (this.match(token_1.TokenType.RETURN))
            return this.parseReturnStatement();
        if (this.match(token_1.TokenType.THROW))
            return this.parseThrowStatement();
        // Note: 'throw' keyword is not in TokenType list as THROWS, wait. 
        // Java uses 'throw' for statement and 'throws' for declaration.
        // My token list only has THROWS. I'll reuse THROWS or IDENTIFIER 'throw'.
        // Let's assume IDENTIFIER for now or fix Token list. 
        // Actually, let's treat IDENTIFIER 'throw' as throw statement if strictly needed.
        // Block
        if (this.check(token_1.TokenType.LBRACE)) {
            this.consume(token_1.TokenType.LBRACE, "Expect '{'");
            return this.parseBlock();
        }
        // Variable Decl or Expression
        if (this.check(token_1.TokenType.FINAL) || this.check(token_1.TokenType.IDENTIFIER)) {
            // Check for VarDecl: Modifiers Type Name ...
            // Or Type Name ...
            // This lookahead is getting complex.
            // If it starts with 'final', it's almost certainly a VarDecl (cannot be expression).
            if (this.check(token_1.TokenType.FINAL)) {
                return this.parseVariableDeclaration();
            }
            const next = this.tokens[this.current + 1];
            if (next && next.type === token_1.TokenType.IDENTIFIER) {
                // Type Identifier -> VarDecl
                return this.parseVariableDeclaration();
            }
        }
        const expr = this.parseExpression();
        this.consume(token_1.TokenType.SEMICOLON, "Expect ';' after expression.");
        return { type: 'ExpressionStatement', expression: expr };
    }
    parseIfStatement() {
        this.consume(token_1.TokenType.LPAREN, "Expect '('.");
        const test = this.parseExpression();
        this.consume(token_1.TokenType.RPAREN, "Expect ')'.");
        const consequent = this.parseStatement();
        let alternate = null;
        if (this.match(token_1.TokenType.ELSE)) {
            alternate = this.parseStatement();
        }
        return { type: 'IfStatement', test, consequent, alternate };
    }
    parseTryStatement() {
        this.consume(token_1.TokenType.LBRACE, "Expect '{'");
        const block = this.parseBlock();
        let handler = null;
        if (this.match(token_1.TokenType.CATCH)) {
            this.consume(token_1.TokenType.LPAREN, "Expect '('.");
            const type = this.parseQualifiedName();
            const name = this.consume(token_1.TokenType.IDENTIFIER, "Expect exception name.").value;
            this.consume(token_1.TokenType.RPAREN, "Expect ')'.");
            this.consume(token_1.TokenType.LBRACE, "Expect '{'");
            const body = this.parseBlock();
            handler = { type: 'CatchClause', param: { name, paramType: type }, body };
        }
        let finalizer = null;
        if (this.match(token_1.TokenType.FINALLY)) {
            this.consume(token_1.TokenType.LBRACE, "Expect '{'");
            finalizer = this.parseBlock();
        }
        return { type: 'TryStatement', block, handler, finalizer };
    }
    parseReturnStatement() {
        let argument = null;
        if (!this.check(token_1.TokenType.SEMICOLON)) {
            argument = this.parseExpression();
        }
        this.consume(token_1.TokenType.SEMICOLON, "Expect ';'.");
        return { type: 'ReturnStatement', argument };
    }
    parseThrowStatement() {
        const arg = this.parseExpression();
        this.consume(token_1.TokenType.SEMICOLON, "Expect ';' after throw.");
        return { type: 'ThrowStatement', argument: arg };
    }
    parseVariableDeclaration() {
        if (this.match(token_1.TokenType.FINAL)) { /* ignore modifiers for now */ }
        const type = this.parseType();
        const name = this.consume(token_1.TokenType.IDENTIFIER, "Expect var name.").value;
        let init = null;
        if (this.match(token_1.TokenType.ASSIGN)) {
            init = this.parseExpression();
        }
        this.consume(token_1.TokenType.SEMICOLON, "Expect ';'.");
        return { type: 'VariableDeclaration', name, varType: type, init };
    }
    parseExpression() {
        return this.parseAssignment();
    }
    parseAssignment() {
        const expr = this.parseEquality();
        if (this.match(token_1.TokenType.ASSIGN)) {
            const value = this.parseAssignment();
            if (expr.type === 'Identifier') {
                return { type: 'AssignmentExpression', left: expr, right: value };
            }
            throw new Error("Invalid assignment target.");
        }
        return expr;
    }
    parseEquality() {
        let expr = this.parseComparison();
        while (this.match(token_1.TokenType.EQUALS, token_1.TokenType.NOT_EQUALS)) {
            const operator = this.previous().value;
            const right = this.parseComparison();
            expr = { type: 'BinaryExpression', left: expr, operator, right };
        }
        return expr;
    }
    parseComparison() {
        let expr = this.parseTerm();
        while (this.match(token_1.TokenType.GREATER_THAN, token_1.TokenType.GREATER_EQUALS, token_1.TokenType.LESS_THAN, token_1.TokenType.LESS_EQUALS)) {
            const operator = this.previous().value;
            const right = this.parseTerm();
            expr = { type: 'BinaryExpression', left: expr, operator, right };
        }
        return expr;
    }
    parseTerm() {
        let expr = this.parseFactor();
        while (this.match(token_1.TokenType.PLUS, token_1.TokenType.MINUS)) {
            const operator = this.previous().value;
            const right = this.parseFactor();
            expr = { type: 'BinaryExpression', left: expr, operator, right };
        }
        return expr;
    }
    parseFactor() {
        let expr = this.parseCall();
        while (this.match(token_1.TokenType.STAR, token_1.TokenType.SLASH)) {
            const operator = this.previous().value;
            const right = this.parseCall();
            expr = { type: 'BinaryExpression', left: expr, operator, right };
        }
        return expr;
    }
    parseCall() {
        // Check for Lambda: (param) -> { ... } or () -> ...
        // This is ambiguous with Parenthesized Expression or Casts.
        // We'll use a lookahead heuristic. 
        // If we see '(', we parse comma separated list, then ')'. If next is '->', it's a lambda.
        if (this.check(token_1.TokenType.LPAREN)) {
            // Try to look ahead for '->'
            let foundArrow = false;
            let parenCount = 0;
            for (let i = this.current; i < this.tokens.length; i++) {
                if (this.tokens[i].type === token_1.TokenType.LPAREN)
                    parenCount++;
                if (this.tokens[i].type === token_1.TokenType.RPAREN)
                    parenCount--;
                if (parenCount === 0 && this.tokens[i + 1]?.type === token_1.TokenType.ARROW) {
                    foundArrow = true;
                    break;
                }
                if (parenCount < 0)
                    break;
            }
            if (foundArrow) {
                return this.parseLambda();
            }
        }
        let expr = this.parsePrimary();
        while (true) {
            if (this.match(token_1.TokenType.LPAREN)) {
                const args = [];
                if (!this.check(token_1.TokenType.RPAREN)) {
                    do {
                        args.push(this.parseExpression());
                    } while (this.match(token_1.TokenType.COMMA));
                }
                this.consume(token_1.TokenType.RPAREN, "Expect ')'.");
                expr = { type: 'CallExpression', callee: expr, arguments: args };
            }
            else if (this.match(token_1.TokenType.DOT)) {
                const name = this.consume(token_1.TokenType.IDENTIFIER, "Expect property name after '.'").value;
                expr = { type: 'MemberExpression', object: expr, property: name };
            }
            else {
                break;
            }
        }
        return expr;
    }
    parseLambda() {
        this.consume(token_1.TokenType.LPAREN, "Expect '(' for lambda params.");
        const params = [];
        if (!this.check(token_1.TokenType.RPAREN)) {
            do {
                // In Java/λ++, lambda params can be typed or untyped.
                // (String s) -> ... or (s) -> ...
                // Heuristic: if 2 tokens before comma/paren, it's typed.
                // Simplified: Assume untyped for now or single token name.
                // Or try parseType() then check if next is identifier.
                // Let's support simple identifier params for now: (a, b) -> ...
                const name = this.consume(token_1.TokenType.IDENTIFIER, "Expect param name.").value;
                params.push({ name, paramType: 'Inferred' });
            } while (this.match(token_1.TokenType.COMMA));
        }
        this.consume(token_1.TokenType.RPAREN, "Expect ')'.");
        this.consume(token_1.TokenType.ARROW, "Expect '->'.");
        let body;
        if (this.check(token_1.TokenType.LBRACE)) {
            this.consume(token_1.TokenType.LBRACE, "Expect '{'");
            body = this.parseBlock();
        }
        else {
            body = this.parseExpression();
        }
        return { type: 'LambdaExpression', params, body };
    }
    parsePrimary() {
        if (this.match(token_1.TokenType.NEW)) {
            const className = this.parseQualifiedName();
            this.consume(token_1.TokenType.LPAREN, "Expect '('.");
            const args = [];
            if (!this.check(token_1.TokenType.RPAREN)) {
                do {
                    args.push(this.parseExpression());
                } while (this.match(token_1.TokenType.COMMA));
            }
            this.consume(token_1.TokenType.RPAREN, "Expect ')'.");
            return { type: 'NewExpression', callee: className, arguments: args };
        }
        if (this.match(token_1.TokenType.STRING_LITERAL))
            return { type: 'Literal', value: this.previous().value, raw: 'string' };
        if (this.match(token_1.TokenType.NUMBER_LITERAL))
            return { type: 'Literal', value: Number(this.previous().value), raw: 'number' };
        if (this.match(token_1.TokenType.IDENTIFIER))
            return { type: 'Identifier', name: this.previous().value };
        // Handle 'null'
        // Handle 'this'
        throw new Error(`Unexpected token: ${this.peek().type} ${this.peek().value} at line ${this.peek().line}`);
    }
}
exports.Parser = Parser;
