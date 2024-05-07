<script>
	import { onMount, onDestroy  } from 'svelte';
	import { loadIt, storeIt, newInfoPopup  } from './storage.js';
	import Uch from './Uch.svelte';
	
	export let wsCallComponents; 
	export let pseudo; 
	
	onMount(() => { console.log('mount 101'); if (wsCallComponents) wsCallComponents.add(myWsCallback) });
	onDestroy(() => { console.log('destroy 101'); if (wsCallComponents) wsCallComponents.delete(myWsCallback) });

	function myWsCallback(m) {
		// console.log('myWsCallbak pipo101',m);
		if (m.op=="notif" && m.fromPseudo==pseudo && etape==1) {
			etape=2;
			newInfoPopup("Voila !","tu peux maintenant fermer cette fenêtre de victoire, puis la fenêtre de chat et continuer");
		}
	}

	let etape = loadIt("P_101_etape",0);
	function newEtape(n) {
		storeIt("P_101_etape",etape);
		window.scroll(0,0);
	}
	$: newEtape(etape);
	
</script>

<style>
	.suite {font-size: 0.8em}
</style>

<p>
	{#if pseudo=="Kikiadoc"}<input type=button value="admin reset" on:click={ () => { etape=0 } } />{/if}
</p>
<p>
	Etape: {etape+1}/5
</p>
{#if etape==0}
	<div>
		Bienvenue dans le challenge d'accueil de ce nouvel événement, l'Uchonie.
	</div>
	<div>
		Ce challenge d'accueil te permettra de découvrir quelques une de mes nouvelles fonctions.
	</div>
	<div>
		<input type="button" value="clique ici pour la suite" class="suite" on:click={() => {etape=1} } />
	</div>
{/if}
{#if etape==1}
	<div>
		Tu peux envoyer un message à tous les participants connectés en cliquant sur l'indicateur "multijoueurs"
		dans le bandeau en haut. Cet indicateur "multijoueurs" doit toujours être vert.
		(si ce n'est pas le cas, il faut contacter Kikiadoc sur Discord)
	</div>
	<div style="color: red" >Envoie un premier message pour passer à la suite, en cliquant sur "multijoueurs"</div>
{/if}
{#if etape==3}
	<p style="color:red">
		Tout d'abord, et pour valider ta participation à ce challenge, n'oublie pas d'indiquer un message
		sur mon livre de correspondance dans ma chambre avec le mot "Uchonie".
	</p>
	<div>
		Quand ce sera fait, 
		<input type="button" value="clique ici pour la suite" class="suite" />
		...
	</div>
{/if}
{#if etape<5}
	<Uch bind:wsCallComponents={wsCallComponents} bind:pseudo={pseudo}></Uch>
{/if}


