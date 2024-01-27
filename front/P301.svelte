<script>
	import { onMount, onDestroy  } from 'svelte';
	import { loadIt, storeIt, apiCall } from './storage.js';
	import { countDownTo, jjhhmm, duree, alphanum2placer, newInfoPopup } from './storage.js';
	import { playSound, playDing } from './storage.js';
	import Epiq from './Epiq.svelte';
	import Uch from './Uch.svelte';

	export let wsCallComponents;
	export let pseudo;
	
	let intervalId= null;

	onMount(() => { 
		// console.log('Mount 301');
		// if (wsCallComponents) wsCallComponents.add(myWsCallback);
		intervalId = setInterval(refreshTimer,1000);
	});
	onDestroy(() => {
		// console.log('Unmount 301');
		if (intervalId) { clearInterval(intervalId); intervalId = null; };
		// if (wsCallComponents) wsCallComponents.delete(myWsCallback);
	});


	let step = loadIt("P301_step",0);
	$: storeIt("P301_step",step); 

	let filRouge = {};
	$: refreshFilRouge(filRouge);

	let tblTrouve = [];
	let tblTrouveActuel = [];
	let nbTrouve = 0;
	
	function refreshFilRouge() {
		// Determine les pseudos ayant déjà résolu l'énigme
		let tmpTrouve = [];
		let tmpTrouveActuel = [];
		// console.log('filRouge',filRouge);
		if (filRouge.pseudos) {
			for (let iPseudo in filRouge.pseudos) {
				let tblIndex = [];
				for (let i in filRouge.pseudos[iPseudo].trouves) {
					let ii = parseInt(i,10);
					tblIndex.push(ii);
					if (ii == filRouge.currentIdx)
						tmpTrouveActuel.push(iPseudo);
				}
				tmpTrouve.push({pseudo: iPseudo, trouves: tblIndex});
			}
			nbTrouve = Object.keys(filRouge.pseudos[pseudo].trouves).length;
		}
		tblTrouve = tmpTrouve;
		tblTrouveActuel = tmpTrouveActuel;
	}

	let timerLbl = null;
	function refreshTimer() {
		if (filRouge.currentDthStart > 0)
			timerLbl=countDownTo(filRouge.currentDthStart+filRouge.renewTimer);
	}

	let scheduleList = [];
	let displaySchedule = false;
	function toggleDisplaySchedule() {
		displaySchedule = ! displaySchedule;
	}
	function computeSchedule() {
		console.log("computeSchedule");
		let nb=filRouge.nbIdx;
		let nextDthFrom=filRouge.currentDthStart+filRouge.renewTimer;
		let nextDthTo=filRouge.currentDthStart+filRouge.renewTimer;
		let nextId=filRouge.currentIdx+1 % nb;
		let schedule = [];
		for (let l=0; l < 3*nb; l++) {
			schedule.push({i: nextId, 
										 f: jjhhmm(nextDthFrom), t: jjhhmm(nextDthTo),
										 // m: jjhhmm((nextDthFrom+nextDthTo)/2),
										 d: duree(nextDthTo-nextDthFrom)
										});
			nextId = (nextId+1) % nb;
			nextDthFrom += filRouge.refreshMin;
			nextDthTo += filRouge.refreshMax;
		}
		// console.log("schedule:",schedule);
		scheduleList = schedule;
		displaySchedule = true;
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

</script>
<style>
	.enigme { height: 6em; font-size: 0.8em; outline: solid 1px yellow }
	input { font-size: 0.8em }
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
<input type="button" on:click={()=> step=0} value="Réafficher le lore" />
<Uch bind:filRouge={filRouge} wsCallComponents={wsCallComponents} pseudo={pseudo} />
{#if step == 0}
	<div class="reveal">
		{pseudo}, 
		j'ai retrouvé dans le Grand Grimoire des Savoirs des noms de nombreux héros du passé
		qui ont disparus mystérieusement. 
		Il semble qu'ils aient été transportés dans le temps présent sous de nouvelles identités
		afin qu'ils ne puissent pas réaliser leurs missions dans le passé.
		<br/>
		Dans le présent, il semble qu'ils soient souvent des PNJ dont l'activité impacte peu l'évolution d'Eorzéa ou de l'Univers Connu.
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
			En utilisant une incantation magique du Grand Grimoire de la Magie, un message m'est apparu pendant quelques
			heures et m'a permis de 
			retrouver une lalafelle nommée Imaginette.
			Quand je lui ai dit qu'elle était en réalité
			<a target="_blank" href="https://fr.wikipedia.org/wiki/Gandalf">Gandalf</a>,
			elle a été stupéfaite et a continué ses activités dans le temps présent comme si de rien n'était.
			Mais le Grand Grimoire des Savoirs s'en est trouvé modifié:
			Il indique maintenant que
			<a target="_blank" href="https://fr.wikipedia.org/wiki/Gandalf">Gandalf</a>
			a contribué à libérer la Terre du Milieu de l'emprise de Sauron, le seigneur des ténèbres,
			alors qu'auparavent, il indiquait que Sauron en était le maître maléfique. 
		</div>
		<div style="clear: both" />
		<Epiq bind:step={step} oui=2 ouiVal="Réveler leur passé peut changer l'Histoire!" />
	</div>
{/if}

{#if step==2}
	<div class="reveal">
		Oui, révéler leurs véritables identités peut changer l'Histoire!
		<br/>
		Les Victimes de l'Uchronie ont été transporté dans le temps présent d'Eorzéa, interrompant ainsi
		les Hauts Faits qu'ils auraient du réaliser dans le passé.
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
		Quelques informations complémentaires:
		<br/>
		<u>Gains du challenge</u>
		<br/>
		Selon le nombre de pnj découverts au global, la dotation de ce challenge
		sera entre 0 et {2*filRouge.nbIdx} Millions de Gils.
		Elle sera ensuite répartie entre les participants au prorata du nombre de découvertes de chacun.
		<br/>
		<u>Déroulement</u>
		<br/>
		Tu dois découvrir le nom d'un PNJ victime de l'Uchronie en résolvant l'énigme
		et indiquer son nom pendant que l'incantation est active (quelques heures).
		<br/>
		Lorsque l'incantation se termine, je l'invoque à nouveau.
		Mais ce sera l'énigme associée à un autre Héros du Passé qu'il faudra résoudre.
		<br/>
		Si tu sollicites mon premier assistant Mathématicien
		<a target="_blank" href="https://fr.wikipedia.org/wiki/Alain_Connes">Alain Connes</a>,
		il t'informera sur les heures probables du pop des prochaines énigmes
		<br/>
		N'hésite pas à partager tes découvertes avec les autres participants (discord ou message aux connectés).
		<br/>
		Ce challenge est ouvert pendant toute la durée de l'événement,
		les créneaux de "pop" des énigmes varient d'un jour à l'autre.
		<br/>
		<Epiq bind:step={step} oui=9 ouiVal="Go, {pseudo} power!" />
	</div>
{/if}

{#if step==9}
	<div class="filRouge papier">
		<div>
			<div>
				<input type="button" on:click={computeSchedule} value="Planning des Pops" />
				<br />
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
				{#if tblTrouveActuel.length==0}
					Cette victime (#{filRouge.currentIdx+1}) n'a pas encore été identifiée
				{:else}
					Cette victime (#{filRouge.currentIdx+1}) a déjà été identifiée par: 
					{#each tblTrouveActuel as pseudo}
						{pseudo} &nbsp;
					{/each}
				{/if}
			</div>
			<div style="font-size: 0.7em">
				<div style="text-decoration: underline">Récap des identifications:</div>
				{#each tblTrouve as trouveur}
					<div>
						{trouveur.pseudo} ({trouveur.trouves.length}/{filRouge.nbIdx}):
						{#each trouveur.trouves as i}
							#{i+1} &nbsp;
						{/each}
					</div>
				{/each}
				<div style="text-decoration: underline">Rappels:</div>
				<div>
					Découvre un PNJ victime de l'Uchronie en résolvant l'énigme (partagé par tous les connectés)
				</div>
				<div>
					Apres un délai variable, le PNJ change pour le PNJ suivant.
				</div>
				<div>
					N'hésite pas a partager tes découvertes avec les autres participants, cela augmentera les gains de tous.
					<br/>
					Et si elle a déjà été découverte, tu peux demander la réponse!
				</div>
			</div>
		</div>
	</div>
	
	{#if displaySchedule}
		<div class="popupCadre papier">
			<div class="close" on:click={toggleDisplaySchedule} on:keypress={null} role="button" tabindex=0>X</div>
			<div class="popupZone">
				<div class="popupContent" style="font-size:0.8em">
					Voici les prochains <u>créneaux de début</u> des énigmes.
					<br/>
					Ne sont indiquées que celles que tu n'as pas encore identifiées.
					<br/>
					Mon assistant,
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

{/if}

<!-- p301.svelte -->
