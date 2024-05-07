<script>
	import { onMount, onDestroy  } from 'svelte';
	
	export let wsCallComponents; 
	export let pseudo; 
	
	onMount(() => { console.log('mount P-tmp'); if (wsCallComponents) wsCallComponents.add(myWsCallback) });
	onDestroy(() => { console.log('destroy P-tmp'); if (wsCallComponents) wsCallComponents.delete(myWsCallback) });

	function myWsCallback(m) {
		// console.log('myWsCallbak pipo101',m);
	}

</script>

<style>
	
</style>

<div>
	
</div>


