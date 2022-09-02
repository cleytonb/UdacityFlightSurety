<script>
  import { account, accounts } from "@/stores/accounts";
  import FriendlyAddress from '@/components/FriendlyAddress.svelte';

  let opened = false;

  function toggle() {
    opened = !opened;
  }

  function setAccount(acc) {
    account.set(acc);
    opened = !opened;
  }
</script>

<div class="dropdown">
  <button class="btn btn-secondary dropdown-toggle" on:click={toggle}>
    {$account.label || "Loading..."}
  </button>
  {#if opened}
  <ul class="dropdown-menu show">
    {#each $accounts as acc}
    <li>
      <button class="dropdown-item" on:click={setAccount(acc)}>
        {acc.label}: <FriendlyAddress address={acc.address} />
      </button>
    </li>
    {/each}
  </ul>
  {/if}
</div>
