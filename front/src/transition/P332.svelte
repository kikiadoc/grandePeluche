<script>
	import { onMount, onDestroy } from 'svelte';
	import { loadIt, storeIt, apiCall, clickSur, scrollTop } from "./storage.js"
	import { addNotification, newInfoPopup, playVideo, urlCdn, setHautFait, getHautFait } from "./storage.js"

	import Btn from './z/Btn.svelte'
	import Cpacman from './Cpacman.svelte'
	
	// export let wsCallComponents
  export let pseudo
  export let page
  export let pageDesc = null
  export let pageDone = []
	// export let pseudoList = []
	export let audioVolume
	
	const pageEpiqLbl = "P"+pageDesc.n + "_epiqStep"
	const pageSaisiesLbl = "P"+pageDesc.n + "_saisies"
	
	let step = loadIt(pageEpiqLbl,0)
  $: storeIt(pageEpiqLbl,step)

	let saisies = loadIt(pageSaisiesLbl,{})
  $: storeIt(pageSaisiesLbl,saisies)

	// Gestion des reload, refresh etc..
	onMount(() => {
	})
	onDestroy(() => {
	})

	// escape de la prison
	function pacmanEscape() {
		saisies.escape=true
		setHautFait("evadePrison",3)
		playVideo("ff-7-portemagique")
		step=20
		scrollTop()
	}

	// affichage des hautfaits/résultats
	let dspResultats = null
	async function calcResultats() {
		dspResultats = await getHautFait("evadePrison");
	}
	
</script>
<style>
</style>

{#if pseudo.startsWith("Kikiadoc")}
	<div class="adminCadre">
	  <input type="button" on:click={()=> apiCall('/hautsFaits/evadePrison','DELETE')} value="Reset evadePrison" />
	</div>
{/if}

<div>
  <input type="button" on:click={()=> step=0} value="Réafficher le lore" />
  <input type="button" on:click={()=> calcResultats()} value="Les évadés" />
</div>

{#if step==0}
	<div>
		<div>
			Les Anciens étaient une antique civilisation qui a disparu lors de la Fragmentation.
			Si quelques Asciens sont présents dans le nouveau monde, de nombreux
			vestiges des Anciens existent encore, et certaines de leurs coutumes et capacités
			sont notées dans le Grand Grimoire des Savoirs.
		</div>
		<p>
			Ainsi, celà confirme la possibilité que de Nouveaux Anciens
			apparaissent en Eorzéa et que tu en as peut-être déjà identifié leur dieu: Méphistophélès.
		</p>
		<p>
			Si les Nouveaux Anciens reprennent les objectifs des Anciens disparus, alors
			ils veulent remplacer les civilisations d'Eorzéa par une nouvelle Hégémonie.
		</p>
		<p>
			C'est pourquoi j'ai besoin de toi pour comprendre les arcanes de ces Nouveaux Anciens avant que
			nous les combattions.
		</p>
		<Btn bind:refStep={step} step=1 video="ff-7-epique-1" val="Tu peux compter sur moi" />
	</div>
{/if}
{#if step==1}
	<div>
		{pseudo}, je suppose que 12 8, ce sont des coordonnées en Eorzéa, mais je n'en suis pas sûre.
		<br/>
		Explore Eorzéa à la découverte d'une guilde située aux environs de X:12 Y:8 dans une ville de base.
		<br/>
		Trouve alors le maître de cette guilde et note son nom sur ton parchemin épique.
		<div class="parchemin">
			Parchemin épique:
			<br/>
			<input type="text" bind:value={saisies.maitre128} placeholder="maître de guilde" on:keypress={(e) => e.key=="Enter" && clickSur('maitre128')} />
			<Btn id="maitre128" bind:refStep={step} step=11 video="ff-7-epique-2" val="➤"
				ifFct={()=> saisies.maitre128 && (saisies.maitre128.toLowerCase() == "geva")}
				koMsg="{saisies.maitre128} n'est pas le maître de guilde en X:12 Y:8" />
		</div>
	</div>
{/if}
{#if step==11}
	<div>
		{pseudo}, ton âme est prisonnière des Nouveaux Anciens, mais elle n'est pas encore possédée!
		<br/>
		<Btn video="ff-7-epique-2" val="Remontre-moi ma capture" />
		<Btn bind:refStep={step} step=15 video="ff-7-escapeprison" val="Que dois-je faire?" />
		{#if saisies.escape}
			<Btn bind:refStep={step} step=20 val="Je me suis déjà échappé" />
		{/if}
		<p style="font-size: 0.8em; font-style: italic;">
			Le code Javascript de la Prison des Ames est inspiré de
			<a href="https://github.com/daleharvey/pacman" target="_blank">https://github.com/daleharvey/pacman</a>
			<br/>
			Merci à lui!
		</p>
	</div>
{/if}
{#if step==15}
	<Cpacman bind:audioVolume={audioVolume} cbSuccess={pacmanEscape}/>
{/if}

{#if step==20}
	<div>
		Ton âme a réussi à s'échapper de la Prison des Ames et rejoindre ton corps.
		<br />
		Tu as eu de la chance, car les Gardiens de le Prison
		ont été surpris par ta capture et l'évasion a été facile...
		<br />
		Si ton âme est à nouveau prisonnière de la Prison des Ames,
		ta future évasion sera bien plus délicate...
		<br />
		<Btn bind:refStep={step} step=21 val="J'ai eu chaud aux fesses!" />
	</div>
{/if}

{#if step==21}
	<div>
		{pseudo}, je suis très perturbée par ce qu'il vient de t'arriver. 
		<div class="br" />
		Il semble que mon interprétation était incorrecte.
		<br />
		Peut-être que la séquence "12 8" n'indiquait pas les coordonnées de la guilde des tanneurs en Gridania...
		<div class="br" />
		Je vais organiser un congrès scientifique pour tenter de comprendre ces nombres étranges.
		J'espère que les Peluches 
		<a href="https://fr.wikipedia.org/wiki/Jean-Fran%C3%A7ois_Champollion" target="_blank">Champollion</a>
		et 
		<a href="https://fr.wikipedia.org/wiki/Lothar_Collatz" target="_blank">Collatz</a>
		seront présentes.
		<br/>
		Mon fidèle Hildiscord te sollicitera dès la fin de ce congrès.
		<div class="br" />
		Tu peux voir les résultats actuels de ce challenge en cliquant sur "Les évadés".
		<div>
			<i style="font-size:0.8em">Ce challenge est terminé, tu peux revoir le lore en cliquant sur 'Revoir le lore'</i>
		</div>
		<Btn bind:refPage={page} bind:refPageDone={pageDone} page=0 pageDone={pageDesc.n} val="Merci Grande Peluche" />
		<Btn bind:refStep={step} step=0  val="Revoir le lore" />
	</div>
{/if}

{#if dspResultats}
	{@const pseudos = Object.keys(dspResultats.pseudos)}
	<div class="popupCadre papier">
		<div class="close" on:click={()=>dspResultats=false} on:keypress={null} role="button" tabindex=0>X</div>
		<div class="popupZone">
			<div class="popupContent">
				Les Evadés de la Prison des Ames:&nbsp;&nbsp;&nbsp;
				<br/>
				{#each pseudos as p,i}
					<span>{p} &nbsp;</span>
				{/each}
			</div>
			<div>Total: {pseudos.length} aventuriers</div>
		</div>
	</div>
{/if}



<!-- P332.svelte -->
