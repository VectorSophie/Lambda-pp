"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Runner = void 0;
const desugarer_1 = require("./desugarer");
const reducer_1 = require("./reducer");
const thaumaturgy_1 = require("./thaumaturgy");
class Runner {
    static async run(program) {
        console.log("--------------------------------------------------");
        console.log(`LARC v2.0.0 (λLC) - Reducing ${program.package || 'default'}...`);
        console.log("--------------------------------------------------");
        const term = desugarer_1.Desugarer.desugar(program);
        const initialState = {
            allocatedTotal: 0,
            liveList: new Map(),
            nextPtr: 1
        };
        const initialEnv = new Map([
            ['cast', { type: 'Closure', param: '_', body: { type: 'Lit', value: null, kind: 'boolean' }, env: new Map() }],
            ['getPosition', { type: 'Closure', param: '_', body: { type: 'Lit', value: null, kind: 'boolean' }, env: new Map() }],
            ['fire', { type: 'Closure', param: '_', body: { type: 'Lit', value: null, kind: 'boolean' }, env: new Map() }],
            ['start', { type: 'Closure', param: '_', body: { type: 'Lit', value: null, kind: 'boolean' }, env: new Map() }]
        ]);
        const result = await reducer_1.Reducer.evaluate(term, initialEnv, initialState);
        for (const obs of result.observations) {
            await this.handleObservation(obs);
        }
        if (result.status === 'failure') {
            console.error(`\n[!] RUNTIME ERROR: ${result.error}`);
        }
        else {
            this.checkFinalState(result.state);
        }
    }
    static async handleObservation(obs) {
        switch (obs.type) {
            case 'FluxChange':
                await thaumaturgy_1.Thaumaturgy.animateFlux(0, obs.value);
                break;
            case 'Print':
                console.log(obs.value);
                break;
            case 'RuneGen':
                console.log(thaumaturgy_1.Thaumaturgy.generateSignature(obs.value));
                break;
        }
    }
    static checkFinalState(state) {
        if (state.allocatedTotal > 0) {
            console.error(`\n[!] CRITICAL: MANA LEAK DETECTED! Leaked ${state.allocatedTotal} units.`);
        }
        else if (state.allocatedTotal < 0) {
            console.error(`\n[!] ERROR: Double-free detected.`);
        }
        else {
            console.log("\n[Runtime] Mana pool balanced. Reality is stable.");
            console.log(thaumaturgy_1.Thaumaturgy.stabilize());
        }
    }
}
exports.Runner = Runner;
