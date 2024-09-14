<script>
	import { onMount, onDestroy } from 'svelte';
	import { loadIt, storeIt, apiCall, getEpsilon, jjmmhhmmss } from "./storage.js"
	import { addNotification, newInfoPopup, playVideo, urlCdn, countDownTo } from "./storage.js"

	// pour les screens: mascotte fantome triste ou poupée ascienne
	// gobelin de la mimine bleue
	
	import Epiq from './z/Epiq.svelte'
	
	export let wsCallComponents
  export let pseudo
  // export let page
  export let pageDesc = null
  // export let pageDone = []
	// export let pseudoList = []
	
	const pageEpiqLbl = "P"+pageDesc.n + "_epiqStep"
	const pageSaisiesLbl = "P"+pageDesc.n + "_saisies"

	// etape de l'epique
	let epiqStep = loadIt(pageEpiqLbl,0)
  $: storeIt(pageEpiqLbl,epiqStep)
	// etat des saisies
	let saisies = loadIt(pageSaisiesLbl,{tableaux:[],nombres:[],traductions:[]})
  $: storeIt(pageSaisiesLbl,saisies)
	// challenge termine
	let challengeTermine=false

	

	let timeoutId = null
	
	// Gestion des reload, refresh etc..
	onMount(() => {
		if (wsCallComponents) wsCallComponents.add(myWsCallback)
		loadEtat(null)
		calculParametres() // setup aussi le timer
		timeoutId = setInterval(onTimer,500)
	})
	onDestroy(() => {
		if (wsCallComponents) wsCallComponents.delete(myWsCallback)
		clearInterval(timeoutId)
	})
	// callback sur le websocket
	function myWsCallback(m) {
		if (m.op=="usinesGaz") {	loadEtat(m); return true }
	}

	// calcul des parametres
	let probaMax = 100
	let delaiFail = 30000
	let delaiTick = 2
	function calculParametres() {
		switch(saisies.configRate) {
			case 1:	probaMax =  50; delaiTick=6; delaiFail=60000; break
			case 2:	probaMax =  75; delaiTick=4; delaiFail=40000; break
			case 3:	probaMax = 100; delaiTick=2; delaiFail=20000; break
			default:
				probaMax = 100; delaiTick=2; delaiFail=30000; 
				saisies.configRate=3
		}
		console.log("Parametres","proba",probaMax,"timer",delaiTick)
	}

	// etat actue du challenge (maj par get ou WS)
	const tblLigne = new Array(10).fill(false)
	const tblCol = new Array(4).fill(false)
	let etat = null // { divers, lieux[]: { status, unlockPseudo, unlockDth, findPseudo, findDth}}
	let localLockDth=0
	
	// chargement de l'état (mWs msg du websocket ou d'un autre requete null)
	async function loadEtat(mWs) {
		let ret = (!mWs)?  await apiCall("/usinesGaz") : mWs
		if ( ret.status!=200) return
		etat = ret.o
		recalcEtat()
	}

	// recalcul les parametres d'affichage
	function recalcEtat() {
		let nbSurv = 0 // clacul du nombre de case surveillées par le réparateur alpha
		let nbTrouve = 0 // nombre de trouves
		let trouveMax = 0 // calcul le dth de dernier trouve du pseudo
		let unlockMax = 0 // calcul le dth de dernier unlock du pseudo
		let now=Date.now()+getEpsilon() // raccord sur l'horloge serveur
		for (let c=0;c<4;c++)
			for (let l=0;l<10;l++) {
				let lieu = etat.lieux[l*4+c]
				// lieu surveillé ?
				if (!tblCol[c] || !tblLigne[l]) nbSurv++
				// calcul du trouveDth et unlockDth perso
				if (lieu.unlockPseudo==pseudo && lieu.unlockDth > unlockMax) unlockMax=lieu.unlockDth
				if (lieu.trouvePseudo==pseudo && lieu.trouveDth > trouveMax) trouveMax=lieu.trouveDth
			}
		etat.trouveMax = trouveMax+etat.trouveDelai
		etat.unlockMax = unlockMax+etat.unlockDelai
		etat.canTrouve = now>etat.trouveMax // indique si l'option de découverte est ok ou si il faut attendre
		etat.canUnlock = now> Math.max(etat.unlockMax,localLockDth) // indique si l'option de unlock est ok ou si il faut attendre
		etat.nbSurv = nbSurv // nombre de lieux surveillés
		etat.proba = Math.floor(probaMax*(40-nbSurv)/40)
		for (let c=0;c<4;c++)
			for (let l=0;l<10;l++) {
				let lieu = etat.lieux[l*4+c]
				// type du lieu
				switch(lieu.status) {
					case "lock":
						lieu.tdClass= (!tblCol[c] || !tblLigne[l])? "lockSurv" : "lockFree"
						break
					case "unlock":
						lieu.tdClass= (etat.canTrouve)? "unlockCan" : "unlockCant"
						// si echeance timer... pass en lock, ferme le popup d'unlock 
						if (lieu.unlockDth+etat.trouveDelai <= now) { lieu.status="lock"; dspUnlock=null }
						break
					case "trouve":
						lieu.tdClass="trouve"
						nbTrouve++
						break
				}
			}
		etat.nbTrouve = nbTrouve
	}

	//timer
	let currentTick= 0
	function onTimer() {
		if (!etat) return
		if (++currentTick>=delaiTick) {
			currentTick=0
			if (Math.random()<0.40)	
				clearCol(Math.floor(Math.random()*tblCol.length))
			clearLigne(Math.floor(Math.random()*tblLigne.length))
		}
		recalcEtat()
	}

	function clicLigne(e,l) {
		if (!etat.canUnlock) return addNotification("Tu dois attendre...","red",2,"prout-long")
		tblLigne[l]=true
		recalcEtat()
	}
	function clicCol(e,c) {
		if (!etat.canUnlock) return addNotification("Tu dois attendre...","red",2,"prout-long")
		tblCol[c]=true
		recalcEtat()
	}
	function clearLigne(l) {
		tblLigne[l]=false
		// recalcEtat()
	}
	function clearCol(c) {
		tblCol[c]=false
		// recalcEtat()
	}
	
	function clicLieu(l,c) {
		const idx=l*tblCol.length+c
		let lieu = etat.lieux[idx]
		switch(lieu.status) {
			case "lock":
				if (!etat.canUnlock) return addNotification("Repose toi un peu",'yellow',2,'prout-long')
				// Si case bloquée ou proba trop basse
				if (etat.proba<20 || !tblLigne[l] || !tblCol[c]) return addNotification('Trop de risques','yellow',2,'prout-long')
				if (etat.proba/100 < Math.random()) {
					// tentative echouée
					newInfoPopup("Pas de chance!","le Réparateur a vu ton manège. Cache-toi un peu","Ferme ce popup pour continuer")
					localLockDth=Date.now()+delaiFail // horloge locale
					return					
				}
				// tentative reussie
				lieu.status="unlock"
				lieu.unlockDth = Date.now()+getEpsilon()  // horloge serveur
				lieu.unlockPseudo = pseudo
				recalcEtat() // pour forcer a la date heure actuelle en attendnt le refresh server et le tick
				// dspUnlock = lieu
				newInfoPopup("Bravo!",
										 [
											 "Tu as bouché un avaloir de la station Alpha",
											 "Tu peux cliquer dessus (ou sur un autre avaloir bouché) pour en découvrir l'extrémité"
										 ]
										 ,"Ferme ce popup pour continuer")
				apiCall('/usinesGaz/unlock/'+idx,'POST')
				break
			case "unlock":
				dspUnlock = lieu
				break
			case "trouve": 
				dspTrouve = lieu
				break
		}
		recalcEtat()
	}

	async function tryTrouve(e) {
		// dspUnlock est actif et est le lieu concerné
		let tmpNbTrouve = etat.nbTrouve // conserve le nbTrouve actuel car possible race condition
		// la maj se fera par le WS
		let ret = await apiCall("/usinesGaz/trouve/"+dspUnlock.i+"/"+saisies.X+"/"+saisies.Y,'POST')
		// si erreur de coordonnées
		if (ret.status==201) return addNotification("Mauvaise coordonnées","red",10,"prout-long")
		// si ok, video et ferme le popup
		if (ret.status==200) { 
			// Si ce n'est pas le dernier trouve... video inter (nbTrouve pas encore incrémenté)
			if (tmpNbTrouve+1 < etat.lieux.length )
				playVideo('ff-7/ff-7-stationalpha-intermediaire')
			else
				playVideo('ff-7/ff-7-stationalpha-final')
			dspUnlock=null
			return
		}
	}
	
	//afichage detail...
	let dspUnlock=null
	let dspTrouve=null
	let dspResultats = null
	
</script>
<style>
	.unlockCan {background-color: lightgreen; width:20%; cursor: pointer}
	.unlockCant {background-color: orange; width:20%; cursor: pointer}
	.lockSurv {color:red; background-color: red; width:20%; cursor: not-allowed;}
	.lockFree {color:white; background-color: lightgreen; width:20%; cursor: pointer}
	.trouve {color:white; width:20%; cursor: pointer}
	.selDown { background-color: green; cursor:pointer}
	.selDown::before { content: "✅"}
	.unselDown { background-color: red; cursor:pointer}
	.unselDown::before { content: "⬇️"}
	.selRight { background-color: green; cursor:pointer}
	.selRight::after { content: "✅"}
	.unselRight { background-color: red; cursor:pointer}
	.unselRight::after { content: "➡️"}
	.nosel { background-color: red; cursor:wait}
	.nosel::before { content: "⏳"}
</style>


<!-- svelte-ignore a11y-click-events-have-key-events -->
<div>
	
{#if pseudo.startsWith("Kikiadoc")}
	<div class="adminCadre">
		Admin:
		<input type="button" value="Reset Challenge" on:click={()=>confirm('reset challenge') && apiCall('/usinesGaz/admResetChallenge','DELETE')}/>
		<input type="button" value="Reset Timers" on:click={()=>confirm('reset timers') && apiCall('/usinesGaz/admResetTimers','DELETE')} />
	</div>
{/if}

{#if etat}
	<div>
	  <input type="button" on:click={()=> epiqStep=0} value="Revoir le lore" />
	  <input type="button" on:click={()=> epiqStep=0} value="Resultats" />
		<span style="font-size:0.7em" class="gpHelp" gphelp="Delai à respecter avant de pouvoir perturber le Réparateur de la Station Alpha afin d'inspecter un avaloir à gaz">
			⏳{countDownTo(Math.max(etat.unlockMax,localLockDth))}<sup>🛈</sup>
		</span>
		<span style="font-size:0.7em" class="gpHelp" gphelp="Delai à respecter avant de pouvoir identifier l'extrémité d'un avaloir à gaz bouché">
			🔎{countDownTo(etat.trouveMax)}<sup>🛈</sup>
		</span>
		<span style="font-size:0.7em">
			<input type="range" min=1 max=3 bind:value={saisies.configRate} on:change={()=>calculParametres()} style="width: 3em; height:0.4em" />
			<sup class="gpHelp" gphelp="Rapidité du réparateur de la station Alpha">🛈</sup>
		</span>
	</div>
{/if}
{#if epiqStep==0}
	<div>
		<img src="{urlCdn}ff-7/lasource-infos.png" alt="" style="width:20%; float: right"/>
		{pseudo}, il faut détruire la Station Alpha sinon Eorzéa est perdu.
		<div class="br"/>
		Au fond de la station Alpha se trouve le Générateur de Gaz, il ne faut pas s'en approcher!
		<br/>
		Il s'y trouve aussi le Réparateur-Alpha et les 40 Avaloirs.
		<br/>
		Les Avaloirs sont organisés selon 10 lignes et 4 colonnes.
		<div class="br"/>
		Chaque Avaloir diffuse du Gaz de Possession vers sa cible, un lieu d'Eorzéa.
		<br/>
		En distrayant le Reparateur, tu peux augmenter ta chance d'identifier la cible d'un Avaloir.
		Quand la chance est suffisante, tu peux tenter cette identification et boucher temporairement l'Avaloir.
		<br/>
		Quand le lieu associé à un Avaloir est identifié, tu peux t'y rendre et m'indiquer les coordonnées de ce lieu.
		Je bloquerai alors l'extrémité de l'Avaloir.
		<div class="br"/>
		<Epiq bind:step={epiqStep} oui=10 ouiVal="Et on fait ca tous ensemble?" />
		<div style="clear:both" />
	</div>
{/if}
{#if epiqStep==10}
	<div>
		Oui, il y a 40 Avaloirs et chaque opération est périlleuse, longue et délicate.
		<div class="br"/>
		C'est pourquoi j'ai sollicité tous les Aventuriers.
		<div class="br"/>
		Tu l'as compris, il y a plusieurs phases pour bloquer définitivement un avaloir, mais elle peuvent se superposer:
		Tous les aventuriers peuvent faire un peu tout en même temps!
		<div class="br"/>
		Ca a l'air compliqué, mais tu verras que ce n'est pas le cas quand tu te lanceras dans l'Aventure!
		<div class="br"/>
		Tu peux jeter un oeuil sur la matrice des Avaloirs en vidéo.
		<div class="br"/>
		<div style="font-weight: bold; text-decoration: underline">Phase d'identification d'un lien cible d'un Avaloir</div>
		Pour identifier un lien cible d'un Avaloir, il faut distraire le Réparateur:
		<br/>
		C'est une phase de rapidité "solo", répétable toutes les {"TBC"} minutes.
		<br/>
		Lorsque cette phase est possible, des flèches ⬇️ et ➡️ sont affichées autour de la Matrice des Avaloirs.
		En cliquant sur ces flèches, tu va perturber le Réparateur,
		et dès que ta probabilité d'identification est "suffisante", tu peux cliquer sur la case d'un Avaloir.
		<br/>
		Si tu as de la chance, l'Avaloir sera alors bouché et sa cible identifiée.
		<br/>
		Attention, le Réparateur va annuler rapidement tes pertubations! Tu pourras règler la difficulté de cette phase.
		<br/>
		Voir un complément en vidéo.
		<div class="br"/>
		<div style="font-weight: bold; text-decoration: underline">Phase de blocage d'un lieu cible:</div>
		Quand un Avaloir est identifié/bouché, tous les Aventuriers
		peuvent en identifier le lieu cible pendant {"TBC"}.
		Si un lieu cible d'un Avaloir n'a pas été identifiée pendant ce délai, le réparateur aura fini de déboucher l'Avaloir.
		<div class="br"/>
		Si tu as identifié un lieu cible d'un Avaloir, tu ne peux en découvrir un autre qu'après un repos de {"TBC"}.
		Mais tu peux continuer à identifier/boucher des avaloirs, car même si tu ne peux pas faire d'identification,
		tu aideras les autres Aventuriers et si un autre Aventutier identifie un lieu cible que tu as idenfié,
		tu récupèreras une partie des gains.
		<div class="br"/>
		<div style="font-weight: bold; text-decoration: underline">Réglage de la difficulté de la rapidité solo:</div>
		Difficulté:
		<input type="range" min=1 max=3 bind:value={saisies.configRate} style="width: 6em; height:0.4em" />
		<br/>
		<div class="info">
			{#if saisies.configRate==3}Rapide (1s), probabilité de réussite max: 100%, si le Réparateur te voit: 30 secondes{/if}
			{#if saisies.configRate==2}Moyen(1.5s), probabilité de réussite max: 75%, si le réparateur te voit: 1 minute {/if}
			{#if saisies.configRate==1}Lent(2s), probabilité de réussite max: 50%, si le Réparateur te voit: 2 minutes {/if}
		</div>
		<div class="info">Tu pourras le modifier plus tard</div>
		<Epiq bind:step={epiqStep} oui=99 ouiVal="GO GO GO!" />
		<div style="clear:both" />
	</div>
{/if}
{#if epiqStep==99 && etat}
	<div>
		<!--<table border=1 style="width: 100%; background-size: cover; background-image: url('https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/ff-7/damier-freepix.jpg') ">-->
		<table border=1 style="width: 100%; text-align: center">
			<tr>
				<td></td>
				<td class={ (etat.canUnlock)? ((tblCol[0])? "selDown":"unselDown"): "nosel" } on:click={(e)=>clicCol(e,0)} ></td>
				<td class={ (etat.canUnlock)? ((tblCol[1])? "selDown":"unselDown"): "nosel" } on:click={(e)=>clicCol(e,1)} ></td>
				<td class={ (etat.canUnlock)? ((tblCol[2])? "selDown":"unselDown"): "nosel" } on:click={(e)=>clicCol(e,2)} ></td>
				<td class={ (etat.canUnlock)? ((tblCol[3])? "selDown":"unselDown"): "nosel" } on:click={(e)=>clicCol(e,3)} ></td>
			</tr>
			{#each tblLigne as _,l}
				<tr>
					<td class={  (etat.canUnlock)? ((tblLigne[l])? "selRight":"unselRight"): "nosel" } on:click={(e)=>clicLigne(e,l)} ></td>
					{#each tblCol as _,c}
						{@const lieu = etat.lieux[l*tblCol.length + c]}
						{@const status = lieu && lieu.status}
						<td class={lieu.tdClass} on:click={()=>clicLieu(l,c)} on:keypress={null} >
							{#if status=="lock"} 
								{etat.proba}%
							{:else if status=="unlock"}
								<table>
									<tr>
										<td>🔎</td>
										<td style="font-size:0.5em">
											{lieu.unlockPseudo}
											<br/>
											{countDownTo(lieu.unlockDth+etat.trouveDelai)}
										</td>
									</tr>
								</table>
							{:else if status=="trouve"}
								<table>
									<tr>
										<td>✅</td>
										<td style="font-size:0.5em">
											{lieu.unlockPseudo}
											<br/>
											{lieu.trouvePseudo}
										</td>
									</tr>
								</table>
							{/if}
						</td>
					{/each}
				</tr>
			{/each}
		</table>
	</div>
{/if}

{#if dspUnlock}
	<div class="popupCadre papier">
		<div class="close" on:click={()=>dspUnlock=null} role="button" tabindex=0>X</div>
		<div class="popupZone">
			<div class="popupContent">
				{#if etat.canTrouve}
					<div class="info">
						Si tu n'as pas tout de suite la solution,
						tu peux fermer ce popup,
						tu pourras choisir plus tard cet avaloir bouché, ou un autre, en cliquant sur sa case.
					</div>
				{:else}
					<div class="info">
						Tu ne peux pas identifier l'extrémité de cet avaloir car tu en as trouvé une récemment et
						tu dois te reposer encore
						{countDownTo(etat.trouveMax)}
						<br/>
						Tu peux fermer ce popup,
						tu pourras choisir plus tard cet avaloir bouché, ou un autre, en cliquant sur sa case.
					</div>
				{/if}
				{dspUnlock.unlockPseudo} a bouché l'avaloir #{dspUnlock.i+1} et aperçu son extrémité.
				<br/>
				Le réparateur de la station Alpha va finir de déboucher cet avaloir dans 
				{countDownTo(dspUnlock.unlockDth+etat.trouveDelai)}
				<br/>
				{#if etat.canTrouve}
					<div>
						Je pourrai condamner dénitivement cet avaloir en bouchant son extrémité. Pour celà indique-moi ses coordonnées.
						Un Nouvel Ancien en garde la sortie:
					</div>
					<div>
						X:<input type="number" bind:value={saisies.X} min=0 max=50 step="0.1" />
						Y:<input type="number" bind:value={saisies.Y} min=0 max=50 step="0.1" />
						<input type="button" value="➤" on:click={(e)=>tryTrouve(e)} />
					</div>
				{/if}
				Voici ce qu'a vu {dspUnlock.unlockPseudo}:
				<br/>
				<img src="{urlCdn}ff-7/usinesGaz/avaloir-{dspUnlock.i}.png" style="width:100%" alt=""/>
			</div>
		</div>
	</div>
{/if}

{#if dspTrouve}
	<div class="popupCadre papier">
		<div class="close" on:click={()=>dspTrouve=null} role="button" tabindex=0>X</div>
		<div class="popupZone">
			<div class="popupContent">
				L'avaloir #{dspTrouve.i+1} a été bouché par {dspTrouve.unlockPseudo}  {jjmmhhmmss(dspTrouve.unlockDth)}
				<br/>
				Son extrémité a été trouvée par {dspTrouve.trouvePseudo}  {jjmmhhmmss(dspTrouve.trouveDth)}
				<br/>
				<img src="{urlCdn}ff-7/usinesGaz/avaloir-{dspTrouve.i}.png" style="width:100%" alt=""/>
			</div>
			<div class="info">Tu peux fermer cette popup et la rouvrir plus tard</div>
		</div>
	</div>
{/if}
	
{#if dspResultats}
	<div class="popupCadre papier">
		<div class="close" on:click={()=>dspResultats=null} role="button" tabindex=0>X</div>
		<div class="popupZone">
			<div class="popupContent">
				{#each dspResultats as e,i}
					<span>{e} &nbsp;</span>
				{/each}
			</div>
			<div>Total: {dspResultats.length}</div>
		</div>
	</div>
{/if}

</div>

<!-- P360.svelte -->
