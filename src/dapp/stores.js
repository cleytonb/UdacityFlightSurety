import { get, writable } from 'svelte/store';
import contract from './contract';

export const account = writable('');
export const accounts = writable([]);
export const operatingStatus = writable(true);

export const methods = {
    initialize: async function() {
        const accts = await contract.getAccounts();
        account.set({ label: 'Owner', type: 'owner', address: accts[0] });
        
        accounts.update(() => [
            { label: 'Owner', type: 'owner', address: accts[0] },
            { label: 'Airline 1', type: 'airline', address: accts[1] },
            { label: 'Airline 2', type: 'airline', address: accts[2] },
            { label: 'Airline 3', type: 'airline', address: accts[3] },
            { label: 'Airline 4', type: 'airline', address: accts[4] },
            { label: 'Airline 5', type: 'airline', address: accts[5] },
            { label: 'Insuree 1', type: 'insuree', address: accts[6] },
            { label: 'Insuree 2', type: 'insuree', address: accts[7] },
            { label: 'Insuree 3', type: 'insuree', address: accts[8] },
            { label: 'Insuree 4', type: 'insuree', address: accts[9] },
            { label: 'Insuree 5', type: 'insuree', address: accts[10] }
        ]);

        const paused = await contract.getOperatingStatus(accts[0]);
        operatingStatus.set(!paused);
    },

    pauseContract: async function() {
        try {
            await contract.setPaused(get(account).address, true);

            const paused = await contract.getOperatingStatus(get(account).address);
            operatingStatus.set(!paused);
        } catch(e) {
            console.error('pauseContract: ' + e);
        }
    },

    resumeContract: async function() {
        try {
            await contract.setPaused(get(account).address, false);

            const paused = await contract.getOperatingStatus(get(account).address);
            operatingStatus.set(!paused);
        } catch(e) {
            console.error('resumeContract: ' + e);
        }
    }
};