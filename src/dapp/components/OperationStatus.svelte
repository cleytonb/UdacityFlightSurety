<script>
    import { account, operatingStatus } from '../stores';
    import contract from '../contract';

    async function pauseContract() {
        await contract.pauseContract(account);
    }

    async function resumeContract() {
        await contract.resumeContract(account);
    }
</script>

{#if $operatingStatus}
<div class="bg-success text-white text-center" on:click={pauseContract}>Contract is operational</div>
{:else}
<div class="bg-danger text-white text-center" on:click={resumeContract}>Contract operation is halted</div>
{/if}