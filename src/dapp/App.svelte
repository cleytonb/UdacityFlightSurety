<script>
	import Header from '@/components/Header.svelte';
    import OperationStatus from '@/components/OperationStatus.svelte';
    import AirlineOperations from '@/components/AirlineOperations.svelte';

    import { account } from '@/stores/accounts';
</script>

<Header/>
<OperationStatus />
{#if $account.type == 'airline'}
<AirlineOperations />
{/if}