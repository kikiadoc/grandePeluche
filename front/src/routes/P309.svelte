<script>
	import { onMount, onDestroy  } from 'svelte';
	import { loadIt, storeIt, apiCall, urlImg  } from './storage.js';
	import { playSound, playDing, newInfoPopup, addNotification, playVideo } from './storage.js';
	import Epiq from './Epiq.svelte';

	export let wsCallComponents;
	export let pseudo;
	export let pageDesc = null

	onMount(() => { 
		if (wsCallComponents) wsCallComponents.add(myWsCallback);
		// init();
	});
	onDestroy(() => {
		if (wsCallComponents) wsCallComponents.delete(myWsCallback);
	});
	
	function myWsCallback(m) {
		// if (m.op=="dirac") { getResultat(); return true; }
	}

	const pageEpiqLbl = "P"+pageDesc.n + "_epiqStep"

	let step = loadIt(pageEpiqLbl,0);
	$: storeIt(pageEpiqLbl,step);

</script>
<style>
	.fin {
		border-radius: 6px;
		border: 4px outset red;
		position: relative;
		left: 10%;
		width: 80%;
	}
</style>

<div>
	<input type="button" on:click={()=> step=0} value="Réafficher le lore" />
</div>

{#if step == 0}
	<div class="reveal">
		Bravo {pseudo} pour tous ces challenges réussis.
		<br/>
		Veux-tu voir la dernière étape de nos Aventures?
		<br/>
		<Epiq bind:step={step} oui=1 ouiVal="Oui, montre-moi!" ouiVideo="ff-6-epilogue"/>
	</div>
{/if}
{#if step == 1}
	<div class="reveal">
		Encore bravo {pseudo}.
		<br/>
		L'écriture d'un nouveau chapître dans le Grand Grimoire des Savoirs aurait été impossible
		sans tes performances, car l'Histoire et le Temps étaient totalement perturbés.
		<br />
		Maintenant que Temps et Histoire d'Eorzéa sont rétablis,
		je peux y relater tes Aventures,
		mais, pour cela, laisse-moi encore quelques jours. 
		<br />
		J'aimerai illustrer mon récit avec les visages des Héros de l'Uchronie
		et le tien y a toute sa place.
		<br/>
		<i>
			<span class="blinkMsg">Poste un screen sur le canal #discussion du Discord</span>
			où on voit parfaitement le visage de ton perso, de face ou légèrement tourné/incliné, sur fond plutôt clair et
			d'une taille suffisante (300pixels, 20% de l'écran) car je découperai le screen autour de ton visage et
			il ne faut pas qu'il soit pixellisé.
		</i>
		<div class="stars fin" style="text-align: center; font-size:1.2em">
		Ainsi s'achève le
		<br/>
		Kiki's Event VIII,
		<br/>
		l'Uchronie.
		</div>
	</div>
{/if}
		
<!-- p309.svelte -->
