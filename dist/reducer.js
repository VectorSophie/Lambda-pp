"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reducer = void 0;
const effects_1 = require("./effects");
class Reducer {
    static async evaluate(term, env, state) {
        switch (term.type) {
            case 'Lit':
                return {
                    status: 'success',
                    value: { type: 'Literal', value: term.value, kind: term.kind },
                    state,
                    observations: []
                };
            case 'Var':
                const val = env.get(term.name);
                if (!val)
                    return { status: 'failure', error: `Unbound variable: ${term.name}`, state, observations: [] };
                return { status: 'success', value: val, state, observations: [] };
            case 'Lam':
                return {
                    status: 'success',
                    value: { type: 'Closure', param: term.param, body: term.body, env: new Map(env) },
                    state,
                    observations: []
                };
            case 'App':
                const calleeRes = await this.evaluate(term.callee, env, state);
                if (calleeRes.status === 'failure')
                    return calleeRes;
                const argRes = await this.evaluate(term.argument, env, calleeRes.state);
                if (argRes.status === 'failure')
                    return argRes;
                const callee = calleeRes.value;
                const arg = argRes.value;
                if (callee.type !== 'Closure') {
                    return { status: 'failure', error: 'Callee is not a function', state: argRes.state, observations: [] };
                }
                const newEnv = new Map(callee.env);
                newEnv.set(callee.param, arg);
                const bodyRes = await this.evaluate(callee.body, newEnv, argRes.state);
                return {
                    ...bodyRes,
                    observations: [...calleeRes.observations, ...argRes.observations, ...bodyRes.observations]
                };
            case 'Prim':
                const evalArgs = [];
                let currentState = state;
                let currentObs = [];
                for (const argTerm of term.args) {
                    const res = await this.evaluate(argTerm, env, currentState);
                    if (res.status === 'failure')
                        return res;
                    evalArgs.push(res.value);
                    currentState = res.state;
                    currentObs = [...currentObs, ...res.observations];
                }
                const primRes = await effects_1.Effects.apply(term.name, evalArgs, currentState);
                return {
                    ...primRes,
                    observations: [...currentObs, ...primRes.observations]
                };
        }
    }
}
exports.Reducer = Reducer;
