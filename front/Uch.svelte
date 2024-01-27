<script>
	import { onMount, onDestroy, tick  } from 'svelte';
	import { apiCall, addNotification } from './storage.js';
	
	export let wsCallComponents; 
	export let pseudo;
	export let filRouge = {};
	
	let lastCurrentIdx = -1;

	onMount(() => { 
		console.log('build filrouge');
		refreshFilRouge();
		if (wsCallComponents) wsCallComponents.add(myWsCallback);
	});
	onDestroy(() => {
		console.log('destroy filrouge');
		if (wsCallComponents) wsCallComponents.delete(myWsCallback);
	});

	function myWsCallback(m) {
		// console.log('myWsCallbak filrouge',m);
		if (m.op=="collection" && m.name=="uchronieFilRouge") {
			refreshFilRouge();
			return true;
		}
	}
	async function refreshFilRouge() {
		// console.log("refreshFilRouge");
		let ret = await apiCall("/uchronieFilRouge");
		if (ret.status==200) {
			let tmpFilRouge = ret.o;
			tmpFilRouge.enigmeTrouve = tmpFilRouge.pseudos[pseudo].trouves[tmpFilRouge.currentIdx] ;
			// ding ding ??
			if (tmpFilRouge.currentIdx != lastCurrentIdx) {
				lastCurrentIdx = tmpFilRouge.currentIdx;
				if (tmpFilRouge.enigmeTrouve == null) {
					addNotification("Identifie la victime #"+ (lastCurrentIdx+1) + " de l'Uchonie","orange",20,true);
				}
				else {
					addNotification("Victime #"+ (lastCurrentIdx+1) + " déjà identifiée","orange",20,true);
				}
			} 
			filRouge = tmpFilRouge;
		}
	}

</script>
<!-- Uch.svelte -->
