<script>
    import { operatingStatus } from '@/stores/operatingStatus';
</script>

{#if $operatingStatus}
<div class="bg-success text-white text-center">Contract is operational</div>
{:else}
<div class="bg-danger text-white text-center">Contract operation is halted</div>
{/if}