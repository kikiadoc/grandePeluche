<script>
	import { onMount, onDestroy  } from 'svelte';
	import { loadIt, storeIt, apiCall, urlImg, scrollTop } from './storage.js';
	import { playSound, playDing, newInfoPopup, addNotification, jjhhmm } from './storage.js';
	import Epiq from './Epiq.svelte';
	import Uch from './Uch.svelte';

	export let wsCallComponents;
	export let pseudo;
	export let page;
	export let pageDesc = null
	export let pageDone = [];


	const pageEpiqLbl = "P"+pageDesc.n + "_epiqStep"
	const pageEpiqChoix = "P"+pageDesc.n + "_choix"

	onMount(() => { 
		// if (wsCallComponents) wsCallComponents.add(myWsCallback);
	});
	onDestroy(() => {
		// if (wsCallComponents) wsCallComponents.delete(myWsCallback);
	});


	let step = loadIt(pageEpiqLbl,0);
	$: storeIt(pageEpiqLbl,step); 

	let filRouge = {}; // sera modifié par le composant Uch

	let choix = loadIt(pageEpiqChoix,{})
	$: storeIt(pageEpiqChoix,choix)
	let validated = {} // etapes validées

	const couleurs = ["","blanc","rouge","vert","bleu","violet","noir","jaune"]
	const zeroUnDeux = ["","0","1","2"]

	function updatedChoix(c) {
		validated = { };
		if (choix.p01==4 && choix.p02==4 && choix.p03==3 && choix.p04==5 && choix.p05==5 && choix.p06==3 && choix.p07==3 && choix.p08==5)
			validated.s1 = true;
		// pour le 11 pour éviter les soucis, bleu ou violet
		if ((choix.p11==4 || choix.p11==5) && choix.p12==7 && choix.p13==7 && choix.p14==3 && choix.p15==4)
			validated.s2 = true;
		if (choix.c1==1 && choix.c2==2 && choix.c3==1 && choix.c4==1 && choix.c5==2 && choix.c6==1 && choix.c7==3  )
			validated.s3 = true;
	}

	function valMaisonCl() {
		updatedChoix()
		if (validated.s1) {
			scrollTop()
			step=20
		}
		else {
			newInfoPopup("Vérifie les couleurs des cristaux",
									 "Je perçois une anomalie dans les couleurs tel que tu me l'indiques",
									 "ferme cette popup pour continuer",
									 { ding:"prout-long", back: "papier"}
									)
		}
	}
	
	function valEtherites() {
		updatedChoix()
		if (validated.s2) {
			scrollTop()
			step=30
		}
		else {
			newInfoPopup("Vérifie les couleurs des cristaux",
									 "Je perçois une anomalie dans les couleurs tel que tu me l'indiques",
									 "ferme cette popup pour continuer",
									 { ding:"prout-long", back: "papier"}
									)
		}
	}

	function valChambres() {
		updatedChoix()
		if (validated.s3) {
			setMineralogistes()
			scrollTop()
			step=40
		}
		else {
			newInfoPopup("Vérifie les couleurs des cristaux-jouvencelles",
									 "Je perçois une anomalie dans les couleurs tel que tu me l'indiques",
									 "ferme cette popup pour continuer",
									 { ding:"prout-long", back: "papier"}
									)
		}
	}

	async function setMineralogistes() {
		let ret = await apiCall("/hautsFaits/mineralogistes","PUT");
		if (ret.status==201) addNotification("Médaille de mineralogiste obtenue");
		if (ret.status==200) addNotification("Médaille de mineralogiste déjà obtenue");
	}

	// affichage des resultats
	let dspResultats = false;
	async function calcResultats() {
		let ret = await apiCall("/hautsFaits/mineralogistes",'GET')
		if (ret.status !=200) return;
		// sync IHM
		dspResultats=ret.o
	}
	

	
</script>
<style>
	
</style>
{#if pseudo.startsWith("Kikiadoc")}
	<div class="adminCadre">
		Admin:
	</div>
{/if}

<Uch bind:filRouge={filRouge} wsCallComponents={wsCallComponents} pseudo={pseudo} />

<div>
	<input type="button" on:click={()=> step=0} value="Réafficher le lore" />
	<input type="button" on:click={()=>calcResultats()} value="Voir les Minéralogistes"/>
</div>

{#if step == 0}
	<div class="reveal">
		{pseudo}, 
		selon ce que j'ai lu dans le Grand Grimoire de la Magie,
		le catalyseur ultime et nécessaire à la Restauration du Temps
		est le Cristal-Mère de l'Uchronie.
		Sans ce cristal, l'incantation ne peut réussir.
		Peux-tu m'aider à trouver le Cristal de l'Uchronie en Eorzéa ?
		<br/>
		<Epiq bind:step={step} oui=10 ouiVal="Bien sur!" />
	</div>
{/if}

{#if step == 10}
	<div class="reveal">
		<img src={urlImg+"ff-6-cristaux-entree.png"} alt="" style="width: 35%; float:right" />
		Dans la maison de CL de Kikiadoc, il y a des cristaux sur des espaliers juste avant l'entrée des chambres.
		<br/>
		Est-il possible de l'un d'entre eux soit un Cristal-Mère de l'Uchronie?
		<br/>
		Indique moi les couleurs des huit cristaux en partant du haut et jusqu'en bas.
		<table>
			<tr>
				<td><Epiq bind:step={choix.p01} selOpt={couleurs} /></td>
				<td><Epiq bind:step={choix.p02} selOpt={couleurs} /></td>
			</tr>
			<tr>
				<td><Epiq bind:step={choix.p03} selOpt={couleurs} /></td>
				<td><Epiq bind:step={choix.p04} selOpt={couleurs} /></td>
			</tr>
			<tr>
				<td><Epiq bind:step={choix.p05} selOpt={couleurs} /></td>
				<td><Epiq bind:step={choix.p06} selOpt={couleurs} /></td>
			</tr>
			<tr>
				<td><Epiq bind:step={choix.p07} selOpt={couleurs} /></td>
				<td><Epiq bind:step={choix.p08} selOpt={couleurs} /></td>
			</tr>
		</table>
		<div>
			<input type="button" on:click={()=>valMaisonCl()} value="Je pense que c'est ça" />
		</div>
		<br style="clear:both"/>
	</div>
{/if}

{#if step == 20}
	<div class="reveal">
		Merci {pseudo} de tes investigations.
		<br/>
		J'ai bien examiné tous les cristaux à l'entrée des Chambres de la maison de cl de Kikiadoc.
		<br/>
		Hélas, ce ne sont pas des Cristaux-Mères et encore moins le Cristal-Mère de l'Uchronie.
		<div class="br"/>
		Peut-être le trouveras-tu ailleurs dans Eorzéa?
		<br/>
		<u>Indiques moi la couleur de ce qui pourrait-être un cristal-mère dans ces différents lieux d'Eorzéa</u>:
		<div class="br"/>
		<!-- ressemble à ethérite abandonnée (noscéa occidentale 13.1 13.4) = couleur violet clair -->
		👉Il y a ce qui ressemble à une éthérite abandonnée un peu à l'ouest du Wharf des pillards en Noscéa.
		Quelle est sa couleur?
		<Epiq bind:step={choix.p11} selOpt={couleurs} />
		<div class="br"/>
		<!-- vers le sud, au dela de l'explorable, foret du nord, 16.4 32.4 = couleur jaune -->
		👉Dans la forêt de Sombrelinceul, à l'extrème sud de la falaise des Trouveurs,
		il est possible, en volant, de discerner des cristaux bien au delà de l'espace Explorable d'Eorzéa.
		Leur couleur est?
		<Epiq bind:step={choix.p12} selOpt={couleurs} />
		<div class="br"/>
		<!-- griffes de dalamud (thanalan septentrional 20.2 17.2) = couleur jaune -->
		👉Dans le Thanalan, quel est la couleur des concrétions des Griffes de Dalamud
		<Epiq bind:step={choix.p13} selOpt={couleurs} />
		<div class="br"/>
		<!-- ressemble à poincon vers le ciel (abalathia - azyz lya 25.0 28.37 couleur verte -->
		👉Au centre de la cathédrale d'Abalathia, il y a un cristal qu'il semble être une flèche dirigée vers le ciel.
		Quel est sa couleur?
		<Epiq bind:step={choix.p14} selOpt={couleurs} />
		<div class="br"/>
		<!-- thanalan occidental 6.8 4.6 couleur bleu -->
		👉A l'extrème ouest du Cap Vendouest en Thanalan, au delà de l'Explorable d'Eorzéa,
		Castrum Marinum semble contenir un cristal intérieur qui en illumine les fenêtres.
		Quelle est cette couleur?
		<Epiq bind:step={choix.p15} selOpt={couleurs} />
		<div class="br"/>
		<div>
			<input type="button" on:click={()=>valEtherites()} value="Grande Peluche, tu valides?" />
		</div>
	</div>
{/if}

{#if step == 30}
	<div class="reveal">
		Tes explorations, {pseudo}, sont parfaites.
		<br/>
		Mais aucun de ces cristaux ne ressemble au Cristal-Mère de l'Uchronie.
		<br/>
		Et il semble que la Magie Maléfique soit plus puissante que je ne l'imaginais...
		<br/>
		Ainsi je viens de découvrir que toutes tes recherches, passées ou futures, ne peuvent être que vaines.
		<br/>
		Je viens de décrypter un nouveau feuillet du Grand Grimoire de la magie et ce n'est pas de bon augure.
		<br/>
		<Epiq bind:step={step} oui=31 ouiVal="Et qu'indique-t-il?" ouiVideo="ff-6-cristal" />
	</div>
{/if}

{#if step == 31}
	<div class="reveal">
		<img src={urlImg+"cage.png"} alt="" style="width: 35%; float:right" />
		Tu l'as déjà compris, mon espoir réside en la possibilité d'utiliser des Cristaux-Jouvencelles
		de la même couleur que le Cristal-Mère de l'Uchronie lors de l'invocation de
		la Restauration du Temps.
		<div class="br"/>
		Les Peluches Jardinières élèvent des Cristaux-Jouvencelles au
		milieu de belles-de-jours	dans des pots de culture.
		<div class="br"/>
		C'est pour mieux les protéger.
		<br />
		Indétectable derrière une épaisse toison de fleurs de même couleur,
		chaque cristal peut alors se développer sereinement.
		<br />
		Ainsi, dans chacun de lieux-élus des Peluches Jardinières, derrière chaque toison de belles-de-jours,
		un Cristal-Jouvencelle se cache. 
		<br/>
		Parmi les lieux-élus, il y a nombre de chambres de la maison de CL de Kikiadoc.
		Et dans chacun de ces lieux-élus, il y a deux pots de culture.
		<br/>
		Combien de Cristaux-Jouvencelles de la bonne couleur y sont dissimulés?
		<table>
		<!-- lexplorateur - le labyrinthe - -->
		<!-- jaune - vert -->
		<tr><td>Le Labyrinthe:</td><td><Epiq bind:step={choix.c1} selOpt={zeroUnDeux} /></td></tr>
		<!-- lestockeur - chambre du temps - -->
		<!-- bleus - violet -->
		<tr><td>La chambre du Temps:</td><td><Epiq bind:step={choix.c2} selOpt={zeroUnDeux} /></td></tr>
		<!-- lemignon - le pont de l'enterprise - -->
		<!-- orange - rouge -->
		<tr><td>Le Pont de l'Enterprise:</td><td><Epiq bind:step={choix.c3} selOpt={zeroUnDeux} /></td></tr>
		<!-- lebogosse - le 4ème pouvoir - -->
		<!-- rouge - orange -->
		<tr><td>La chambre du 4ème pouvoir:</td><td><Epiq bind:step={choix.c4} selOpt={zeroUnDeux} /></td></tr>
		<!-- lecalin - la force - -->
		<!-- Violet - vert -->			
		<tr><td>La chambre de la Force:</td><td><Epiq bind:step={choix.c5} selOpt={zeroUnDeux} /></td></tr>
		<!-- lejoligarcon - Oracle des Savoirs - -->
		<!-- ??? - vert -->
		<tr><td>L'Oracle des Savoirs:</td><td><Epiq bind:step={choix.c6} selOpt={zeroUnDeux} /></td></tr>
		<!-- lecoquin - EX gravitation!!! - -->
		<!-- ??? - ??? -->
		<tr><td>Le Dirac des Dimensions</td><td><Epiq bind:step={choix.c7} selOpt={zeroUnDeux} /></td></tr>
		</table>
		<Epiq bind:step={step} oui=31 ouiVal="Puis-je revoir la vidéo?" ouiVideo="ff-6-cristal"	/>
		<input type="button" on:click={()=>valChambres()} value="Grande Peluche, tu valides?" />
	</div>
{/if}

{#if step == 40}
	<div class="reveal">
		Merci de toutes ces explorations et informations {pseudo}.
		<br/>
		Tu as rejoint le club des Minéralogistes de l'Uchronie.
		<div class="br"/>
		Avec ces différents Cristaux-Jouvencelles violets, je pense disposer de
		tous les catalyseurs me permettant d'invoquer
		prochainement la Restauration du Temps.
		<br/>
		<Epiq bind:step={step} bind:page={page} bind:pageDone={pageDone} oui=40 ouiPage=0 ouiPageDone={pageDesc.n} ouiVal="Merci Grande Peluche" />
	</div>
{/if}

{#if dspResultats}
	{@const tblPseudos = Object.keys(dspResultats.pseudos) }
	<div class="popupCadre stars">
		<div class="close" on:click={() => dspResultats=false} on:keypress={null} role="button" tabindex=0>X</div>
		<div class="popupZone">
			<div class="popupContent" >
				<div>Le cristal de l'Uchronie</div>
				<div>Liste des experts en Minéralogie</div>
				{#each tblPseudos as iPseudo, i}
					<div style="font-size:0.8em">
						{iPseudo} ({jjhhmm(dspResultats.pseudos[iPseudo].dth)})
					</div>
				{/each}
			</div>
		</div>
	</div>
{/if}



{#if step == 999}
	<div class="reveal">
		Identifier la couleur des aggregats à l'entrée des chambres --> donne localisation de l'étape 1
		stèle de retour à la mer (noscea occidentale 18.4 15.6) --> couleur rouge
		ressemble à ethérite abandonnée (noscéa occidentale 13.1 13.4) --> couleur violet clair
		couleur des griffes de dalamud dans les griffes de dalamud (thanalan septentrional) --> couleur jaune
		--> donne le lieu 
		
		
		alors que Kikiadoc a avait fait une collection de peluche dans le temps présents,
		La Grande Peluche Cuisinère avait copier cette collection dans son Laboratoire Culinaire
		Mais alors qu'lle préparait les conposants, il semble que l'ordre de cette collection indique
		une pertubation dans les coordonnées spaciales.
		
		<br/>
		<Epiq bind:step={step} oui=1 ouiVal="???" />
	</div>
{/if}

<!-- p306.svelte -->

