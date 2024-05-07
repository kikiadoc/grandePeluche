<script>

	import {getContext} from 'svelte';
	import {getMixedAudioVolume, audioPause, audioResume, newInfoPopup, scrollTop} from './storage.js';
	import {apiCall} from './storage.js';

	export let type = null;  // peut indiquer le type detail
	export let grimoire = null;
	export let nom = "nomTBD";
	export let texte = "texteTBD";
	export let ext = "";
	export let details = false;
	export let entree = false;
	export let mp3 = null;
	export let mp4 = null;
	export let vol = 1;
	export let statusVideos = null;
	
	export let seq="TBD";


	let videoDone = false;
	$: recalc(statusVideos)
	
	function recalc(s) {
		videoDone = (statusVideos) ? statusVideos.videos[nom] : false;
	}
	
	

	let startDth = null;
	let endDth = null;

	const { videoVisionnee } = getContext('P1');


	function toggleGrimoire() {
		grimoire = (grimoire!=nom) ? nom: null
		if (grimoire != null)
			scrollTop(grimoire);
		else
			audioResume();
	}
	function goDetails() {
		if (grimoire==nom) {
			grimoire = nom + "_detail";
			scrollTop(grimoire);
		}
	}
	function goEntree() {
		
	}
	function audioStart(t) {
		audioPause();
		startDth = Date.now();
		let e = document.getElementById(nom+"_audio");
		e.volume = getMixedAudioVolume(vol);
	}
	function audioEnd() {
		endDth = Date.now();
		audioResume();
	}
	function videoStart(t) {
		audioPause();
		startDth = Date.now();
		let e = document.getElementById(nom+"_video");
		e.volume = getMixedAudioVolume(vol);
	}
	function videoEnd() {
		endDth = Date.now();
		let e = document.getElementById(nom+"_video");
		let videoDuration = Math.floor(e.duration);
		let videoView = Math.floor((endDth-startDth) / 1000) +1;
		console.log("videoDuration=", videoDuration)
		console.log("videoView:", videoView);
		if (videoView >= videoDuration)
			videoVisionnee(nom);
		else
			newInfoPopup("Désolé","Tu n'as pas regardé toute la vidéo, peut-être as tu déplacé l'index de lecture involontairement","Je ne valide pas!")
			
		audioResume();
	}
</script>
<style>

</style>

{#if type=="detail"}
	<hr />
	<div class="event" id="{nom}_detail" on:click={() => {grimoire=nom; scrollTop(grimoire)}} role="button" tabindex=0 on:keypress={null} >
		Event {seq}: {texte} (détails) ⏫
	</div>
{:else}
	<div class="grimoire" id={nom} on:click={toggleGrimoire} role="button" tabindex=0 on:keypress={null}>
		{#if mp4 == null}
			<span style="color:white">👉</span>
		{:else}
			{#if videoDone}
				<span style="color:green">✓</span>
			{:else}
				<span style="color:red">👁</span>
			{/if}
		{/if}
		<span class="{ext}">{texte}</span>
	</div>
	{#if grimoire==nom}
		<div class="ouvert papier">
			{#if mp3!==null}
				<audio id="{nom}_audio" on:loadstart={audioStart} on:ended={audioEnd} autoplay>
					<source src="https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/{mp3}.mp3" type="audio/mp3" />
				</audio>
			{/if}
			{#if mp4!==null}
				<video id="{nom}_video" controls autoplay on:loadstart={videoStart}  on:ended={videoEnd} class="videoDroite">
					<source src="https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/{mp4}.mp4" type="video/mp4" />
					<track kind="captions" />
				</video>
			{/if}
	
			<slot>SLOT non defini!!</slot>
	
			{#if details!==false}
				<div class="chapitre">
					Après avoir regardé la vidéo,
					tu peux voir le détail de l'événement
					<span style="cursor:pointer" on:click={goDetails} role="button" tabindex=0 on:keypress={null}>ici⏬</span>
				</div>
			{/if}
			{#if entree!==false}
					<span style="cursor:pointer" on:click={goDetails} role="button" tabindex=0 on:keypress={null}>⏫</span>
			{/if}
	
	
			<div class="fin"></div>
		</div>
	{/if}
{/if}

<!-- P1_E.svelte -->
