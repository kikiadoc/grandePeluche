<script>
	import { onMount, onDestroy, tick  } from 'svelte';
	import { ssms, hhmmssms, loadIt, storeIt, shuffle, playSound, apiCall, addNotification, playDing, newInfoPopup } from './storage.js';
	
	export let wsCallComponents; 
	export let pseudo; 
	

	let phrases = [ ] ; 
	let template = null;
	let idx = -1;
	let gpMessage = null;
	let resultats = null;
	let sResultats = null;
	let trHttp = [];
	let trWs = [];
	
	onMount(() => { 
		console.log('mount 100');
		if (wsCallComponents) wsCallComponents.add(myWsCallback);
		document.getElementById("keyboard").addEventListener("animationiteration", animLoop, false);
		trHttp = loadIt("uchronieIntroTrHttp", []);
		trWs = loadIt("uchronieIntroTrWs", []);
		getCurrentState();
		scrollToBottom(scrollPhrases);
	});
	onDestroy(() => {
		console.log('destroy 100');
		if (wsCallComponents) wsCallComponents.delete(myWsCallback);
		storeIt("uchronieIntroTrHttp", trHttp);
		storeIt("uchronieIntroTrWs", trWs);
	});

	
	function myWsCallback(m) {
		if (m.op == "uchronieIntroSynch") {
			trWs.push({ server:m.dth, client: Date.now() });
			idx = m.idx;
			template = m.template;
			gpMessage = m.gpMsg;
			if (m.mp3) playSound(m.mp3);
			if (idx >= phrases.length)
				newInfoPopup(
					"GG, le challenge est déjà terminé!",
					"Les résultats sont disponibles. Si tu as eu un soucis lors de challenge "+
					"(lag etc..) examine bien l'analyse technique de la Grande Peluche dans les résultats",
					"Ferme cette popup et clique sur le bouton pour afficher les résultats",
				);
			return true;
		}
	}
	
	async function getCurrentState() {
		let ret= await apiCall("/uchronieIntro/resynch");
		if (ret.code == 200) {
			phrases = ret.o.phrases;
			idx = ret.o.idx;
			template = ret.o.template;
			gpMessage = ret.o.gpMsg;
		}
	}
	////////
	let lettres = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
	function animLoop(e) {
		// console.log(e);
		shuffleKeys();
	}
	function shuffleKeys() {
		lettres = shuffle(lettres);
	}
	async function c(k) {
		disableKeys();
		setTimeout(enableKeys,6000);
		const trDthStart = Date.now();
		let ret= await apiCall("/uchronieIntro/lettre/"+lettres[k]);
		const trDthEnd = Date.now();
		trHttp.push({cStart: trDthStart, cEnd : trDthEnd, sStart: ret.startDth , sEnd: ret.dth} );
		switch(ret.code) {
			case 200:	addNotification(ret.msg,"green", 3); playDing("Clochette");	break;
			case 202:	addNotification(ret.msg,"red", 3); playDing("prout-long");	break;
		}
	}
	function setKeys(c) {
		document.getElementById("keyboardShow").style["visibility"] = c? "visible": "hidden";
	}

	// Auto scroll
	$: scrollIdx(idx);
	let scrollPhrases;
	async function scrollIdx(idx) {
		await tick();
		scrollToBottom(scrollPhrases);
	}
	const scrollToBottom = async (node) => {
    node.scroll({ top: node.scrollHeight, behavior: 'smooth' });
  }; 

	function enableKeys() { setKeys(1) }
	function disableKeys() { setKeys(0) }
	function adminStart() { apiCall("/uchronieIntro/adminStart") }
	function adminReinit() { resultats= null; apiCall("/uchronieIntro/adminReinit") }
	function adminReinitStats() { trHttp = []; trWs = [] }

	async function getResultats() {
		let ret= await apiCall("/uchronieIntro/resultats");
		resultats = ret.o;
		// Calcul des temps de réponses !
		let sommeTrClientHttp = 0;
		let nbTrClientHttp = 0;
		let sommeTrServerHttp = 0;
		let nbTrServerHttp = 0;
		// let sommeWsTransit = 0;
		let nbWsTransit = 0;
		trHttp.forEach( (tr, i) => {
			// cStart, cEnd, sStart, sEnd
			if (tr.cStart && tr.cEnd && (tr.cEnd>= tr.cStart)) {
				sommeTrClientHttp += (tr.cEnd-tr.cStart); nbTrClientHttp++;
			} ;
			if (tr.sStart && tr.sEnd && (tr.cEnd>= tr.cStart)) {
				sommeTrServerHttp += (tr.sEnd-tr.sStart); nbTrServerHttp++;
			} ;
		});
		trWs.forEach( (tr, i) => {
			nbWsTransit++;
		});  
		let moyClientHttp = sommeTrClientHttp /nbTrClientHttp;
		let moyServerHttp = sommeTrServerHttp /nbTrServerHttp; 
		// let moyWs = sommeWsTransit / nbWsTransit;
		// Calcull de la somme de différence au carré
		let somme2ClientHttp = 0;
		let somme2ServerHttp = 0;
		trHttp.forEach( (tr, i) => { 
			if (tr.cStart && tr.cEnd && (tr.cEnd>= tr.cStart))
				somme2ClientHttp = ( (tr.cEnd-tr.cStart) - moyClientHttp ) **2;
			if (tr.sStart && tr.sEnd && (tr.cEnd>= tr.cStart))
				somme2ServerHttp = ( (tr.sEnd-tr.sStart) - moyServerHttp ) **2;
		});
		/*
		let somme2Ws = 0;
		trWs.forEach( (tr, i) => {
			// server client
			if (tr.client && tr.server && (tr.client>=tr.server)) {
				somme2Ws = ( (tr.client-tr.server) - moyServerHttp ) **2;
			}; 
		}); 
		*/
		let varClientHttp = sommeTrClientHttp / nbTrClientHttp;
		let varServerHttp = sommeTrServerHttp / nbTrServerHttp;
		// let varWs = somme2Ws / nbWsTransit;
		let ecaClientHttp = Math.sqrt(varClientHttp);
		let ecaServerHttp = Math.sqrt(varServerHttp);
		// let ecaWs = Math.sqrt(varWs);
		sResultats = {
			nbClient: nbTrClientHttp, nbServer: nbTrServerHttp, nbWs: nbWsTransit,
			moyClient: Math.round(moyClientHttp), moyServer: Math.round(moyServerHttp),
			ecaClient: Math.round(ecaClientHttp), ecaServer: Math.round(ecaServerHttp),
		};
	};
	
</script>

<style>
	.keyboard {
		animation-duration: 10s;
		animation-name: slidein;
		animation-iteration-count: infinite;
		/* width: 97%; */
		text-align: center; cursor: pointer;
		background-position: center; background-repeat: no-repeat; 
		background-size: cover; 
		background-image: url('https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/texture-papier-noir.jpg');
		/* position: fixed;
		left: 0px; 
		bottom: 1.5em; */
		border: 2px solid red;
	}
	@keyframes slidein {
	  from { color: white; }
		75% { color: white; }
	  95% {	color: #404040; }
	  to { color: black; }
	}
	.key {
		border: 3px solid purple; 
		border-radius: 2rem;
		width: 1.5em;
		display: inline-block; 
	}
	.phrases {
		height: 4.7em;
		overflow-y: scroll;
		scrollbar: auto;
		scrollbar-gutter: stable;
		scrollbar-color: yellow yellow;
		border: 1px solid white;
		font-size: 0.7em;
		font-family: "monospace", monospace;
		background-color: black;
		background-image: url('https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/texture-papier-noir.jpg');
	}
	.phrase {
		width:95%;
	}
	.toBeDiscovered {
		height: 4.7em;
		overflow-y: scroll;
		scrollbar: auto;
		scrollbar-gutter: stable;
		scrollbar-color: yellow yellow;
		border: 1px solid white;
		font-size: 0.7em;
		font-family: "monospace", monospace;
		background-color: black;
		background-image: url('https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/texture-papier-noir.jpg');
	}
	.resultats {
		border: 1px solid white;
		background-color: black;
		background-repeat: repeat;
		background-image: url('https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/stars.gif');
	}
	.tech {
		margin: 0.3em;
		border: 1px solid red;
		font-size: 0.5em;
		color: lightgreen;
	}
	.byPseudo {
		margin: 0.3em;
		border: 1px solid red;
	}
	.byPhrase {
		margin: 0.3em;
		border: 1px solid red;
	}
	.gpMessage {
		font-size: 0.7em;
		color: orange;
		height: 1.6em;
		overflow: scroll;
		border: 1px solid white;
		background-color: black;
		background-image: url('https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/texture-papier-noir.jpg');
	}
	.explication {
		font-size: 0.8em;
	}
	.buttonResultats {
		font-size: 1.5em; 
		border: 0.2em solid red;
	}
</style>

{#if pseudo=="Kikiadoc"}
	<p>
		<input type=button value="shuffle" on:click={shuffleKeys} />
		<input type=button value="enable" on:click={enableKeys} />
		<input type=button value="disable" on:click={disableKeys} />
		<input type=button value="reinitStats" on:click={adminReinitStats} />
		<input type=button value="reinitChallenge" on:click={adminReinit} />
		<input type=button value="demarrer" on:click={adminStart} />
	</p>
{/if}

<p>Bienvenue dans le challenge de la Transition</p>
<div class="explication">
	<div><u>Quelques infos avant de commencer</u></div>
	<div>Les touches du clavier ensorcelé, en bas de page, changent toutes les 6 secondes</div>
	<div>Dès que tu cliques une touche du clavier ensorcelé, il n'est plus utilisable pendant 6 secondes.</div>
	<div>Tu peux te familiariser avec le fonctionnement du clavier ensorcelé avant le début du challenge</div>
	<div>
		Pendant le challenge, il faut voir, au minimum, la zone de phrases à découvrir et le clavier ensorcelé.
		<u>Sur smartphone</u>, positionne bien la page de telle sorte que ces deux zones te soient accessibles directement (pas besoin de scroll)
		sinon, tu seras pénalisé car c'est un challenge de rapidité 
	</div>
	<div>Plusieurs phrases seront à découvir...</div>
	<div>L'interface de ce mini-jeu de rapidité est juste en dessous</div>
</div>

<div class="phrases" bind:this={scrollPhrases}>
	{#if idx < 0}
		Ici s'afficheront les phrases déjà découvertes
	{:else}
		{#each phrases as texte,i}
			{#if i < idx}
				<div class="phrase">{texte} </div>
			{/if}
		{/each}
	{/if}
</div>
<div class="gpMessage" >Grande Peluche: {gpMessage}</div>
{#if resultats==null}
	<div class="toBeDiscovered">
		{#if idx < 0}
			Ici s'affichera la phrase à découvrir,
			tu devras cliquer sur le clavier ensorcelé...
		{:else}
		{#if idx < phrases.length}
			{template}
		{:else}
			<input class="buttonResultats" type="button" on:click={getResultats} value="Le challenge est terminé, clic pour les résultats" />
		{/if}
		{/if}
	</div>
{/if}
	
{#if resultats!=null}
	<div id="resultats" class="resultats">
		<div style="font-size: 0.7em">Analyse technique de tes échanges (les temps sont en millisecondes)</div>
		<div class="tech" >
			{#if sResultats.moyServer < 30}
				<div>La Grande Peluche a traité tes {sResultats.nbServer} propositions en {sResultats.moyServer}ms en moyenne (écart-type de {sResultats.ecaServer}ms) sur le server</div>
			{:else}
				<div style="color:red">La Grande Peluche a traité tes {sResultats.nbServer} propositions en {sResultats.moyServer}ms en moyenne (écart-type de {sResultats.ecaServer}ms) sur le server</div>
			{/if}
			{#if sResultats.moyClient < 150}
				<div>Tes {sResultats.nbClient} allers/retours réseau avec le Grande Peluche ont duré {sResultats.moyClient}ms en moyenne avec une gigue de {sResultats.ecaClient}ms</div>
			{:else}
				<div style="color:red">Tes {sResultats.nbClient} allers/retours réseau avec le Grande Peluche ont duré {sResultats.moyClient}ms en moyenne avec une gigue de {sResultats.ecaClient}ms</div>
			{/if}
			<div>La Grande Peluche t'a synchonisé {sResultats.nbWs} fois avec les autres participants avec un délai réseau de {Math.round(sResultats.moyClient/2)}ms</div>
		{#if (sResultats.moyServer >= 30) || (sResultats.moyClient >= 150) }
			<div style="color: red">
				Ton expérience utilisateur pendant ce mini-jeu ne semble pas optimale.
				La cause n'est pas connue et ce n'est pas forcement lié à ton équipement.
				Contacte Kikiadoc sur Discord pour examiner plus précisement pourquoi.
			</div>
		{:else}
			<div style="color: lightgreen">
				Ton expérience utilisateur pendant ce mini-jeu semble optimale.
				Si ce n'est pas le cas, contacte Kikiadoc sur Discord pour examiner plus précisement pourquoi.
			</div>
		{/if}
		</div>
		<div>
		Il y avait {resultats.phrases.length} phrases
		et globalement {resultats.gblLettres} lettres à découvrir
		</div>
		<div>
		Résultats par pseudo:
		</div>
		<div class="byPseudo">
			{#each resultats.byPseudo as pseudo,i }
				<div style="font-size:0.8em">{pseudo.pseudo}: {pseudo.nb} lettre(s) découvertes ({Math.round(100*pseudo.nb / resultats.gblLettres)}%) </div>
			{/each}
		</div>
		Résultats par phrase:
		<div class="byPhrase">
			{#each resultats.byPhrase as tblLettres,i}
				<div style="color: red">Phrase: {resultats.phrases[i]}</div>
				{#each tblLettres as lettre,i}
					<div style="font-size:0.8em">{lettre.pseudo}@{hhmmssms(lettre.dth)}: {lettre.lettre} {lettre.ok}</div> 
				{/each}
			{/each}
		</div>
	</div>
{/if}

	<div id="keyboard" class="keyboard">
		<div>
			Clavier ensorcelé
		</div>
		<div id="keyboardShow">
			{#each lettres as l, i}
				<span class="key" on:click={()=>{c(i)}} role="button" tabindex=0 on:keypress={null}> {lettres[i]} </span>
			{/each}
		</div>
	</div>

