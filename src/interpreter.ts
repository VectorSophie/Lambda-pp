import * as AST from './ast';
import { Thaumaturgy } from './thaumaturgy';

export class Interpreter {
    private manaAllocated: number = 0;
    private scope: Map<string, any>[] = [new Map()];

    public async interpret(program: AST.Program) {
        console.log("--------------------------------------------------");
        console.log(`LARC v1.0.0 - Compiling ${program.package || 'default'}...`);
        console.log("--------------------------------------------------");

        // Phase 1: Registration (Simulated)
        program.body.forEach(clazz => {
            console.log(`[Registry] Registered ritual: ${clazz.name} ${Thaumaturgy.generateSignature(clazz.name)}`);
            if (clazz.metadata) {
                console.log(`  > Metadata: ${JSON.stringify(clazz.metadata.properties)}`);
            }
        });

        // Phase 2: Execution (Find Main)
        const mainClass = program.body.find(c => c.methods.some(m => m.name === 'main' && m.isStatic));
        if (mainClass) {
            const mainMethod = mainClass.methods.find(m => m.name === 'main')!;
            console.log(`\n[Runtime] Invoking ${mainClass.name}.main()...`);
            console.log(Thaumaturgy.formulateSpell(mainClass.name, 'main'));
            try {
                await this.executeBlock(mainMethod.body);
            } catch (e: any) {
                console.error(`[Runtime] FATAL: ${e.message}`);
            }
        } else {
            console.log("[Runtime] No entry point (@Main) found.");
        }

        // Phase 3: Post-Run Checks
        this.checkManaLeaks();
    }

    private checkManaLeaks() {
        if (this.manaAllocated > 0) {
            console.error(`\n[!] CRITICAL: MANA LEAK DETECTED! Leaked ${this.manaAllocated} units.`);
            console.error("    The fabric of reality weakens. Expect void entities.");
        } else if (this.manaAllocated < 0) {
            console.error(`\n[!] ERROR: Double-free or stack corruption detected.`);
        } else {
            console.log("\n[Runtime] Mana pool balanced. Reality is stable.");
            console.log(Thaumaturgy.stabilize());
        }
    }

    private async executeStatement(stmt: AST.Statement) {
        switch (stmt.type) {
            case 'BlockStatement':
                this.pushScope();
                await this.executeBlock(stmt as AST.BlockStatement);
                this.popScope();
                break;
            case 'ExpressionStatement':
                await this.evaluate((stmt as AST.ExpressionStatement).expression);
                break;
            case 'VariableDeclaration':
                await this.executeVarDecl(stmt as AST.VariableDeclaration);
                break;
            case 'IfStatement':
                await this.executeIf(stmt as AST.IfStatement);
                break;
            case 'TryStatement':
                await this.executeTry(stmt as AST.TryStatement);
                break;
            // ... other statements
        }
    }

    private async executeBlock(block: AST.BlockStatement) {
        for (const stmt of block.statements) {
            await this.executeStatement(stmt);
        }
    }

    private async executeVarDecl(stmt: AST.VariableDeclaration) {
        const val = stmt.init ? await this.evaluate(stmt.init) : null;
        this.currentScope().set(stmt.name, val);
    }

    private async executeIf(stmt: AST.IfStatement) {
        if (await this.evaluate(stmt.test)) {
            await this.executeStatement(stmt.consequent);
        } else if (stmt.alternate) {
            await this.executeStatement(stmt.alternate);
        }
    }

    private async executeTry(stmt: AST.TryStatement) {
        try {
            await this.executeBlock(stmt.block);
        } catch (e) {
            if (stmt.handler) {
                this.pushScope();
                this.currentScope().set(stmt.handler.param.name, e); 
                await this.executeBlock(stmt.handler.body);
                this.popScope();
            }
        } finally {
            if (stmt.finalizer) {
                await this.executeBlock(stmt.finalizer);
            }
        }
    }

    private async evaluate(expr: AST.Expression): Promise<any> {
        switch (expr.type) {
            case 'Literal':
                return (expr as AST.Literal).value;
            case 'Identifier':
                return this.resolve((expr as AST.Identifier).name);
            case 'CallExpression':
                return await this.executeCall(expr as AST.CallExpression);
            case 'AssignmentExpression':
                return await this.executeAssignment(expr as AST.AssignmentExpression);
            case 'NewExpression':
                const newExpr = expr as AST.NewExpression;
                const args = await Promise.all(newExpr.arguments.map(a => this.evaluate(a)));
                return { __type: newExpr.callee, __args: args };
            case 'MemberExpression':
                const obj = await this.evaluate((expr as AST.MemberExpression).object);
                const prop = (expr as AST.MemberExpression).property;
                if (obj && typeof obj === 'object') return obj[prop];
                return undefined;
            case 'LambdaExpression':
                return { 
                    type: 'Lambda', 
                    params: (expr as AST.LambdaExpression).params, 
                    body: (expr as AST.LambdaExpression).body,
                    closure: this.currentScope() // Capture scope
                };
            case 'BinaryExpression':
                return await this.evaluateBinary(expr as AST.BinaryExpression);
        }
    }

    private async evaluateBinary(expr: AST.BinaryExpression): Promise<any> {
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

    private async executeCall(expr: AST.CallExpression): Promise<any> {
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
            
            callee.params.forEach((param: any, index: number) => {
                this.currentScope().set(param.name, args[index]);
            });
            
            let result;
            if (callee.body.type === 'BlockStatement') {
                await this.executeBlock(callee.body);
            } else {
                result = await this.evaluate(callee.body);
            }
            this.popScope();
            return result;
        }
        
        // Handle Thread.start() - Special Case
        if (expr.callee.type === 'MemberExpression') {
             const member = expr.callee as AST.MemberExpression;
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
                         } else {
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
            const member = expr.callee as AST.MemberExpression;
            const objName = member.object.type === 'Identifier' ? (member.object as AST.Identifier).name : null;
            
             if (member.property === 'println') {
                console.log(...args);
                return;
            }
             if (member.property === 'allocate' && objName === 'Mana') {
                const amount = args[0];
                await Thaumaturgy.animateFlux(this.manaAllocated, Number(amount));
                this.manaAllocated += Number(amount);
                return { __ptr: Date.now(), __size: Number(amount) }; 
            }
            if (member.property === 'free') { 
                const ptr = args[0];
                if (ptr && ptr.__size) {
                    await Thaumaturgy.animateFlux(this.manaAllocated, -ptr.__size);
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

    private async executeAssignment(expr: AST.AssignmentExpression): Promise<any> {
        const val = await this.evaluate(expr.right);
        this.assign(expr.left.name, val);
        return val;
    }

    // Scope Management
    private pushScope() { this.scope.push(new Map()); }
    private popScope() { this.scope.pop(); }
    private currentScope() { return this.scope[this.scope.length - 1]; }

    private resolve(name: string): any {
        // Walk up scopes
        for (let i = this.scope.length - 1; i >= 0; i--) {
            if (this.scope[i].has(name)) return this.scope[i].get(name);
        }
        // Check Globals/Classes
        if (name === 'System') return { out: { println: 'native' } };
        if (name === 'Mana') return { allocate: 'native', free: 'native' };
        // Return name as is for "Enums" like School.EVOCATION
        return name; 
    }

    private assign(name: string, value: any) {
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
