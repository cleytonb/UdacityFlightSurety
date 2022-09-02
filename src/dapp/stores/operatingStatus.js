import { get, writable } from "svelte/store";
import contract from "@/contract";
import { account } from '@/stores/accounts';

export const operatingStatus = writable(true);

export async function initOperatingStatus() {
  const paused = await contract.getOperatingStatus(get(account).address);
  operatingStatus.set(!paused);
}

contract.events.Paused().on('data', () => operatingStatus.set(false));
contract.events.Unpaused().on('data', () => operatingStatus.set(true));

export const methods = {
  pauseContract: async function () {
    try {
      await contract.setPaused(get(account).address, true);
    } catch (e) {
      console.error("pauseContract: " + e);
    }
  },

  resumeContract: async function () {
    try {
      await contract.setPaused(get(account).address, false);
    } catch (e) {
      console.error("resumeContract: " + e);
    }
  },
};
