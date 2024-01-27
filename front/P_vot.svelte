<script>
	import { onMount, onDestroy } from 'svelte';
	import {apiCall, newInfoPopup, addNotification } from './storage.js';

	export let wsCallComponents; // param obligatoire read only
	export let pseudo; // param obligatoire read only
	export let apiName = "TBD"; // param obligatoire read only

	onMount(() => { 
		console.log('mount P_vot');
		if (wsCallComponents) wsCallComponents.add(myWsCallback);
		getVotCol();
	});
	onDestroy(() => { console.log('destroy P_vot'); if (wsCallComponents) wsCallComponents.delete(myWsCallback) });

	function myWsCallback(m) {
					// console.log('myWsCallbak',m);
	}

	// Collection backend
	let votCol = { };
	// Elements recalculés pour affichage
	let votCur = null;
	let votDsp = null;

	async function getVotCol() {
		let json = await apiCall("/"+apiName);
		if (json.status==200) {
			votCol = json.o;			
			transformVotColToVotCurDsp();
		}
	}

	function transformVotColToVotCurDsp() {
		let tmpVotDsp = {  };
		tmpVotDsp.choix = votCol.choix;
		tmpVotDsp.colors = votCol.colors;
		tmpVotDsp.options = [];
		tmpVotDsp.minPond = 0;
		tmpVotDsp.maxPond = 0;
		tmpVotDsp.sommePond = 0;
		// balayage des options
		votCol.options.forEach( (option, idxOpt) => {
			// option={lbl,by} idxOpt=numéro d'option
			let tmp = { lbl: option.lbl, by: option.by, votants: [], somme: 0, sommePond: 0, choix: new Array(votCol.choix.length).fill(0) };
			// balayage des réponses par pseudo
			Object.keys(votCol.pseudos).forEach( (pseudo) => {
				// pseudo::= nom du pseudo
				// let tmpTblChoix = votCol.pseudos[pseudo];
				// tmpTblChoix ::= [x,y,z] qui sont les choix actuels du pseudo
				// on ne s'intérsse qu'a l'option idxOpt...
				// tmp.choix[tmpTblChoix[idxOpt]] ++;
				//optimized:
				const vote=votCol.pseudos[pseudo][idxOpt];
				// compteur de vote
				tmp.choix[vote] ++;
				// Ajoute le pseudo dans la liste des votants
				tmp.votants.push({pseudo: pseudo, vote: vote });
			});
			// balayage des compteus de choix
			tmp.choix.forEach( (nb, i) => {
				tmp.somme += nb;
				tmp.sommePond += nb * votCol.poids[i];
			});
			tmpVotDsp.options.push(tmp);
			if (tmp.sommePond < tmpVotDsp.minPond) tmpVotDsp.minPond = tmp.sommePond;
			if (tmp.sommePond > tmpVotDsp.maxPond) tmpVotDsp.maxPond = tmp.sommePond;
			tmpVotDsp.sommePond += tmp.sommePond;
		});
		let tmpVotCur = votCol.pseudos[pseudo];
		if (tmpVotCur == null || tmpVotCur == undefined) tmpVotCur = new Array(votCol.options.length);
		tmpVotDsp.electeurs = Object.keys(votCol.pseudos).length;
		// commit
		votDsp = tmpVotDsp;
		votCur = tmpVotCur;
		// console.log("votCol",votCol);
		// console.log("votDsp",votDsp);
	}

	async function votSelect(option,choix) {
		console.log("votSelect=",option, choix);
		let json = await apiCall("/"+apiName+"/"+option+"/"+choix,"PUT");
		if (json.status==200) {
			votCol = json.o;			
			transformVotColToVotCurDsp();
			if (! votCol.votesOuverts)
				addNotification("La votation est close","red");
		}
	}
	function votInfo(option) {
		// votDsp.options.votants contient un tableau des votants {pseudo, choix}
		let texte = [];
		let votants = votDsp.options[option].votants;
		votants.forEach( (votant) => {
				const voteTexte = (votant.vote==null || votant.vote==undefined)? "vote blanc": votCol.choix[votant.vote];
				texte.push(votant.pseudo + "("+voteTexte+")");			
		});
		newInfoPopup(votDsp.options[option].lbl,texte,"Fermez cette popup");
	}
	function optInfo(optIdx) {
		let texte = [];
		let calcul = [];
		let option = votDsp.options[optIdx];
		if (option.sommePond >= votDsp.maxPond-1) {
			// Dans le haut de classement
			texte.push("Cette option est actuellement en haut du classement");
		}
		else
		if (option.sommePond <= votDsp.minPond+1) {
			// Dans le bas de classement
			texte.push("Cette option est actuellement en bas de classement");
		}
		else {
			// Dans le milieu de classement
			texte.push("Cette option est actuellement en milieu de classement");
		}
		calcul.push("Il y a "+ option.votants.length +" participant(s) à cette votation");
		calcul.push("L'évaluation actuelle de cette option est de "+option.sommePond);
		calcul.push("(le minimum actuel est "+votDsp.minPond+", le maximum actuel est "+votDsp.maxPond+")");
		newInfoPopup(option.lbl,texte,calcul);
	}

	async function resetParticipation()	{ 
		const pseudo = document.getElementById('admPseudo').value;
		let ret = await apiCall("/"+apiName+"/"+pseudo,"DELETE");
		newInfoPopup("clear "+pseudo, ret.msg);
	}
	async function addOption()	{ 
		const addOption = document.getElementById('addOption').value;
		let ret = await apiCall("/"+apiName+"/addOption/"+addOption);
		newInfoPopup("addOption "+addOption, ret.msg);
	}
	async function startVotes()	{ 
		let ret = await apiCall("/"+apiName+"/startVotes");
		newInfoPopup("startVotes", ret.msg);
	}
	async function stopVotes()	{ 
		let ret = await apiCall("/"+apiName+"/stopVotes");
		newInfoPopup("stopVotes", ret.msg);
	}

	
</script>

<style>

	table { 
		width: 99%;
	}
	.tr { 
		outline: 0.2em solid lightgrey;
		background-image: url("https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/texture-papier-noir.jpg");
		background-color: black;
		background-position: center;
	}
	td {
	}
	.buttonOn { outline: 0.2em outset white; cursor: pointer; background-color: grey}
	.buttonOff { outline: 0.1em solid white; cursor: pointer; background-color: black; font-style: italic }
	.lbl { cursor: pointer; text-align: right; vertical-align: top; width: 40%}
	.choix { width: 25%; text-align: right }
	.choixTop { cursor: pointer; border-width: 5px 5px 0px 5px; border-style: solid; border-color: white; border-radius: 25% 25% 0% 0%; background-color: lightgray }
	.bargraph { cursor: pointer }
	.center { text-align: center }
	.admin { border: 5px solid red; background-color: black }
	.votesOuverts { text-align: center; background-color: lightgreen; border: 0.4em solid lightgreen } 
	.votesFermes { text-align: center; background-color: darkred; border: 0.4em solid darkred }
	
</style>

<div>
	{#if votDsp != null}
		{#if votCol.votesOuverts}
			<div class="votesOuverts">Tu peux indiquer tes choix</div>
		{:else}
			<div class="votesFermes">Le scrutin est clos</div>
		{/if}
		<table>
			<tr>
				<td class="lbl center choixTop" on:keypress={null} on:click={() => newInfoPopup("Liste des options",["Cette colonne indique les options possibles","Tu dois indiquer ton vote dans la colonne du milieu","Si l'option est en vert, l'option est dans le haut du classement actuel","Clique sur une case pour le détail"],"")}>Options🛈</td>
				<td class="choix center choixTop" on:keypress={null} on:click={() => newInfoPopup("Exprime-toi!","Cette colonne te permet d'indiquer ton choix pour chacune des options","")}>⏬Choisir⏬</td>
				<td class="bargraph center choixTop" on:keypress={null} on:click={() => newInfoPopup("Les votes exprimés",["Cette colonne indique les votes actuels","Clique sur une case pour connaitre les votants "],"")}>Les votes🛈</td>
			</tr>
			{#each votDsp.options as option, idxOpt }
				<tr class="tr">
					<td class="lbl" on:click={() => optInfo(idxOpt)} role="button" tabindex=0 on:keydown={null}>
						{#if option.sommePond >= votDsp.maxPond-1}
							<div style="background-color:green">{option.lbl}</div>
						{:else}
							<div>{option.lbl}</div>
						{/if}
					</td>
					<td class="choix">
						{#each votDsp.choix as choix, idxChoix}
							{#if votCur[idxOpt] == idxChoix }
								<div class="buttonOn" on:click={() => votSelect(idxOpt,idxChoix)} role="button" tabindex=0 on:keydown={null}>
									{choix}✔
								</div>
							{:else}
								<div class="buttonOff" on:click={() => votSelect(idxOpt,idxChoix)} role="button" tabindex=0 on:keydown={null}>
									{choix}
								</div>
							{/if}
						{/each}					
					</td>
					<td class="bargraph" on:click={() => votInfo(idxOpt)} role="button" tabindex=0 on:keydown={null}>
						{#each option.choix as choix, i}
							<div>
								<span style="display: block; width: {100*choix/votDsp.electeurs}%; background-color: {votDsp.colors[i]} ">
									{choix}
								</span>
							</div>
						{/each}
					</td>
				</tr>
				<tr><td style="font-size: 0.4em; height: 0.4em">&nbsp;</td></tr>
			{/each}
			
		</table>
	{/if}

	
	{#if pseudo=="Kikiadoc"}
		<div class="admin">
			<div>ADMIN!!</div>
			<div>
				<input type="button" value="start votes" on:click={startVotes}>
				<input type="button" value="arret votes" on:click={stopVotes}>
			</div>
			<div>
				<input type="text" id="addOption">
				<input type="button" value="Ajout option" on:click={addOption}>
			</div>
			<div>
				<input type="text" id="admPseudo">
				<input type="button" value="reset participation" on:click={resetParticipation}>
			</div>
	</div>
	{/if}
</div>


