<script>
	import { tick } from 'svelte';
	import { playVideo, newInfoPopup, scrollTop, addNotification, apiCall } from "./storage.js"
	export let step;
	export let page;
	export let pageDone = [];
	export let oui = null;
	export let non = null;
	export let rst = null;
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

	async function epiqHautFait(hf,lvl) {
		if (hf && lvl) {
			const ret = await apiCall("/hautsFaits/"+hf+"/"+lvl,'PUT');
			if (ret.status==200) addNotification("Haut fait "+hf+" dejà obtenu","lightgreen",5)
			if (ret.status==201) addNotification("Haut fait "+hf+" obtenu","yellow",10)
		} 
	}

	function clicOui() {
		if (ouiMsg) newInfoPopup(titre,ouiMsg,trailer);
		playVideo(ouiVideo);
		if (ouiHautFait) epiqHautFait(ouiHautFait,3);
		if ( (ouiPageDone) && (pageDone.find((e) => e==ouiPageDone) == undefined) ) pageDone.push(ouiPageDone);
		if (ouiFct) ouiFct();
		step = oui;
		if (ouiPage) page=ouiPage;
		scrollTop();
	}
	function clicNon() {
		if (nonMsg) newInfoPopup(titre,nonMsg,trailer);
		playVideo(nonVideo);
		if (nonHautFait) epiqHautFait(nonHautFait,3);
		if ( (nonPageDone) && (pageDone.find((e) => e==nonPageDone) == undefined) ) pageDone.push(nonPageDone);
		if (nonFct) nonFct();
		step = non;
		if (nonPage) page=nonPage;
		scrollTop();
	}
	function clicRst() {
		if (rstMsg) newInfoPopup(titre,rstMsg,trailer);
		playVideo(rstVideo);
		if (rstHautFait) epiqHautFait(rstHautFait,3);
		if ( (rstPageDone) && (pageDone.find((e) => e==rstPageDone) == undefined) ) pageDone.push(rstPageDone);
		if (rstFct) rtsFct();
		step = rst;
		if (rstPage) page=rstPage;
		scrollTop();
	}
	
</script>

<style>
	
</style>

{#if oui != null} <input on:click={clicOui} type="button" value={ouiVal} />{/if}
{#if non != null} <input on:click={clicNon} type="button" value={nonVal} />{/if}
{#if rst != null} <input on:click={clicRst} type="button" value={rstVal} />{/if}
{#if selOpt !== null}
	{#if selVal}{selVal}{/if}
	<select bind:value={step}>
		{#each selOpt as opt,i}
			<option value={i}>{opt}</option>
		{/each}
	</select>
{/if}

<!-- epiq.svelte -->

