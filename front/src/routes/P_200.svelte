<script>
	import { onMount, onDestroy, tick  } from 'svelte';
	import { loadIt, storeIt } from './storage.js';
	import Epiq from './Epiq.svelte';
	
	export let wsCallComponents; 
	export let pseudo;
	export let page;
	
	onMount(() => { 
		console.log('mount 200');
		if (wsCallComponents) wsCallComponents.add(myWsCallback);
	});
	onDestroy(() => {
		console.log('destroy 200');
		if (wsCallComponents) wsCallComponents.delete(myWsCallback);
	});

	
	function myWsCallback(m) {
	}


	////////////////////////////////////////////
	// Gestion de l'épique
	////////////////////////////////////////////
	let epiqStep = loadIt("P200_epiqStep", 0);
	$: storeIt("P200_epiqStep",epiqStep);

	
</script>

<style>

</style>

<h3>
	Bienvenue {pseudo}
</h3>
<div>
	Participer au challenge de rapidité de la Transition Magique n'est pas si simple...
</div>
<div class="explication">
	{#if epiqStep<1}
		<div class="spacer" id="P200_0" />
		<div class="reveal">
			Des phénomènes inexpliqués se produisent en Eorzéa depuis que
			les Quatre (Hikaru, Robin, Luke et Anakin) sont partis explorer
			la 5ème dimension en utilisant le Chonogyre.
			<br/>
			tu t'en souviens ? 
			<br/>
			<Epiq bind:step={epiqStep} rst=0 oui=1 non=1 toId="P200_1"
				ouiVideo="ff-5-trailer" ouiMsg="Bon, tu mérites un petit refresh quand même" 
				nonVideo="ff-5-trailer" nonMsg="Bon, tu mérites un petit refresh"
				trailer="Ferme ce popup et la vidéo pour continuer"
			/>
		</div>
	{/if}
	{#if epiqStep==1}
		<div class="spacer" id="P200_1" />
		<div class="reveal">
			Je viens de recevoir un parchemin des Quatre via le Chronogyre et aucun glyphe n'est visible.
			Il est actuellement scellé et je n'ose l'ouvrir car je sais que dès qu'il sera ouvert,
			nous n'aurons que très peu de temps pour en trouver la signification.
			Il semblerai que le contenu de ce parchemin
			ne puisse se révéler qu'a la croisée des deux dimensions temporelles!
			<br/>
			J'ai ainsi compris que je ne peux lire seule ce message car il faut croiser les deux dimensions temporelles ! 
			<br/>
			Tu me suis ?
			<br/>
			<Epiq bind:step={epiqStep} rst=0 oui=2 non=2 toId="P200_2"
				ouiMsg="Je n'en suis pas certaine, mais bon.. je te fais confiance!"
				nonMsg="Ca ne m'étonne pas, mais comme je t'aime bien, on va continuer"
			/>
		</div>
	{/if}
	{#if epiqStep==2}
		<div class="spacer" id="P200_2" />
		<div class="reveal">
			Pour identifier le message inscrit sur le parchemin, il faut que tu me proposes des lettres
			dans la temporalité classique et
			que je détecte d'éventuelles Harmoniques de la lettre dans l'Ortho-temps.
			Si c'est le cas, alors je croiserai
			les flux éthérés entre les deux temporalités pour matérialiser une lettre sur le parchemin.
			<br/>
			C'est clair ? 
			<br/>
			<Epiq bind:step={epiqStep} rst=0 oui=3 non=3 toId="P200_3"
			ouiMsg="Ok, mais je perçois la noobitude t'envahir, alors je vais te détailler le processus quand même"
			nonMsg="Ca ne m'étonne pas, je vais donc te détailler le processus"
			/>
		</div>
	{/if}
	{#if epiqStep==3}
		<div class="spacer" id="P200_3" />
		<div class="reveal">
			Alors, pour t'expliquer simplement, le parchemin comporte plusieurs phrases composant le message des Quatre.
			<br/>
			<b><u>Il faut que tu me proposes des lettres, une par une, afin de reconstituer, phrases après phrases, le message des Quatre.</u></b>
			<br/>
			Mais il faut aller très vite, c'est pourquoi, dès que j'aurai brisé le scellé du parchemin, toi et tes amis pourront me
			proposer des lettres et je vérifirai alors leur pertinence dans l'Ortho-temps. Elles apparaitront alors sur le parchemin.
			<br/>
			Ha oui, j'ai oublié de te dire que, comme il faut identifier les phrases du parchemin au plus vite,
			j'ai invité tout le monde à participer dès que je vais ouvrir le parchemin !
			<u>Toi et tes amis serez compétiteurs pour proposer des lettres !</u>
			C'est pourquoi c'est un challenge de rapidité
			<br/>
			Tu me suis toujours ?
			<br/>
			<Epiq bind:step={epiqStep} rst=0 oui=4 non=4 toId="P200_4"
				ouiMsg="Je savais que je pouvais compter sur toi"
				nonMsg="Pff, faudra que tu m'indiques des lettres en cliquant, c'est tout!!!"
			/>
		</div>
	{/if}
	{#if epiqStep==4}
		<div class="spacer" id="P200_4" />
		<div  class="reveal">
			Et il faut savoir que la plupart des claviers d'Eorzéa ont été enchantés, même le mien !!
			Je n'en connais pas la cause, mais c'est perturbant pour communiquer car les touches changent de
			façon aléatoire! Peut-être que le message des Quatre nous éclairera sur ce qui se passe...
			<br/>
			Tu as tout compris, on peut y aller ?
			<br/>
			<Epiq bind:step={epiqStep} oui=5 non=5 rst=0 toId="P200_5"
				ouiMsg="Ha j'oubliai..."
				nonMsg="Tant pis pour toi, on y va... mais quelques derniers trucs..."
			/>
		</div>
	{/if}
	{#if epiqStep==5}
		<div class="spacer" id="P200_5" />
		<div class="reveal">
			<u>Encore quelques infos avant de commencer</u>
			<br/>
			Les touches du clavier ensorcelé changent toutes les 6 secondes
			<br/>
			Dès que tu cliques une touche du clavier ensorcelé, il n'est plus utilisable pendant 6 secondes.
			<br/>
			Tu peux te familiariser avec le fonctionnement du clavier ensorcelé avant le début du challenge.
			<br/>
			Et plusieurs phrases composent le message des Quatre...
			<br/>
			Tu as tout compris, je peux afficher l'interface de décryptage du message des Quatre ?
			<br/>
			<Epiq bind:step={epiqStep} bind:page={page} oui=5 non=5 rst=0 ouiPage=201
				nonMsg="Je ne sais pas quoi te dire de plus..."
			/>
		</div>
	{/if}
</div>
		

