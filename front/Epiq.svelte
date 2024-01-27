<script>
	import { tick } from 'svelte';
	import { playVideo, hautFait, newInfoPopup, scrollTop } from "./storage.js"
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
	export let rstPageDone = null;
	export let titre = "Quête initiatique...";
	export let trailer = "Ferme ce popup pour continuer";
	
	let scrollPrm = { behavior : "smooth", block: "start", inline: "start"  }

	function clicOui() {
		if (ouiMsg) newInfoPopup(titre,ouiMsg,trailer);
		playVideo(ouiVideo);
		hautFait(ouiHautFait,3);
		if ( (ouiPageDone) && (pageDone.find((e) => e==ouiPageDone) == undefined) ) pageDone.push(ouiPageDone);
		if (ouiPage) page=ouiPage;
		if (ouiFct) ouiFct();
		step = oui;
		scrollTop();
	}
	function clicNon() {
		if (nonMsg) newInfoPopup(titre,nonMsg,trailer);
		playVideo(nonVideo);
		hautFait(nonHautFait,3);
		if (nonPage) page=nonPage;
		if (nonFct) nonFct();
		step = non;
		scrollTop();
	}
	function clicRst() {
		if (rstMsg) newInfoPopup(titre,rstMsg,trailer);
		playVideo(rstVideo);
		hautFait(rstHautFait,3);
		if (rstPage) page=rstPage;
		if (rstPageDone) pageDone = pageDone.filter(e => e !== rstPageDone);
		if (rstFct) rtsFct();
		step = rst;
		scrollTop();
	}
	
</script>

<style>
	
</style>

{#if oui != null} <input on:click={clicOui} type="button" value={ouiVal} />{/if}
{#if non != null} <input on:click={clicNon} type="button" value={nonVal} />{/if}
{#if rst != null} <input on:click={clicRst} type="button" value={rstVal} />{/if}

<!-- epiq.svelte -->

