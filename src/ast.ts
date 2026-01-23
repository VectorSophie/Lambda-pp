
export interface Node {
    type: string;
}

export interface Program extends Node {
    type: 'Program';
    package: string;
    imports: Import[];
    body: ClassDeclaration[];
}

export interface Import extends Node {
    type: 'Import';
    path: string;
}

export interface Annotation extends Node {
    type: 'Annotation';
    name: string;
    properties: { [key: string]: any };
}

export interface ClassDeclaration extends Node {
    type: 'ClassDeclaration';
    name: string;
    superClass: string | null;
    metadata: Annotation | null;
    methods: MethodDeclaration[];
    fields: FieldDeclaration[];
}

export interface FieldDeclaration extends Node {
    type: 'FieldDeclaration';
    name: string;
    fieldType: string;
    value: Expression | null;
    isStatic: boolean;
}

export interface MethodDeclaration extends Node {
    type: 'MethodDeclaration';
    name: string;
    returnType: string;
    params: Parameter[];
    body: BlockStatement;
    isStatic: boolean;
}

export interface Parameter {
    name: string;
    paramType: string;
}

export type Statement = 
    | BlockStatement
    | ExpressionStatement
    | ReturnStatement
    | IfStatement
    | TryStatement
    | VariableDeclaration
    | ThrowStatement;

export interface BlockStatement extends Node {
    type: 'BlockStatement';
    statements: Statement[];
}

export interface ExpressionStatement extends Node {
    type: 'ExpressionStatement';
    expression: Expression;
}

export interface ReturnStatement extends Node {
    type: 'ReturnStatement';
    argument: Expression | null;
}

export interface IfStatement extends Node {
    type: 'IfStatement';
    test: Expression;
    consequent: Statement;
    alternate: Statement | null;
}

export interface TryStatement extends Node {
    type: 'TryStatement';
    block: BlockStatement;
    handler: CatchClause | null;
    finalizer: BlockStatement | null;
}

export interface CatchClause extends Node {
    type: 'CatchClause';
    param: Parameter;
    body: BlockStatement;
}

export interface VariableDeclaration extends Node {
    type: 'VariableDeclaration';
    name: string;
    varType: string;
    init: Expression | null;
}

export interface ThrowStatement extends Node {
    type: 'ThrowStatement';
    argument: Expression;
}

export type Expression = 
    | CallExpression
    | MemberExpression
    | Identifier
    | Literal
    | NewExpression
    | AssignmentExpression
    | BinaryExpression
    | LambdaExpression;

export interface LambdaExpression extends Node {
    type: 'LambdaExpression';
    params: Parameter[];
    body: BlockStatement | Expression;
}

export interface BinaryExpression extends Node {
    type: 'BinaryExpression';
    left: Expression;
    operator: string;
    right: Expression;
}

export interface CallExpression extends Node {
    type: 'CallExpression';
    callee: Expression;
    arguments: Expression[];
}

export interface MemberExpression extends Node {
    type: 'MemberExpression';
    object: Expression;
    property: string;
}

export interface Identifier extends Node {
    type: 'Identifier';
    name: string;
}

export interface Literal extends Node {
    type: 'Literal';
    value: any;
    raw: string;
}

export interface NewExpression extends Node {
    type: 'NewExpression';
    callee: string;
    arguments: Expression[];
}

export interface AssignmentExpression extends Node {
    type: 'AssignmentExpression';
    left: Identifier;
    right: Expression;
}
