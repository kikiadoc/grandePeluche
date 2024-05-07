

<script>
	import { loadIt, storeIt, removeIt, addNotification, apiCall, newInfoPopup} from "./storage.js";
	
	async function clearPseudoServer()	{ 
		const pseudo = document.getElementById('admClearPseudo').value;
		let retJson = await apiCall("/pseudos/"+pseudo,"DELETE");
		newInfoPopup("deletePeudo:",retJson.o.pseudo,"status="+retJson.status); 
	}
	function clearPseudoClient()	{ 
		removeIt('pseudo');
		removeIt('pseudoPwd');
		removeIt('page');
		location.reload();
	}

	async function incJetons()	{ 
		const pseudo = document.getElementById('admJetonPseudo').value;
		let retJson = await apiCall("/test/incJetons/"+pseudo);
		newInfoPopup("incJetons "+pseudo, retJson.o.data[pseudo].solde);
	}
	async function decJetons()	{ 
		const pseudo = document.getElementById('admJetonPseudo').value;
		let retJson = await apiCall("/test/decJetons/"+pseudo);
		newInfoPopup("decJetons "+pseudo, retJson.o.data[pseudo].solde);
	}
	async function queryJetons()	{ 
		const pseudo = document.getElementById('admJetonPseudo').value;
		let retJson = await apiCall("/test/queryJetons/"+pseudo);
		newInfoPopup("queryJetons "+pseudo, retJson.o.data[pseudo].solde);
	}
	

</script>

<style>
	.inputCadre { border: 2px solid red; background-color: black; margin: 2px }

</style>

<div class="inputCadre">
	<div>
		ADMIN !
	</div>
	<div class="inputCadre">
		<input type="text" id="admClearPseudo">
		<input type="button" value="ClearPseudoServer" on:click={clearPseudoServer}>
	</div>
	<div class="inputCadre">
		<input type="button" value="ClearPseudoClient" on:click={clearPseudoClient}>
	</div>
	<div class="inputCadre">
		<input type="text" id="admJetonPseudo">
		<input type="button" value="info jetons" on:click={queryJetons }>
		<input type="button" value="inc jetons" on:click={incJetons }>
		<input type="button" value="dec jetons" on:click={decJetons }>
	</div> 
</div>

