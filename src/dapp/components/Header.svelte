<script>
  import { account } from "@/stores/accounts";
  import SetOperationStatus from "@/components/SetOperationStatus.svelte";
  import AccountDropdown from "@/components/AccountDropdown.svelte";
</script>

<header class="p-3 text-bg-dark">
  <div class="container">
    <div class="d-flex flex-wrap align-items-center justify-content-between">
      <a href="/" class="text-white text-decoration-none"> Flight Surety </a>
      <div class="d-flex text-end">
        {#if $account.type == "owner"}
          <SetOperationStatus />
        {/if}
        <AccountDropdown />
      </div>
    </div>
  </div>
</header>
