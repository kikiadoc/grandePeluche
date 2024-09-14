<script>
	import { onMount, onDestroy } from 'svelte'
	import { loadIt, storeIt, apiCall, urlCdn } from "./storage.js"
	import { newInfoPopup, addNotification,playDing } from "./storage.js"

	// export let pseudo
	export let cbResolve = null
	export let ascVal=1
	
	// Gestion des reload, refresh etc..
	onMount(() => {	init() });
	onDestroy(() => { console.log('destroy ctrad') });

	// données statique de traduction avec les soluces (tableau)
	let soluces = null
	// etat actuel des traductions (objet contenant tradTrouves[])
	let etat = null
	// popup pour déjà trouvé
	let dspTrouve = null
	// popup pour aide initiale
	let dspInit = null
	
	
	// Chargement des données statiques et etat initial pour decodage ascVal
	async function init() {
		let ret = await apiCall("/asciens/tradsEtSoluces")
		if (ret.status!=200) return newInfoPopup("FATAL!","Impossible de charger les données de calcul","Contacte Kikiadoc immédiatement")
		// deux champs: etat et tradsString - tradsString est une string de JSON pour optim coté serveur
		soluces = JSON.parse(ret.o.tradsString)
		etat = ret.o.etat
		// verif que ascVal c'est un nombre ancien valide
		if (!soluces.find( (e) => e.nbAsc==ascVal) ) {
			cbResolve(null)
			newInfoPopup("Vérifie le nombre que tu as indiqué",ascVal+" n'apparait dans aucun document Ancien connu","Si tu es sûr de ton nombre alors contacte Kikiadoc immédiatement")
			return;
		}
		calculStart(ascVal)
		// cas particuliler du 1
		if (ascVal==1) calculEnd()
		// si la solution est déjà trouvée...
		if (etat.tradTrouves[calculs.nbIter]) {
			// traduction déja trouvée
			dspTrouve = soluces[calculs.nbIter]
		}
		else {
			// Afiche la fenetre d'aide initiale
			dspInit=true
		}
	}
	
	// détermine les element d'une solution pour root
	function resolveSyracuse(root) {
		let n=root
		let altitude=root
		let t= []
		while (n!=1) {
			t.push(n)
			n = (n%2==0) ? n/2 : n*3+1
			if (n> altitude) altitude=n
		}
		t.push(1) 
		return { altitude: altitude, tbl: t }
	}
	
	// calculs en cours { init, lastVal, ops:[ {p, r, op, x, y } ] }
	// init: valeur intiale du calcul
	// lastVal: valeur de résultat actuel
	// x,y: valeur pour le graphe svg associé
	// p: valeur précédent
	// r: résultat
	// op: opération en texte
	let calculs = null
	
	// démarrage d'un calcul
	function calculStart(n) {
		let resolve = resolveSyracuse(n)
		calculs = { init: n, lastVal: n, nbIter: resolve.tbl.length, altitude: resolve.altitude, ops: [{p: n, r:n, x:0, y:n, op: null} ] }
	}
	// calcul terminé
	async function calculEnd() {
		let ret = await apiCall("/asciens/traduction/"+calculs.init+"/"+calculs.ops.length,"PUT")
		if (ret.status!=200) return addNotification("Traduction non validée","red",20,"prout-long")
		addNotification("Traduction notée dans ton parchemin personnel","lightgreen",10)
		newInfoPopup("Traduction de "+calculs.init+" réalisée",
								 [
									"Tu as traduit un nombre Ancien.",
									"Tu peux voir la traduction dans 'Conjecture'.",
									"Je l'ai enregistré dans ton parchemin personnel.",
									"Clique sur le bouton 'j'ai réussi' dans ta table de calculs pour continuer"
								 ],
								 "Ferme ce popup")
	}
	// Propose, verifie et ajoute un résultat de calcul
	function calculPropose() {
		const last = calculs.lastVal
		const result = calculs.propose
		calculs.propose=null
		const valid = (last%2==0)? last/2 : last*3+1
		if (result != valid) return addNotification("Mauvais calcul","yellow",5,"prout-long")
		const op = (last%2==0)? "/2=" : "x3+1="
		calculs.ops.unshift({ p: last, r: valid, op: op, x: calculs.ops.length , y: valid  })
		calculs.lastVal = valid
		if (valid==1) calculEnd()
	}

	// afficahge de l'assistant d'aide pour le calcul
	function dspAideTimer()	{
		const last = calculs.lastVal
		const op = (last%2==0)? "/2=" : "x3+1="
		const valid = (last%2==0)? last/2 : last*3+1
		newInfoPopup("Euclide:",["J'ai consulté mon traité d'arithmétique",last+op+valid], "Ferme ce popup et Indique ce résultat sur la Tablette de Traduction")		
		playDing();
	}
	// afficahge de l'assistant d'aide pour le calcul
	function dspAide() {
		const last = calculs.lastVal
		const op = (last%2==0)? "/2=" : "x3+1="
		const valid = (last%2==0)? last/2 : last*3+1
		newInfoPopup("Euclide:",["Tu as demandé mon aide!", "Attend une dizaine de secondes, je réfléchis"], "Patiente le temps qu'Euclide réfléchisse")		
		setTimeout(dspAideTimer,10000)
	}
	
	/////////////////////////////////////////////////////////////////////////////////////////////
	// divers eligible storage.js
	/////////////////////////////////////////////////////////////////////////////////////////////
	// conversion d'un array en un tableau directement utilisable en SVG dans une zone carrée 100x100
	// contenu du tableau: [ { x, y, ... } ]
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
</style>

<!-- Affichage grille de calculs -->
{#if soluces && etat && calculs}
	{@const svgObj= convertArrayToSvg(calculs.ops,0,calculs.altitude)}
	<table>
		<tr>
			<td class="tdTop">
				<div class=" adminCadre papier">
					<div style="text-align: center">Traduction de {calculs.init}</div>
					{#if calculs.lastVal!=1}
						<div>
							{calculs.lastVal}{(calculs.lastVal%2==0)? "/2=":"x3+1="}
							<input type=number style="width: 6em" bind:value={calculs.propose} on:keypress={(e)=>{if (e.keyCode==13) calculPropose()}}/>
							<input type=button value="►" on:click={calculPropose} />
							<input type=button value="⌨" on:click={dspAide} />
							<input type=button value="🛈" on:click={()=>dspInit=true} />
						</div>
					{:else}
						<div>
							<input type="button" value="J'ai réussi" on:click={()=>cbResolve(soluces[calculs.ops.length])} />
						</div>
					{/if}
					{#each calculs.ops as c, i}
						<div>
							#{calculs.ops.length - i}: {c.p}
							{#if c.op}
								{c.op}{c.r}
							{/if}
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
							{#if calculs.lastVal==1}
								{@const trad = soluces[calculs.ops.length] || {} }
								<text class="svgTextGreen" x=0 y=10 >Décodage effectuée du</text>
								<text class="svgTextGreen" x=0 y=20 >nombre Ascien: {trad.nbAsc}</text>
								<text class="svgTextGreen" x=0 y=30 >Itérations Syracuse: {calculs.ops.length}</text>
								<text class="svgTextGreen" x=0 y=50 >Selon la pierre de Qarn:</text>
								<text class="svgTextGreen" x=0 y=60 >Nombre Eorzéen: {trad.nbEor}</text>
								<text class="svgTextGreen" x=0 y=70 >Lettre Eorzéenne: {trad.chEor}</text>
								<text class="svgTextGreen" x=0 y=80 >Mot Eorzéen:</text>
								<text class="svgTextGreen" x=0 y=90 >{trad.phrase || "(aucune)"}</text>
							{/if}
						</svg>
					{/if}
				</div>
			</td>
		</tr>
	</table>
{/if}

{#if dspTrouve}
	<div class="popupCadre papier">
		<div class="close" on:click={()=>dspTrouve=false} on:keypress={null} role="button" tabindex=0>X</div>
		<div class="popupZone">
			<div class="popupContent">
				Selon ton parchemin personnel, tu as déjà traduit le nombre ancien {dspTrouve.nbAsc} par:
				{#if dspTrouve.nbEor}<div>○ Le nombre {dspTrouve.nbEor}</div>{/if}
				{#if dspTrouve.chEor}<div>○ La lettre '{dspTrouve.chEor}'</div>{/if}
				{#if dspTrouve.phrase}<div>○ Le mot "{dspTrouve.phrase}"</div>{/if}
				<input type="button" value="J'utilise mon parchemin"
					on:click={()=> { cbResolve && cbResolve(soluces[dspTrouve.nbEor]) } }/>
				<input type="button" value="Je veux refaire la traduction" on:click={()=> dspTrouve=false}/>
			</div>
		</div>
	</div>
{/if}

{#if dspInit}
	<div class="popupCadre papier">
		<div class="close" on:click={()=>dspInit=false} on:keypress={null} role="button" tabindex=0>X</div>
		<div class="popupZone">
			<div class="popupContent">
				<div style="font-size:0.8em">
					Utilise la tablette de Traduction pour faire les opérations selon la Conjecture de Syracuse.
					<br />
					Tu peux demander de l'aide à la
					<a href="https://fr.wikipedia.org/wiki/Euclide" target="_blank">Peluche Euclide</a>
					en cliquant sur sa calculette (⌨) à chaque opération demandée.
				</div>
			</div>
		</div>
	</div>
{/if}


