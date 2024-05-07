<script>
	import { onMount, onDestroy  } from 'svelte';
	import { loadIt, storeIt, apiCall, addNotification, newInfoPopup, urlImg, playDing } from './storage.js';
	import Epiq from './Epiq.svelte';
	import Uch from './Uch.svelte';

	export let wsCallComponents;
	export let pseudo;
	export let page;
	// export let pageDone = [];
	export let pageDesc = null;

	const pageEpiqLbl = "P"+pageDesc.n + "_epiqStepObj"

	onMount(() => { if (wsCallComponents) wsCallComponents.add(myWsCallback); init() });
	onDestroy(() => { if (wsCallComponents) wsCallComponents.delete(myWsCallback) });

	async function myWsCallback(m) {
	}

	let epiqState = loadIt(pageEpiqLbl,{step: 0});
	$: storeIt(pageEpiqLbl,epiqState); 

	let staticCtx = null; // contexte statique du mini jeu
	async function init() {
		let ret = await apiCall("/dispersionSpatiale/static")
		if (ret.status != 200) {
			newInfoPopup("Erreur GRAVE","Impossible de charger le contexte statique de ce challenge","CONTACTE IMMEDIATEMENT KIKIADOC")
			page=0;
			return
		}
		staticCtx = ret.o
		await getTrouves();
	}

	let trouves = []
	let trouvesNb = 0;
	
	async function checkToutTrouve() {
		if (trouves.length==0) return;
		let tmpTrouvesNb=0;
		for (let i=0; i < trouves.length; i++ ) {
			console.log("trouve",i,trouves[i])
			if (trouves[i]) tmpTrouvesNb++;
		}
		if (tmpTrouvesNb==trouves.length) {
			newInfoPopup("Bravo!","Tu as retrouvé tous les plats nécessaires à l'incantation de la Restauration du Temps")
		}
		trouvesNb = tmpTrouvesNb;
	}
	async function getTrouves() {
		let ret = await apiCall("/dispersionSpatiale/dynamic")
		if (ret.status == 200) { trouves = ret.o;	checkToutTrouve() }
	}

	let propose = null; // { i: x: y: }
	async function proposeCheck() {
		// TODO: verif des args
		if (isNaN(parseFloat(propose.x)) || isNaN(parseFloat(propose.y)) ) {
			addNotification("Tes coordonnées invalides, c'est DTC!","red",5)
			playDing("prout-long")
			return;
		}
		let ret = await apiCall("/dispersionSpatiale/trouve/"+propose.i+"/"+propose.x+"/"+propose.y,'PUT')
		if (ret.status==202) {
			addNotification("Je ne perçois aucun fumet ici...","yellow",8)
			playDing("prout-long")
			return;
		}
		if (ret.status==200) { trouves = ret.o;	checkToutTrouve() }
		propose = null;
	}

	let recap=null
	async function getRecap() {
		let ret = await apiCall("/dispersionSpatiale/recap")
		if (ret.status!=200) return;
		let tmpRecap = ret.o
		// calcul cumul par pseudos en scan des lieux
		let tmpCounts = {}
		for (let i=0; i < staticCtx.lieux.length; i++) {
			Object.keys(tmpRecap.lieux[i].pseudos).forEach( (pseudo) => { tmpCounts[pseudo] ??= 0; tmpCounts[pseudo]++ })
		}
		// console.log('tmpCounts',tmpCounts);
		// construction du tableau des scores
		let tmpTblCounts = []
		Object.keys(tmpCounts).forEach( (pseudo)=> tmpTblCounts.push( {pseudo: pseudo, count: tmpCounts[pseudo]} ) )
		// tri des scores
		tmpTblCounts.sort( (a,b) => (a.count<b.count)? -1 : (a.count==b.count)? 0 : 1 )
		tmpRecap.counts = tmpTblCounts
		recap=tmpRecap // synch ihm
	}
</script>

<style>

</style>

<Uch fullDisplay=0 wsCallComponents={wsCallComponents} pseudo={pseudo} />

{#if pseudo.startsWith('Kikiadoc')}
	<div class="adminCadre">
		Admin
		<input type="button" value="reinitTrouvesAll" on:click={()=>apiCall('/dispersionSpatiale/trouvesAll','DELETE')} />
	</div>
{/if}

<div>
	<Epiq bind:step={epiqState.step} rst=0 rstVal="Réafficher le lore" />
	<input type="button" value="Voir les Découvertes" on:click={()=>getRecap()}/>
</div>
	
{#if epiqState.step==99 && staticCtx && trouves}
	<div>
		<div>
			Voici les {staticCtx.lieux.length} catalyseurs dispersés lors
			de l'explosion du Laboratoire Culinaire de la Grande Peluche Cuisinière.
		</div>
		{#if trouvesNb==trouves.length}
			<div style="color:lightgreen">
				Tu as retrouvés les {trouves.length} catalyseurs!
			</div>
		{:else}
			<div>
				Tu en as retrouvé {trouvesNb}/{trouves.length}
			</div>
		{/if}
		<table>
			{#each trouves as trouve,i }
				{@const lieu = staticCtx.lieux[i]}
				{@const cls = (trouves[i] && "stars") || "papiers"}
				<tr class={cls}>
					<td>
						<img src="{urlImg}dispersionSpatiale/{lieu.img}.png" alt="" />
					</td>
					<td>
						<a target="_blank" href="https://fr.finalfantasyxiv.com/lodestone/playguide/db/item/{lieu.lodestone}">{lieu.lbl}</a>
						<br />
						{#if trouves[i]}
							tu l'as trouvé
						{:else}
							Dispersé dans la {lieu.zone} de Kikiadoc
							<br />
							<input type="button" value="Je l'ai trouvé" on:click={() => propose={i:i} } />
						{/if}
					</td>
				</tr>
			{/each}
		</table>
	</div>
{/if}

{#if propose !==null} 
	<div class="popupCadre papier">
		<div class="close" on:click={()=> propose=null} on:keypress={null} role="button" tabindex=0>X</div>
		<div class="popupZone">
			<div class="popupContent">
				Indique moi <u>précisément</u> selon ta boussole IG
				<br/>
				où se trouve {staticCtx.lieux[propose.i].lbl}
				dans la {staticCtx.lieux[propose.i].zone} de Kikiadoc
				<div class="br" />
				Positionne toi bien au milieu du plat et 
				n'hésite pas à grimper dessus pour avoir les coordonnées exactes.
				<br />
				X:<input type="text" placeholder="X.x" maxlength=5 size=6 bind:value={propose.x} />
				Y:<input type="text" placeholder="Y.y" maxlength=5 size=6 bind:value={propose.y} />
				{#if propose.x && propose.y }
					<input type="button" value="C'est là" on:click={()=>proposeCheck()}/>
				{/if}
			</div>
		</div>
	</div>
{/if}

{#if recap !== null}
	<div class="popupCadre papier">
		<div class="close" on:click={()=> recap=null} on:keypress={null} role="button" tabindex=0>X</div>
		<div class="popupZone">
			<div class="popupContent">
				<div>Résultats actuels</div>
				<div style="font-size:0.7em">
					Les gains seront répartis aux prorata du nombre des découvertes
				</div>
				<hr/>
				<div>Par nombre de plats découverts:</div>
				{#each recap.counts as count,i}
					{count.pseudo}:{count.count}/{staticCtx.lieux.length}
					<br />
				{/each}
				<hr/>
				<div>Par plats:</div>
				<div style="font-size:0.8em">
					{#each recap.lieux as lieu, i}
						{@const pseudos = Object.keys(recap.lieux[i].pseudos) }
						<div>
							<div class="br" />
							{staticCtx.lieux[i].lbl}: ({pseudos.length})
							<br />
							{#each pseudos as pseudo}
								<i>{pseudo}</i>
								<br/>
							{/each}
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
{/if}

{#if epiqState.step==0}
	<div class="reveal">
		{pseudo}, j'espère que tu as pu réaliser, pendant ce petit repos, nombre de donjons et quêtes hebdomadaires.
		<br/>
		Mais j'ai une bien mauvaise nouvelle: La Magie Maléfique a encore frappé.
		<div class="br" />
		Tu sais combien lors des Aventures précédentes, le savoir de la Grande Peluche Cuisinière
		a été d'un apport crucial.
		<div class="br" />
		Souviens-toi, c'est elle qui, par exemple, a imaginé les menus qui ont permis aux
		Aventuriers de replier l'Espace lors de l'Ascension d'Anakin.
		<br />
		<Epiq bind:step={epiqState.step}
			oui=1 ouiVal="Je ne m'en souviens plus" ouiVideo="ff-6-souvenirMaite"
			non=1 nonVal="Je m'en souviens"
		/>
	</div>
{/if}

{#if epiqState.step==1}
	<div class="reveal">
		Pour être efficace, la Restauration du Temps nécessite d'être catalysé par
		une quantité impressionante de plats que seule la Grande Peluche Cuisinière peut réaliser.
		<div class="br" />
		C'est une tâche à laquelle elle se consacre depuis que j'ai décrypté la page
		du Grand Grimoire de la Magie concernant ce sort.
		<div class="br" />
		Alors que la Grande Peluche Cuisinière venait de terminer tous les plats nécessaires
		à la Restauration du Temps,
		<span class="blinkMsg">la Magie Maléfique a fait exploser son Laboratoire Culinaire</span>
		en utilisant le sort de Dispersion Spatiale.
		<br />
		<Epiq bind:step={epiqState.step}
			oui=2 ouiVal="Les plats sont détruits?"
			non=3 nonVal="Elle est blessée ?"
			rst=4 rstVal="Elle est morte ?"
		/>
	</div>
{/if}

{#if epiqState.step==2}
	<div class="reveal">
		Imbécile, je me fous des plats, c'est de la Grande Peluche Cuisinière dont je parle.
		Tu mériterais un malus sur tes gains, mais c'est ton jour de chance.
		<br />
		<Epiq bind:step={epiqState.step}
			oui=4 ouiVal="Alors elle est indemne!"
		/>
	</div>
{/if}

{#if epiqState.step==3}
	<div class="reveal">
		Non, heureusement, elle n'est pas blessée. Lors de l'explosion, elle faisait son marché à Lavandière
		pour trouver quelques ingrédients rares pour ses mystérieuses recettes.
		<br />
		<Epiq bind:step={epiqState.step}
			oui=5 ouiVal="Cela me rassure"
		/>
	</div>
{/if}

{#if epiqState.step==4}
	<div class="reveal">
		Elle n'a pas été touchée par l'explosion: Par chance, à ce moment là, elle faisait son marché à Lavandière
		pour trouver quelques ingrédients rares pour ses mystérieuses recettes.
		<br />
		<Epiq bind:step={epiqState.step}
			oui=5 ouiVal="Cela me rassure"
		/>
	</div>
{/if}

{#if epiqState.step==5}
	<div class="reveal">
		Oui, le plus important est que la Grande Peluche Cuisinière soit indemne.
		<div class="br" />
		Peux-tu imaginer l'étendu de son Savoir ?
		<br />
		<Epiq bind:step={epiqState.step}
			oui=6 ouiVal="Il est tellement vaste" ouiMsg="Tu as raison, regarde" ouiVideo="ff-6-platsMaite"
			non=6 nonVal="Je m'en doute un peu" nonMsg="Regarde ça!" nonVideo="ff-6-platsMaite"
			rst=6 rstVal="Je ne sais pas" rstMsg="Alors apprend" rstVideo="ff-6-platsMaite"
		/>
	</div>
{/if}

{#if epiqState.step==6}
	<div class="reveal">
		Tout de suite après l'explosion de son Laboratoire Culinaire,
		elle m'a fait part de son inquiétude à propos de la Restauration du Temps.
		<div class="br" />
		Elle m'a indiqué être incapable de cuisiner de nouveaux plats
		car aucune échoppe, aucun marché d'Eorzéa, aucun HV ne propose actuellement les ingrédients nécessaires.
		<br />
		<Epiq bind:step={epiqState.step}
			oui=7 ouiVal="Je suis cuistot 90!"
			non=7 nonVal="J'ai plein d'ingrédients!"
			rst=7 rstVal="Je peux chasser du gibier!"
		/>
	</div>
{/if}

{#if epiqState.step==7}
	<div class="reveal">
		Je vois que tu souhaites aider la Grande Peluche Cuisinière.
		<div class="br" />
		Hélas, les plats nécessaires à la Restauration du Temps ne sont pas craftable même avec
		les ingrédients et compétences des plus valeureux des Aventuriers.
		C'est l'apanage de la Grande Peluche Cuisinière.
		<div class="br" />
		Mais il y a peut-être une possibilité...
		<br />
		<Epiq bind:step={epiqState.step}
			oui=8 ouiVal="Dis moi laquelle!"
		/>
	</div>
{/if}

{#if epiqState.step==8}
	<div class="reveal">
		Alors que mon esprit explorait l'Ether Magique, j'ai percu les prémices
		de l'incantation de la Dispersion Spatiale autour du Laboratoire Culinaire.
		J'ai immédiatement demandé à Kikiadoc, mon ami Mage Blanc, de caster un Asile pour protéger
		ce lieu et ses occupants.
		<div class="br" />
		Cela n'a pas empèché l'explosion, mais en a limité les effets.
		Seuls quelques marmitons ont été légèrement blessés et ils vont se rétablir rapidement.
		<div class="br" />
		Alors que la Dispersion Spatiale aurait du envoyer les plats dans tout Eorzéa,
		l'effet de l'Asile a aussi été de limiter cette dispersion dans l'espace.
		Il semble que les plats se soient retrouvés uniquement dans la maison de cl
		ou la maison personnelle de Kikiadoc.
		<br />
		<Epiq bind:step={epiqState.step}
			oui=9 ouiVal="Et on peut alors les retrouver ?"
		/>
	</div>
{/if}

{#if epiqState.step==9}
	<div class="reveal">
		Je l'espère, les plats nécessaires à la catalyse de la Restauration du Temps sont tellement rares.
		<div class="br" />
		Si tu souhaites m'aider, localise ces plats
		dans la maison de cl (moogle, brumée, secteur 19, slot 5)
		et la maison personnelle de Kikiadoc (moogle, shirogane, secteur 22, slot 46).
		<div class="br" />
		Attention, la Dispersion Spatiale a pu transporter quelques plats dans des coins très difficiles à localiser.
		Peut-être même que certains se retrouvent dans des "glitches de housing".
		Kikiadoc m'avait expliqué comment trouver de tels lieux cachés lors d'un précédent événement.
		<br />
		<Epiq bind:step={epiqState.step}
			oui=10 ouiVal="Les glitches?" ouiMsg="Souviens-toi, c'était dans le Kiki's Event IV. Attention, ce ne sont que des exemples du Passé" ouiVideo="ff-2-boum-soluce"
			non=10 nonVal="Je connais tout ca!"
		/>
	</div>
{/if}

{#if epiqState.step==10}
	<div class="reveal">
		Tu peux maintenant te rendre dans les maisons de Kikiadoc,
		rechercher les plats permettant la catalyse de la Restauration du Temps,
		puis m'en indiquer leurs positions exactes.
		<br class="br" />
		Autre chose ?
		<br />
		<Epiq bind:step={epiqState.step}
			oui=10 ouiVal="Remontre moi les glitches" ouiMsg="Souviens-toi, c'était dans le Kiki's Event IV" ouiVideo="ff-2-boum-soluce"
			non=10 nonVal="Quels sont les gains?" nonMsg="Tu peux cliquer sur 'Voir les Découvertes' pour cela."
			rst=99 rstVal="Non, indique-moi les plats"
		/>
	</div>
{/if}

<!-- page P305.svelte -->

