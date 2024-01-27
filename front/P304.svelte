<script>
	import { onMount, onDestroy } from 'svelte';
	import { loadIt, storeIt, apiCall, playVideo, newInfoPopup } from './storage.js';
	import { jjhhmm, countDownTo, addNotification } from './storage.js';
	import Epiq from './Epiq.svelte'
	import Uch from './Uch.svelte'

	export let pseudo = null;
	export let wsCallComponents; 
	// export let pseudo;
	
	onMount(() => { 
		if (wsCallComponents) wsCallComponents.add(myWsCallback);
		loadStatic();
		loadLieux();
		timerId = setInterval(doTimer,1000)
	});
	onDestroy(() => {
		if (wsCallComponents) wsCallComponents.delete(myWsCallback);
		if (timerId) clearInterval(timerId);
	});

	function myWsCallback(m) {
			if (m.op=="lieuxDeracines") { loadLieux(); return true; }
	}

	let epiqStep = loadIt("P304_epiqStep",0);
	$: storeIt("P304_epiqStep",epiqStep); 

	let lieuxDeracines = null; // infos dynamiques 
	let lieuxStatics = null; // infos statiques
	let aDecouvrir = null; // pour decouverte
	let aDecouvrirX = null; // pour decouverte
	let aDecouvrirY = null; // pour decouverte
	let aResoudre = null; // pour résolution d'une énigme (= nb de sceptre requis si move)
	let fromPos = null; // pour déplacement
	// variables non synchronisées
	const vns = { nbSceptres: 0 }
	
	let timerId = null;
	let relaxDth = 0;
	let lblRelaxDth = null;
	let flagToutTrouve = false;

	let tblQuatre = [0,1,2,3]
	let tblDix = [0,1,2,3,4,5,6,7,8,9]

	function doTimer() {
		if (relaxDth)	lblRelaxDth = countDownTo(relaxDth);
	}
	async function loadStatic() {
		let ret = await apiCall('/lieuxDeracines/static');
		if (ret.status==200) {
			lieuxStatics = ret.o
		}
		else {
			newInfoPopup("ATTENTION","Pour une raison inconnue, le contexte de ce mini-jeu n'est pas chargé correctement","Contactez Kikiadoc")
		}
			
	}
	async function loadLieux() {
		let ret = await apiCall('/lieuxDeracines/dynamic');
		if (ret.status==200) {
			let tmpLieuxDeracines = ret.o;
			// calcul du delai de relaxation (max des dth du pseudo) et verif si il y a encore un truc a trouver
			let lastDth = 0;
			let nbTrouves = 0;
			tmpLieuxDeracines.reverse = [];
			// calcul du nb de trouves, du lastDth eventuel, du vecteur reverse et si rune en position finale
			for (let i=0; i<tmpLieuxDeracines.lieux.length; i++) {
				const lieu = tmpLieuxDeracines.lieux[i];
				if (lieu.tPseudo == pseudo && lieu.tDth > lastDth) lastDth=lieu.trouveDth;
				if (lieu.tPseudo) nbTrouves++;
		    tmpLieuxDeracines.reverse[lieu.pCur] = i;
		    lieu.final = (lieu.pCur == lieuxStatics.lieux[i].tLoc);
				// examine si la rune a changé depuis le dernier fetch
		    lieu.changed =  lieuxDeracines && (lieu.pCur != lieuxDeracines.lieux[i].pCur)
				if (lieu.changed && fromPos==i) { addNotification("Rune déplacée par TBD","red",2); fromPos=null; }
			}
			// delai de relax et flagToutTrouve
			relaxDth = lastDth+11*3600*1000;
			flagToutTrouve = (nbTrouves==tmpLieuxDeracines.lieux.length)

			// examine si la rune a changé depuis le dernier fetch

			// synchIHM
			lieuxDeracines = tmpLieuxDeracines
	  }
	}
	/////////////////////////////////////////////////
	// gestion des lieux dans le cadre de la découverte
	/////////////////////////////////////////////////
	async function proposeLieu() {
		let qIdx = aDecouvrir;
		let qX = aDecouvrirX;
		let qY = aDecouvrirY;
		aDecouvrir=null;
		aDecouvrirX=null;
		aDecouvrirY=null;
		let ret = await apiCall("/lieuxDeracines/trouve/"+qIdx+"/"+qX+"/"+qY,'PUT'); // mise à jour
		// la maj de lieuxDeRacines se fera par le ws
		switch(ret.status) {
			case 208:
				newInfoPopup("Lieu déraciné #"+qIdx,
										 "Tes coordonnées ne semblent pas être les bonnes même avec une tolérance de +/-"+
										 lieuxStatics.lieux[qIdx].d 
										 );
				break;
			case 201: 
				newInfoPopup("Lieu déraciné #"+qIdx,"Tu as trouvé lieu déraciné #"+qIdx)
				break;
		}
	}
	function decouvrir(i) {
		aDecouvrir = i;
	}
	function affVideo(i) {
		playVideo("ff14-6-screens",null,null,lieuxStatics.lieux[i].tTime);
		newInfoPopup("Souviens toi...",
								 "Pour voir plus facilement les lieux, tu peux te repositionner dans la vidéo et faire 'Pause'",
								 "Clic pour fermer ce popup");
	}

	/////////////////////////////////////////////////
	// Gestion des echanges dans le cadre de la rapidité
	/////////////////////////////////////////////////

	// n est le nombre de sceptre a obtenir
	function needSceptres(n) {
		aResoudre=n;
		fromPos=null;
	}
	function distance(from,to) {
		let fx = Math.floor(from/4);
		let fy = from - fx*4;
		let tx = Math.floor(to/4);
		let ty = to - tx*4;
		let d = Math.floor(Math.abs(fx-tx) + Math.abs(fy-ty))
		// console.log("distance:",fromPos,to,d,fx,fy,tx,ty)
		return d
	}
	// echange, l'indice est la position dans la matrice
	async function swapReq(iMat) {
		// si clic sur le fromPos, annule la demande
		if (fromPos==iMat) {fromPos = null; return}

		// Recupère l'index du lieu de l'index
		let iTbl = lieuxDeracines.reverse[iMat]
		// Si la rune est dans la bonne position, impossible
		if (iMat==lieuxStatics.lieux[iTbl].tLoc) {
			newInfoPopup("Impossible","Cette rune est déjà à sa bonne position","Clic pour fermer");
			return;
		}
		
		// Si pas de sceptre, on demande une énigme
		if (!vns.nbSceptres) { needSceptres(1); return }
		
		// On a un sceptre, calcul des éléments possibles
		// si pas de départ, marque le départ
		if (fromPos==null) { fromPos = iMat; return }
		// on a un départ, c'est donc une arrivée...

		// calcul de la distance entre frompos et destPos
		let dist = distance(fromPos,iMat)
		if (dist > vns.nbSceptres) { needSceptres(dist); return}

		// On dispose des sceptres et on demande le move au serveur avec les index des lieux
		let ret = await apiCall("/lieuxDeracines/swap/"+lieuxDeracines.reverse[fromPos]+"/"+lieuxDeracines.reverse[iMat],'PUT')
		// si demande ok, retourne et maj via le ws
		fromPos = null;
		if (ret.status==200) return;
		// 205 : source/dest lock
		addNotification("mouvement impossible (ret="+ret.status+")","red",5);
	}

//admin
let admLieuId=null;
	
</script>

<style>
	td {border: 1px solid white; text-align: center; position: relative; font-size:0.9em}
	.fromPos { outline: 5px solid red}
	.lockPos { outline: 1px solid yellow; color: yellow}
	.button100 {width: 100%; text-align: center} 
	.button50 {font-size:0.7em; width: 40%; text-align: center} 
	.corner { position: absolute; top:0; left:0; z-index:100; color:white }
	.changePos { 
			animation-duration: 4s;
			animation-name: changePosFrames;
			animation-iteration-count: 1;
	}
	@keyframes changePosFrames {
	  from { color: red; }
		50% {color: #000000 }
	  to { color: white; }
	}

</style>

<Uch fullDisplay=0 wsCallComponents={wsCallComponents} pseudo={pseudo} />

{#if pseudo.startsWith("Kikiadoc") }
	<div class="adminCadre">
		Admin lieuxDeracinés
		<br/>
		<input type="number" bind:value={admLieuId} />
		<input type="button" value="admResetId" on:click={()=>apiCall("/lieuxDeracines/{admLieuId}",'DELETE')} />
		<input type="button" value="admResetALL!!" on:click={()=>apiCall("/lieuxDeracines/all",'DELETE')} />
	</div>
{/if}

<div>
	{#if epiqStep==9}
		<Epiq bind:step={epiqStep} oui=9 ouiVal="Revoir la vidéo des lieux" ouiVideo="ff14-6-screens"
			ouiMsg="Pour voir facilement les lieux, tu peux te repositionner dans la vidéo et faire 'Pause'" />
	{/if}
	<input type="button" value="Réafficher le lore" on:click={()=>epiqStep=0} />
</div>

{#if epiqStep==9 && lieuxDeracines && lieuxStatics}
	{#if flagToutTrouve}
		<div style="color:red">Tous les lieux ont été trouvés</div>
	{:else if relaxDth >= Date.now()}
		<div>Tu ne pourras localiser un nouveau lieu déraciné que dans {lblRelaxDth}</div>
		<div>Tu peux rechercher des lieux en attendant</div>
	{:else}
		<div style="color:lightgreen">
			Tu peux localiser un lieu déraciné,
		</div>
	{/if}
	<hr/>
	<table class="papier" style="width:99%; font-size: 0.7em">
		{#each tblDix as i}
			<tr>
			{#each tblQuatre as j}
				{@const idx = i*4+j}
				{@const dIdx = lieuxDeracines.reverse[idx]}
				{@const lieu = lieuxDeracines.lieux[dIdx]}
				{@const cls  = ((lieu.final)? "lockPos stars" : (lieu.changed)? "changePos" : "") + ((idx==fromPos)? " fromPos": "")}
				<td class={cls} on:pipo={()=>alert('pipo')} on:transitionend={()=>alert('s')}>
					<div class="corner">{idx+1})</div>
					{#if lieu.tPseudo}
							<div style="cursor:pointer" role="button" on:click={()=>swapReq(idx)} tabindex=0 on:keypress={null}>
								{lieuxStatics.lieux[dIdx].r}-rune{dIdx+1}@{lieuxStatics.lieux[dIdx].tLoc+1}
								<br/>
								({lieu.tPseudo})
							</div>
					{:else}
							<input class="button100 buttonGreen" type="button" value="Aide-moi" on:click={()=>affVideo(dIdx)} />
							<input class="button100 buttonGreen" type="button" value="J'ai trouvé" on:click={()=>decouvrir(dIdx)} />
					{/if}
				</td>
			{/each}
			</tr>
		{/each}
	</table>
{/if}

{#if aDecouvrir!== null}
	<div class="popupCadre papier">
		<div class="close" on:click={()=>aDecouvrir=null} role="button" tabindex=0 on:keypress={null}>X</div>
		<div class="popupZone">
			<div class="popupContent">
				<div>
				Pour le lieu #{aDecouvrir+1}, positionne toi à l'emplacement EXACT où se trouve Kikiadoc dans la vidéo.
				Quand tu y es, indique ci-dessous les coordonnées indiquées par la boussole IG
				</div>
				<div>
					X:<input bind:value={aDecouvrirX} type="text" placeholder="x.x" size=5>
					Y:<input bind:value={aDecouvrirY} type="text" placeholder="y.y" size=5>
					<input type="button" value="C'est là" on:click={() => proposeLieu()} />
				</div>
			</div>
		</div>
	</div>
{/if}
{#if aResoudre!== null}
	<div class="popupCadre papier">
		<div class="close" on:click={()=>aResoudre=null} role="button" tabindex=0 on:keypress={null}>X</div>
		<div class="popupZone">
			<div class="popupContent">
				<div>
					{#if aResoudre > 1}
						Pour cet échange de runes, il faut {aResoudre} Sceptres du Temps.
					{:else}
						Tu n'as plus de Sceptre du Temps, et tout échanges de runes en nécessite au moins un.
					{/if}
					<br/>
					Résoud cette énigme pour en obtenir un.
				</div>
				<div>
					<input type="button" value="++nbSceptres" on:click={()=>{vns.nbSceptres++; aResoudre=null }} />
				</div>
			</div>
		</div>
	</div>
{/if}


{#if epiqStep==0}
	<div class="reveal">
		blabla lore
		<br/>
		<Epiq bind:step={epiqStep} oui=9 ouiVal="Montre moi!" ouiVideo="ff14-6-screens"  />
	</div>
{/if}

<!-- page P304.svelte -->
	
