<script>
	import { tick } from 'svelte';
	import { playVideo, newInfoPopup, scrollTop, addNotification, apiCall, setHautFait } from "./storage.js"
	export let step
	export let page = 0
	export let pageDone = [];
	export let oui = null;
	export let non = null;
	export let rst = null;
	export let ouiIf = true
	export let nonIf = true
	export let rstIf = true
	export let ouiVideo = null;
	export let nonVideo = null;
	export let rstVideo = null;
	export let ouiHautFait = null;
	export let nonHautFait = null;
	export let rstHautFait = null;
	export let ouiMsg = null;
	export let nonMsg = null;
	export let rstMsg = null;
	export let ouiVal = "oui";
	export let nonVal = "non";
	export let rstVal = "recommencer";
	export let ouiPage = 0;
	export let nonPage = 0;
	export let rstPage = 0;
	export let ouiFct = null;
	export let nonFct = null;
	export let rstFct = null;
	export let ouiPageDone = null;
	export let nonPageDone = null;
	export let rstPageDone = null;
	export let selVal = null;
	export let selOpt = null;
	export let titre = "Quête initiatique...";
	export let trailer = "Ferme ce popup pour continuer";
	
	let scrollPrm = { behavior : "smooth", block: "start", inline: "start"  }

	function clicOui() {
		if (ouiMsg) newInfoPopup(titre,ouiMsg,trailer);
		playVideo(ouiVideo)
		if (ouiHautFait) setHautFait(ouiHautFait,3);
		if ( (ouiPageDone) && (pageDone.find((e) => e==ouiPageDone) == undefined) ) pageDone.push(ouiPageDone);
		if (ouiFct) ouiFct();
		step = oui
		if (ouiPage) page=ouiPage;
		scrollTop();
	}
	function clicNon() {
		if (nonMsg) newInfoPopup(titre,nonMsg,trailer);
		playVideo(nonVideo)
		if (nonHautFait) setHautFait(nonHautFait,3);
		if ( (nonPageDone) && (pageDone.find((e) => e==nonPageDone) == undefined) ) pageDone.push(nonPageDone);
		if (nonFct) nonFct();
		step = non
		if (nonPage) page=nonPage;
		scrollTop();
	}
	function clicRst() {
		if (rstMsg) newInfoPopup(titre,rstMsg,trailer);
		playVideo(rstVideo);
		if (rstHautFait) setHautFait(rstHautFait,3);
		if ( (rstPageDone) && (pageDone.find((e) => e==rstPageDone) == undefined) ) pageDone.push(rstPageDone);
		if (rstFct) rstFct();
		step = rst
		if (rstPage) page=rstPage;
		scrollTop();
	}
	
</script>

<style>
	
</style>

{#if oui != null && ouiIf} <input on:click={clicOui} type="button" value={ouiVal} />{/if}
{#if non != null && nonIf} <input on:click={clicNon} type="button" value={nonVal} />{/if}
{#if rst != null && rstIf} <input on:click={clicRst} type="button" value={rstVal} />{/if}
{#if selOpt !== null}
	{#if selVal}{selVal}{/if}
	<select bind:value={step}>
		{#each selOpt as opt,i}
			<option value={i}>{opt}</option>
		{/each}
	</select>
{/if}

<!-- epiq.svelte -->

