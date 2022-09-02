import { get, writable } from "svelte/store";
import contract from "@/contract";
import { account } from "@/stores/accounts";

export const airlineStatus = writable({
  registered: false,
  operational: false,
});

export const methods = {
  fetchStatus: async function () {
    const status = await contract.getAirlineStatus(get(account).address);
    airlineStatus.set({
      registered: status[0],
      operational: status[1],
    });
  },
  fundAirline: async function () {
    await contract.fundAirline(get(account).address);
    const status = await contract.getAirlineStatus(get(account).address);
    airlineStatus.set({
      registered: status[0],
      operational: status[1],
    });
  },
  registerAirline: async function(newAirline) {
    await contract.registerAirline(get(account).address, newAirline);
  }
};
