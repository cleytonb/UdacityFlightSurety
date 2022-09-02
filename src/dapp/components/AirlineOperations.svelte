<script>
    import { account } from '@/stores/accounts';
    import { airlineStatus, methods } from '@/stores/airlines';

    $: $account, methods.fetchStatus();

    let newAirline = '';
</script>

<div>
    <div>Registered: {$airlineStatus.registered}</div>
    <div>Operational: {$airlineStatus.operational}</div>
    {#if $airlineStatus.registered && !$airlineStatus.operational}
    <button class="btn btn-primary" on:click={methods.fundAirline}>Fund account</button>
    {/if}
</div>

{#if $airlineStatus.operational}
<div>
    <input type="text" bind:value={newAirline} />
    <button class="btn btn-primary" on:click={methods.registerAirline(newAirline)}>Register airline</button>
</div>
{/if}