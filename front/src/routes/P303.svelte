<script>
	import { onMount, onDestroy } from 'svelte';
	import { loadIt, storeIt, apiCall, playVideo, newInfoPopup } from './storage.js';
	import { jjhhmm, countDownTo, addNotification, playDing, urlImg } from './storage.js';
	import Epiq from './Epiq.svelte'
	import Uch from './Uch.svelte'

	export let pseudo = null;
	export let wsCallComponents; 
	export let page = null;
	export let pageDesc = null;

	const pageEpiqLbl = "P"+pageDesc.n + "_epiqStep" + pageDesc.phase

	// variables globales non synchronisées
	const vns = { timerId: null, lastLoadDth: 0, reponseDth: false }
	
	onMount( async () => { 
		if (wsCallComponents) wsCallComponents.add(myWsCallback);
		await loadStatic();
		await loadLieux();
		vns.timerId = setInterval(doTimer,1000)
	});
	onDestroy(() => {
		if (wsCallComponents) wsCallComponents.delete(myWsCallback);
		clearInterval(vns.timerId);
	});

	function myWsCallback(m) {
			if (m.op=="lieuxDeracines") { loadLieux(m); return true; }
			if (m.op=="ld_sceptres") { majSceptres(m); return true; }
	}

	// gestion de l'épique
	let epiqStep = loadIt(pageEpiqLbl,pageDesc.phase*10);
	$: storeIt(pageEpiqLbl,epiqStep); 

	let lieuxDeracines = null; // infos dynamiques 
	let staticCtx = null; // infos statiques
	let aDecouvrir = null; // pour decouverte
	let aResoudre = null; // pour résolution d'une énigme (= nb de sceptre requis si move, question etc...)
	let fromPos = null; // pour déplacement
	let nbSceptres = 0;
	let nbSceptresDth = 0;
	let nbConsos = 0;
	let coefSceptres = 1;
	let survColor = "white";
	let flagVideoFinalDone=false; // falg de video dontgiveup
	let tagEpiqVideo = "P"+pageDesc.n + "_epiqVideo"
	
	
	let lblRelaxDth = null; // delai de découverte d'un lieu
	let lblIncantDth = null; // delai d'ouverture du jeu d'échange de runes
	let lblReponseDth = null; // delai de réponse à énigme
	let lblResilience = null; // delai de fin de la phase 1

	const tblColIdx = [0,1,2,3]
	const tblLineIdx = [0,1,2,3,4,5,6,7,8,9]

	function doTimer() {
		const dth = Date.now()
		// console.log(dth, lieuxDeracines && lieuxDeracines.relaxDth, pageDesc.incantDth && pageDesc.incantDth )
		let tmpLblRelaxDth = lieuxDeracines && lieuxDeracines.relaxDth > dth && countDownTo(lieuxDeracines.relaxDth);
		let tmpLblIncantDth = pageDesc.incantDth && pageDesc.incantDth > dth && countDownTo(pageDesc.incantDth)
		let tmpLblReponseDth = vns.reponseDth && vns.reponseDth > dth && countDownTo(vns.reponseDth)
		let tmpLblResilience = pageDesc.phase==1 && pageDesc.incantDth<dth && (Math.floor(Math.max(10, 100-((dth-pageDesc.incantDth)/30000) )*10)/10)
		if (lblRelaxDth != tmpLblRelaxDth) lblRelaxDth = tmpLblRelaxDth
		if (lblIncantDth != tmpLblIncantDth) lblIncantDth = tmpLblIncantDth
		if (lblReponseDth != tmpLblReponseDth) lblReponseDth = tmpLblReponseDth
		if (lblResilience != tmpLblResilience) lblResilience = tmpLblResilience
	}

	// calcul sceptres, consos et du coef de sceptres selon le nb conso
	// et d'un réponse server r.o {s: c: }
	function calcCoef(r) {
		console.log("calcCoef",r.o)
		if (r.o) {
			if (Number.isInteger(r.o.s)) nbSceptres = r.o.s
			if (Number.isInteger(r.o.c)) nbConsos = r.o.c
		}
		let tmpCoef = 1;
		let tmpSurvColor ="lightgreen"
		// ATTENTION FONCTION PARTAGEE SERVER
		if (nbConsos<5) { tmpCoef=1; tmpSurvColor ="lightgreen" }
		else if (nbConsos<15) { tmpCoef=2; tmpSurvColor ="orange" }
		else if (nbConsos<25) { tmpCoef=4; tmpSurvColor ="red" }
		else if (nbConsos<35) { tmpCoef=6; tmpSurvColor ="red" }
		else { tmpCoef=10; tmpSurvColor ="red" }
		// commit ihm et calculs
		if (coefSceptres!=tmpCoef) {
			newInfoPopup("La Magie Maléfique te surveille",
									 ["Tes échanges de Runes seront plus couteux"]
									)
		}
		survColor = tmpSurvColor;
		coefSceptres = tmpCoef;
	}
	// mise à jour du nb sceptres selon une réponse ou un wsm
	async function majSceptres(r) {
		// prevenir race condition
		if (r.dth > nbSceptresDth) {
			calcCoef(r)
		}
		else
			console.log("race condition/majSceptres",nbSceptresDth,r.dth)
	}
	async function loadStatic() {
		let ret = await apiCall('/lieuxDeracines/static');
		if (ret.status==200) {
			staticCtx = ret.o
			ret = await apiCall('/lieuxDeracines/sceptres');
			if (ret.status==200)
				calcCoef(ret)
		}
		// test global pour les 2 appels api
		if (ret.status!=200) {
			newInfoPopup("ATTENTION","Pour une raison inconnue ("+ret.status+"), le contexte de ce mini-jeu n'est pas chargé correctement","Contactez immédiatement Kikiadoc")
			page=0;
		}
	}
	async function loadLieux(wsm) {
		// si objet déjà défini via le ws, on ne fait pas l'appel synchrone
		let ret = wsm
		if (!ret) {
			ret = await apiCall('/lieuxDeracines/dynamic');
			if (ret.status!=200) { console.log("err/dynamic",ret); return; }
		}
		// vérifie la synchro entre les chargements en cas d'overlap
		if (vns.lastLoadDth > ret.dth) { console.log("race/ld_dynamic"); return }
		vns.lastLoadDth = ret.dth
		// objet temporaire de calcul
		let tmpLieuxDeracines = ret.o;
		// calcul du delai de relaxation (max des dth du pseudo) et verif si il y a encore un truc a trouver
		let lastDth = 0;
		let nbBonnesPos = 0;
		let nbTrouves = 0;
		let nbTrouvesByPseudo = 0;
		tmpLieuxDeracines.reverseMatrix = [];
		// calcul du nb de trouves, du lastDth eventuel, du vecteur reverse et si rune en position finale
		for (let i=0; i<tmpLieuxDeracines.lieux.length; i++) {
			const lieu = tmpLieuxDeracines.lieux[i];
			tmpLieuxDeracines.reverseMatrix[lieu.pCur] = i;
			if (lieu.tPseudo == pseudo && lieu.tDth > lastDth) lastDth=lieu.tDth;
			if (lieu.tPseudo == pseudo) nbTrouvesByPseudo++;
			if (lieu.tPseudo) nbTrouves++;
			// si la rune est en position finale
			lieu.final = (lieu.pCur == staticCtx.lieux[i].tLoc);
			if (lieu.final) nbBonnesPos++;
			// si la rune a changé depuis le dernier fetch
			lieu.changed =  lieuxDeracines && (lieu.pCur != lieuxDeracines.lieux[i].pCur)
			if (lieu.changed) {
				if (fromPos) fromPos.toPosTbl[lieu.pCur] = null
				if (fromPos && fromPos.iMat==lieu.pCur) {
					fromPos=null;
				}
			}
		}
		// delai de relax et flagToutTrouve
		switch(nbTrouvesByPseudo) {
			case 0:  tmpLieuxDeracines.relaxDth = 0; break;
			case 1:  tmpLieuxDeracines.relaxDth = lastDth+ 4*3600* 500; break; // 2h min
			default: tmpLieuxDeracines.relaxDth = lastDth+42*3600* 500; break; // 21H
		}
		tmpLieuxDeracines.flagToutTrouve = (nbTrouves==tmpLieuxDeracines.lieux.length)
		tmpLieuxDeracines.flagBonnesPos = (nbBonnesPos==tmpLieuxDeracines.lieux.length)

		// synchIHM
		lieuxDeracines = tmpLieuxDeracines

		// Final !
		if (tmpLieuxDeracines.flagBonnesPos) {
			if (!flagVideoFinalDone) {
				flagVideoFinalDone=true;
				if (loadIt(tagEpiqVideo))
					playVideo("ff-6-dontgiveup","00:37")
				else
					playVideo("ff-6-dontgiveup", () => storeIt(tagEpiqVideo,false))
			}
			else
				console.log("video dontgiveup deja vue")
		}
	}
	/////////////////////////////////////////////////
	// gestion des lieux dans le cadre de la découverte
	/////////////////////////////////////////////////
	async function proposeLieu() {
		let qIdx = aDecouvrir.i;
		let qX = aDecouvrir.x;
		let qY = aDecouvrir.y;
		aDecouvrir=null;
		let ret = await apiCall("/lieuxDeracines/trouve/"+qIdx+"/"+qX+"/"+qY,'PUT'); // mise à jour
		// la maj de lieuxDeRacines se fera par le ws
		switch(ret.status) {
			case 208:
				newInfoPopup("Lieu déraciné #"+(qIdx+1),
										 "Tes coordonnées ne semblent pas être les bonnes même avec une tolérance de +/-"+
										 staticCtx.lieux[qIdx].d,
										 null,
										 {back:"papier"}
										 );
				break;
			case 201: 
				majSceptres(ret);
				newInfoPopup("Lieu déraciné #"+(qIdx+1),"Tu as trouvé lieu déraciné #"+(qIdx+1))
				break;
		}
	}
	function decouvrir(i) {
		aDecouvrir = {i:i}
	}
	
	function affVideo(i) {
		playVideo("ff14-6-screens",null,staticCtx.lieux[i].tTime);
		newInfoPopup("Souviens toi...",
								 "Pour voir plus facilement les lieux, tu peux te repositionner dans la vidéo et faire 'Pause'",
								 "Clic pour fermer ce popup");
	}

	/////////////////////////////////////////////////
	// Gestion des echanges dans le cadre de la rapidité
	/////////////////////////////////////////////////

	// phase de resturation du temps,
	let lastQuestion = {dth:0, i:0};
	function gagnerSceptre() {
		if (Date.now() > lastQuestion.dth) {
			lastQuestion.i = Math.floor(Math.random()*staticCtx.questions.length)
			lastQuestion.dth = Date.now()+60000;
		}
		// synch IHM
		aResoudre = { i: lastQuestion.i, q:staticCtx.questions[lastQuestion.i] }
		fromPos=null;
		// synch backend
		apiCall("/lieuxDeracines/intention/reset")
	}
	async function resoudre(r) {
		let q = aResoudre.i
		aResoudre=null;
		fromPos=null;
		let ret = await apiCall("/lieuxDeracines/resoudre/"+q+"/"+r,'PUT')
		if (ret.status == 200) {
			majSceptres(ret)
			console.log("nbs",nbSceptres)
			lastQuestion = {dth:0, i:0};
			playDing("ding-ding");
		}
		if (ret.status == 202) {
			playDing("prout-long");
			vns.reponseDth = Date.now() + 30000;
			newInfoPopup("Reponse incorrecte","Tu ne pourras résoudre une énigme que dans 30 secondes",
									 "Ferme cette popup",{back:"papier"})
		}
	}

	// from et to sont des index de la matrice
	function distance(from,to) {
		let fx = Math.floor(from/tblColIdx.length);
		let fy = from - fx*tblColIdx.length;
		let tx = Math.floor(to/tblColIdx.length);
		let ty = to - tx*tblColIdx.length;
		let d = Math.abs(fx-tx) + Math.abs(fy-ty);
		return Math.floor(d*coefSceptres)
	}

	// phase incantation, mark le début d'un swap
	async function markFrom(iMat,iTbl) {
		apiCall("/lieuxDeracines/intention/"+iTbl)
		let tmpToPosTbl = [];
		
		for (let i = 0; i < tblColIdx.length*tblLineIdx.length; i++) {
			if ( distance(iMat,i) <= nbSceptres)
				tmpToPosTbl[i] = true;
		}

		/*
		let l = Math.floor(iMat/tblColIdx.length);
		let c = iMat - tblColIdx.length*l;
		for (let i = Math.max(l-nbSceptres,0); i <= Math.min(l+nbSceptres,9); i++) {
			for (let j = Math.max(c-nbSceptres,0); j <= Math.min(c+nbSceptres,3); j++) {
				if ( (Math.floor(Math.abs(l-i) + Math.abs(c-j))) <= nbSceptres)
					tmpToPosTbl[i*tblColIdx.length+j] = true;
			}
		}
		*/
		// sync IHM
		fromPos = {iMat: iMat, toLock: staticCtx.lieux[iTbl].tLoc, toPosTbl: tmpToPosTbl }
	}

	// phase incantation, clik pour destination
	async function markTo(iMat,iTbl) {
		// calcul de la distance entre frompos et destPos
		let dist = distance(fromPos.iMat,iMat)
		if (dist > nbSceptres) {
			newInfoPopup(dist+" Sceptres requis",
									 ["Tu n'as pas assez de sceptres pour cet échange",
										(nbSceptres<2)? "Tu dois résoudre une énigme" :	"Tu dois quémander"
									 ],
									 "Clic pour fermer")
			// synch backend
			apiCall("/lieuxDeracines/intention/reset")
			fromPos= null;
			return
		}
		// si le challenge de rapidité n'est pas commencé...
		if (Date.now() < pageDesc.incantDth) {
			newInfoPopup("Patience...",
									 ["Tu ne pourras echanger ces runes que lorsque le challenge aura commencé",
										"Coût de cet échange: "+dist+" Sceptres"
									 ],
									 "Clic pour fermer",
									 {back:"papier"})
			// synch backend
			apiCall("/lieuxDeracines/intention/reset")
			fromPos= null;
			return;
		}

		// On dispose des sceptres et on demande le move au serveur avec les index des lieux
		let ret = await apiCall("/lieuxDeracines/swap/"+lieuxDeracines.reverseMatrix[fromPos.iMat]+"/"+lieuxDeracines.reverseMatrix[iMat],'PUT')
		fromPos = null; // sync IHM
		if (ret.status==202) {
			// mouvement impossible
			calcCoef(ret)
			addNotification(ret.o.m,"red",5);
			return
		}
		if (ret.status==201) {
			// mouvement ok
			calcCoef(ret)
		}
	}

	// demande d'echange, l'indice est la position dans la matrice
	// un premier clic pour l'origine, un second pour la destination
	async function clickIncantation(iMat,iTbl) {
		// si clic sur le fromPos, annule la demande
		if (fromPos && fromPos.iMat==iMat) {
			apiCall("/lieuxDeracines/intention/reset")
			fromPos = null;
			return
		}
		// Si la rune est dans la bonne position, impossible
		if (iMat==staticCtx.lieux[iTbl].tLoc) {
			newInfoPopup("Impossible","Cette rune est déjà à sa bonne position","Clic pour fermer");
			return;
		}
		// Si pas de sceptre, on demande une énigme
		if (!nbSceptres) { 
			newInfoPopup("Impossible",["Tu n'as pas de Sceptre du temps","Résous une énigme"],"Clic pour fermer");
			return
		}
		
		// Echange...
		// si pas de départ, marque le départ
		if (fromPos==null)
			markFrom(iMat,iTbl);
		else
			markTo(iMat,iTbl);
	}
	
	// Click sur la matrice
	function clickMat(iMat) {
		// Recupère l'index du lieu de l'index matrice
		const iTbl = lieuxDeracines.reverseMatrix[iMat]
		console.log('clickMat imat:',iMat,"iTbl:",iTbl)
		if (pageDesc.phase != 1)
			newInfoPopup("Patience...",
									  ["La préparation de la Restauration du Temps n'est pas commencée.",
										 "Tu ne peux pas encore déplacer la Rune "+(iTbl+1)
										],
	 									"Rune découverte par: "+lieuxDeracines.lieux[iTbl].tPseudo+", "+
										jjhhmm(lieuxDeracines.lieux[iTbl].tDth),
									 {back:"papier"}
									)
		else
			clickIncantation(iMat,iTbl)
	}

	async function quemander() {
		let ret = await apiCall('/lieuxDeracines/quemander')
		if (ret.status==202) 
			addNotification("Tu es déjà dans la liste des Quémandeurs","red",1,"prout-long");
		// update via le ws
	}
	
	async function donner(dest) {
		if (nbSceptres < 2) { 
			addNotification("Tu n'as pas assez de Sceptres","red",1);
			playDing("prout-long");
			return;
		}
		if (dest==pseudo) { 
			addNotification("Impossible de te donner un Sceptre à toi-même","red",1);
			playDing("prout-long");
			return;
		}
		if (!lblResilience) {
			if ( !pseudo.startsWith("Kikiadoc") || !confirm("adm?") ) { 
				newInfoPopup("Oups!","Le challenge n'est pas en cours","Ferme ce popup");
				playDing("prout-long");
				return;
			}
		}
		let ret = await apiCall("/lieuxDeracines/donner/"+dest,'PUT')
		if (ret.status==200) majSceptres(ret)
	}

	// une animation s'est terminée, on supprime les classes d'animation
	function animationEnded(iMat) {
		// recupere le lieu de iMat
		let lieu = lieuxDeracines.lieux[lieuxDeracines.reverseMatrix[iMat]]
		// on ne marque plus le lieu comme changé dernièrement
		lieu.changed = false;
		// synchIHM
		lieu=lieu;
	}

	// Affichage du résultat
	let dspResultat = null;
	function calcResultat() {
		if (pageDesc.phase!=1) {
			// Résultat phase découverte
			let trouvesByPseudo = {};
			for (let i=0; i<lieuxDeracines.lieux.length; i++) {
				const tPseudo = lieuxDeracines.lieux[i].tPseudo
				if (tPseudo) {
					trouvesByPseudo[tPseudo] ??= 0;
					trouvesByPseudo[tPseudo]++
				}
			}
			// transofrmation en tableau
			let tblByPseudo = [];
			Object.keys(trouvesByPseudo).forEach((p)=>{tblByPseudo.push(p+": "+trouvesByPseudo[p])})
			// synchr IHM
			dspResultat={ top: "Lieux déracinés découverts: ",
									  msg:"60 millions seront répartis au prorata du nombre de lieux découverts",
									  lst: tblByPseudo, bot: ""}
		}
		else {
			// Résultat phase raipdité
			// synchr IHM
			dspResultat={ top: "Non disponible", msg:"Sera réparti entre tous les Aventuriers qui ont participé", lst: [], bot: ""}
		}
	}
	
	//admin
	let admLieuId=null;
	let showAdmin = false;
	
</script>

<style>
	table {width:99%; font-size: 0.7em }
	.quart {width: 24%; padding:2px; border: 2px solid white; text-align: center; position: relative; font-size:0.9em}
	.tdReponse {padding:2px; border: 2px solid white; text-align: center; position: relative; font-size:0.9em}
	.fromPos { border: 2px solid red}
	.toPos { border: 2px solid orange}
	.toLock { border: 2px solid green;
			animation-duration: 1s;
			animation-name: toLockFrames;
			animation-iteration-count: infinite;
	}
	@keyframes toLockFrames {
	  from { border-color: green; color: green}
		50% { border-color: lightgreen; color: lightgreen}
	  to { border-color: green; color: green}
	}
	.lockPos { border: 2px solid lightgreen; color: lightgreen}
	.button100 {width: 100%; text-align: center} 
	.button50 {font-size:0.7em; width: 40%; text-align: center} 
	.corner1 { position: absolute; top:0; left:0; z-index:100; color:white; font-size: 1.3em }
	.corner2 { position: absolute; bottom:0; right:0; z-index:100; color:white; font-size: 0.6em }
	.changePos { 
			animation-duration: 1s;
			animation-name: changePosFrames;
			animation-iteration-count: 1;
	}
	@keyframes changePosFrames {
	  from { color: black; background-color: black }
		50% { color: black; background-color: #808080 }
	  to { color: white; background-color: black }
	}

	.incantRoleOff { color: white; background-color: grey; border: 5px outset white }
	.incantRoleOn { color: lightgreen; background-color: grey; border: 5px inset white }

</style>

<Uch fullDisplay=0 wsCallComponents={wsCallComponents} pseudo={pseudo} />
<!-- preload videos -->
<video preload="auto" src="{urlImg}ff-6-dontgiveup.mp4" style="display:none">
	<track kind="captions" />
</video>


{#if pseudo.startsWith("Kikiadoc") }
	<div class="adminCadre" style="font-size:0.6em">
		<input type="button" value="adminShowHide" on:click={()=>showAdmin = !showAdmin } />
		phase {pageDesc.phase}
		{#if showAdmin}
			<div>
				lblRelaxDth:{lblRelaxDth},
				lblIncantDth:{lblIncantDth},
				lblReponseDth:{lblReponseDth}
				<br/>
				{#if pageDesc.phase == 0}
					<input type="text" placeholder="idxTABLEAU" bind:value={admLieuId} />
					<input type="button" value="clrTrouveId" on:click={()=>apiCall("/lieuxDeracines/trouves/"+admLieuId,'DELETE')} />
					<input type="button" value="setTrouveId" on:click={()=>apiCall("/lieuxDeracines/trouves/"+admLieuId,'PATCH')} />
					<input type="button" value="clrTrouveAll" on:click={()=>apiCall("/lieuxDeracines/trouves/all",'DELETE')} />
					<input type="button" value="setTrouveAll" on:click={()=>apiCall("/lieuxDeracines/trouves/all",'PATCH')} />
					<input type="button" value="clrSceptresAll" on:click={()=>apiCall("/lieuxDeracines/sceptres/all",'DELETE')} />
				{/if}
				{#if pageDesc.phase == 1}
					<input type="button" value="startPhase1" on:click={()=>pageDesc.incantDth=Date.now()+10000} />
					<input type="button" value="clrPosAll" on:click={()=>apiCall("/lieuxDeracines/positions/all",'DELETE')} />
					<input type="button" value="setPosAll" on:click={()=>apiCall("/lieuxDeracines/positions/all",'PATCH')} />
					<input type="button" value="ClrConso" on:click={()=>apiCall("/lieuxDeracines/conso",'DELETE')} />
				{/if}
			</div>
		{/if}
	</div>
{/if}

<div>
	<input type="button" value="Réafficher le lore" on:click={()=>epiqStep=10*pageDesc.phase} />
	<input type="button" value="Résultats actuels" on:click={()=>calcResultat()} />
	{#if pageDesc.phase == 1}
		Sceptres:{nbSceptres}
		{#if lblIncantDth}
				<span style="color:red">Dans {lblIncantDth}</span>
		{/if}
		{#if lblResilience}
			&nbsp;
			<span style="color:{survColor}">👁({nbConsos})</span>
			<span style="color:lightgreen">{lblResilience}%</span>
		{/if}
	{/if}
</div>

{#if epiqStep==99 && lieuxDeracines && staticCtx}
	<!-- Avancement de l'étape de découverte -->
	{#if pageDesc.phase == 0}
		{#if lieuxDeracines.flagToutTrouve}
			<div style="color:red">Tous les lieux ont été trouvés</div>
		{:else if lblRelaxDth}
			<div style="color:red">Tu pourras localiser un nouveau lieu déraciné dans {lblRelaxDth}</div>
		{:else}
			<div style="color:lightgreen">Tu peux localiser un lieu déraciné</div>
		{/if}
	{/if}
	<!-- Avancement de l'étape de rapidité -->
	{#if pageDesc.phase == 1}
		<div>
			<div>
				Echange:
				{#if nbSceptres>0}
					{#if fromPos}
						<span style="color:lightgreen">Clic rune à échanger</span>
					{:else}
						<span style="color:lightgreen">Clic rune de départ</span>
					{/if}
				{:else}
					<span style="color:lightgrey">Pas de sceptres</span>
				{/if}
			</div>
			<div>
				Actions:
				{#if nbSceptres<2}
					<input type="button" value="Enigme {lblReponseDth || ""}" on:click={()=>{gagnerSceptre(0)}} />
				{/if}
				{#if nbSceptres>1}
					<input type="button" value="Quémander" on:click={()=>{quemander()}} />
				{/if}
			</div>
			<div>
				Donner à:
				{#each lieuxDeracines.quemandeurs || [] as q,i }
					<input type="button" value={q} on:click={()=>{donner(q)}} />
				{/each}
			</div>
		</div>
	{/if}
	<hr/>
	<table class="papier">
		{#each tblLineIdx as i}
			<tr>
			{#each tblColIdx as j}
				{@const iMat = i*tblColIdx.length+j}
				{@const dIdx = lieuxDeracines.reverseMatrix[iMat]}
				{@const lieu = lieuxDeracines.lieux[dIdx]}
				{@const cls = (
					(lieu.final)? "quart lockPos stars" :
					(lieu.changed)? "quart changePos" :
					(fromPos && iMat==fromPos.iMat)? "quart fromPos" :
					(fromPos && iMat==fromPos.toLock)? "quart toLock" :
					(fromPos && fromPos.toPosTbl[iMat])? "quart toPos" :
					"quart"
				) }
				<td class={cls} on:animationend={()=>{animationEnded(iMat)} }>
					<div class="corner1">{iMat+1})</div>
					<div class="corner2">({dIdx+1}</div>
					{#if lieu.tPseudo}
							<div style="cursor:pointer" role="button" on:click={()=>clickMat(iMat)} tabindex=0 on:keypress={null}>
								{staticCtx.lieux[dIdx].r}{#if pageDesc.phase==1}@{staticCtx.lieux[dIdx].tLoc+1}{/if}
								<br/>
								(
								{#if lieu.iPseudo}
									<span style="color:red">{lieu.iPseudo}</span>
								<!--
								{:else if lieu.pPseudo}
									{lieu.pPseudo}
								-->
								{:else}
									{lieu.tPseudo}
								{/if}
								)
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
				{#if lieuxDeracines.relaxDth > Date.now()}
					<span style="color:red">Tu ne peux valider un lieu que dans {lblRelaxDth}</span>
					<br/>
					Si tu as déjà identifié le lieu #{aDecouvrir.i+1},
					positionne-toi à l'emplacement EXACT où se trouve Kikiadoc dans la vidéo
					et note les coordonnées de la boussole IG.
					Tu pourras les indiquer quand une découverte te sera possible.
				{:else}
					<div>
					Pour le lieu #{aDecouvrir.i+1}, positionne toi à l'emplacement EXACT où se trouve Kikiadoc dans la vidéo.
					Quand tu y es, indique ci-dessous les coordonnées indiquées par la boussole IG
					</div>
					<div>
						X:<input bind:value={aDecouvrir.x} type="text" placeholder="x.x" size=5>
						Y:<input bind:value={aDecouvrir.y} type="text" placeholder="y.y" size=5>
						{#if aDecouvrir.x && aDecouvrir.y}
							<input type="button" value="C'est là" on:click={() => proposeLieu()} />
						{/if}
					</div>
				{/if}
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
					{#if lblReponseDth}
						<div>Enigme disponible dans {lblReponseDth}</div>
					{:else}
						<div>
							Lieu: {aResoudre.q.c}
							<br/>
							{aResoudre.q.q}
							<br/>
							<table style="width:100%">
								<tr>
									{#each aResoudre.q.p as opt,r}
										<td class="tdReponse">
											<input type="button" value={opt} on:click={()=>{resoudre(r)}} />
										</td>
									{/each}
								</tr>
							</table>
						</div>
					{/if}
					{#if pseudo.startsWith("Kikiadoc")}
						<div class="adminCadre">
							ADMIN SPOILER:{aResoudre.q.r}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

{#if dspResultat}
	<div class="popupCadre papier">
		<div class="close" on:click={()=>dspResultat=false} role="button" tabindex=0 on:keypress={null}>X</div>
		<div class="popupZone">
			<div class="popupContent">
				<div>
					{dspResultat.top}
					<div style="font-size:0.7em">{dspResultat.msg}</div>
					{#each dspResultat.lst as l,i}
						<div style="font-size:0.8em">{l}</div>
					{/each}
					{dspResultat.bot}
				</div>
			</div>
		</div>
	</div>
{/if}



					
{#if epiqStep==0}
	<div class="reveal">
		Après avoir découvert le feuillet relatif à Teotihuacan,
		j'ai poursuivi mon analyse du Grand Grimoire de la Magie,
		et j'ai identifié 40 feuillets référençant chacun un lieu déraciné.
		<br/>
		40 lieux, c'est beaucoup. C'est pourquoi je compte sur toi mais aussi sur les
		autres Aventuriers de l'Uchronie pour confirmer leur existance.
		<br/>
		Kikiadoc est parti en éclaireur mais il a oublié sa boussole,
		et j'ai besoin des coordonnées exactes de ces lieux.
		<br/>
		<Epiq bind:step={epiqStep} 
			oui=1 ouiVal="Montre moi les lieux!" ouiMsg="Regarde attentivement la vidéo" ouiVideo="ff14-6-screens"  />
	</div>
{/if}
{#if epiqStep==1}
	<div class="reveal">
		J'ai conçu le damier de l'Histoire où chaque case est associée à l'un des 40 lieux déracinés.
		Je te l'afficherai un peu plus tard.
		<div class="br"/>
		Sur chaque case, tu trouveras deux boutons.
		<br/>
		Le premier (aide-moi) te permettra de réafficher	une partie de la vidéo afin de bien localiser le lieu.
		<br/>
		Le second (j'ai trouvé) est à utiliser quand tu te seras positionné EXACTEMENT à l'endroit où Kikiadoc se trouvait
		(la vidéo ne sert qu'a t'indiquer le lieu, il faudra te déplacer un peu pour te positionner
		EXACTEMENT où se trouvait Kikiadoc). Tu pourras alors indiquer les coordonnées de ta boussole.
		<u>Si les coordonnées sont les bonnes, alors une Rune d'Histoire apparaitra dans la case.</u>
		<br/>
		<Epiq bind:step={epiqStep} oui=99 ouiVal="Montre moi le damier!" />
	</div>
{/if}

{#if epiqStep==10}
	<div class="reveal">
		<i>
			Lis <u>attentivement</u> toutes les informations pour te préparer au challenge,
			et si certains éléments ne sont pas clairs ou que tu souhaites une précision, n'hésite pas à
			MP @kikiadoc ou utiliser le canal #discussions sur Discord.
			N'oublie pas que tu peux cliquer sur "réafficher le lore" pour réafficher les explications.
		</i>
		<br/>
		<Epiq bind:step={epiqStep} oui=11 ouiVal="Je vais lire attentivement" />
	</div>
{/if}

{#if epiqStep==11}
	<div class="reveal">
		{pseudo}, je pense que tous les prérequis à la Restauration du Temps seront bientôt réunis,
		à l'exception du dernier: 
		<br/>
		<u>Rétablir l'ordre des Runes de l'Histoire.</u>
		<br/>
		Tu connais déjà le Damier de l'Histoire et ses Runes, tu as contribué à les identifier
		en localisant tous les lieux déracinés.
		<br/>
		Mais échanger des Runes du Damier de l'Histoire serait immédiatement vu par la
		Magie Maléfique, c'est pourquoi je ne peux démarrer cette opération que si un
		maximum d'entre-vous êtes préparés!
		<br/>
		Aussi, je souhaite t'expliquer comment cela va se dérouler: Ce sera un challenge
		de rapidité où tu devras collaborer avec les autres Aventuriers.
		<br/>
		A la fin de mes explications, tu pourras t'exercer en attendant le début du challenge.
		<br/>
		<Epiq bind:step={epiqStep} oui=12 ouiVal="Trop bien, je vais pouvoir m'exercer!" />
	</div>
{/if}

{#if epiqStep==12}
	<div class="reveal">
		Oui {pseudo}, tu pourras t'exercer
		car seule une réelle coopération
		permettra de rétablir rapidement l'ordre des Runes de l'Histoire.
		<div class="blinkMsg">
			Ton seul adversaire lors de ce challenge est le TEMPS, les autres Aventuriers sont tes alliés.
		</div>
		Tu pourras choisir à tout instant d'être "un fournisseur de sceptres" ou "un déplaceur de runes",
		cela n'est pas important, du moment que tu contribues à l'effort commun.
		La performance globale sera fonction du TEMPS mis pour rétablir
		l'ordre des Runes de l'Histoire.
		Evidemment, plus tu contribues,	plus court sera le TEMPS pour rétablir l'ordre des Runes.
		<div class="br" />
		<Epiq bind:step={epiqStep} oui=13 ouiVal="Un pour tous, tous pour un!" />
	</div>
{/if}

{#if epiqStep==13}
	<div class="reveal">
		<img src={urlImg+"restaurationDuTemps/Tuto1.png"} style="width:40%; float:right" alt="" />
		Exactement, c'est un pour tous et tous pour un!
		<div style="br" />
		Tu connais déjà mon damier de l'Histoire où tu as identifié les runes liées à des lieux déracinés.
		<br />
		Il faudra déplacer les 40 runes pour les positionner
		à leurs endroits dans l'Histoire.
		<br/>
		J'ai indiqué sur chacune des runes sa position cible dans l'Histoire, comme tu peux le voir
		dans l'image ci-contre, en l'annotant d'un @xx indiquant sa position dans l'Histoire.
		<br/>
		<Epiq bind:step={epiqStep} oui=14 ouiVal="J'ai compris" />
		<div style="clear:both" />
	</div>
{/if}

{#if epiqStep==14}
	<div class="reveal">
		<img src={urlImg+"restaurationDuTemps/Tuto2.png"} style="width:40%; float:right" alt="" />
		Tu peux échanger deux runes, la rune X prendra la place de la rune Y et reciproquement.
		<div class="br"/>
		Pour définir un échange, clique sur la première rune, tu verras alors tes possibilités d'échange.
		Les autres Aventuriers verront ton pseudo en rouge sur cette rune,
		et cela leur indiquera ton intention d'échanger cette rune.
		<br/>
		Si l'une des possibilités te convient, clique sur la seconde rune pour réaliser l'échange.
		<br/>
		Si elles ne te conviennent pas, tu peux annuler ton intention en recliquant sur la première rune.
		<br/>
		Si tu cliques sur une rune au delà des tes possibilités, tu verras le nombre de Sceptres requis.
		<br/>
		<Epiq bind:step={epiqStep} oui=15 ouiVal="J'ai compris" />
		<div style="clear:both" />
	</div>
{/if}

{#if epiqStep==15}
	<div class="reveal">
		<img src={urlImg+"restaurationDuTemps/Tuto3.png"} style="width:40%; float:right" alt="" />
		Les Sceptres sont des objets rares, mais tu peux en gagner!
		<br/>
		Si tu as moins de 2 Sceptres, tu peux en gagner en résolvant des énigmes.
		Pour cela, clique sur le bouton "énigme", et trouve la réponse.
		<br/>
		<u>Toutes les réponses aux énigmes se trouvent dans une chambre ou dans la maison de cl de Kikiadoc.</u>
		<div class="br" />
		Dès que tu as au moins un Sceptre, tu peux faire un échange de runes.
		<br/>
		Si tu as au moins deux Sceptres, tu peux aussi en donner à un autre Aventurier
		dans le besoin pour lui permettre un échange de Runes couteux.
		<u>Attention, tu perdras deux Sceptres, et il n'en recevra qu'un!</u>
		<br/>
		Dans ce dernier cas, la limite des 2 sceptres ne s'applique pas à cet autre Aventurier.
		Pour donner un Sceptre, clique sur le bouton "donner.." de l'Aventurier
		à qui tu souhaites donner un Sceptre (en en consommer 2)
		<br/>
		<Epiq bind:step={epiqStep} oui=16 ouiVal="J'ai compris" />
		<div style="clear:both" />
	</div>
{/if}

{#if epiqStep==16}
	<div class="reveal">
		<img src={urlImg+"restaurationDuTemps/Tuto4.png"} style="width:40%; float:right" alt="" />
		Enfin, si tu as identifié un échange coutant plus que le nombre de Sceptres dont tu disposes,
		tu peux cliquer sur le bouton 'Quémander' pour demander aux autres Aventuriers de te donner
		des Sceptres afin de réaliser cet échange.
		<br/>
		Tu ne peux quémander que si tu as au moins deux Sceptres. 
		<br/>
		Seulement 3 Aventuriers peuvent quémander en même temps. Si tu quémandes alors qu'il y
		a déjà 3 quémandeurs, ta demande remplacera la plus ancienne.
		<br/>
		<Epiq bind:step={epiqStep} oui=17 ouiVal="J'ai compris" />
		<div style="clear:both" />
	</div>
{/if}

{#if epiqStep==17}
	<div class="reveal">
		N'oublie pas, c'est Un pour tous, Tous pour un !
		<br />
		Ton unique adversaire est le TEMPS
		<div class="br" />
		L'important n'est pas d'obtenir un grand nombre de sceptres,
		ni de faire un maximum d'échange de Runes, mais que toutes les Runes se retrouvent
		à leur bonne position sur le Damier de l'Histoire au plus vite en collaborant
		avec les autres Aventuriers.
		<div class="blinkMsg">
		Tant que le challenge n'est pas commencé, tu peux t'exercer,
		mais tu ne pourras pas faire d'échange de Runes.
		</div>
		Si tu n'as pas encore 2 sceptres,
		profite de cet exercise pour compléter ton stock initial en résolvant des énigmes.
		Et profite de cette phase d'exercice pour définir une stratégie entre Aventuriers!
		<br/>
		<Epiq bind:step={epiqStep} oui=18 ouiVal="Quelques derniers conseils?" />
	</div>
{/if}

{#if epiqStep==18}
	<div class="reveal">
		Si possible, lors du challenge, rejoint le salon vocal #blablabla sur Discord,
		tu pourras partager vocalement ta stratégie, tes actions avec les autres Aventuriers.
		Kikiadoc m'a dit qu'il y sera pour t'aider si besoin.
		<div class="br" />
		<u>Si tu es sur Windows et tu as un seul écran</u>, utilise alt-tab pour basculer entre le jeu et le site.
		Surtout ne ferme pas ton navigateur et
		garde le site affiché dans ton navigateur afin de recevoir les notifs et informations vocales
		<br/>
		<u>Si tu es sur Windows avec deux écrans</u>, affiche le site et le jeu sur deux écrans différents,
		<br/>
		<u>Si tu utilises un smartphone pour afficher le site</u>, reste avec le site affiché,
		ton smartphone ne devrait pas passer en veille pendant le challenge car je lui demande d'être en
		<a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/API/WakeLock">Wakelock</a>
		<div class="br" />
		<Epiq bind:step={epiqStep} oui=19 ouiVal="C'est tout?" />
	</div>
{/if}

{#if epiqStep==19}
	<div class="reveal">
		Oui, c'est tout ^^
		<div class="br" />
		Je te donne donc rendez-vous dans la
		<u>maison de cl de Kikiadoc, dimanche 31 mars à 20:00:00 précise (heure de Paris)</u>,
		afin de satisfaire le dernier prérequis avant l'invocation de la Restauration du Temps.
		<div class="br" />
		<span class="blinkMsg">La bienséance veut que tu sois quelques minutes en avance sur Discord,
			sur le site	et dans la maison de cl de Kikiadoc!</span>
		<div class="br" />
		Je te propose maintenant de t'exercer en t'indiquant le Damier de l'Histoire!
		<div class="br" />
		<Epiq bind:step={epiqStep} oui=99 ouiVal="Oh oui!" />
	</div>
{/if}


<!-- page P303.svelte -->
	
