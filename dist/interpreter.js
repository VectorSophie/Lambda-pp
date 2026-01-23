"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interpreter = void 0;
const thaumaturgy_1 = require("./thaumaturgy");
class Interpreter {
    manaAllocated = 0;
    scope = [new Map()];
    async interpret(program) {
        console.log("--------------------------------------------------");
        console.log(`LARC v1.0.0 - Compiling ${program.package || 'default'}...`);
        console.log("--------------------------------------------------");
        // Phase 1: Registration (Simulated)
        program.body.forEach(clazz => {
            console.log(`[Registry] Registered ritual: ${clazz.name} ${thaumaturgy_1.Thaumaturgy.generateSignature(clazz.name)}`);
            if (clazz.metadata) {
                console.log(`  > Metadata: ${JSON.stringify(clazz.metadata.properties)}`);
            }
        });
        // Phase 2: Execution (Find Main)
        const mainClass = program.body.find(c => c.methods.some(m => m.name === 'main' && m.isStatic));
        if (mainClass) {
            const mainMethod = mainClass.methods.find(m => m.name === 'main');
            console.log(`\n[Runtime] Invoking ${mainClass.name}.main()...`);
            console.log(thaumaturgy_1.Thaumaturgy.formulateSpell(mainClass.name, 'main'));
            try {
                await this.executeBlock(mainMethod.body);
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
            console.log(thaumaturgy_1.Thaumaturgy.stabilize());
        }
    }
    async executeStatement(stmt) {
        switch (stmt.type) {
            case 'BlockStatement':
                this.pushScope();
                await this.executeBlock(stmt);
                this.popScope();
                break;
            case 'ExpressionStatement':
                await this.evaluate(stmt.expression);
                break;
            case 'VariableDeclaration':
                await this.executeVarDecl(stmt);
                break;
            case 'IfStatement':
                await this.executeIf(stmt);
                break;
            case 'TryStatement':
                await this.executeTry(stmt);
                break;
            // ... other statements
        }
    }
    async executeBlock(block) {
        for (const stmt of block.statements) {
            await this.executeStatement(stmt);
        }
    }
    async executeVarDecl(stmt) {
        const val = stmt.init ? await this.evaluate(stmt.init) : null;
        this.currentScope().set(stmt.name, val);
    }
    async executeIf(stmt) {
        if (await this.evaluate(stmt.test)) {
            await this.executeStatement(stmt.consequent);
        }
        else if (stmt.alternate) {
            await this.executeStatement(stmt.alternate);
        }
    }
    async executeTry(stmt) {
        try {
            await this.executeBlock(stmt.block);
        }
        catch (e) {
            if (stmt.handler) {
                this.pushScope();
                this.currentScope().set(stmt.handler.param.name, e);
                await this.executeBlock(stmt.handler.body);
                this.popScope();
            }
        }
        finally {
            if (stmt.finalizer) {
                await this.executeBlock(stmt.finalizer);
            }
        }
    }
    async evaluate(expr) {
        switch (expr.type) {
            case 'Literal':
                return expr.value;
            case 'Identifier':
                return this.resolve(expr.name);
            case 'CallExpression':
                return await this.executeCall(expr);
            case 'AssignmentExpression':
                return await this.executeAssignment(expr);
            case 'NewExpression':
                const newExpr = expr;
                const args = await Promise.all(newExpr.arguments.map(a => this.evaluate(a)));
                return { __type: newExpr.callee, __args: args };
            case 'MemberExpression':
                const obj = await this.evaluate(expr.object);
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
                return await this.evaluateBinary(expr);
        }
    }
    async evaluateBinary(expr) {
        const left = await this.evaluate(expr.left);
        const right = await this.evaluate(expr.right);
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
    async executeCall(expr) {
        // Evaluate callee and args
        let callee = await this.evaluate(expr.callee);
        // Handle MemberExpression separately if evaluate failed to return a function but returned object property
        if (expr.callee.type === 'MemberExpression') {
            // Re-evaluate context for "this" binding or special handling
            // Simplified: just rely on `callee` being the function/value
        }
        const args = await Promise.all(expr.arguments.map(a => this.evaluate(a)));
        // Handle Lambda/Function calls
        if (callee && callee.type === 'Lambda') {
            this.pushScope();
            // Restore closure
            callee.params.forEach((param, index) => {
                this.currentScope().set(param.name, args[index]);
            });
            let result;
            if (callee.body.type === 'BlockStatement') {
                await this.executeBlock(callee.body);
            }
            else {
                result = await this.evaluate(callee.body);
            }
            this.popScope();
            return result;
        }
        // Handle Thread.start() - Special Case
        if (expr.callee.type === 'MemberExpression') {
            const member = expr.callee;
            const obj = await this.evaluate(member.object);
            if (member.property === 'start' && obj && obj.__type === 'Thread') {
                console.log("[Runtime] Spawning thread...");
                const runnable = obj.__args[0];
                if (runnable && runnable.type === 'Lambda') {
                    // Fire and forget (Pseudo-Thread)
                    // We do NOT await this to simulate concurrency
                    (async () => {
                        console.log("[Thread-1] Running lambda...");
                        if (runnable.body.type === 'BlockStatement') {
                            await this.executeBlock(runnable.body);
                        }
                        else {
                            await this.evaluate(runnable.body);
                        }
                        console.log("[Thread-1] Finished.");
                    })();
                    return;
                }
            }
        }
        // Handle Special Built-ins (Mana, System)
        if (expr.callee.type === 'MemberExpression') {
            const member = expr.callee;
            const objName = member.object.type === 'Identifier' ? member.object.name : null;
            if (member.property === 'println') {
                console.log(...args);
                return;
            }
            if (member.property === 'allocate' && objName === 'Mana') {
                const amount = args[0];
                await thaumaturgy_1.Thaumaturgy.animateFlux(this.manaAllocated, Number(amount));
                this.manaAllocated += Number(amount);
                return { __ptr: Date.now(), __size: Number(amount) };
            }
            if (member.property === 'free') {
                const ptr = args[0];
                if (ptr && ptr.__size) {
                    await thaumaturgy_1.Thaumaturgy.animateFlux(this.manaAllocated, -ptr.__size);
                    this.manaAllocated -= ptr.__size;
                }
                return;
            }
            if (member.property === 'cast') {
                console.log(`[Cast] Casting spell...`);
                console.log(`  Manifesting:`);
                return;
            }
        }
        return null;
    }
    async executeAssignment(expr) {
        const val = await this.evaluate(expr.right);
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
