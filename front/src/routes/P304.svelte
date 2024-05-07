<script>
	import { onMount, onDestroy  } from 'svelte';
	import { loadIt, storeIt, apiCall, addNotification, jjhhmm } from './storage.js';
	import Epiq from './Epiq.svelte';
	import Uch from './Uch.svelte';

	export let wsCallComponents;
	export let pseudo;
	export let page;
	export let pageDone = [];
	export let pageDesc = null;

	const pageEpiqLbl = "P"+pageDesc.n + "_epiqStepObj" + pageDesc.phase

	onMount(() => { if (wsCallComponents) wsCallComponents.add(myWsCallback) });
	onDestroy(() => { if (wsCallComponents) wsCallComponents.delete(myWsCallback) });

	async function myWsCallback(m) {
	}

	let epiqState = loadIt(pageEpiqLbl,{step: 0});
	$: storeIt(pageEpiqLbl,epiqState); 

	//	niFruitNifleur: 5 fontaines/cascades, 2 cornouillers, 3 matsu-bonsai, 4 vase ahriman
	//	FruitNifleur: 4 pot d'oranger,
	//	NiFruitFleur: 1 jardinire bas-tonneau,2 table ronde féérique, 4 vase de fleurs, 
	//  2 cage ornées de fleurs, 6 jardinière pampa, 4 vasque de merca, 2 pot nosceen, 3 pots d'azalee
	//	4 jardinière roses, 14 rideaux lierre
	const epiqRoi=2;
	const epiqNbNiFruitNiFleur = 14;
	const epiqNbFruitNiFleur = 4;
	const epiqNbNiFruitFleur = 42;
	const epiqNbObjets = epiqNbNiFruitNiFleur+epiqNbFruitNiFleur+epiqNbNiFruitFleur;
	const bonneReponse = epiqRoi+"-"+epiqNbNiFruitNiFleur+"-"+epiqNbFruitNiFleur+"-"+epiqNbNiFruitFleur;
	
	let phraseReponse = "";
	
	const lblRoi = [
		{ l: "invalide", d: "invalide" },
		{ l: "à Gizeh", d: "en 2550 av. Eorzéa" },
		{ l: "à Ninive", d: "en 690 av. Eorzéa" },
		{ l: "à Versailles", d: "en 1682 d'Eorzéa" },
		{ l: "à Babylone", d: "en 580 av. Eorzéa" },
		{ l: "à Alexandrie", d: "en 295 av. Eorzéa" },
		{ l: "en Armorique", d: "en 50 av. Eorzéa" }
	];

	function validationStep1() {
		if (epiqState.zone==epiqZone && epiqState.secteur==epiqSecteur && epiqState.appart==epiqAppart) {
			newInfoPopup("Les Jardins !","Tu sembles avoir trouvé les Jardins Suspendus dans le temps présent","On passe à l'étape suivante");
			scrollTop();
			epiqState.step=2;
		}
		else {
			newInfoPopup("Jardins introuvables","Les jardins suspendus ne semblent pas se trouver à cet endroit","Cherche encore!");
		}
	}

	$: calculReponse(epiqState);
	
	function calculReponse(e) {
		phraseReponse = epiqState.roi+"-"+epiqState.niFruitNiFleur+"-"+epiqState.fruitNiFleur+"-"+epiqState.niFruitFleur;
	}

	async function geographeJardins() {
		let ret = await apiCall("/hautsFaits/geographeJardins","PUT");
		if (ret.status==201) addNotification("Médaille de Géographe des Jardins obtenue");
		if (ret.status==200) addNotification("Médaille de Géographe des Jardins déjà obtenue");
	}

	// affichage des resultats
	let dspResultats = false;
	async function calcResultats() {
		let ret = await apiCall("/hautsFaits/geographeJardins",'GET')
		if (ret.status !=200) return;
		// sync IHM
		dspResultats=ret.o
	}

	// liste des objets 
	let objVegetal = [
		{n:"jardinière bas-tonneau",l:"d02eae9fa84"},
		{n:"cornouiller domien",l:"13984c5e095"},
		{n:"pot d'oranger",l:"7d3c0517ba1"},
		{n:"cascade d'intérieur orientale",l:"4a02b3faeec"},
		{n:"fontaine d'intérieur orientale",l:"109647e2a33"},
		{n:"table ronde féérique",l:"78670b57339"},
		{n:"matsu-bonsaï",l:"19c22204182"},
		{n:"vase de fleurs en noyer",l:"887d665010b"},
		{n:"cage ornée de fleurs",l:"a1c07b3ac12"},
		{n:"jardinière pampa",l:"880b6690e4c"},
		{n:"vasque de mercadonies",l:"61f48edab3b"},
		{n:"pot de fleur nosceen (avec son contenu)",l:"8388c97b0fe"},
		{n:"pot d'azalées",l:"8ccfff041e6"},
		{n:"vase ahriman",l:"20a1a952079"},
		{n:"jardinière murale de roses",l:"d9a1a4cc6f3"},
		{n:"rideau de lierre.",l:"713dc1e9ed5"}
	]

	// selection actuelle
	const lblSelVegetal = "P"+pageDesc.n + "_selVegetal"
	let selVegetal = loadIt(lblSelVegetal,{n:[],t:[]})
	$: storeIt(lblSelVegetal,selVegetal);

</script>
<style>
	/* 
	input { width: 20%; font-size: 0.6em}
	select { width: 20%; font-size: 0.6em}
	*/
</style>

<Uch fullDisplay=0 wsCallComponents={wsCallComponents} pseudo={pseudo} />

<div>
	<Epiq bind:step={epiqState.step} rst=0 rstVal="Réafficher le lore" />
	<input type="button" on:click={()=>calcResultats()} value="Voir les géographes"/>
</div>
	
{#if epiqState.step==0}
	<div class="reveal">
		{pseudo},
		<a target="_blank" href="https://fr.wikipedia.org/wiki/Jardins_suspendus_de_Babylone">les Jardins Suspendus</a>
		sont l'une des sept merveilles du monde que l'on croyait disparue.
		<br/>
		Les premiers Aventuriers de l'Uchronie, lors du mini-jeu "les Jardins Suspendus", ont confirmé 
		leur existence dans le temps présent, et ont déterminé que les Jardins étaient
		localisés en Eorzéa, dans le monde Moogle, appartement 67, secteur 24, à Lavandière.
		<br/>
		En continuant d'étudier le Grand Grimoire de la Magie récupéré en Camelot,
		je sais que la disparition des Jardins n'est pas le fait de l'usure du temps
		mais un effet de la Magie Maléfique.
		Cela pourrait transformer toute la géographie d'Eorzéa jusqu'en faire disparaire les reflets!
		<br/>
		<Epiq bind:step={epiqState.step} oui=1 ouiVal="Alors, il faut renvoyer les Jardins dans le passé"/>
	</div>
{/if}
		
{#if epiqState.step==1}
	<div class="reveal">
		<img style="float:right; width:25%" alt="jardins" src="https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/jardins.png"/>
		<div>
			Tu as compris, {pseudo}.
			<br/>
			Pour la survie d'Eorzéa, il faut replacer dans l'Histoire
			les victimes de l'Uchronie et tous les lieux déracinés.
			<br/>
			Pour celà, incanter le sort de Restauration du Temps, bientôt je devrai.
			<br/>
			Mais je ne maîtrise pas encore le calibrage spatial et temporel nécessaire à cette incantation.
			<br/>
			<a target ="_blank" href="https://www.nationalgeographic.fr/histoire/2020/07/les-jardins-suspendus-de-babylone-la-plus-mysterieuse-des-sept-merveilles-du-monde">
				Les Peluches Archéologues débattent aujourd'hui de la localisation des Jardins Suspendus dans le Passé.
			</a>
			<br/>
			Aussi, j'ai besoin d'informations complémentaires.
			<br/>
			Franchis la porte des Jardins Suspendus du temps présent et indique-moi
			qui est présent dans les Jardins.
			<br/>
			<i style="font-size:0.8em">
			Si tu n'as pas noté l'emplacement des Jardins Suspendus dans le temps présent, réaffiche le lore, 
			Si le nom des mannequins ne s'affichent pas, modifie tes options IG.
			</i>
			<br/>
			<select bind:value={epiqState.roi}>
				<option value=""></option>
				<option value="1">Le pharaon Khéops</option>
				<option value="2">Le roi Sennachérib</option>
				<option value="3">Le roi Louis XIV</option>
				<option value="4">Le roi Nabuchodonosor II</option>
				<option value="5">Le roi Ptolémée I</option>
				<option value="6">Le chef Abraracourcix</option>
			</select>
			{#if epiqState.roi}
				<br/>
				Selon tes informations, je dois renvoyer les Jardins Suspendus
				<u>{lblRoi[epiqState.roi].l}</u> {lblRoi[epiqState.roi].d} ?
				<br/>
				<Epiq bind:step={epiqState.step} oui=3 ouiVal="Oui, c'est cà" ouiMsg="Si tu changes d'avis, tu peux réafficher le lore et modifier tes choix"/>
			{/if}
		</div>
		<div style="clear:both">&nbsp; </div>
	</div>
{/if}

{#if epiqState.step==3}
	<div class="reveal">
		Tu m'as indiqué qu'il me faudra envoyer les Jardins {lblRoi[epiqState.roi].l} {lblRoi[epiqState.roi].d}.
		<br/>
		Cela devrait me permettre de définir le calibrage temporel.
		<div class="br"/>
		Connaitre le périmètre exact des jardins est pour moi
		le meilleur moyen de definir le calibrage spatial.
		<div class="br"/>
		Le Grand Grimoire des Savoirs indique que les Jardins Suspendus comportent {epiqNbObjets}
		objets de nature végétale.
		Selon qu'ils ont des fleurs, des fruits ou seulement des feuilles,
		cela impacte ma calibration spatiale.
		<br/>
		J'ai identifié {objVegetal.length} types d'objets comportant des feuilles.
		Ils sont donc de nature végétale même si pour certains cela n'est pas évident.
		<div class="br"/>
		Voici la liste que tu peux annoter au fil de ton exploration.
		<u>
			Mais j'ai tellement de chose à faire que je ne ferai pas les calculs pour toi
			et tu devras indiquer les résultats après cette liste.
		</u>
		<div style="font-size:0.8em">
			<i>
				Les objets peuvent être n'importe où dans l'appartement.
				Ils ne sont pas cachés, mais parfois seule la majeure partie supérieure est visible.
				Parfois, les fleurs ne sont pas très visibles, comme pour le rideau de lierre mural.
			</i>
		</div>
		<hr />
		<div style="font-size: 0.8em">
			{#each objVegetal as o, i}
				<div style="display: inline-block" class="adminCadre">
					<a target="_blank" href="https://fr.finalfantasyxiv.com/lodestone/playguide/db/item/{o.l}">
						{o.n}
					</a>
					<br/>
					<input bind:value={selVegetal.n[i]} type="number" placeholder="0,1,2..." maxlength=3 min=0 max=60 style="width:5em"/>
					<select bind:value={selVegetal.t[i]}>
						<option>Choisir...</option>
						<option>avec fruits</option>
						<option>avec fleurs</option>
						<option>ni fruits ni fleurs</option>
					</select>
				</div>
			{/each}
			<hr />
		</div>
		<div class="br"/>
		Explore les Jardins Suspendus à la recherche de ces 60 objets et
		indique moi leur nombre selon les catégories suivantes:
		<br/>
		Combien n'ont ni fruit ni fleur, seulement des feuilles ?
		<br/>
		<input bind:value={epiqState.niFruitNiFleur} type="number" min=0 max=50 placeholder="Ni fleur ni fruit" />
		<br/>
		Combien ont des fruits (et pas de fleur) ?
		<br/>
		<input bind:value={epiqState.fruitNiFleur} type="number" min=0 max=50 placeholder="Fruits sans fleur" />
		<br/>
		Combien ont des fleurs (et pas de fruits) ?
		<br/>
		<input bind:value={epiqState.niFruitFleur} type="number" min=0 max=50 placeholder="Fleurs sans fruit" />
		<br/>
		{#if epiqState.niFruitNiFleur + epiqState.fruitNiFleur + epiqState.niFruitFleur != epiqNbObjets }
			<span style="color:red">
				Il faut répartir les {epiqNbObjets} objets selon les 3 catégories.
			</span>
		{:else}
			<span style="color:lightgreen">
				Tu as proposé une répartition des {epiqNbObjets} objets de nature végétale.
			</span>
			<br/>
			<Epiq bind:step={epiqState.step} oui=4 ouiVal="Je confirme la répartition" ouiFct={geographeJardins} />
		{/if}
	</div>
{/if}

{#if epiqState.step==4}
	<div class="reveal">
		{pseudo}, j'ai vu ta proposition, et à ce titre, tu as obtenu la médaille de Géographe des Jardins.
		<br/>
		{#if epiqState.roi!=2}
			<div class="blinkMsg">
				Mais je ne perçois aucune aura temporelle liée à ta proposition temporelle
				({lblRoi[epiqState.roi].l} {lblRoi[epiqState.roi].d}). 
			</div>
		{:else if phraseReponse!=bonneReponse}
			<div class="blinkMsg">
				Mais le Grand Grimoire de la Magie ne semble pas réceptif à la répartition
				que tu m'as indiqué pour les plantes.
			</div>
		{/if}
		{#if phraseReponse==bonneReponse }
			<div>
				<u>Ta proposition est parfaite</u>.
				<br/>
				Le Grand Grimoire de la Magie a été totalement réceptif à tes informations.
				Je vais calibrer les coeffients temporels et spatiaux
				de la Restauration du Temps selon tes indications.
				N'oublie pas d'indiquer {phraseReponse} sur le livre de correspondance des Jardins Suspendus
				pour valider ta réponse.
			</div>
			<Epiq bind:step={epiqState.step} oui=5 ouiVal="J'ai indiqué {phraseReponse} sur le livre" />
		{:else}
			<div>
				Ce n'est donc pas la meilleure proposition.
				Tu peux indiquer {phraseReponse} sur le livre de correspondance des Jardins Suspendus
				pour valider ta réponse. Tu pourras réafficher le lore pour parfaire ta proposition.
			</div>
			<Epiq bind:step={epiqState.step}
				oui=1 ouiVal="J'ai indiqué {phraseReponse} sur le livre et je refais une proposition"
				non=5 nonVal="J'ai indiqué {phraseReponse} sur le livre et je reviendrai plus tard" />
			<br/>
		{/if}
	</div>
{/if}

{#if epiqState.step==5}
	<div class="reveal">
		{pseudo}, tu as terminé ce challenge.
		<br/>
		Si tu partages tes propositions avec des amis, n'oublie pas qu'ils doivent aussi obtenir la médaille de Géographe des Jardins
		ET écrire la réponse sur le livre pour participer à la répartition des gains.
		<br/>
		<Epiq bind:step={epiqState.step} oui=5 ouiVal="Merci Grande Peluche"
					bind:page={page} bind:pageDone={pageDone} ouiPageDone={pageDesc.n} ouiPage=0 />
	</div>
{/if}

{#if dspResultats}
	{@const tblPseudos = Object.keys(dspResultats.pseudos) }
	<div class="popupCadre stars">
		<div class="close" on:click={() => dspResultats=false} on:keypress={null} role="button" tabindex=0>X</div>
		<div class="popupZone">
			<div class="popupContent" >
				<div>Géographes des Jardins:</div>
				<div style="font-size:0.8em">
					Les gains seront répartis entre les géographes au prorata d'un coef 1 ou 6:
					1 au titre de la participation et 5 de plus si la répartition est parfaite.
				</div>
				<div>Géographes des Jardins:</div>
				{#each tblPseudos as iPseudo, i}
					<div style="font-size:0.8em">
						{iPseudo} ({jjhhmm(dspResultats.pseudos[iPseudo].dth)})
					</div>
				{/each}
			</div>
		</div>
	</div>
{/if}


<!-- P304.svelte -->

