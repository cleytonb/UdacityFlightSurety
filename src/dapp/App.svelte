<script>
	import Header from './components/Header.svelte';
    import OperationStatus from './components/OperationStatus.svelte';

    import { methods } from './stores';

    methods.initialize();
</script>

<Header/>
<OperationStatus />