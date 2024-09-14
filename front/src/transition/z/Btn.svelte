<script>
	import { newInfoPopup, scrollTop, setHautFait, playDing, playVideo } from "./storage.js"
	export let refStep = null
	export let refPage = 0
	export let refPageDone = null
	export let id = null
	export let val = "ok";
	export let ifFct = null
	export let msg = null
	export let koMsg = null
	export let ding = null
	export let video = null
	export let koVideo = null
	export let hautFait = null;
	export let page = null
	export let step = null
	export let pageDone = null;
	export let titre = "Challenge...";
	export let trailer = "Ferme ce popup pour continuer";
	
	function clicOui() {
		let ok = (ifFct)? ifFct() : true
		if (ok) {
			if (msg) newInfoPopup(titre,msg,trailer, {ding: ding});
			if (video) playVideo(video)
			if (hautFait) setHautFait(hautFait,3);
			if (pageDone && refPageDone && (refPageDone.find((e) => e==pageDone) == undefined) ) refPageDone.push(pageDone)
			if (step!==null) refStep=step
			if (page!==null) refPage=page
			if (step!=null || page!=null) scrollTop()
		}
		else {
			if (koMsg) newInfoPopup(titre,koMsg,trailer, {ding: 'prout-long', back:'papier'});
			if (koVideo) playVideo(koVideo)
		}
	}
</script>

<style>
	
</style>

<input id={id} on:click={clicOui} type="button" value={val} />

<!-- z/Step.svelte -->

