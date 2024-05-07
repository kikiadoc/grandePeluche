<script>
	import { onMount, onDestroy } from 'svelte';
	import { apiCall, newInfoPopup, addNotification, loadIt, storeIt } from './storage.js';
	import { playDing, playSound, jjmmhhmmss, countDownTo, scrollTop } from './storage.js';
	import Epiq from './Epiq.svelte'

	const urlImg = 'https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/';

	export let wsCallComponents; 
	export let pseudo;

	// Status actuel du jeu
	let statusJeu = null;
	// Indices actuels du jeu
	let statusIndices = null;
	// flag des possibilites a afficher en ihm
	let ihmNouvellePartie = false;
	let ihmClaim = false
	let ihmJouer = false
	let ihmDthLock = 0;
	let ihmRelax = 0;
	let ihmTick = Date.now();
	let ihmTimerId = null;
	let ihmIndicesTrouves = false;
	
	onMount(() => { 
		if (wsCallComponents) wsCallComponents.add(myWsCallback);
		ihmTimerId = setInterval(() => { ihmTick = Date.now() } ,1000);
		loadIndices();
		loadJeu();
	});
	onDestroy(() => {
		if (wsCallComponents) wsCallComponents.delete(myWsCallback);
		clearInterval(ihmTimerId)
	});

	function myWsCallback(m) {
		if (m.op=="tictactoe") {
			loadJeu();
			return true;
		}
		if (m.op=="decouvrirJardins") {
			loadIndices();
			return true;
		}
	}

	$: recalcIhm(ihmTick);
	function recalcIhm() {
		
	}

	////////////////////////////////////////////
	// Gestion de l'épique
	////////////////////////////////////////////
	let epiqStep = loadIt("P204_epiqStep", 0);
	$: storeIt("P204_epiqStep",epiqStep);

	////////////////////////////////////////////
	// Recalcul le jeu selon les parametres	
	////////////////////////////////////////////
	function updateJeu(sJeu) {
		if (!sJeu) return;
		// colorize les résultats
		sJeu.colorize=[];
		if (sJeu.humanWin !== false)
			sJeu.humanWin.forEach( (idx) => { sJeu.colorize[idx]="humanWin blinkFlag" } )
		if (sJeu.computerWin !== false)
			sJeu.computerWin.forEach( (idx) => { sJeu.colorize[idx]="computerWin blinkFlag" } )

		// reset IHM
		statusJeu = sJeu;
		ihmNouvellePartie=false;
		ihmClaim = false;
		ihmJouer = false;
		ihmDthLock = 0;
		ihmIndicesTrouves = false;

		// Si tous les indices sont trouvés...
		if (statusIndices) {
				if (statusIndices.nbTrouves==statusIndices.trouves.length) {
					newInfoPopup("Toutes les révélations ont été découvertes",
											 ["1) Analyse les révélations pour trouver la location des Jardins Suspendus",
												"2) Dirige-toi IG dans les Jardins Suspendus (c'est un appartement IG)",
												"3) Lit alors le message sur le livre de correspondance pour les dernieres consignes et terminer ce challenge",
												"Attention, tes gains ne seront validés QUE si tu laisses un message selon les consignes du livre"
											 ],
											 "Ferme ce popup et consulte les révélations");
					ihmIndicesTrouves=true
					return;
				}
		}
		// si jeu perdant, propose un nouveau jeu immediatement
		if (sJeu.computerWin !== false) {
			ihmNouvellePartie=true;
			newInfoPopup("Dommage",["Tu as été battu par le maléfice du Grimoire","Tu peux le défier à nouveau immédiatement"],"Réfléchis bien")
		}
		else
		// si jeu gagnant claim la récompense
		if (sJeu.humanWin !== false) {
			ihmClaim = true;
			newInfoPopup("Tu as battu le Maléfice du Grimoire","Tu peux réléver un élément","Bravo")
		}
		else
		// si pat suffisant
		if (sJeu.nbPat >=2) {
			ihmClaim = true;
			newInfoPopup("Le maléfice du Grimoire s'ennuie",["GG, tu as provoqué l'ennui du maléfice du Grimoire.","Tu peux réléver un élément"],"Bravo")
		}
		else
		// si pat
		if (! sJeu.canPlay) {
			ihmNouvellePartie = true;
			newInfoPopup("Pas de gagnant","Pour une nouvelle partie, clique sur 'défier à nouveau'","Patience...")
		}
		else
		// si dthLock...
		if (sJeu.dthLock >= Date.now(20*3600*1000) - sJeu.relaxMs) {
			ihmDthLock = sJeu.dthLock;
			ihmRelax = sJeu.relaxMs
		}
		else
			ihmJouer = true

	}
	
	async function loadJeu() {
		let ret = await apiCall("/tictactoes");
		if (ret.status==200) updateJeu(ret.o);
	}
	
	async function initJeu() {
		let ret = await apiCall("/tictactoes","DELETE");
		if (ret.status==200) updateJeu(ret.o);
	}

	async function clickJeu(i) {
		// si pas ihmJouer, il y a forcement une autre option....
		if (!ihmJouer) {
			newInfoPopup("Jouer maintenant n'est pas pertinent","Consulte les options possibles")
			return;
		}
		statusJeu.board[i]="O";
		ihmNouvellePartie=false;
		ihmClaim = false;
		ihmJouer = false
		let ret = await apiCall("/tictactoes/"+i,"PUT");
		// reponse via le WebSocket
	}
	
	// Recalcul le jeu et les indices selon les parametres	
	function updateIndices(sIndices) {
		// sync ihm
		statusIndices = sIndices
		updateJeu(statusJeu);
	}
	
	async function loadIndices() {
		let ret = await apiCall("/decouvrirJardins");
		if (ret.status==200) updateIndices(ret.o)
	}
	async function claimIndice() {
		scrollTop();
		let ret = await apiCall("/decouvrirJardins","PUT");
		// response synch pour le jeu
		if (ret.status==200) updateJeu(ret.o);
		// reponse via le WebSocket pour les indices
	}

	function infoIndice(indice,i) {
		if (indice) {
			newInfoPopup( "Révélation #"+i+" découverte par:",
									 indice.pseudo+" "+jjmmhhmmss(indice.dth),
									 "Cliquer pour fermer"
									);
		}
		else {
			newInfoPopup( "A découvrir",
									 "Cette révélation #"+i+" n'a pas encore été découverte",
									 "Cliquer pour fermer"
									);
		}
	}

	async function admInit() {
		let ret = await apiCall("/tictactoes/admInit","PUT")
		if (ret.status==200) updateJeu(ret.o);
	}
</script>

<style>
	.humanWin { color: green }
	.computerWin { color: red }
	.decouvert { opacity: 70%; background-color: black; }
	.proposition { opacity: 70%; background-color: black; }
	.indices { font-size:0.8em; border:2px solid white}
	table { background-image: url("https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/Malefice.gif");
					background-position: center; background-size: contain; background-repeat: no-repeat;
					border: 0.2em solid pink;
					margin-left: auto;
				  margin-right: auto;
				}
	td { width: 2em; height: 2em; text-align: center; opacity: 60%; background-color: black; cursor: pointer }
	input { }
</style>

{#if pseudo=="Kikiadoc"}
	<div class="adminCadre">
		<input type="button" value="Init" on:click={admInit}>
		<input type="button" value="admResetIndices" on:click={() => apiCall("/decouvrirJardins/admClearAll","PUT")}>
		<input type="button" value="admFullIndices" on:click={() => apiCall("/decouvrirJardins/admSetAll","PUT")}>
		<input type="button" value="admPartielIndices" on:click={() => apiCall("/decouvrirJardins/admSetPartiel","PUT")}>
	</div>
{/if}

{#if epiqStep==9 && statusJeu !== null && statusIndices !== null}
	<div>
		<input type="button" value="Reafficher le lore" on:click={() => epiqStep=0}>
	</div>
	
	<div class="decouvert">
		<div style="font-size:0.6em">Révélations: {statusIndices.nbTrouves}  / {statusIndices.trouves.length}</div>
		<div class="indices">
			{#each statusIndices.trouves as indice,i }
				<span role="button" tabindex=0 on:keypress={null} on:click={infoIndice(indice,i+1)} style="cursor:pointer">
					{indice.indice || '?'}</span>
			{/each}
		</div>
	</div>
	<div class="proposition">
		<div style="font-size:0.7em">Le Maléfice te propose:</div>
		{#if ihmNouvellePartie}
			<input type="button" value="Défier le Maléfice" on:click={initJeu}>
		{/if}
		{#if ihmClaim}
			<input type="button" value="Révéler un élément" on:click={claimIndice}>
		{/if}
		{#if ihmJouer}
			Poser un "O"
		{/if}
		{#if ihmDthLock}
			de patienter {countDownTo(ihmDthLock+ihmRelax,ihmTick)}
		{/if}
		{#if ihmIndicesTrouves}
			d'analyser les Révélations
		{/if}
			
		<br/>
		<div style="font-size:0.7em">(Ennui: {statusJeu.nbPat}/2, gagné: {statusJeu.nbWin}, nulle: {statusJeu.nbNull}, perdu: {statusJeu.nbLoose})</div>
	</div>
	<table>
		{#each Array(statusJeu.bSize) as _, l }
			{@const idxL = l*statusJeu.bSize}
			<tr>
				{#each Array(statusJeu.bSize) as _, c }
					{@const i = idxL+c}
					<td on:click={()=>clickJeu(i)} on:keypress={null} class={statusJeu.colorize[i]}>{statusJeu.board[i] || "?" }</td>
				{/each}
			</tr>
		{/each}
	</table>
{/if}


<!-- EPIQUE -->
{#if epiqStep==0}
	<div class="reveal">
		Lore 1/5
		<br/>
		Lors de l'aventure "Brocéliande", tu as participé à l'apaisement de la forêt de Sombrelinceuil
		et permis à mon Explorateur de se rendre en Camelot.
		<br/>
		Il y a trouvé le Grand Grimoire de la Magie, le complément du Grand Grimoire des Savoirs.
		<br/>
		Il me l'a apporté et je le conserve précieusement dans la Grande Bibliothèque du Bois Bandé.
		<br/>
		Hélas, de nombreux éléments du Grimoire semblent illisibles
		car recouverts de maléfices puissants.
		<br/>
		<Epiq bind:step={epiqStep} oui=1 ouiVal="Il faut dissiper les maléfices!" />
	</div>
{/if}
{#if epiqStep==1}
	<div class="reveal">
		Lore 2/5
		<br/>
		Tu as raison, il faut dissiper les Maléfices.
		<br/>
		J'ai pu identifier une page du Grand Grimoire de la Magie nommé "Les Jardins Suspendus dans le temps présent",
		mais elle est illisible.
		<br/>
		Les 
		<a href="https://fr.wikipedia.org/wiki/Jardins_suspendus_de_Babylone" target="_blank" >Jardins Suspendus</a>,
		selon mon Grand Grimoire des Savoirs, ont disparus il y a bien longtemps et de façon mystérieuse.
		<br/>
		Il semblerai donc qu'un sort de Magie ai transporté les antiques Jardins Suspendus dans le temps présent et
		à un autre lieu.
		<br/>
		Saurais-tu, toi, Aventurier de l'Uchronie, contribuer à dissiper le Maléfice masquant le contenu de cette page ?
		<br/>
		<Epiq bind:step={epiqStep} oui=2 ouiVal="Oui, bien sur" rst=0 rstVal="recommencer le lore" />
	</div>
{/if}
{#if epiqStep==2}
	<div class="reveal">
		Lore 3/5
		<br/>
		Les éléments de cette page sont protégés par un Maléfice que 
		tu dois défier au jeu de 
		<a href="https://fr.wikipedia.org/wiki/Tic-tac-toe" target="_blank">tic-tac-toe</a>
		<br/>
		Ce n'est pas le jeu de base: C'est un <u>plateau de 5x5 cases et il faut aligner 4 pièces</u> pour gagner!
		<br/>
		Si tu gagnes, un élément de cette page sera révélé.
		<br/>
		Si tu fais une partie nulle, sans gagnant, tu vas exaspérer le Maléfice, 
		et si tu l'exaspères deux fois, un élément sera révélé par lassitude du Maléfice.
		<br/>
		Si tu perds la partie, tu pourras en recommencer une tout de suite.
		<br/>
		Si tu as révélé un élément, tu devras attendre quelques heures pour provoquer à nouveau le Maléfice.
		<br/>
		<Epiq bind:step={epiqStep} oui=3 ouiVal="J'ai compris les règles" rst=0 rstVal="recommencer le lore" />
	</div>
{/if}
{#if epiqStep==3}
	<div class="reveal">
		Lore 4/5
		<br/>
		Le Maléfice n'est pas idiot, mais il n'est pas aussi intelligent que toi!
		<br/>
		Mon ami, Kikiadoc Lepetiot, lors de sa dernière visite ici, m'a indiqué quelques
		éléments de stratégie. 
		<br/>
		Il a commencé par m'expliquer que le Maléfice est doté d'une intelligence artificielle
		assez limitée et blablabla...
		<br/>
		Je n'ai pas tout compris, mais ce que j'ai bien retenu c'est quelques indices importants:
		<br/>
			1) ne pas vouloir obligatoirement gagner, mais viser une partie nulle.
			Une partie nulle, c'est quand toutes les cases du jeu sont occupées
			mais que ni toi, ni la Malédition, n'a gagné en alignant 4 O ou 4 X.
			Mais pourquoi? Parce que le Maléfice
			renonce après 2 parties nulles et qu'il est bien plus facile de faire une partie nulle
			que de gagner une partie. Que tu gagnes une partie ou que tu fasses 2 nulles, tu auras le même délai pour rejouer!
			Et tu auras révélé un élément de la page dans les 2 cas.
		<br/>
			2) pour provoquer une partie nulle, il te faut <u>toujours empècher</u> le maléfice de poser 3 "X" au milieu
			du plateau de jeu (diagonale, horizontale,verticale) ou sur les bords, avec 2 cases vides de part et d'autres.
		<br/>
			3) si le Maléfice a placé 3 X en ligne/colonne/diagonale, veille à le <u>bloquer pour la 4ème place</u>.
		<br/>
			4) bien réfléchir avant de proposer quelque chose
			car si tu te précipites, tu as toutes les chances de perdre en faisant une connerie!
		<br/>
		<Epiq bind:step={epiqStep} oui=4 ouiVal="C'est clair" rst=0 rstVal="recommencer le lore" />
	</div>
{/if}
{#if epiqStep==4}
	<div class="reveal">
		Lore 5/5
		<br/>
		Les éléments de la page concernant les Jardins Suspendus vont se révéler
		au fur et à mesure de la réussite des parties.
		<br/>
		Dès que tu peux identifier le lieu des Jardins Suspendus du temps présent, tu peux t'y rendre IG
		et suivre les consignes dans le "message du propriétaire" sur le livre de correspondance présent
		dans les Jardins.
		(N.B: c'est un <u>appartement</u> dans une zone résidentielle du jeu)
		<br/>
		Pour obtenir un lot, il faut avoir laissé un message sur le livre et avoir
		découvert au moins un élément de la page du Grimoire.
		Les 30 millions de gils seront répartis entre les participants en fonction du nombre de Jetons de Camelot
		possédés (max 5) (tu gagnes un jeton par élément découvert)
		<br/>
		<Epiq bind:step={epiqStep} oui=9 ouiVal="Voir le Grimoire" rst=0 rstVal="recommencer le lore" />
	</div>
{/if}


<!-- P204.svelte -->
