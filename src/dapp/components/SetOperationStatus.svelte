<script>
    import { operatingStatus, methods } from '../stores';
</script>

{#if $operatingStatus}
<button class="btn btn-danger me-2" on:click={methods.pauseContract}>Halt contract</button>
{:else}
<button class="btn btn-success me-2" on:click={methods.resumeContract}>Resume contract</button>
{/if}