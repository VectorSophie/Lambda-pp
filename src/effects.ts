
import * as LC from './lc';

export class Effects {
    public static async apply(
        name: string, 
        args: LC.Value[], 
        state: LC.ManaState
    ): Promise<LC.MonadicResult<LC.Value>> {
        switch (name) {
            case 'mana_allocate':
                const size = (args[0] as LC.Value & { value: number }).value;
                const ptrId = state.nextPtr;
                const newLiveList = new Map(state.liveList);
                newLiveList.set(ptrId, size);
                
                return {
                    status: 'success',
                    value: { type: 'Literal', value: ptrId, kind: 'ptr' },
                    state: {
                        allocatedTotal: state.allocatedTotal + size,
                        liveList: newLiveList,
                        nextPtr: state.nextPtr + 1
                    },
                    observations: [{ type: 'FluxChange', value: size }]
                };

            case 'mana_free':
                const targetPtr = (args[0] as LC.Value & { value: number }).value;
                if (!state.liveList.has(targetPtr)) {
                    return { status: 'failure', error: `DoubleFreeException: Ptr ${targetPtr}`, state, observations: [] };
                }
                const freedSize = state.liveList.get(targetPtr)!;
                const updatedLiveList = new Map(state.liveList);
                updatedLiveList.delete(targetPtr);
                
                return {
                    status: 'success',
                    value: { type: 'Literal', value: null, kind: 'boolean' },
                    state: {
                        allocatedTotal: state.allocatedTotal - freedSize,
                        liveList: updatedLiveList,
                        nextPtr: state.nextPtr
                    },
                    observations: [{ type: 'FluxChange', value: -freedSize }]
                };

            case 'println':
                const msg = (args[0] as LC.Value & { value: any }).value;
                return {
                    status: 'success',
                    value: { type: 'Literal', value: null, kind: 'boolean' },
                    state,
                    observations: [{ type: 'Print', value: msg }]
                };

            default:
                return { status: 'failure', error: `Unknown primitive: ${name}`, state, observations: [] };
        }
    }
}
