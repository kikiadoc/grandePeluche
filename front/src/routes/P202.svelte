<script>
	import { onMount, onDestroy, tick  } from 'svelte';
	import { loadIt, storeIt } from './storage.js';
	import Epiq from './Epiq.svelte';

	export let wsCallComponents;
	export let pseudo;
	export let page;
	export let pageDone;

	onMount(() => {
					console.log('mount',page);
					if (wsCallComponents) wsCallComponents.add(myWsCallback);
	});
	onDestroy(() => {
					console.log('destroy',page);
					if (wsCallComponents) wsCallComponents.delete(myWsCallback);
	});

	function myWsCallback(m) {
	}

	////////////////////////////////////////////
	// Gestion de l'épique
	////////////////////////////////////////////
	let epiqStep = loadIt("P202_epiqStep", 0);
	$: storeIt("P202_epiqStep",epiqStep);

</script>

<style>
	.titreEpique {color:red; text-decoration: underline; }
</style>

<div class="explication">
	{#if epiqStep==0}
		<div class="reveal">
			<span class="titreEpique">Initiatique de Brocéliande 1/6</span>
			<br/>
			Bienvenue {pseudo},
			<br/>
		  Moi, la Grande Peluche Oracle des Savoirs,
			j'ai été très perturbée par le message des Quatre,
			en particulier par le passage suivant:
			<div><i> 
				Hikaru a appelé ce phénomène l'Uchronie, Luke l'a appelé la Magie
			</i></div>
			Par le passé, les Compagnons de l'Ascension ont affronté la Grande Menace.
			<br/>
			Utilisant Savoirs, Pouvoirs, et respectant les Valeurs, ils ont aidé Anakin et Luke à la neutraliser
			en bloquant sa Magie Maléfique.
			<br/>
			Tu t'en souviens ?
			<br/>
			<Epiq bind:step={epiqStep} rst=0 oui=1 non=0
					ouiMsg="Si tu souhaites un petit refresh, tu pourras toujours recommencer cette quête initiatique"
					nonVideo="ff-4-trailer"
					trailer="Ferme ce popup pour continuer"
					bind:pageDone={pageDone} rstPageDone=202
			/>
		</div> 
	{/if}
	{#if epiqStep==1}
		<div class="reveal">
			<span class="titreEpique">Initiatique de Brocéliande 2/6</span>
			<br/>
			Lors de toutes nos précédentes aventures, l'axe des Temps était immutable, les Savoirs s'opposaient frontalement à la Magie Maléfique...
			<br/>
			Mais Hikaru mentionne l'Uchronie...
			<br/>
			Que pourrait-il se passer si la Magie permettait de modifier le Passé ?
			<br/>
			Tu as une idée ?
			<br/>
			<Epiq bind:step={epiqStep} rst=0 oui=1 non=2 
				ouiMsg={["MYTHO!!",
				"Ton savoir de la Magie se limite à celui d'un poisson-rouge",
				"Les Peluches ont toujours exploré les Sciences et non la Théologie ou la Magie",
				"Regarde comment les Maîtres Jedi des Savoirs ont permis l'extension de la matrice des Dimensions" ]}
				ouiVideo="ff-5-trailer"
			/>
		</div>
	{/if}
	{#if epiqStep==2}
		<div class="reveal">
			<span class="titreEpique">Initiatique de Brocéliande 3/6</span>
			<br/>
			Moi non plus, je ne sais encore rien de la conjonction de la Magie et de l'Uchronie.
			Je n'ai rien trouvé dans le Grand Grimoire des Savoirs à ce sujet.
			<br/>
			Après la neutralisation de la Grande Menace par Anakin, Luke et les Compagnons de l'Ascension,
			la Magie a longtemps été contenue dans la partie nord-est de la forêt de Sombrelinceul,
			autour du chateau de Camelot, au delà des Terres Sylphes de la Forêt de l'Est.
			<br/>
			L'influence de Gandalf et de Merlin avait rendue la Magie bienveillante.
			<br/>
			Hélas, ce n'est plus le cas... Merlin est devenu un vieillard aux pouvoirs évanescents
			et Gandalf s'est rendu, il y a quelques temps déjà, dans la Conté pour quelques missions d'importance. 
			<br/>
			Aujourd'hui, toute la forêt est recouverte d'une brume magique très inquiétante,
			la même que l'on a connu lors de l'ère de la Magie, quand la forêt de Sombrelinceul s'appelait Brocéliande. 
			<br/>
			Je pense que c'est l'un des effets dont parlent les Quatre dans leur message.
			<br/>
			J'ai donc décidé d'envoyer ma première assistante, mon meilleur espion, ma fantasque transformiste,
			<a class="revealSimple" target="_blank" href="https://fr.wikipedia.org/wiki/Charles_d%27%C3%89on_de_Beaumont">
				le chevalier Charles d'Éon de Beaumont
			</a>
			en Camelot afin de s'enquérir de la Magie.
			<br/>
			Traverser la forêt de sombrelinceul, aujourd'hui recouverte par la 
			Magie ancestrale de Brocéliande,
			ne sera pas un voyage facile pour mon émissaire.
			<br/>
			Les Peluches Géographes ont envoyé des drones dans le ciel de Sombrelinceul pour analyser la forêt.
			<br/>
			De cette analyse, il ressort que la forêt peut être cartographiée selon 6x6 lieux,
			chacun recouvert par un type de magie de Brocéliande.
			<br/>
			<img style="width:95%" src="https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/Sombrelinceul-6x6.png" alt=""/>
			<br/>
			Mon émissaire devra partir du Bois Bandé au sud-ouest
			pour rejoindre le chateau de Camelot au nord-est.
			<br/>
			Je compte sur toi pour lui faciliter le voyage.
			<br/>
			<Epiq bind:step={epiqStep} rst=0 oui=3 non=3
					ouiVal="Tu peux compter sur moi"
					nonVal="Je n'ai rien compris"
					nonMsg="On va dire que tu as compris" 
			/>
		</div>
	{/if}
	{#if epiqStep==3}
		<div class="reveal">
			<span class="titreEpique">Initiatique de Brocéliande 4/6</span>
			<br/>
			Quand tu seras dans la salle de commandement,
			il te suffira de cliquer sur un lieu,
			n'importe lequel, pour en découvrir la magie et en permettre la traversée!
			<br/>
			Sur un lieu découvert, des flèches indiqueront les déplacements possibles de mon émissaire:
			Il ne pourra aller vers le nord, l'ouest, l'est ou le sud d'un lieu découvert
			que selon la Magie de ce lieu.
			<br/>
			Toi et les autres Explorateurs de Brocéliande devrez découvrir suffisamment de lieux de la forêt
			afin d'identifier un itinéraire
			que mon émissaire pourra alors emprunter et se rendre en Camelot!
			<br/>
			<br/>
			Selon la Magie du lieu que tu découvriras, ta progression sera différente:
			<br/>
			<br/>
			<div>
				<img style="width:20%; float:right " src="https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/iconCoffre.png" alt=""/>
				Si, en découvrant un lieu, tu trouves un coffre magique, alors c'est cool...
				tu ne devras pas te reposer et pourras tout de suite explorer un nouveau lieu.
			</div>
			<br/>
			<div style="clear: both">
				<img style="width:20%; float:right " src="https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/iconMonstre.png" alt=""/>
				Si le lieu est protégé par un monstre, tu auras découvert la zone, mais
				toi ou un autre Explorateur de Brocéliande devra résoudre l'énigme pour l'appaiser et permettre le passage par ce lieu.
				Tu devras te reposer quelques heures, mais tu pourras tout de suite tenter de résoudre l'énigme.
				<u>Toutes les énigmes ont leur réponse dans la forêt de Sombrelinceul</u>
			</div>
			<br/>
			<div style="clear: both">
				<img style="width:20%; float:right " src="https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/iconPiege.png" alt=""/>
				Si le lieu est piègé, alors
				tu ne pourras reprendre ton exploration qu'après la cicatrisation de tes blessures et un grand repos.
				Mais le lieu sera découvert!
			</div>
			<br/>
			<div style="clear: both">
				<img style="width:20%; float:right " src="https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/iconArbre.png" alt=""/>
				Si le lieu est simplement de la verdure, un enchevêtrement de ronces ou des arbres majestueux,
				tu pourras reprendre ton exploration après quelques heures de repos.
			</div>
			<br/>
			<div style="clear: both">
				<img style="width:20%; float:right " src="https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/iconJeton.png" alt=""/>
				Enfin, il y un type de lieu très particulier: le distributeur de jetons de Camelot.
				Après avoir découvert un tel lieu, tu devras quand meme te reposer quelques heures
				mais tu pourras récuperer un jeton gratuit tout de suite en cliquant à nouveau sur ce lieu!
				<br/>
				<u>
					Tous les Explorateurs de Brocéliande pourront obtenir un jeton tous les jours en cliquant sur ce type de lieu,
					peu importe si c'est toi ou un autre Explorateur qui l'a découvert.
				</u>
			</div>
			<br/>
			<Epiq bind:step={epiqStep} rst=0 oui=4 non=2
					ouiVal="C'est clair"
					nonVal="Je n'ai rien compris"
					nonMsg="Bon, je vais répéter depuis le début"
			/>
		</div>
	{/if}
	{#if epiqStep==4}
		<div class="reveal">
			<span class="titreEpique">Initiatique de Brocéliande 5/6</span>
			<br/>
			<div style="clear: both">
			<img style="width:25%; float:right " src="https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/iconBunbuku.png" alt=""/>
			Enfin, mon emissaire suivra tes directives pour se rendre en Camelot.
			</div>
			En cliquant sur le lieu où il se trouve,
			tu pourras lui indiquer le lieu adjacent où il devra se déplacer, en respectant les directions possibles.
			<br/>
			S'il se retrouve dans un cul-de-sac ou dans une boucle infernale,
			tu pourras le téléporter à Bois Bandé
			afin qu'il recommence son périple vers Camelot.
			<br/>
			<br/>
			<u class="revealSimple">Tu ne peux déplacer mon émissaire qu'en utilisant DEUX Jetons de Camelot</u>
			<br/>
			Tu peux obtenir un jeton de Camelot en résolvant une énigme, en découvrant une zone avec un piège, un coffre
			ou en sollicitant un distributeur de jetons!
			<br/>
			Le don de jeton est possible entre Explorateurs connectés en cliquant sur l'icon jeton dans le bandeau supérieur
			<br/>
			Et n'oublie pas que tous les Explorateurs jouent en même temps que toi !
			<br/>
			<br/>
			<u>Il est facile de se tromper en guidant mon émissaire,</u>
			<br/>
				Avant de déplacer mon émissaire,
				détermine un itinéraire optimal vers Camelot ou
				suis celui indiqué par les autres Explorateurs de Brocéliande.
			<br/>
				Tu peux utiliser l'option "Marquer ce lieu..." pour partager avec les autres explorateurs
				les lieux de passages pertinents pour mener mon émissaire en Camelot.
			<br/>
				Si tu remarques une erreur dans l'itinéraire proposé,
				que ce soit une proposition de ta part ou celle d'un autre Explorateur de Brocéliande,
				tu peux utiliser l'option "Retirer ce lieu...".
			<br/>
			<u>
				En suivant un itinéraire clair et partagé, chacun pourra alors faire progresser mon émissaire sans erreur,
				en utilisant ses jetons de Camelot.
			</u>
			<br/>
			Ta priorité doit rester à la découverte des lieux, car ce sera principalement celà qui fera ton classement final
			<br/>
			<Epiq bind:step={epiqStep} rst=0 oui=5 non=2
					ouiVal="C'est clair"
					nonVal="Je n'ai rien compris"
					nonMsg="Bon, je vais répéter..."
			/>
		</div>
	{/if}
	{#if epiqStep==5}
		<div class="reveal">
			<span class="titreEpique">Initiatique de Brocéliande 6/6</span>
			<br/>
			Tes gains seront fonction des <u>lieux que tu auras découverts</u>, et dans une moindre mesure
			des <u>lieux pertinents que tu auras marqués en premier</u> pour permettre à mon émissaire de se rendre en Camelot.
			<br/>
			Attention à <u>ne pas marquer des lieux non pertinents (petit malus)</u>...
			<br/>
			Enfin, déplacer mon émissaire selon un itinéraire pour l'amener en Camelot n'augmentera pas tes gains,
			mais cela sera nécessaire pour valider le challenge.
			<br/>
			Tu peux maintenant découvrir la salle de commandement
			qui te permettra d'aider mon émissaire à rejoindre Camelot
			<br/>
			Tu pourras, à tout moment, vérifier l'avancement du challenge en cliquant sur le bouton
			"afficher l'avancement" en dessous de la carte.
			<br/>
			<Epiq bind:step={epiqStep} rst=0 oui=0
				ouiVal="Go salle de commandement" ouiPage=203 ouiPageDone=202 ouiHautFait="broceliandeInitiatique"
				bind:page={page} bind:pageDone={pageDone}
			/>
		</div>
	{/if}
</div>
<div class="spacer" />

