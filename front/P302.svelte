<script>
	import { onMount, onDestroy  } from 'svelte';
	import { loadIt, storeIt, apiCall, addNotification } from './storage.js';
	import Epiq from './Epiq.svelte';
	import Uch from './Uch.svelte';

	export let wsCallComponents;
	export let pseudo;
	export let page;
	export let pageDone = [];

	onMount(() => { console.log('mount 302'); if (wsCallComponents) wsCallComponents.add(myWsCallback) });
	onDestroy(() => { console.log('destroy 302'); if (wsCallComponents) wsCallComponents.delete(myWsCallback) });

	async function myWsCallback(m) {
	}

	let epiqState = loadIt("P302_epiqState",{step: 0});
	$: storeIt("P302_epiqState",epiqState); 

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
		{ l: "à Gizeh", d: "en 2550 av. JC" },
		{ l: "à Ninive", d: "en 690 av. JC" },
		{ l: "à Versailles", d: "en 1682" },
		{ l: "à Babylone", d: "en 580 av. JC" },
		{ l: "à Alexandrie", d: "en 295 av. JC" },
		{ l: "en Armorique", d: "en 50 av. JC" }
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
	
</script>
<style>
	input { width: 20%; font-size: 0.6em}
	select { width: 20%; font-size: 0.6em}
</style>

<Uch fullDisplay=0 wsCallComponents={wsCallComponents} pseudo={pseudo} />

{#if epiqState.step!=0}
	<div>
		<Epiq bind:step={epiqState.step} rst=0 rstVal="Recommencer le challenge" />
	</div>
{/if}
	
{#if epiqState.step==0}
	<div class="reveal">
		{pseudo}, merci de ta visite.
		<br/>
		<a target="_blank" href="https://fr.wikipedia.org/wiki/Jardins_suspendus_de_Babylone">Les Jardins Suspendus</a>
		sont l'une des sept merveilles du monde que l'on croyait disparue.
		<br/>
		Les permiers Aventuriers de l'Uchronie, lors du mini-jeu "les Jardins Suspendus", ont confirmé 
		leur existence dans le temps présent, et ont déterminé que les Jardins étaient
		localisés en Eorzéa, dans l'appartement 67, secteur 24, à Lavandière.
		<br/>
		En continuant d'étudier le Grand Grimoire de la Magie récupéré en Camelot,
		je sais que la disparition des Jardins n'est pas le fait de l'usure du temps.
		En usant de la Magie, **NOM TBD** a transporté les Jardins dans le temps présent.
		<br/>
		Selon ma copine, la Peluche Productrice
		<a target="_blank" href="https://fr.wikipedia.org/wiki/Naoki_Yoshida">Naoki Yoshida</a>, 
		il faut les renvoyer dans le passé: Leur présence en Eorzéa 
		risque de provoquer dans un futur proche un
		<a target="_blanck" href="https://fr.wikipedia.org/wiki/Effet_papillon">effet papillon</a>
		tellement important que toute la géographie d'Eorzéa en sera modifiée et fera même
		disparaître les reflets. Le futur en sera tellement modifié que même 
		<a target="_blank" href="https://fr.finalfantasyxiv.com/dawntrail/">FF14 Dawntrail</a>
		ne sera plus qu'une espérance vaine.
		<br/>
		<Epiq bind:step={epiqState.step} oui=1 ouiVal="Alors, il faut renvoyer les Jardins dans le passé"/>
	</div>
{/if}
		
{#if epiqState.step==1}
	<div class="reveal">
		<img style="float:right; width:25%" alt="jardins" src="https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/jardins.png"/>
		Tu as compris, {pseudo}.
		<br/>
		Comme aurait dit Yoda, incanter le sort de Retour Temporel, bientôt je devrai.
		<br/>
		Mais le lieu et le temps où je dois fixer mon regard dans le passé restent incertains.
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
			Selon tes informations, je dois renvoyer les Jardins Suspendus <u>{lblRoi[epiqState.roi].l}</u> {lblRoi[epiqState.roi].d} ?
			<br/>
			<Epiq bind:step={epiqState.step} oui=3 ouiVal="Oui, c'est cà" ouiMsg="Si tu changes d'avis, tu peux recommencer cette quête"/>
		{/if}
	</div>
{/if}

{#if epiqState.step==3}
	<div class="reveal">
		Tu m'as indiqué qu'il faut envoyer les Jardins {lblRoi[epiqState.roi].l}, mais il faut aussi connaitre le périmètre
		exact des jardins car je ne dois pas renvoyer tout l'immeuble de Lavandière dans le passé!
		<br/>
		Selon le Grand Grimoire des Savoirs, les Jardins Suspendus comportent {epiqNbObjets} objets de nature végétale.
		Les dénombrer plus précisement devrait me permettre de définir le périmètre précis des Jardins.
		<br/>
		<i style="font-size:0.8em">
			Pour la suite, c'est le <u>nombre d'objets IG</u> qui est important, peu importe leur
			nature (meuble, table, pot, vase, mural... du moment que c'est <u>avec des feuilles</u>).
			<br>
			Ils peuvent être n'importe où du moment que c'est dans l'appartement. <u>Ils ne sont pas cachés</u>.
			<br>
			A titre d'exemple, les différentes
			<a href="https://fr.ff14housing.com/itemview.php?id=109647e2a33" target="_blank">fontaines</a>
			et 
			<a href="https://fr.ff14housing.com/itemview.php?id=4a02b3faeec" target="_blank">cascades</a>
			comptent pour des végétaux (il y a des feuilles) sans fleur ni fruit.
			<br>
			Dans de rares cas, un végétal peut sembler ambigu, comme par exemple le 
			<a href="https://fr.ff14housing.com/itemview.php?id=713dc1e9ed5" target="_blank">
			rideau de lierre mural
			</a>
			Ce dernier est à 
			considérer comme un végétal avec fleurs car il comporte des fleurs tombantes bleues/vertes
			même si elle ne sont pas très visibles.
			<br>
			Attention, le sol ou le décor mural global ne comptent pas.
		</i>
		<br/>
		Combien d'objets n'ont ni fruit ni fleur, seulement des feuilles ?
		<br/>
		<input bind:value={epiqState.niFruitNiFleur} type="number" min=0 max=50 placeholder="Ni fleur ni fruit" />
		<br/>
		Combien d'objets n'ont que des fruits et pas de fleur ?
		<br/>
		<input bind:value={epiqState.fruitNiFleur} type="number" min=0 max=50 placeholder="Fruits sans fleur" />
		<br/>
		Combien d'objets ont des fleurs ?
		<br/>
		<input bind:value={epiqState.niFruitFleur} type="number" min=0 max=50 placeholder="Fleurs sans fruit" />
		<br/>
		{#if epiqState.niFruitNiFleur + epiqState.fruitNiFleur + epiqState.niFruitFleur != epiqNbObjets }
			Tu n'as pas proposé la répartition des {epiqNbObjets} objets de nature végétale.
		{:else}
			<Epiq bind:step={epiqState.step} oui=4 ouiVal="Je confirme la répartition" ouiFct={geographeJardins} />
		{/if}
	</div>
{/if}

{#if epiqState.step==4}
	<div class="reveal">
		{pseudo}, j'ai vu ta proposition, et à ce titre, tu as obtenu la médaille de Géographe des Jardins.
		<br/>
		{#if phraseReponse!=bonneReponse}
			Mais le Grand Grimoire de la Magie ne semble pas totalement réceptif aux informations
			que tu m'as données, probablement parce que 
			<span class="blinkMsg">au moins un élément n'est pas exact</span>.
			<br/>
			Indique {phraseReponse} sur le livre de correspondance des Jardins Suspendus pour valider ta réponse,
			même si ce n'est pas totalement exact. Tu pourras la modifier.
			<br/>
			Tu peux recommencer cette quête pour trouver une meilleure réponse.
			<br/>
			<Epiq bind:step={epiqState.step} oui=1 ouiVal="J'ai indiqué {phraseReponse} sur le carnet et je refais une proposition" />
		{:else}
			Le Grand Grimoire de la Magie a été totalement réceptif à tes informations, car <u>c'est la meilleure
			proposition possible</u>.
			<br/>
			Indique {phraseReponse} sur le livre de correspondance des Jardins Suspendus pour valider ta réponse.
			<br/>
			<Epiq bind:step={epiqState.step} oui=5 ouiVal="J'ai indiqué {phraseReponse} sur le livre" />
		{/if}
		<br/>
	</div>
{/if}

{#if epiqState.step==5}
	<div class="reveal">
		Bravo {pseudo},
		<br/>
		Tu as terminé ce challenge.
		<br/>
		Si tu partages tes propositions avec des amis, n'oublie pas qu'ils doivent aussi obtenir la médaille de Géographe des Jardins
		ET écrire la réponse sur le livre pour participer à la répartition des gains.
		<br/>
		<Epiq bind:step={epiqState.step} oui=5 ouiVal="Je confirme avoir indiqué {phraseReponse} sur le livre"
					bind:page={page} bind:pageDone={pageDone} ouiPageDone=302 ouiPage=0 />
	</div>
{/if}
	
<!-- P302.svelte -->
