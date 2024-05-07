<script>
	import { onMount, onDestroy  } from 'svelte';
	import { countDownTo, jjmmhhmmss, apiCall, newInfoPopup } from './storage.js';
	
	export let wsCallComponents; 
	export let pseudo; 

	onMount(() => { 
		console.log('mount 203');
		if (wsCallComponents) wsCallComponents.add(myWsCallback);
		loadForetMap();
		loadForetStatus();
	});
	onDestroy(() => {
		console.log('destroy 203');
		if (wsCallComponents) wsCallComponents.delete(myWsCallback);
		if (countDownIntervalId) window.clearInterval(countDownIntervalId);
	});
	
	function myWsCallback(m) {
		if (m.op=="collection" && m.name=="broceliande") {
			loadForetStatus();
			return true;
		}
	}

	const foretIdx = [ 0,1,2,3,4,5 ];
	const foretType = [
		/* 0 */ {icon: "iconBoisBande"},
		/* 1 */ {icon: "iconCamelot"},
		/* 2 */ {icon: "iconArbre"},
		/* 3 */ {icon: "iconCoffre"},
		/* 4 */ {icon: "iconPiege"},
		/* 5 */ {icon: "iconMonstre"},
		/* 6 */ {icon: "iconJeton"},
		/* 7 */ {icon: "iconError"},
		/* 8 */ {icon: "iconError"},
		/* 9 */ {icon: "iconError"},
	];

	// Remplacé par synchro server
	let foretMap = [
		{t:9},{t:9},{t:9},{t:9},{t:9},{t:9},
		{t:9},{t:9},{t:9},{t:9},{t:9},{t:9},
		{t:9},{t:9},{t:9},{t:9},{t:9},{t:9},
		{t:9},{t:9},{t:9},{t:9},{t:9},{t:9},
		{t:9},{t:9},{t:9},{t:9},{t:9},{t:9},
		{t:9},{t:9},{t:9},{t:9},{t:9},{t:9}
	];

	// Remplacé par synchro server
	let foretStatus = {
		name: "broceliande",
		participants: {}, /* .pseudo.nextDth */
		emissaire: {l:5, c:0 },
		cases: [ 
			/* ok:0|1 , pseudo:xx, dth: xx */
			{},{},{},{},{},{},
			{},{},{},{},{},{},
			{},{},{},{},{},{},
			{},{},{},{},{},{},
			{},{},{},{},{},{},
			{},{},{},{},{},{}
		]
	};
	async function loadForetStatus() {
		let ret = await apiCall("/broceliande/foretStatus");
		if (ret.status==200) {
			foretStatus = ret.o;
			// recalcul du delai de repos
			countDownInit();
		}
			
	}
	async function loadForetMap() {
		let ret = await apiCall("/broceliande/foretMap");
		if (ret.status==200)
			foretMap = ret.o;
	}

	/////////////////
	// gestion du timer
	/////////////////
	let countDownDth = null;
	let countDownTimer = null;
	let countDownIntervalId = null;
	function countDownInit() {
			countDownDth = (foretStatus.participants[pseudo])? foretStatus.participants[pseudo].nextDth : Date.now();
			if (!countDownIntervalId)	countDownIntervalId = window.setInterval(countDownFct,1000);
	}
	function countDownFct() {
		countDownTimer = (countDownDth > Date.now())? "dans "+countDownTo(countDownDth) : "dès maintenant";
	}

	/////////////////
	// gestion popupTuile
	/////////////////
	let popupTuile=false;
	let popupL = null;
	let popupC = null;
	
	function clickTuile(l, c) {
		popupL = l;
		popupC = c;
		popupTuile=true;
	}
	
	async function selDecouvrir(l,c) {
		let zoneStatus = foretStatus.cases[l*6+c];
		let zoneMap = foretMap[l*6+c];
		if (zoneStatus.ok)
			newInfoPopup("Trop tard","Cette zone a déjà été identifiée par "+zoneStatus.pseudo,"");
		else {
			let ret = await apiCall("/broceliande/decouvrir/"+parseInt(l*6+c));
			if (ret.status==200)
				newInfoPopup("Résultat de la découverte:",ret.msg,"Le temps de repos est affiché en haut de la carte")
		}
		popupTuile = false;
	}
	
	async function selMove(l,c,d) {
		popupTuile = false;
		let ret = await apiCall("/broceliande/deplacer/"+d);
		if (ret.status==200)
			newInfoPopup("L'émissaire indique:",ret.msg,"Le temps de repos est affiché en haut de la carte")
	}

	async function selJeton(l,c) {
		popupTuile = false;
		let ret = await apiCall("/jetons/getGratuit");
		if (ret.status==200)
			newInfoPopup("La Peluche Banquière indique:",ret.msg,"");
	}
	async function selMark(l,c) {
		popupTuile = false;
		let ret = await apiCall("/broceliande/mark/"+parseInt(l*6+c));
		if (ret.status==200)
			newInfoPopup("L'émissaire indique:",ret.msg,"");
	}

	let reponse= "";
	async function sendReponse() {
		// popupL et popupC sont définis
		let ret = await apiCall("/broceliande/resoudre/"+parseInt(popupL*6+popupC)+"/"+reponse);
		if (ret.status==200) {
			popupTuile = false;
			newInfoPopup("Avis du monstre:",ret.msg,"Le temps de repos est affiché en haut de la carte");
		}
		else
		if (ret.status==202) {
			newInfoPopup("Avis du monstre:",ret.msg,"Tu peux modifier ta réponse tout de suite");
			popupTuile = true;
		}
	}
	
	async function admResetZone(l,c,d) {
			let ret = await apiCall("/broceliande/admResetZone/"+parseInt(l*6+c));
	}
	async function admOkZone(l,c,d) {
			let ret = await apiCall("/broceliande/admOkZone/"+parseInt(l*6+c));
	}

	async function admClearPseudo() {
			let ret = await apiCall("/broceliande/admClearPseudo/"+document.getElementById('P203admPseudo').value);
	}
	async function admChallenge(i) {
			let ret = await apiCall("/broceliande/admChallenge/"+i);
	}

	///////////////////////////////////////////////////////
	// Popup d'avancment
	///////////////////////////////////////////////////////
	let popupAvancement = false;
	let avancement = {} ;
	function sortAvancement(a, b) {
	  if (a.score > b.score) {
	    return -1;
	  } else if (a.score < b.score) {
	    return 1;
	  }
	  // a must be equal to b
	  return 0;
	}
	function calculAvancement() {
		let w = { nbOk: 0, nbLock: 0, byPseudo: {}, arrayPseudo: [] }
		foretStatus.cases.forEach( (c,i) => {
			if (c.ok) {
				w.nbOk++;
				if (c.pseudo && !w.byPseudo[c.pseudo]) w.byPseudo[c.pseudo] = { pseudo: c.pseudo, arrOk: [], arrPath: [], arrBad: []  }
				if (c.markPseudo && !w.byPseudo[c.markPseudo]) w.byPseudo[c.markPseudo] = { pseudo: c.markPseudo, arrOk: [], arrPath: [], arrBad: []  }
				if (c.pseudo) w.byPseudo[c.pseudo].arrOk.push(i);
				if (c.markPseudo) {
					if(foretMap[i].p)
						w.byPseudo[c.markPseudo].arrPath.push(i);
					else
						w.byPseudo[c.markPseudo].arrBad.push(i);
				}
			}
			if (c.lock) {
				w.nbLock++;
			}
		});
		// objet TO array pour affichage & calcul score
		Object.keys(w.byPseudo).forEach( p => {
			w.byPseudo[p].score = w.byPseudo[p].arrOk.length*5 + w.byPseudo[p].arrPath.length - w.byPseudo[p].arrBad.length ;
			w.arrayPseudo.push(w.byPseudo[p]);
		});
		w.arrayPseudo.sort(sortAvancement);
		console.log(w);
		// affichage
		avancement = w;
		popupAvancement = true;
	}
	
</script>

<style>
	.backForet {
		/* width: 99%; */
		background-image: url('https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/Sombrelinceul-300x300.png');
		background-size: cover;
		background-position: center;
	}
	tr { height: 3em }
	td { width:3em; height:3em;
			outline:1px solid white; text-align:center; vertical-align:middle; position:relative;
			cursor: pointer;
	}
	.tdh { position: absolute; top: -10px; left:50%; transform: translate(-50%) }
	.tdb { position: absolute; bottom: -10px; left:50%; transform: translate(-50%) }
	.tdd { position: absolute; top: 0px; right: 0px; transform: translate(0,50%) }
	.tdg { position: absolute; top: 0px; left: 0px; transform: translate(0,50%) }
	.mark { position: absolute; top: 0px; left: 0px; font-size:0.8em }
	.iconCamelot {
		background-image: url('https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/iconCamelot.png');
		background-size: cover;
	}
	.iconBoisBande {
		background-image: url('https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/iconBiblio.png');
		background-size: cover;
	}
	.iconCoffre {
		background-image: url('https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/iconCoffre.png');
		background-size: cover;
	}
	.iconArbre {
		background-image: url('https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/iconArbre.png');
		background-size: cover;
	}
	.iconPiege {
		background-image: url('https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/iconPiege.png');
		background-size: cover;
	}
	.iconMonstre {
		background-image: url('https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/iconMonstre.png');
		background-size: cover;
	}
	.iconAssistante {
		background-image: url('https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/iconBunbuku.png');
		background-size: cover;
		height: 1.0em; width: 1.0em;
		outline: 3px solid red;
		position: absolute; top: 50%; left:50%; transform: translate(-50%,-50%); 
	}
	.iconError {
		background-image: url('https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/iconError.png');
		background-size: cover;
	}
	.iconJeton {
		background-image: url('https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/iconJeton.png');
		background-size: cover;
	}
	.sel { cursor:pointer }

	.mini { font-size:0.7em }
</style>

{#if pseudo=="Kikiadoc"}
	<div class="adminCadre">
		ADMIN
		<div>
			<input type="button" value="stopChallenge" on:click={() => admChallenge(0)}>
			<input type="button" value="startChallenge" on:click={() => admChallenge(1)}>
			<input type="button" value="EndChallenge" on:click={() => admChallenge(2)}>
		</div>
		<div>
			<input type="text" id="P203admPseudo">
			<input type="button" value="clearTimerPseudo" on:click={admClearPseudo}>
		</div>
	</div>
{/if}

<div class="spacer" />
{#if foretStatus.challenge==0}
	<div style="color:red">Le challenge n'a pas commencé</div>
{:else if foretStatus.challenge==1}
	<div style="color:lightgreen">Découverte possible {countDownTimer}</div>
{:else if foretStatus.challenge==2}
	<div style="color:red">
		Le challenge est terminé
		<br/>
		Mon émissaire a découvert un Grand Grimoire de la Magie en Camelot
	</div>
{:else}
	<div style="color:red">
		Erreur sur status serveur: foretStatus.challenge
	</div>
{/if}
<table class="backForet">
	{#each foretIdx as l}
		<tr>
			{#each foretIdx as c}
				{@const zone= foretStatus.cases[l*6+c]}
				{@const zoneMap = foretMap[l*6+c] }
				{#if zone.lock}
					<td class={foretType[zoneMap.t].icon} on:click={() => clickTuile(l,c)} on:keydown={null}>
						<div class="blinkFlag">Aide</div>
					</td>
				{:else if zone.ok}
					<td class={foretType[zoneMap.t].icon} on:click={() => clickTuile(l,c)} on:keydown={null}>
							{#if zoneMap.h}<div class="tdh">▲</div>{/if}
							{#if zoneMap.b}<div class="tdb">▼</div>{/if}
							{#if zoneMap.g}<div class="tdg">◀</div>{/if}
							{#if zoneMap.d}<div class="tdd">▶</div>{/if}
							{#if zone.mark}<div class="mark">✅</div>{/if}
							{#if l==foretStatus.emissaire.l && c==foretStatus.emissaire.c }
								<div class="iconAssistante"></div>
							{/if}
							<div style="font-size : 0.5em">{l}-{c}</div>
					</td>
				{:else}
					<td on:click={() => clickTuile(l,c)} on:keydown={null}>
							<div style="font-size : 0.5em">{l}-{c}</div>
					</td>
				{/if}
			{/each}
		</tr>
	{/each}
	
</table>
<div>
	<input type="button" value="Afficher l'avancement" on:click={calculAvancement}/>
</div>

{#if popupTuile}
	{@const zone = foretStatus.cases[popupL*6+popupC]}
	{@const zoneMap = foretMap[popupL*6+popupC]}
	<div class="popupCadre papier" id="P203popupTuile">
		<div class="close" on:click={() => {popupTuile=false}} on:keypress={null} role="button" tabindex=0>X</div>
		<div class="popupZone">
			<div class="popupContent">
				{#if zone.lock}
					<div>
						Cette zone a été découverte par {zone.pseudo} {jjmmhhmmss(zone.dth)}
						<br/>
						Mais un monstre en interdit encore l'accès.
						<br/>
						Pour l'apaiser, indique la solution de l'énigme:
						<br/>
						<i>{zoneMap.q}</i>
						<br/>
						<span style="font-size: 0.8em">Indice de réponse:</span>
						<br/>
						<span style="font-size: 0.8em">{zoneMap.tip}</span>
						<br/>
						<input style="width: 85%" class="messageText" bind:value={reponse} type="text" maxlength="60" on:keypress={(e) => {if (e.keyCode==13) sendReponse()}}/>
						<input style="width: 8%" class="messageButton" type="button" value="►" on:click={sendReponse} />
	
					</div>
				{:else if zone.ok}
					<div>
						Cette zone a été découverte par {zone.pseudo} {jjmmhhmmss(zone.dth)}
						{#if zone.dthLock}
							<br/>
							Le monstre a été apaisé par {zone.pseudoLock} {jjmmhhmmss(zone.dthLock)} en résolvant	l'énigme 
							<br/>
							<i>{zoneMap.q} (réponse: {zoneMap.r})</i>
						{/if}
						<br/>
						{ zoneMap.info || ""}
					</div>
					{#if zone.mark}
						Selon {zone.markPseudo}, ce lieu est un passage optimal pour aller en Camelot.
					{/if}
					{#if zoneMap.t == 6}
						<div class="sel" on:click={()=> {selJeton(popupL,popupC)}} on:keypress={null} role="button" tabindex=0>
							👉 Demande ton jeton gratuit quotidien (pas de delai de repos)
						</div>
					{/if}
					{#if zone.mark}
						<div class="sel" on:click={()=> {selMark(popupL,popupC)}} on:keypress={null} role="button" tabindex=0>
							👉 Retirer ce lieu de l'itinéraire optimal de l'émissaire vers Camelot (immédiat)
						</div>
					{:else if zoneMap.t>1}
						<div class="sel" on:click={()=> {selMark(popupL,popupC)}} on:keypress={null} role="button" tabindex=0>
							👉 Marquer ce lieu comme itinéraire optimal vers Camelot (immédiat)
						</div>
					{/if}
				{:else}
					<div class="sel" on:click={()=> {selDecouvrir(popupL,popupC)}} on:keypress={null} role="button" tabindex=0>
						👉 Découvrir cette zone
					</div>
				{/if}
				{#if (foretStatus.emissaire.l == popupL) && (foretStatus.emissaire.c == popupC)}
					{@const map=foretMap[popupL*6+popupC]}
					{#if map.h}
						<div class="sel" on:click={()=> {selMove(popupL,popupC,"h")}} on:keypress={null} role="button" tabindex=0>
							👉 Déplacer l'émissaire vers le nord (utilise deux Jetons de Camelot)
						</div>
					{/if}
					{#if map.b}
						<div class="sel" on:click={()=> {selMove(popupL,popupC,"b")}} on:keypress={null} role="button" tabindex=0>
							👉 Déplacer l'émissaire vers le sud (utilise deux Jetons de Camelot)
						</div>
					{/if}
					{#if map.g}
						<div class="sel" on:click={()=> {selMove(popupL,popupC,"g")}} on:keypress={null} role="button" tabindex=0>
							👉 Déplacer l'émissaire vers l'ouest (utilise deux Jetons de Camelot)
						</div>
					{/if}
					{#if map.d}
						<div class="sel" on:click={()=> {selMove(popupL,popupC,"d")}} on:keypress={null} role="button" tabindex=0>
							👉 Déplacer l'émissaire vers l'est (utilise deux Jetons de Camelot)
						</div>
					{/if}
					<div class="sel" on:click={()=> {selMove(popupL,popupC,"r")}} on:keypress={null} role="button" tabindex=0>
						👉 Téléporter l'émissaire dans le Bois Bandé (utilise deux Jetons de Camelot)
					</div>
				{/if}
				<div class="sel" on:click={()=> {popupTuile=false}} on:keypress={null} role="button" tabindex=0>
					👉 Je ne veux rien faire ici
				</div>
				{#if pseudo=="Kikiadoc"}
					<div class="sel" on:click={()=> {admResetZone(popupL,popupC)}} on:keypress={null} role="button" tabindex=0>
						👉 Admin: reset zone
					</div>
					<div class="sel" on:click={()=> {admOkZone(popupL,popupC)}} on:keypress={null} role="button" tabindex=0>
						👉 Admin: zone découverte
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

{#if popupAvancement}
	<div class="popupCadre stars">
		<div class="close" on:click={() => {popupAvancement=false}} on:keypress={null} role="button" tabindex=0>X</div>
		<div class="popupZone">
			<div class="popupContent">
				<div>
					Lieux découverts:
					{avancement.nbOk}/36
				</div>
				<div>
					Lieux encore défendus par des monstres:
					{avancement.nbLock}
				</div>
				<hr/>
				<div>
					Classement actuel:
				</div>
				{#each avancement.arrayPseudo as p}
					<div>
						{p.pseudo} ({p.score})
					</div>
				{/each}
				{#each avancement.arrayPseudo as p}
					<hr/>
					<div>
						Detail de {p.pseudo}: {p.score} points
					</div>
					<div class="mini">
						Découverts({p.arrOk.length}): Points+{p.arrOk.length*5}
						<br/>
						{#each p.arrOk as l}
							<span>{Math.floor(l/6)}-{l%6} &nbsp; </span>
						{/each}
						<br/>
						Marqués({p.arrPath.length}): Points+{p.arrPath.length}
						<br/>
						{#each p.arrPath as l}
							<span>{Math.floor(l/6)}-{l%6} &nbsp; </span>
						{/each}
						<br/>
						Marqués invalides({p.arrBad.length}): Points-{p.arrBad.length}
						<br/>
						{#each p.arrBad as l}
							<span>{Math.floor(l/6)}-{l%6} &nbsp; </span>
						{/each}
					</div>
				{/each}

			</div>
		</div>
	</div>
{/if}
<!-- P203.svelte -->
