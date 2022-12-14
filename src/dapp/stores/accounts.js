import { writable } from "svelte/store";
import contract from "@/contract";

export const account = writable("");
export const accounts = writable([]);

export const initAccounts = async function () {
  const accts = await contract.getAccounts();
  account.set({ label: "Owner", type: "owner", address: accts[0] });
  ///account.set({ label: "Airline 1", type: "airline", address: accts[1] });

  accounts.update(() => [
    { label: "Owner", type: "owner", address: accts[0] },
    { label: "Airline 1", type: "airline", address: accts[1] },
    { label: "Airline 2", type: "airline", address: accts[2] },
    { label: "Airline 3", type: "airline", address: accts[3] },
    { label: "Airline 4", type: "airline", address: accts[4] },
    { label: "Airline 5", type: "airline", address: accts[5] },
    { label: "Insuree 1", type: "insuree", address: accts[6] },
    { label: "Insuree 2", type: "insuree", address: accts[7] },
    { label: "Insuree 3", type: "insuree", address: accts[8] },
    { label: "Insuree 4", type: "insuree", address: accts[9] },
    { label: "Insuree 5", type: "insuree", address: accts[10] }
  ]);
};