<script>
	import { onMount, onDestroy  } from 'svelte';
	import { loadIt, storeIt, apiCall } from './storage.js';
	import { countDownTo, jjhhmm, duree, alphanum2placer, newInfoPopup } from './storage.js';
	import { playSound, playDing } from './storage.js';
	import Epiq from './Epiq.svelte';
	import Uch from './Uch.svelte';

	export let wsCallComponents;
	export let pseudo;
	export let pageDesc = null

	const pageEpiqLbl = "P"+pageDesc.n + "_epiqStep"
	
	let intervalId= null;

	onMount(() => { 
		// if (wsCallComponents) wsCallComponents.add(myWsCallback);
		intervalId = setInterval(refreshTimer,1000);
	});
	onDestroy(() => {
		if (intervalId) { clearInterval(intervalId); intervalId = null; };
		// if (wsCallComponents) wsCallComponents.delete(myWsCallback);
	});


	let step = loadIt(pageEpiqLbl,0);
	$: storeIt(pageEpiqLbl,step); 

	let filRouge = {}; // sera modifié par le composant Uch
	$: refreshFilRouge(filRouge);

	let tblTrouve = []; // liste globale des trouves ave les pseudos  indexé par l'idx d'enigme
	let nbTrouve = 0; // nb trouvé de l'utilisaeur
	
	function refreshFilRouge() {
		// console.log('filRouge',filRouge.pseudos);
		const tmpNbTrouve = (filRouge.pseudos && filRouge.pseudos[pseudo] && Object.keys(filRouge.pseudos[pseudo].trouves).length) || 0
		const dthNow1000 = Date.now() + 1000;
		let tmpTrouve = []; // liste globale des trouves ave les pseudos  indexé par l'idx d'enigme
		for (let i = 0; i<filRouge.nbIdx;i++)
			tmpTrouve[i]={ dthMin: dthNow1000, bonus: null, pseudos: [] };
		if (filRouge.pseudos) {
			for (let iPseudo in filRouge.pseudos) {
				const iPseudoObj = filRouge.pseudos[iPseudo]
				for (let i in iPseudoObj.trouves) {
					let ii = parseInt(i,10)
					let lDth= iPseudoObj.trouves[i].dth
					tmpTrouve[i].pseudos.push({pseudo: iPseudo, dth: lDth})
					if (lDth < tmpTrouve[i].dthMin) {
						tmpTrouve[i].dthMin = lDth
						tmpTrouve[i].bonus = iPseudo
					}
				}
			}
			// ici tmpTrouve est un tbl avec dthMin et bonus pour le gagnat bonus et un pseudos[] des répondeurs
			// on patch filRouge.pseudos pour calculer les bonus par pseudo
			for (let i = 0; i<filRouge.nbIdx;i++) {
				if (tmpTrouve[i].bonus) {
					const fPseudo = filRouge.pseudos[tmpTrouve[i].bonus]
					fPseudo.nbBonus = (fPseudo.nbBonus)? fPseudo.nbBonus+1 : 1
				}
			}
		}
		nbTrouve = tmpNbTrouve; // synch IHM
		tblTrouve = tmpTrouve; // synch IHM
		// console.log('tblTrouve',tblTrouve)
	}

	let timerLbl = null;
	function refreshTimer() {
		if (filRouge.currentDthStart > 0)
			timerLbl=countDownTo(filRouge.currentDthStart+filRouge.renewTimer);
	}

	let scheduleList = [];
	let displaySchedule = false;
	function computeSchedule() {
		console.log("computeSchedule");
		let nb=filRouge.nbIdx;
		let nextDthFrom=filRouge.currentDthStart+filRouge.renewTimer;
		let nextDthTo=filRouge.currentDthStart+filRouge.renewTimer;
		let nextId= (filRouge.currentIdx+1) % nb;
		let tmpSchedule = [];
		for (let l=0; l < 3*nb; l++) {
			tmpSchedule.push({i: nextId, 
										 f: jjhhmm(nextDthFrom), t: jjhhmm(nextDthTo),
										 // m: jjhhmm((nextDthFrom+nextDthTo)/2),
										 d: duree(nextDthTo-nextDthFrom)
										});
			nextId = (nextId+1) % nb;
			nextDthFrom += filRouge.refreshMin;
			nextDthTo += filRouge.refreshMax;
		}
		scheduleList = tmpSchedule;
		// console.log("sl",scheduleList)
		displaySchedule = true; // sync IHM
	}

	let reponse = "";
	async function checkReponse() {
		// if (! reponse) return;
		let ret = await apiCall("/uchronieFilRouge/"+filRouge.currentIdx+"/"+reponse,"PUT");
		// alert(ret.status);
		if (ret.status==201) {
			newInfoPopup(
				"Victime identifiée !",
				[
					"Tu as identifié la victime #"+(filRouge.currentIdx+1)+", c'est "+filRouge.currentR.toLowerCase(),
					"Fais en profiter tes amis !"
				],
				"Ferme cette popup pour continuer"
			);
			playSound("Wonderful");
		}
		if (ret.status==202) {
			newInfoPopup(
				"Ce n'est pas le nom de la victime",
				"Ta réponse, c'est du caca",
				"Ferme cette popup pour continuer"
			);
			playDing("Mauvaise");
		}
	}

	let displayResultats = false;
	function computeResultat() {
		displayResultats = true;
	}
	
</script>
<style>
	.enigme { height: 6em; font-size: 0.8em; outline: solid 1px yellow }
	.reponse { width: 80% }
  .filRouge {	border: 5px solid darkgrey; background-color: black; }
</style>
{#if pseudo=="Kikiadoc"}
	<div class="adminCadre">
		Admin:
		<input type="button" on:click={()=> apiCall("/uchronieFilRouge/adminNew")} value="nextPnj" />
		<input type="button" on:click={()=> apiCall("/uchronieFilRouge/adminClear")} value="clearCurrent" />
	</div>
{/if}

<Uch bind:filRouge={filRouge} wsCallComponents={wsCallComponents} pseudo={pseudo} />

<div>
	<input type="button" on:click={()=> step=0} value="Réafficher le lore" />
	<input type="button" on:click={computeSchedule} value="Planning des Pops" />
	<input type="button" on:click={computeResultat} value="Résultats actuels" />
</div>
{#if step == 0}
	<div class="reveal">
		{pseudo}, 
		j'ai retrouvé dans le Grand Grimoire des Savoirs des noms de nombreux héros du passé
		qui ont disparus mystérieusement. 
		Il semble qu'ils aient été transportés dans le temps présent sous de nouvelles identités
		afin qu'ils ne puissent pas réaliser leurs missions dans le passé.
		<br/>
		Dans le présent, il semble qu'ils soient devenus des PNJs dont l'activité impacte peu l'évolution d'Eorzéa ou de l'Univers Connu.
		<br/>
		Je percois là l'influence de La Magie Maléfique.
		<br/>
		<Epiq bind:step={step} oui=1 ouiVal="Je devrai découvrir des PNJs!" />
	</div>
{/if}

{#if step==1}
	<div class="reveal">
		<img style="width:20%; float:right; border: 10px solid white" src="https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/ff14-gandalf.png" alt=""/>
		<div>
			Oui {pseudo}, il te faudra identifier des pnjs !
			<br/>
			En utilisant la Révélation de Destinée, une incantation magique du Grand Grimoire de la Magie, un message m'est apparu pendant quelques
			heures et m'a permis de 
			retrouver une lalafelle nommée Imaginette.
			<br/>
			Quand je lui ai dit qu'elle était en réalité
			<a target="_blank" href="https://fr.wikipedia.org/wiki/Gandalf">Gandalf</a>,
			elle a été stupéfaite et a continué ses activités dans le temps présent comme si de rien n'était.
			<br/>
			Mais le Grand Grimoire des Savoirs s'en est trouvé modifié:
			Il indique maintenant que
			<a target="_blank" href="https://fr.wikipedia.org/wiki/Gandalf">Gandalf</a>
			a contribué à libérer la Terre du Milieu de l'emprise de Sauron, le seigneur des ténèbres,
			alors qu'auparavent, il indiquait que Sauron en était le maître maléfique. 
		</div>
		<div class="br" />
		<Epiq bind:step={step} oui=2 ouiVal="Réveler leur identité peut changer l'Histoire!" />
		<div style="clear: both" class="br" />
	</div>
{/if}

{#if step==2}
	<div class="reveal">
		Oui, révéler leurs véritables identités peut restaurer un peu de l'Histoire!
		<br/>
		Les Victimes de l'Uchronie ont été transportées dans le temps présent d'Eorzéa, interrompant ainsi
		les Hauts Faits qu'elles auraient dû réaliser dans le passé.
		<br/>
		En invoquant le sort de Révélation de Destinée, je peux faire que leurs existances dans le passé
		reprennent et qu'ils continuent leurs missions.
		<br/>
		Mais je ne peux solliciter cette incantation magique que périodiquement,
		et je ne peux pas explorer Eorzéa toute seule.
		<br/>
		{pseudo}, aide-moi à identifier toutes les Victimes de l'Uchronie.
		<br/>
		<Epiq bind:step={step} oui=3 ouiVal="Tu peux compter sur moi" />
	</div>
{/if}

{#if step==3}
	<div class="reveal">
		Rends-toi dans les zones indiquées dans les énigmes et cliques sur les PNJ en regardant
		leurs dialogues afin d'identifier le bon pnj.
		<div class="br" />
		Il y a {filRouge && filRouge.nbIdx} victimes de l'Uchronie.
		La dotation de ce challenge	sera entre 0 et {2*filRouge.nbIdx} Millions de Gils,
		selon le nombre de victimes découvertes au global.
		Elle sera répartie au prorata des découvertes de chacun.
		L'aventurier qui découvre en premier le nom d'un des PNJs recoit un bonus de 500K.
		<br/>
		Mon assistant Discord partagera les infos à chaque première découverte d'un PNJ.
		<u>Mais attention, même si tu connais alors la solution, il faudra l'indiquer lorsque l'incantation concernée
		est active.</u>
		<br/>
		Lorsque l'incantation se termine, je l'invoque à nouveau, elle dure environ 1 heure.
		Mais ce sera l'énigme associée à un autre Héros du Passé qu'il faudra résoudre.
		<div class="br"/>
		Ce challenge est ouvert pendant toute la durée de l'événement,
		les créneaux de "pop" des énigmes varient d'un jour à l'autre.
		Tu peux les afficher en cliquant sur le bouton <b><u>planning des pops</u></b> juste en dessous du bandeau du site.
		<br/>
		<Epiq bind:step={step} oui=9 ouiVal="Go, {pseudo} power!" />
	</div>
{/if}

{#if step==9 && filRouge}
	<div class="filRouge papier">
		<div>
			<div>
				Victime #{filRouge.currentIdx+1}:
				<span class="timer">{timerLbl}</span>
				<br />
			</div>
			
			<div class="enigme scrollbar">
				Enigme:
				<a href={filRouge.currentU} target="_blank">
					{filRouge.currentQ}
				</a>
			</div>
			
			{#if filRouge.enigmeTrouve == null}
				{@const plh = alphanum2placer(filRouge.currentR)}
				<div class="indice">Indice: {plh}</div>
				<div>
					<input class="reponse" type="text" maxlength=80 bind:value={reponse} placeholder={plh}
						on:keypress={(e) => {if (e.keyCode==13) checkReponse()}} />
					<input type="button" value="▶" on:click={checkReponse} />
				</div>
			{:else}
				<div style="font-size: 0.9em">
					Tu l'as identifiée, c'est {filRouge.currentR.toLowerCase()}.
				</div>
			{/if}
			<div style="font-size: 0.9em; color: lightgrey">
				{#if nbTrouve < filRouge.nbIdx}
						Reste à identifier: {filRouge.nbIdx-nbTrouve}/{filRouge.nbIdx}
				{:else}
						Tu as identifié toutes les victimes de l'Uchronie
				{/if}
			</div>
			<hr />
			<div style="font-size: 0.7em">
				{#if tblTrouve[filRouge.currentIdx] && tblTrouve[filRouge.currentIdx].pseudos.length>0}
					<span style="color:lightgreen">
					Tu peux voir la réponse à cette énigme sur Discord 
					</span>
					car cette victime (#{filRouge.currentIdx+1}) a déjà été identifiée par: 
					{#each tblTrouve[filRouge.currentIdx].pseudos as pseudoObj}
						{pseudoObj.pseudo} &nbsp;
					{/each}
				{:else}
					Cette victime (#{filRouge.currentIdx+1}) n'a pas encore été identifiée
				{/if}
			</div>
		</div>
	</div>
{/if}

{#if displaySchedule}
	<div class="popupCadre papier">
		<div class="close" on:click={() => displaySchedule=false} on:keypress={null} role="button" tabindex=0>X</div>
		<div class="popupZone">
			<div class="popupContent" style="font-size:0.8em">
				Voici les prochains <u>créneaux de début</u> des énigmes.
				<br/>
				La liste est uniquement pour les PNJs que tu n'as pas encore identifiés.
				<br/>
				Mon assistant mathématicien,
				<a target="_blank" href="https://fr.wikipedia.org/wiki/Alain_Connes">Alain Connes</a>,
				réactualise ses calculs en permanence et affine les créneaux.
				<br/>
				Reviens consulter ce planning, si possible, une fois par jour.
				{#each scheduleList as d}
					{#if !filRouge.pseudos[pseudo].trouves[d.i]}
						<div>
							<hr/>
							#{d.i+1}: Entre {d.f} et {d.t}
						</div>
					{/if}
				{/each}
			</div>
		</div>
	</div>
{/if}

{#if displayResultats && filRouge && filRouge.pseudos}
	<div class="popupCadre stars">
		<div class="close" on:click={() => displayResultats=false} on:keypress={null} role="button" tabindex=0>X</div>
		<div class="popupZone">
			<div class="popupContent" style="font-size:0.8em">
				<div style="text-decoration: underline">Résultats actuels</div>
				{#each Object.keys(filRouge.pseudos) as iPseudo}
					{@const objPseudo = filRouge.pseudos[iPseudo]}
					{@const tblTrouves = Object.keys(objPseudo.trouves)}
					<div>
						{iPseudo} 
						({tblTrouves.length}/{filRouge.nbIdx}, {objPseudo.nbBonus || 0} bonus)
						:
						{#each tblTrouves as i}
							&nbsp; #{parseInt(i,10)+1}
						{/each}
					</div>
				{/each}
			</div>
		</div>
	</div>
{/if}



<!-- p301.svelte -->
