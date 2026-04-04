
export type Term = 
    | Var
    | Lam
    | App
    | Lit
    | Prim;

export interface Var {
    type: 'Var';
    name: string;
}

export interface Lam {
    type: 'Lam';
    param: string;
    body: Term;
}

export interface App {
    type: 'App';
    callee: Term;
    argument: Term;
}

export interface Lit {
    type: 'Lit';
    value: any;
    kind: 'string' | 'number' | 'boolean' | 'ptr';
}

export interface Prim {
    type: 'Prim';
    name: string;
    args: Term[];
}

export type Env = Map<string, Value>;

export type Value = 
    | { type: 'Closure', param: string, body: Term, env: Env }
    | { type: 'Literal', value: any, kind: string }
    | { type: 'Primitive', name: string, args: Value[] };

export interface ManaState {
    allocatedTotal: number;
    liveList: Map<number, number>;
    nextPtr: number;
}

export interface Observation {
    type: 'FluxChange' | 'RuneGen' | 'Print';
    value: any;
}

export type MonadicResult<T> = 
    | { status: 'success', value: T, state: ManaState, observations: Observation[] }
    | { status: 'failure', error: string, state: ManaState, observations: Observation[] };
