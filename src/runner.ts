
import * as AST from './ast';
import * as LC from './lc';
import { Desugarer } from './desugarer';
import { Reducer } from './reducer';
import { Thaumaturgy } from './thaumaturgy';

export class Runner {
    public static async run(program: AST.Program) {
        console.log("--------------------------------------------------");
        console.log(`LARC v2.0.0 (λLC) - Reducing ${program.package || 'default'}...`);
        console.log("--------------------------------------------------");

        const term = Desugarer.desugar(program);
        const initialState: LC.ManaState = {
            allocatedTotal: 0,
            liveList: new Map(),
            nextPtr: 1
        };

        const initialEnv: LC.Env = new Map([
            ['cast', { type: 'Closure', param: '_', body: { type: 'Lit', value: null, kind: 'boolean' }, env: new Map() }],
            ['getPosition', { type: 'Closure', param: '_', body: { type: 'Lit', value: null, kind: 'boolean' }, env: new Map() }],
            ['fire', { type: 'Closure', param: '_', body: { type: 'Lit', value: null, kind: 'boolean' }, env: new Map() }],
            ['start', { type: 'Closure', param: '_', body: { type: 'Lit', value: null, kind: 'boolean' }, env: new Map() }]
        ]);

        const result = await Reducer.evaluate(term, initialEnv, initialState);

        for (const obs of result.observations) {
            await this.handleObservation(obs);
        }

        if (result.status === 'failure') {
            console.error(`\n[!] RUNTIME ERROR: ${result.error}`);
        } else {
            this.checkFinalState(result.state);
        }
    }

    private static async handleObservation(obs: LC.Observation) {
        switch (obs.type) {
            case 'FluxChange':
                await Thaumaturgy.animateFlux(0, obs.value); 
                break;
            case 'Print':
                console.log(obs.value);
                break;
            case 'RuneGen':
                console.log(Thaumaturgy.generateSignature(obs.value));
                break;
        }
    }

    private static checkFinalState(state: LC.ManaState) {
        if (state.allocatedTotal > 0) {
            console.error(`\n[!] CRITICAL: MANA LEAK DETECTED! Leaked ${state.allocatedTotal} units.`);
        } else if (state.allocatedTotal < 0) {
            console.error(`\n[!] ERROR: Double-free detected.`);
        } else {
            console.log("\n[Runtime] Mana pool balanced. Reality is stable.");
            console.log(Thaumaturgy.stabilize());
        }
    }
}
