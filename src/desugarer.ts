
import * as AST from './ast';
import * as LC from './lc';

export class Desugarer {
    public static desugar(program: AST.Program): LC.Term {
        const mainClass = program.body.find(c => c.methods.some(m => m.name === 'main' && m.isStatic));
        if (!mainClass) throw new Error("No entry point found.");
        
        const mainMethod = mainClass.methods.find(m => m.name === 'main')!;
        return this.desugarBlock(mainMethod.body);
    }

    private static desugarBlock(block: AST.BlockStatement): LC.Term {
        let term: LC.Term = { type: 'Lit', value: null, kind: 'boolean' };
        
        for (let i = block.statements.length - 1; i >= 0; i--) {
            const stmt = block.statements[i];
            const next = term;
            term = this.desugarStatement(stmt, next);
        }
        
        return term;
    }

    private static desugarStatement(stmt: AST.Statement, next: LC.Term): LC.Term {
        switch (stmt.type) {
            case 'ExpressionStatement':
                return {
                    type: 'App',
                    callee: { type: 'Lam', param: '_', body: next },
                    argument: this.desugarExpression(stmt.expression)
                };
            case 'VariableDeclaration':
                return {
                    type: 'App',
                    callee: { type: 'Lam', param: stmt.name, body: next },
                    argument: stmt.init ? this.desugarExpression(stmt.init) : { type: 'Lit', value: null, kind: 'boolean' }
                };
            case 'BlockStatement':
                return this.desugarBlock(stmt);
            case 'TryStatement':
                return this.desugarBlock(stmt.block);
            case 'IfStatement':
                return {
                    type: 'App',
                    callee: { type: 'Lam', param: '_', body: next },
                    argument: this.desugarExpression(stmt.test)
                };
            default:
                return next;
        }
    }

    private static desugarExpression(expr: AST.Expression): LC.Term {
        switch (expr.type) {
            case 'Literal':
                return { type: 'Lit', value: expr.value, kind: expr.raw as any };
            case 'Identifier':
                if (expr.name === 'null') return { type: 'Lit', value: null, kind: 'boolean' };
                return { type: 'Var', name: expr.name };
            case 'CallExpression':
                if (expr.callee.type === 'MemberExpression') {
                    const member = expr.callee as AST.MemberExpression;
                    const objName = member.object.type === 'Identifier' ? (member.object as AST.Identifier).name : null;
                    
                    if (member.property === 'allocate' && objName === 'Mana') {
                        return { type: 'Prim', name: 'mana_allocate', args: expr.arguments.map(a => this.desugarExpression(a)) };
                    }
                    if (member.property === 'free' && objName === 'Mana') {
                        return { type: 'Prim', name: 'mana_free', args: expr.arguments.map(a => this.desugarExpression(a)) };
                    }
                    if (member.property === 'println') {
                        return { type: 'Prim', name: 'println', args: expr.arguments.map(a => this.desugarExpression(a)) };
                    }
                }
                
                let callee = this.desugarExpression(expr.callee);
                return expr.arguments.reduce((acc, arg) => ({
                    type: 'App',
                    callee: acc,
                    argument: this.desugarExpression(arg)
                }), callee);
                
            case 'LambdaExpression':
                let body = expr.body.type === 'BlockStatement' ? this.desugarBlock(expr.body) : this.desugarExpression(expr.body);
                return expr.params.reduceRight((acc, param) => ({
                    type: 'Lam',
                    param: param.name,
                    body: acc
                }), body);
                
            case 'NewExpression':
                return { type: 'Lit', value: expr.callee, kind: 'string' };
                
            case 'MemberExpression':
                return { type: 'Var', name: expr.property };
                
            default:
                return { type: 'Lit', value: null, kind: 'boolean' };
        }
    }
}
