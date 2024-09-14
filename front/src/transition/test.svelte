<script>
	import { onMount, onDestroy } from 'svelte';
	import { loadIt, storeIt, apiCall } from "./storage.js"
	import { addNotification, newInfoPopup, playVideo } from "./storage.js"

	import Epiq from './Epiq.svelte'
	
	export let wsCallComponents
  export let pseudo
  // export let page
  export let pageDesc = null
  // export let pageDone = []
	// export let pseudoList = []
	
	const pageEpiqLbl = "P"+pageDesc.n + "_epiqStep"
	let step = loadIt(pageEpiqLbl,0);
  $: storeIt(pageEpiqLbl,step);

	// Gestion des reload, refresh etc..
	onMount(() => {
		if (wsCallComponents) wsCallComponents.add(myWsCallback);
		init()
	});
	onDestroy(() => {
		if (wsCallComponents) wsCallComponents.delete(myWsCallback);
		// clearInterval(intervalId)
	});
	// callback sur le websocket
	function myWsCallback(m) {
		// if (m.op=="innommable") {	console.log('reloadEtat'); loadEtat(m); return true }
	}

	// données statique de traduction (tableau)
	let traductions = null
	// etat actuel des traductions (tableau)
	let tradTrouves = null;
	
	// Chargement des données statiques
	async function init() {
		let ret = await apiCall("/asciens/setupData")
		if (ret.status!=200) { newInfoPopup("FATAL!","Impossible de charger les données du challenge","Contacte Kikiadoc immédiatement"); return }
		traductions = ret.o.traductions
		let tmpTradTrouves = ret.o.etat.tradTrouves
		if (tmpTradTrouves.length > 0)
			tradTrouves = tmpTradTrouves
		else
			tradTrouves = null
	}
	
	// détermine les element d'une solution
	function resolveSyracuse(root) {
		let n=root
		let altitude=root
		let t= []
		while (n!=1) {
			t.push(n)
			if (n%2==0) 
				n=n/2
			else
				n=n*3+1
			if (n> altitude) altitude=n
		}
		t.push(1) 
		return { altitude: altitude, tbl: t }
	}
	// afficahge de l'assistant d'aide pour le calcul
	let dspAide = false
	// calculs en cours { init: init, ops:[ {x: y: op:} ] }
	// init: valeur intiale du calcul
	// x: numero d'opération
	// y: resultat du calcul
	// op: operation en texte
	// o: origine du calcul
	const calculsLbl = "P"+pageDesc.n + "_calculs"
	let calculs =loadIt(calculsLbl,null);
  $: storeIt(calculsLbl,calculs);
	
	// démarrage d'un calcul
	function calculStart(n,cbName) {
		let resolve = resolveSyracuse(n)
		calculs = { init: n, cb: cbName, altitude: resolve.altitude, ops: [{x: 0, y: n, op: "(init)", o:n} ] }
	}
	// calcul terminé
	function calculEnd() {
		console.log("calculEnd",calculs.cb)
		// ne fonctionne pas ca compilation du front et changemen des noms
		// window[stringFunction](param);
		// pas terrible, mais bon, ca marche !
		switch(calculs.cb) {
			case "cbCalculGrimoire": cbCalculGrimoire(); break;
			case "cbCalculGenerique": cbCalculGenerique(); break;
		}
	}
	function calculAdd(n) {
		let tmpOps = calculs.ops
		const op = (n%2==0)? "/2=" : "x3+1="
		const r = (n%2==0)? n/2 : n*3+1
		tmpOps.unshift({ x: tmpOps.length, y:r, op: op, o:n })
		calculs.ops = tmpOps
		if (r==1) calculEnd()
	}
	// retourne la derniere valeur calculée ou la valeur initiale
	function calculLastVal(c) {
		// console.log('calculLastVal')
		return (c.ops && c.ops[0])? c.ops[0].y : c.init
	}
	// Propose, verifie et ajoute un résultat de calcul
	function calculPropose() {
		const last = calculLastVal(calculs)
		const result = calculs.propose
		calculs.propose=null
		const valid = (last%2==0)? last/2 : last*3+1
		if (result != valid) {
			addNotification("Mauvais calcul","yellow",5,"prout-long")
			return;
		}
		calculAdd(last)
	}

	// gestion du grimoire personnel
	let dspGrimoire= false
	// ajoute d'un element dans le grimoire
	async function grimoireAdd(nbAsc,nbEor) {
		let ret = await apiCall("/asciens/traduction/"+nbAsc+"/"+nbEor,"PUT")
		if (ret.status!=200) { addNotification("Erreur de traduction grimoire","red",20,"prout-long"); return }
		tradTrouves = ret.o.tradTrouves
		// console.log("tarattrouves",tradTrouves)
	}
	
	// callback de calcul pour l'etape initiale du grimoire
	function cbCalculGrimoire() {
		// pas d'ajout grimoire pour l'instant, car il faut répondre à la question de la guilde
		newInfoPopup("Bravo, tu as traduit un premier nombre des Anciens",
								 [
									 "Le nombre Ancien 5 peut se traduire de différentes façons:",
									 "Il indique le nombre 6 en Eorzéen",
									 "Il indique la lettre F en Eorzéen",
									 "Il indique parfois une phrase comme ici, Guilde des Tanneurs",
									 "La traduction à prendre en compte dépend du contexte. Ici, c'est la phrase qui est importante.",
									 "Tu peux maintenant aller à la Guilde des Tanneurs, identifier le maître de guilde et l'indiquer à la Grande Peluche afin d'obtenir ton Grimoire Personnel",
								 ],
								 "Ferme cette popup pour continuer",
								 {ding: "Applaudissements"}
		)
	}
	// callback générique
	function cbCalculGenerique() {
		// Ajoute dans le grimoire
		grimoireAdd(calculs.init,calculs.ops.length);
		newInfoPopup("Tu as traduit un nombre des Anciens",
								 [
									 "J'ai noté le résultat dans ton Grimoire"
								 ],
								 "Ferme cette popup pour continuer",
								 {ding: "Applaudissements"}
		)
	}

	// validation de l'acquisition du grimoire
	let nomPnjGuilde=null;
	function obtenirGrimoire() {
		if (!nomPnjGuilde || nomPnjGuilde.toLowerCase() != "geva") {
			addNotification("Non, ce n'est pas le maître de guilde","yellow",10,"prout-long")
			return
		}
		// nom valide, acces au grimoire !
		newInfoPopup(	"Bravo, Geva t'a donné un Grimoire Personnel",
									[
										"Ce challenge est maintenant terminé, tu disposes de ton Grimoire Personnel",
										"Tu y trouveras les décodages que tu as déjà réalisées",
										"Si, lors de prochains challenges, tu souhaites décoder un Nombre Ancien",
										"reviens ici et demande un nouveau décodage",
										"Tu dispose de deux nouveaux boutons en haut de cette page;",
										"Grimoire et Decodage"
									],
									"Ferme cette popup pour continuer",
									{ding: "Applaudissements"}
		)
		// Ajoute le nombre initiatique
		grimoireAdd(5,6);
	}

	// nouveau decodage
	let dspNouveauDecodage=null // null ou true pour afficher ou la valeur a utiliser pour le nouveau decodage
	function calculLanceDecodage() {
		// verif que c'est un nombre ancien valide
		if (!traductions.find( (e) => e.nbAsc==dspNouveauDecodage) ) {
			addNotification(dspNouveauDecodage+" n'apparait dans aucun document Ancien connu","yellow",5,"prout-long")
			returne.nbAsc
		}
		calculStart(dspNouveauDecodage,"cbCalculGenerique")
		// cas particuliler du 1
		if (dspNouveauDecodage==1) calculEnd()
		dspNouveauDecodage = null // ferme la fenetre
	}

	// calcul des résultats du challenge
	function calcResultats() {
	}

	/////////////////////////////////////////////////////////////////////////////////////////////
	// TEST
	/////////////////////////////////////////////////////////////////////////////////////////////
	let dspTstResult = null
	function scanSoluce() {
		const idxBruteForce = [...Array(300).keys()].slice(1)
		let tstResult = []
		idxBruteForce.forEach( (e)=> {
			let result=resolveSyracuse(e).tbl
			tstResult[result.length] ??= { nb: 0, tbl: null }
			if (!tstResult[result.length].tbl || result.length < tstResult[result.length].tbl.length ) {
				tstResult[result.length].tbl = result
				tstResult[result.length].first = e
			}
			tstResult[result.length].nb ++
		})
		console.log('tstResult',tstResult)
		dspTstResult = tstResult
	}
	/////////////////////////////////////////////////////////////////////////////////////////////
	// fin test
	/////////////////////////////////////////////////////////////////////////////////////////////
	
	/////////////////////////////////////////////////////////////////////////////////////////////
	// divers eligible storage.js
	/////////////////////////////////////////////////////////////////////////////////////////////
	// conversion d'un array en un tableau directement utilisable en SVG dans une zone carrée 100x100
	// contenu du tableau: [ { x, y, lbl... } ... ]
	// return null si le tableau ne contient rien
	// dMinX et dMinY sont les valeurs minimale imposées
	function convertArrayToSvg(dataArray,dMinY,dMaxY) {
		if (!dataArray || dataArray.length == 0) return null
		const minX = dataArray.reduce((a, v) => Math.min(a,v.x), +Infinity)
		const maxX = dataArray.reduce((a, v) => Math.max(a,v.x), -Infinity)
		const minY = dataArray.reduce((a, v) => Math.min(a,v.y), (dMinY!==null)? dMinY : +Infinity)
		const maxY = dataArray.reduce((a, v) => Math.max(a,v.y), (dMaxY!==null)? dMaxY : -Infinity)
		const factorX = (maxX-minX > 0)? 100 / (maxX-minX) : 50
		const factorY = (maxY-minY > 0)? 100 / (maxY-minY) : 50
		// convertit les coordonnées
		const points = []
		dataArray.forEach( (e) => points.push({ x: (e.x-minX)*factorX, y: 100-(e.y-minY)*factorY, o: e}))
		// calcul de la polyline entre les points
		const polyline = points.reduce( (a,v) => a=a+ v.x +','+ v.y +' ', '')
		// objet résultat
		return {
			nbStart : dataArray[0].y,
			nbEnd : dataArray[dataArray.length-1].y,
			minX : minX, maxX: maxX, minY: minY, maxY: maxY,
			polyline: polyline,
			points: points
		}
	}

</script>
<style>
	.svg { width: 100% }
	.svgTextGreen { background-color: black; font: italic 8px sans-serif; text-shadow: none; fill: lightgreen; cursor: pointer	}
	.svgPoint { fill: red; cursor:pointer }
	.svgPolyline { fill: none ; stroke: red; stroke-linejoin: round}
	.tdTop { vertical-align: top }
	/*
	.svgText { background-color: black; font: italic 8px sans-serif; text-shadow: none; fill: white; cursor: pointer	}
	.svgText:hover { font-style: bold}
	.parchemin {
  border: 1em 5em;
	padding: 2em 2em;
	border-color: rgb(0, 0, 0, .2);
  border-image-source: url("https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/parchemin-horizontal.jpg");
	border-image-width: 5px;
	border-image-repeat: stretch;
	border-image-slice: 3% 5% fill;
	}
	*/

</style>

{#if pseudo.startsWith("Kikiadoc")}
	<div class="adminCadre">
		<input type="button" value="clearCalculs" on:click={()=>confirm('clearCalcul') && (calculs=null)} />
		<input type="button" value="clearServeur" on:click={()=>confirm('clearServeur') && apiCall("/asciens/admClearPseudo","PATCH")} />
		<input type="button" value="reInit" on:click={()=>confirm('reInit') && init()} />
	</div>
{/if}

<div>
  <input type="button" on:click={()=> step=0} value="Réafficher le lore" />
  <input type="button" on:click={()=> calcResultats()} value="Résultats"/>
	{#if tradTrouves && traductions}
	  <input type="button" on:click={()=> dspGrimoire = !dspGrimoire} value="Voir mon Grimoire"/>
	  <input type="button" on:click={()=> dspNouveauDecodage = !dspNouveauDecodage} value="Nouveau décodage"/>
	{/if}
</div>

<!-- si pas encore de grimoire, affiche l'énigme du grimoire -->
{#if !tradTrouves && step==99}
	<div>
		{pseudo}, tu n'as pas encore obtenu ton Grimoire Personnel.
		<br/>
		{#if calculs && calculLastVal(calculs)==1}
			Grâce à cette première traduction, tu as identifié la Guilde des Tanneurs,
			indique moi le nom du PNJ Maître de cette guilde:
			<br/>
			<input bind:value={nomPnjGuilde} type="text" placeholder="maître de guilde" on:keypress={(e) => {if (e.keyCode==13) obtenirGrimoire()}} />
			<input type="button" on:click={()=>obtenirGrimoire()} value=">" />
			<br/>
		{:else} 
			Pour l'obtenir, il faudra faire une premiere traduction,
			puis m'indiquer ici le nom d'un PNJ:
			<br/>
		{/if}
		{#if !calculs}
			<input type="button" on:click={()=>calculStart(5,"cbCalculGrimoire")} value="Go ma première traduction!" />
		{/if}
	</div>
{/if}


<!-- Affichage grille de calculs -->
{#if traductions && calculs && step==99}
	{@const lastVal=calculLastVal(calculs)}
	{@const svgObj= convertArrayToSvg(calculs.ops,0,calculs.altitude)}
	<table>
		<tr></tr>
		<tr>
			<td class="tdTop">
				<div class=" adminCadre papier">
					<div style="text-align: center">Traduction de {calculs.init}</div>
					{#if lastVal!=1}
						<div>
							{lastVal}{(lastVal%2==0)? "/2=":"x3+1="}
							<input type=number style="width: 6em" bind:value={calculs.propose} on:keypress={(e)=>{if (e.keyCode==13) calculPropose()}}/>
							<input type=button value="►" on:click={calculPropose} />
							<input type=button value="🪄" on:click={()=>dspAide=true} />
						</div>
					{:else}
						<div>
							Décodage terminée
						</div>
					{/if}
					{#each calculs.ops as c, i}
						<div>
							#{c.x+1}: {c.o}{c.op}{c.y}
						</div>
					{/each}
				</div>
			</td>
			<td class="tdTop" width="50%">
				<div class=" adminCadre papier">
					<div style="text-align: center">Conjecture</div>
					{#if svgObj}
						<svg viewBox="0 0 100 100" class="svg">
							<polyline class="svgPolyline" points="{svgObj.polyline}" />
							{#each svgObj.points as p, i}
								<circle class="svgPoint" cx={p.x} cy={p.y} r="2%" />
						  {/each}
							{#if lastVal==1}
								{@const trad = traductions[calculs.ops.length] || {} }
								<text class="svgTextGreen" x=0 y=10 >Décodage effectuée du</text>
								<text class="svgTextGreen" x=0 y=20 >nombre Ascien {trad.nbAsc}</text>
								<text class="svgTextGreen" x=0 y=40 >Résultat:</text>
								<text class="svgTextGreen" x=0 y=50 >Nombre Eorzéen: {trad.nbEor}</text>
								<text class="svgTextGreen" x=0 y=60 >Lettre Eorzéenne: {trad.chEor}</text>
								<text class="svgTextGreen" x=0 y=70 >Phrase Eorzéenne:</text>
								<text class="svgTextGreen" x=0 y=80 >{trad.phrase || "(aucune)"}</text>
							{/if}
						</svg>
					{/if}
				</div>
			</td>
		</tr>
	</table>
{/if}

<!-- affichage du grimoire -->
{#if dspGrimoire}
	<div class="popupCadre papier">
		<div class="close" on:click={()=>dspGrimoire=false} on:keypress={null} role="button" tabindex=0>X</div>
		<div class="popupZone">
			<div class="popupContent">
				Grimoire Personnel:
				<br/>
				Traductions connues:
				<br/>
				{#each tradTrouves as g,i}
					{#if g}
						{@const trad = traductions[g] || {} }
						{trad.nbAsc}→{trad.nbEor}, {trad.chEor}{#if trad.phrase}, {trad.phrase}{/if}
						<br/>
					{/if}
				{/each}
			</div>
		</div>
	</div>
{/if}

<!-- nouveau decodage -->
{#if dspNouveauDecodage}
	<div class="popupCadre papier">
		<div class="close" on:click={()=>dspNouveauDecodage=false} on:keypress={null} role="button" tabindex=0>X</div>
		<div class="popupZone">
			<div class="popupContent">
				Indique un nombre Ancien à décoder:
				<br/>
				<input bind:value={dspNouveauDecodage} type="number" min=1 max=99 on:keypress={(e) => {if (e.keyCode==13) calculLanceDecodage()}}/>
				<input type="button" value="►" on:click={()=>calculLanceDecodage()} />
				<br/>
				N'oublie pas de vérifier dans ton Grimoire si tu n'as pas déjà décodé ce nombre.
			</div>
		</div>
	</div>
{/if}

{#if step==0}
	<div>
		<p>
			Bienvenue {pseudo}, dans cette nouvelle aventure.
		</p>
		<p>
			Les Anciens étaient une antique civilisation qui a disparu lors de la Fragmentation.
			Si quelques Asciens sont présents dans le nouveau monde, de nombreux
			vestiges des anciens existent encore, et certaines de leurs coutumes et savoirs
			sont notées dans le Grand Grimoire des Savoirs.
		</p>
		<p>
			Ainsi, leur language et leur arithmétique sont bien différents de ceux de l'Univers Connu et
			a été totalement incompréhensible pendant de nombreuses ères.
		</p>
		<p>
			La Peluche Mathématicienne
			<a href="https://fr.wikipedia.org/wiki/Lothar_Collatz" target="_blank">Lothar Collatz</a>
			a énoncé, il y a seulement quelques décénies, la
			<a href="https://fr.wikipedia.org/wiki/Conjecture_de_Syracuse" target="_blank">Conjecture de Syracuse</a>
			qui permet de traduire l'Ancien en Eorzéen.
			Par définition, elle n'a pas encore été démontrée et de nombreuses Peluches Mathématicienne pensent obtenir la
			<a href="https://fr.wikipedia.org/wiki/M%C3%A9daille_Fields" target="_blank">Mascotte Fields</a>
			en prouvant la validité de cette conjecture.
		</p>
		<p>
			Mais l'important est qu'en utilisant cette conjecture, il est possible de traduire le langage numérique
			des Anciens en des chiffres et des lettres utilisées en Eorzéa.
		</p>
	</div>
  <Epiq bind:step={step} oui=1 ouiVal="Je pourrais comprendre les écritures des Anciens !" />
{/if}
{#if step==1}
	<div>
		<p>
			Oui {pseudo}, grâce à cette conjecture tu pourras comprendre l'écriture des Anciens.
			Et cela repose sur quelques opérations arithmétique élémentaires.
			Ainsi, un nombre Ancien peut se traduire en un chiffre, un nombre, une lettre
			et même un mot ou une phrase selon le contexte.
			Pourfois il suffit de quelques opérations, parfois il en faut des dizaines!
		</p>
		<p>
			Selon la Conjecture, la série de nombre converge vers 1 puis continue avec un cycle 1/4/2/1/4/2/1 etc..
			La traduction d'un nombre Ancien n'est donc pas le résultat final, il est connu,
			mais le nombre d'opérations nécessaires	pour arriver à la valeur 1.
		</p>
	</div>
  <Epiq bind:step={step} oui=2 ouiVal="Ca a l'air compliqué!" />
{/if}
{#if step==2}
	<div>
		<p>
			Mais non! Ne soit pas si effayé, il faut seulement quelques calculs très simples			
		</p>
		<p>
			En plus, je noterai dans ton grimoire personnel les résultats des traductions
			que tu auras réalisées afin que tu puisses facilement les réutiliser
			lorsque de nouvelles traductions te seront nécessaires.
		</p>
	</div>
  <Epiq bind:step={step} oui=3 ouiVal="Qu'est ce que mon grimoire personnel?" />
{/if}
{#if step==3 && !tradTrouves}
	<div>
		<p>
			Oh! Je n'avais pas vu que tu n'avais pas encore obtenu ton grimoire personnel.
		</p>
		<p>
			Cela va être l'occasion pour toi d'aller le quémander auprès d'une guilde!
			<br/>
			Pour identifier cette guilde, il faut faire ta première traduction Ancien/Eorzéen!
		</p>
	</div>
  <Epiq bind:step={step} oui=99 ouiVal="Dis moi ce que je dois faire!" />
{/if}

{#if step==3 && tradTrouves}
	<div>
		<p>
			Mais tu sais déjà ce qu'est un grimoire personnel!
			<br/>
			Tu l'as déjà obtenu et tu as deux boutons importants.
			<br/>
			Le premier "Grimoire" te permet de consulter ton Grimoire,
			le second "Nouveau décodage" te permet de décoder un nombre Ancien en Eorzéen
		</p>
	</div>
  <Epiq bind:step={step} oui=99 ouiVal="J'avais oublié" />
{/if}

<!-- TEST
{#if dspTstResult}
	<div>BruteForce:</div>
	<div>
		{#each dspTstResult as r,i }
			{@const nbEor= r && r.tbl && r.tbl.length}
				&lbrace;
					nbAsc: {r && r.first},
					nbEor: {nbEor},
					chEor: "{String.fromCharCode(64+nbEor)}",
					tbl: [{r && r.tbl}]
				&rbrace;
		{/each}
	</div>
{/if}
-->


