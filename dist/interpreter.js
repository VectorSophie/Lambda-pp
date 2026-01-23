"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interpreter = void 0;
class Interpreter {
    constructor() {
        this.manaAllocated = 0;
        this.scope = [new Map()];
    }
    interpret(program) {
        console.log("--------------------------------------------------");
        console.log(`LARC v1.0.0 - Compiling ${program.package || 'default'}...`);
        console.log("--------------------------------------------------");
        // Phase 1: Registration (Simulated)
        program.body.forEach(clazz => {
            console.log(`[Registry] Registered ritual: ${clazz.name}`);
            if (clazz.metadata) {
                console.log(`  > Metadata: ${JSON.stringify(clazz.metadata.properties)}`);
            }
        });
        // Phase 2: Execution (Find Main)
        const mainClass = program.body.find(c => c.methods.some(m => m.name === 'main' && m.isStatic));
        if (mainClass) {
            const mainMethod = mainClass.methods.find(m => m.name === 'main');
            console.log(`[Runtime] Invoking ${mainClass.name}.main()...`);
            try {
                this.executeBlock(mainMethod.body);
            }
            catch (e) {
                console.error(`[Runtime] FATAL: ${e.message}`);
            }
        }
        else {
            console.log("[Runtime] No entry point (@Main) found.");
        }
        // Phase 3: Post-Run Checks
        this.checkManaLeaks();
    }
    checkManaLeaks() {
        if (this.manaAllocated > 0) {
            console.error(`\n[!] CRITICAL: MANA LEAK DETECTED! Leaked ${this.manaAllocated} units.`);
            console.error("    The fabric of reality weakens. Expect void entities.");
        }
        else if (this.manaAllocated < 0) {
            console.error(`\n[!] ERROR: Double-free or stack corruption detected.`);
        }
        else {
            console.log("\n[Runtime] Mana pool balanced. Reality is stable.");
        }
    }
    executeStatement(stmt) {
        switch (stmt.type) {
            case 'BlockStatement':
                this.pushScope();
                this.executeBlock(stmt);
                this.popScope();
                break;
            case 'ExpressionStatement':
                this.evaluate(stmt.expression);
                break;
            case 'VariableDeclaration':
                this.executeVarDecl(stmt);
                break;
            case 'IfStatement':
                this.executeIf(stmt);
                break;
            case 'TryStatement':
                this.executeTry(stmt);
                break;
            // ... other statements
        }
    }
    executeBlock(block) {
        for (const stmt of block.statements) {
            this.executeStatement(stmt);
        }
    }
    executeVarDecl(stmt) {
        const val = stmt.init ? this.evaluate(stmt.init) : null;
        this.currentScope().set(stmt.name, val);
    }
    executeIf(stmt) {
        if (this.evaluate(stmt.test)) {
            this.executeStatement(stmt.consequent);
        }
        else if (stmt.alternate) {
            this.executeStatement(stmt.alternate);
        }
    }
    executeTry(stmt) {
        try {
            this.executeBlock(stmt.block);
        }
        catch (e) {
            if (stmt.handler) {
                this.pushScope();
                // Bind exception to param
                this.currentScope().set(stmt.handler.param.name, e); // In a real language, wrap this
                this.executeBlock(stmt.handler.body);
                this.popScope();
            }
        }
        finally {
            if (stmt.finalizer) {
                this.executeBlock(stmt.finalizer);
            }
        }
    }
    evaluate(expr) {
        switch (expr.type) {
            case 'Literal':
                return expr.value;
            case 'Identifier':
                return this.resolve(expr.name);
            case 'CallExpression':
                return this.executeCall(expr);
            case 'AssignmentExpression':
                return this.executeAssignment(expr);
            case 'NewExpression':
                const newExpr = expr;
                const args = newExpr.arguments.map(a => this.evaluate(a));
                return { __type: newExpr.callee, __args: args };
            case 'MemberExpression':
                const obj = this.evaluate(expr.object);
                const prop = expr.property;
                if (obj && typeof obj === 'object')
                    return obj[prop];
                return undefined;
            case 'LambdaExpression':
                return {
                    type: 'Lambda',
                    params: expr.params,
                    body: expr.body,
                    closure: this.currentScope() // Capture scope
                };
            case 'BinaryExpression':
                return this.evaluateBinary(expr);
        }
    }
    evaluateBinary(expr) {
        const left = this.evaluate(expr.left);
        const right = this.evaluate(expr.right);
        switch (expr.operator) {
            case '+': return left + right;
            case '-': return left - right;
            case '*': return left * right;
            case '/': return left / right;
            case '==': return left == right;
            case '!=': return left != right;
            case '<': return left < right;
            case '>': return left > right;
            case '<=': return left <= right;
            case '>=': return left >= right;
            default: return null;
        }
    }
    executeCall(expr) {
        // Handle Special Built-ins
        if (expr.callee.type === 'MemberExpression') {
            const member = expr.callee;
            // Thread.start
            if (member.property === 'start' && member.object.type === 'Identifier' && member.object.name === 'Thread') {
                // Wait, this logic is for Thread.start() static call? No, t.start() is instance.
                // This block is checking static calls mostly.
            }
        }
        const callee = this.evaluate(expr.callee);
        const args = expr.arguments.map(a => this.evaluate(a));
        // Handle Lambda/Function calls
        if (callee && callee.type === 'Lambda') {
            this.pushScope();
            // Restore closure
            // (Simplified: just using current scope + params)
            callee.params.forEach((param, index) => {
                this.currentScope().set(param.name, args[index]);
            });
            let result;
            if (callee.body.type === 'BlockStatement') {
                this.executeBlock(callee.body);
            }
            else {
                result = this.evaluate(callee.body);
            }
            this.popScope();
            return result;
        }
        // Handle Thread.start() via object method
        if (expr.callee.type === 'MemberExpression') {
            const member = expr.callee;
            const obj = this.evaluate(member.object);
            if (member.property === 'start' && obj && obj.__type === 'Thread') {
                console.log("[Runtime] Spawning thread...");
                const runnable = obj.__args[0];
                if (runnable && runnable.type === 'Lambda') {
                    // Run async-ish (in this loop it's sync but conceptually async)
                    console.log("[Thread-1] Running lambda...");
                    // Execute lambda body
                    if (runnable.body.type === 'BlockStatement') {
                        this.executeBlock(runnable.body);
                    }
                    else {
                        this.evaluate(runnable.body);
                    }
                    console.log("[Thread-1] Finished.");
                    return;
                }
            }
        }
        // Handle Special Built-ins (Legacy check for System.out etc which evaluate to null/undefined above mostly)
        // Re-implementing correctly:
        if (expr.callee.type === 'MemberExpression') {
            const member = expr.callee;
            if (member.property === 'println') {
                console.log(...args);
                return;
            }
            if (member.property === 'allocate' && member.object.name === 'Mana') {
                const amount = args[0];
                this.manaAllocated += Number(amount);
                console.log(`    > Allocating ${amount} mana... (Total: ${this.manaAllocated})`);
                return { __ptr: Date.now(), __size: Number(amount) };
            }
            if (member.property === 'free') {
                const ptr = args[0];
                if (ptr && ptr.__size) {
                    this.manaAllocated -= ptr.__size;
                    console.log(`    > Freed ${ptr.__size} mana. (Total: ${this.manaAllocated})`);
                }
                return;
            }
            if (member.property === 'cast') {
                console.log(`[Cast] Casting spell...`);
                return;
            }
        }
        // Constructor
        // if (expr.type === 'NewExpression') {
        // Already evaluated in evaluate() dispatch? No, evaluate calls executeCall for CallExpression.
        // NewExpression is separate.
        // }
        return null;
    }
    executeAssignment(expr) {
        const val = this.evaluate(expr.right);
        this.assign(expr.left.name, val);
        return val;
    }
    // Scope Management
    pushScope() { this.scope.push(new Map()); }
    popScope() { this.scope.pop(); }
    currentScope() { return this.scope[this.scope.length - 1]; }
    resolve(name) {
        // Walk up scopes
        for (let i = this.scope.length - 1; i >= 0; i--) {
            if (this.scope[i].has(name))
                return this.scope[i].get(name);
        }
        // Check Globals/Classes
        if (name === 'System')
            return { out: { println: 'native' } };
        if (name === 'Mana')
            return { allocate: 'native', free: 'native' };
        // Return name as is for "Enums" like School.EVOCATION
        return name;
    }
    assign(name, value) {
        for (let i = this.scope.length - 1; i >= 0; i--) {
            if (this.scope[i].has(name)) {
                this.scope[i].set(name, value);
                return;
            }
        }
        // Define in current if not found (var vs assignment loose handling)
        this.currentScope().set(name, value);
    }
}
exports.Interpreter = Interpreter;
