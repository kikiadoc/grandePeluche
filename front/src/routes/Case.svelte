<script>
  import { onMount, onDestroy } from 'svelte';
	import { apiGet, addNotification, newInfoPopup, loadIt, playSound } from "./storage.js";
	import { STATUS } from "./chasseConst.js";

	export let contenu={};
	export let qr;

	let timer = null;
	let timerDthEnd = null;
	let intervalId = null;
	let inputValue = null;

	$: reflushCase(contenu);
	$: verifyInput(inputValue);
	// $: alert(contenu);

	// onMount(() => { console.log('Case mount') } );
	// onDestroy(() => { console.log('Case destroy', contenu.i); clearTimer(); } );
	onDestroy(() => { clearTimer(); } );

	function clearTimer() {
		// console.log("clear timer", contenu, contenu.i, intervalId);
		timerDthEnd = null;
		if (intervalId) clearInterval(intervalId);
		intervalId=null;
	}

	function infoTuileEncours()  {
		newInfoPopup("Voici l'énigme:",
	    qr[contenu.i].q,
			"Ferme cette popup et indique rapidement la réponse, tu pourras réafficher l'énigme en cliquant en haut de la tuile",
	    qr[contenu.i].img 
		);
	}
	function infoTuileAttente() {
		newInfoPopup("Tu as échoué, appelle à l'aide avant l'échéance du timer",
	    qr[contenu.i].q,
			"Clique sur un connecté (en début de page) afin qu'il clique sur la tuile de ton énigme, tu pourras alors la recommencer immédiatement",
	    qr[contenu.i].img
		);
		playSound("May");
	}
	function infoTuileAttenteOther() {
		newInfoPopup("Reactivation demandée! ",
			"Tu as permis à "+ contenu.pseudo + " d'avoir un nouveau délai pour résoudre son énigme",
			""
			);
	}
	
	async function unlockTuile() {
		let chasse = await apiGet("/logic/chasseauxtresors/unlock/"+contenu.i);
		if (chasse.status==200) {
			infoTuileEncours();
			playSound('SkyNews');
		}
	}
	
	function padValue(v) {
		if (v < 0) return "00";
		if (v < 10) return "0" +v ;
		return ""+v;
	}

	function updateTimer() {
		// console.log("update timer",contenu.i);
		const nbSec = Math.floor( (contenu.timerDthEnd - Date.now()) / 1000);
		if (nbSec >=0 ) {
			const h = Math.floor(nbSec/3600);
			const m = Math.floor( (nbSec - h*3600) / 60);
			timer = padValue(h) + ":" + padValue(m) + ":" + padValue(nbSec % 60);
		}
		else {
  		// console.log("Out of Time",contenu.i);
			clearTimer();
			if (contenu.status==STATUS.ENCOURS) {
				infoTuileAttente();
			}
		}
	}

	function reflushCase(c) {
		if (! c || ! c.i) return;
		clearTimer();
		
		// Gestion du timer si besoin
		if (c.timerDthEnd) {
			intervalId = setInterval(updateTimer,1000);
		}
		
	}
	
	function clicTuile() {
		switch (contenu.status) {
			case STATUS.OWNED:
				newInfoPopup("Tu as résolu l'énigme #" + contenu.i + ":",
					 qr[contenu.i].q,
					 "Consulte le conseil de la Grande Peluche en début de page");
				break;			
			case STATUS.OWNED_OTHER :
				newInfoPopup(contenu.pseudo + " as résolu cette énigme",
					 qr[contenu.i].q,
					 "");
				break;			
			case STATUS.ENCOURS:
				infoTuileEncours();
				break;			
			case STATUS.ENCOURS_OTHER:
				newInfoPopup(contenu.pseudo + " tente de résoudre cette énigme",
					 "",
					 "S'il échoue, tu pourras l'aider en cliquant sur cette tuile");
				break;			
			case STATUS.ATTENTE:
				infoTuileAttente();
				break;			
			case STATUS.ATTENTE_OTHER:
				infoTuileAttenteOther();
				apiGet("/logic/chasseauxtresors/renew/"+contenu.i);
				break;			
			case STATUS.DECOUVRIR:
				if (contenu.enigmesDecouvertes >=2 && contenu.nbParticipantsAyantResolu < 12) {
					if (confirm("Tu as déjà résolu 2 énigmes et il n'y a pas 12 participants ayant résolu une énigme, le mieux serait d'inviter des amis pour augmenter les gains... Es-tu bien sûr de vouloir résoudre cette énigme plutot que d'inviter, toi ou d'autres, des amis?") )
  				  unlockTuile();
				}
				else {
					if (confirm("Tu souhaites résoudre l'énigme #"+ contenu.i + "?"))					
					  unlockTuile();
				}
				break;
			case STATUS.DECOUVRIR_LOCK:
				if (contenu.flagEncours>=0)
					newInfoPopup("Résous d'abord l'énigme en cours",
						 qr[contenu.flagEncours].q,
						 "elle est en cours alors dépèche-toi !",
					   qr[contenu.flagEncours].img
					);
				else
				if (contenu.flagEnattente>=0)
					newInfoPopup("Tu as déjà choisi l'énigme #"+contenu.flagEnattente,
						 qr[contenu.flagEnattente].q,
						 "elle est en attente car tu n'as pas répondu à temps, "+
						 "tu peux demander à un autre participant de la réactiver, "+
						 "mais tu peux aussi attendre l'échéance et "+
						 "tenter un autre énigme encore disponibles."
					);
				break;			
			case STATUS.DECOUVRIR_FUTURE:
					newInfoPopup("Tu as résolu une énigme il y a peu de temps",
						 "tu peux aider les autres, même si tu ne peux pas encore tenter une énigme",
						 "Tu pourras tenter de résoudre une nouvelle énigme après le délai de relaxation"
					);
				break;			
			default:
				addNotification(1,"Erreur clic/status tuile");
		}
	}

	function clickInput() {
		addNotification(0,"Tu peux réafficher l'énigme en cliquant en haut de la tuile");
	}

	// lowercase, supression blanc et tirets...
	function normalizedInput(s) {
		return s.replace(/ /g,'').replace(/-/g,'').toLowerCase(); 
	}
	
	function verifyInput() {
		if ( (!contenu.i) || (!qr[contenu.i]) ) return;
		// addNotification("normalized input" + normalizedInput(inputValue) + ',' + normalizedInput(qr[contenu.i].r));
		if ( normalizedInput(inputValue) == normalizedInput(qr[contenu.i].r)) {
			apiGet("/logic/chasseauxtresors/trouve/"+contenu.i);
		}
	}
	
	function adminReset() {
			apiGet("/logic/chasseauxtresors/adminReset/"+contenu.i);
	}
	function adminTrouve() {
			apiGet("/logic/chasseauxtresors/adminTrouve/"+contenu.i);
	}
	
</script>
<style>
	td { width: 45%; background-color: lightgrey; border: solid 1px white; margin: 0px; spacing:0; padding: 1px; font-size: 0.8em }
	div { spacing: 0px; margin: 0px; padding: 0px }
	input { width:90% }
</style>

{#if ! contenu.status}
	<td><div>Attente...</div>
{/if}
{#if contenu.status ==STATUS.OWNED}
	<td style="background-color: red; cursor:pointer " on:click={clicTuile} role="button" tabindex=0 on:keypress={null}>
		<div>
		{contenu.pseudo}: 
		<br/>
		{qr[contenu.i].r} 
		<br/>
		({new Date(contenu.dthStart).toLocaleDateString("fr-fr",{month: "numeric", day: "numeric"})} {new Date(contenu.dthStart).toLocaleTimeString()})
		</div>
	</td>
{/if}
{#if contenu.status ==STATUS.OWNED_OTHER}
	<td style="background-color: red; cursor:pointer " on:click={clicTuile} role="button" tabindex=0 on:keypress={null}>
		<div>
		{contenu.pseudo}: 
		<br/>
		{qr[contenu.i].r} 
		<br/>
		({new Date(contenu.dthStart).toLocaleDateString("fr-fr",{month: "numeric", day: "numeric"})} {new Date(contenu.dthStart).toLocaleTimeString()})
		</div>
	</td>
{/if}
{#if contenu.status ==STATUS.ENCOURS}
	<td>
		<div style="background-color: orange;  cursor:pointer " on:click={clicTuile} role="button" tabindex=0 on:keypress={null}>
			{contenu.pseudo}: 
		</div>
		<div>
			Réponse: {timer}
		</div>
		<div style="background-color: lightblue;  cursor:pointer " role="button" tabindex=0 on:keypress={null}>
			<input type="text" bind:value={inputValue} on:click={clickInput} >
		</div>
	</td>
{/if}
{#if contenu.status ==STATUS.ENCOURS_OTHER}
	<td style="background-color: lightgrey; cursor:pointer " on:click={clicTuile} role="button" tabindex=0 on:keypress={null}>
		<div>
		{contenu.pseudo}
		<br/>
		En cours: {timer}
		<br/>
		(énigme non résolue)
		</div>
	</td>
{/if}
{#if contenu.status ==STATUS.ATTENTE}
	<td style="background-color: purple; cursor:pointer " on:click={clicTuile} role="button" tabindex=0 on:keypress={null}>
		<div>
		{contenu.pseudo}
		<br/>
		Attente: {timer}
		<br/>
		Tu as échoué
		</div>
	</td>
{/if}
{#if contenu.status ==STATUS.ATTENTE_OTHER}
	<td style="background-color: lightgreen; cursor:pointer " on:click={clicTuile} role="button" tabindex=0 on:keypress={null}>
		<div>
		{contenu.pseudo}
		<br/>
		Attente: {timer}
		<br/>
		Clic pour l'aider!
		</div>
	</td>
{/if}
{#if contenu.status ==STATUS.DECOUVRIR}
	<td style="background-color: green; cursor:pointer " on:click={clicTuile} role="button" tabindex=0 on:keypress={null}>
		<div>
		A découvrir
		<br/>
		énigme {contenu.i}
		<br/>
		{qr[contenu.i].info}
		</div>
	</td>
{/if}
{#if contenu.status ==STATUS.DECOUVRIR_LOCK}
	<td style="background-color: lightgrey; cursor:pointer " on:click={clicTuile} role="button" tabindex=0 on:keypress={null}>
		<div>
		A découvrir
		<br/>
		énigme {contenu.i}
		<br/>
		{qr[contenu.i].info}
		</div>
	</td>
{/if}
{#if contenu.status ==STATUS.DECOUVRIR_FUTURE}
	<td style="background-color: lightgrey; cursor:pointer " on:click={clicTuile} role="button" tabindex=0 on:keypress={null}>
		<div>
		Dans {timer}
		<br/>
		énigme {contenu.i}
		<br/>
		{qr[contenu.i].info}
		</div>
	</td>
{/if}
{#if contenu.pseudoConnecte == "Kikiadoc"}
	<td style="width:10%">
		<div>
			Adm
			<br/>
			<button on:click={adminReset}>reset</button>
			<br/>
			<button on:click={adminTrouve}>trouvé</button>
		</div>
	</td>
{/if}

