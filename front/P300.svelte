<script>
	import { onMount, onDestroy  } from 'svelte';
	import { loadIt, storeIt, newInfoPopup, apiCall, addNotification  } from './storage.js';
	import Epiq from './Epiq.svelte';

	export let wsCallComponents; 
	export let pseudo; 
	export let page;
	export let pageDone = [];

	const pageNumber=300;
	
	onMount(() => { console.log('mount 101'); if (wsCallComponents) wsCallComponents.add(myWsCallback) });
	onDestroy(() => { console.log('destroy 101'); if (wsCallComponents) wsCallComponents.delete(myWsCallback) });

	async function myWsCallback(m) {
		if (m.op=="notif" && m.fromPseudo==pseudo && epiqStep==2) {
			epiqStep=3;
			newInfoPopup("Voila !","tu peux maintenant fermer cette popup, puis la fenêtre de chat et continuer");
		}
	}

	////////////////////////////////////////////
	// Gestion de l'épique
	////////////////////////////////////////////
	let epiqStep = loadIt("P300_epiqStep", 0);
	$: storeIt("P300_epiqStep",epiqStep);
	
</script>

<style>
</style>

<input type="button" value="Recommencer le Lore" on:click={() => epiqStep=0} />
{#if epiqStep==0}
	<div class="reveal">
		Etape 1/x
		<br/>
		Bienvenue dans le challenge d'accueil de ce nouvel événement, l'Uchonie.
		<br/>
		Ce challenge d'accueil te permettra de découvrir quelques une de mes nouvelles fonctions, de vérifier les TPs...
		<br/>
		<Epiq bind:step={epiqStep} oui=1 ouiVal="Suivant" ouiMsg="Petit rappel de la vidéo d'introduction..." ouiVideo="ff-3-templiers"	/>
	</div>
{/if}
{#if epiqStep==1}
	<div class="reveal">
		Etape 2/x
		<br/>
		(blabla du lore de l'event)
		<br/>
		Quand ce sera fait, clique sur "Ok" 
		<br/>
		<Epiq bind:step={epiqStep} oui=2 ouiVal="Ok" />
	</div>
{/if}
{#if epiqStep==2}
	<div class="reveal">
		Etape 3/
		<br/>
		Pendant cet événement, indiquer un élément à un autre participant sera parfois nécessaire.
		<br/>
		Tu peux envoyer un message à tous les participants connectés en cliquant sur l'indicateur "multijoueurs"
		dans le bandeau en haut.
		<br/>
		<u>Ton pseudo et l'indicateur "multijoueurs" doivent toujours être verts</u>
		<br/>
		Cela indique que tu es bien identifié par le serveur de jeu et connecté
		en temps réel au serveur de synchronisation multijoueurs.
		<br/>
		Envoie un premier message pour passer à la suite en cliquant sur "multijoueurs". 
	</div>
{/if}
{#if epiqStep==3}
	<div class="reveal">
		Etape 4/
		<br/>
		Quand ce sera fait, clique sur "Ok" 
		<br/>
		<Epiq bind:step={epiqStep} oui=4 />
	</div>
{/if}
{#if epiqStep==4}
	<div class="reveal">
		Etape 5/
		<br/>
		Enfin, pour valider ta participation à ce challenge, laisse un message avec le mot "Uchronie"
		sur le livre de correspondance de ma chambre: C'est la chambre #9 (Oracle des Savoirs)
		de la maison de cl de Kikiadoc (Moogle, Brumée, secteur 19, slot 5).
		<br/>
		Le plus rapide est de te TP via la liste d'amis IG.
		Si ce n'est pas encore le cas, demande Kikiadoc Lepetiot (Moogle) en ami.
		<br/>
		<u>Attention, laisser un message validera ta participartion et donc les gils associés</u>
		<br/>
		Quand ce sera fait, tu auras terminé la quête initiatique de l'Uchronie
		<br/>
		<Epiq bind:step={epiqStep} oui=5 ouiVal="J'ai laissé un message" 
			bind:page={page} bind:pageDone={pageDone} ouiPageDone={pageNumber} ouiHautFait="uchronieInitiatique"	/>
	</div>
{/if}
{#if epiqStep==5}
	<div class="reveal">
		Etape 6/6
		<br/>
		Si tu as bien indiqué un message avec le mot "Uchronie" sur mon livre de correspondance,
		alors tu as terminé la quête initiatique de l'événement.
		<br/>
		<Epiq bind:step={epiqStep} oui=5 ouiVal="Je confirme" 
			bind:page={page} bind:pageDone={pageDone} ouiPageDone={pageNumber} ouiPage=0 ouiHautFait="uchronieInitiatique" />
	</div>
{/if}
<!-- P300.svelte -->

