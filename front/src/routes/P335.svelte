<script>
	import { onMount, onDestroy  } from 'svelte';
	import { loadIt, storeIt, newInfoPopup, apiCall, apiCallExtern, addNotification, urlImg, urlCdn  } from './storage.js'
	import { playSound, playVideo, jjmmhhmmss, countDownTo, scrollTop  } from './storage.js'
	import Btn from './z/Btn.svelte';
	import Cpacman from './Cpacman.svelte'
	import Cupload from './Cupload.svelte'

	export let wsCallComponents; 
	export let pseudo; 
	// export let page;
	// export let pageDone = [];
	export let pageDesc = null
	export let audioVolume = 100

	const pageEpiqLbl= "P"+pageDesc.n+"_epiqStep"
	
	onMount(() => { if (wsCallComponents) wsCallComponents.add(myWsCallback);  init() });
	onDestroy(() => { if (wsCallComponents) wsCallComponents.delete(myWsCallback) });

	async function myWsCallback(m) {
		if (m.op=="doctrineDuMal") loadContexte(m)
	}

	// init...
	let myConf = {}
	async function init() {
		loadContexte()
	}
	
	// Gestion de l'épique
	let epiqStep = loadIt(pageEpiqLbl, 0);
	$: storeIt(pageEpiqLbl,epiqStep);

	// gestion du contxte
	let ctx = null 
	// {  
	//    pseudos: {pseudo} { etat: , pnjId: , lblLoc: , dthFin:, nbTry:, nbSucces: }
	//    trouves: [] { lettre: , pseudo: , dth: }]
	// }
	async function loadContexte(mWs) {
		let ret = mWs || await apiCall("/doctrineDuMal")
		if (ret.status==200) { ctx = ret.o; normalizeContexte() }
	}
	function normalizeContexte() {
		console.log("normalizeContexte...")
		for (const [pseudo, ctxPseudo] of Object.entries(ctx.pseudos)) {
			console.log(ctxPseudo, Date.now(), (ctxPseudo.dthFin || 0) <= Date.now() )
			if ( (ctxPseudo.dthFin || 0) <= Date.now() )
				ctxPseudo.lblEtat = null
			else
				switch(ctxPseudo.etat) {
					case 'prison': ctxPseudo.lblEtat ="est dans la prison des âmes";	break
					case 'tentative':	ctxPseudo.lblEtat = "recherche la Rune #"+ctxPseudo.iRune+': '+ctxPseudo.nom+'@'+ ctxPseudo.loc; break
					case 'relax': ctxPseudo.lblEtat ="doit se reposer"; break
					default: ctxPseudo.lblEtat = ": "+ctxPseudo.etat
				}
		}
		ctx.pseudos=ctx.pseudos // force IHM refresh
	}

	// popup de choix et avancement
	let dspChoix = null
		
	// clic sur une rune ou simplement pour activer l'avancement (i peut-être nul)
	async function runeClic(i) {
		const now = Date.now()
		// si rune déjà trouvée
		let trouve = i && (i>=0) && ctx.trouves[i]
		if (trouve) return dspChoix = { t:"trouve", trouve: trouve}
		// recupere le status du pseudo
		let status = ctx.pseudos[pseudo]
		// si rien fait ou que timer echu
		if (!status || status.dthFin<now) {
			let iRune = parseInt(i,10)
			if (iRune>=0) {
				let ret= await apiCall("/pnjs/random")
				if (ret.status != 200) return addNotification("Erreur choix random","red",10,"prout-long")
				dspChoix = { t: "choix", lstPnj: ret.o, iRune:iRune }
			}
			else	
				dspChoix = { t: "clicRune"}
			return
		}
		switch(status.etat) {
			case 'tentative': dspChoix = { t: "tentative", status: status}; break
			case 'prison': epiqStep=100; dspChoix = { t: "prison", status: status}; break
			default: dspChoix = { t: "wait", status: status}; break
		}
	}

	async function selectionPnj(iRune,pnj) {
		let ret= await apiCall("/doctrineDuMal/tentative/"+iRune+"/"+pnj.iDb,'PUT')
		if (ret.status==200) dspChoix = { t: "infoEncours", nom: pnj.n, loc: pnj.loc }
		if (ret.status==201) dspChoix = { t: "infoErrDB", nom: pnj.n }
	}

	async function reponseTentative() {
		let ret = await apiCall('/doctrineDuMal/proposition/'+dspChoix.X+'/'+dspChoix.Y,"POST",dspChoix.imageDataRaw)
		switch(ret.status) {
			case 200:
				newInfoPopup("Waou!","Tu as trouvé la rune #"+ret.o.iRune);
				dspChoix=null;
				break;
			case 201:
				addNotification("Les coordonnées ne sont pas les bonnes","red",10,"prout-long");
				break;
			case 202:
				newInfoPopup("Pas de chance","XXX ne t'as donné aucune info");
				dspChoix=null;
				break;
			case 203:
				newInfoPopup("Pas de chance","Ton âme a été capturée");
				dspChoix=null
				epiqStep=100
				break;
		}
	}
		
	// sortie de prison
	function sortiePrison() {
		epiqStep=99
		apiCall("/doctrineDuMal/sortiePrison",'PUT')
		playVideo("ff-7-portemagique")
	}
	
	// saisies et resultat
	let saisies = {}
	let dspDebug=null
	let dspResultat = null

	// admin
	async function findByLettre() {	let ret= await apiCall("/pnjs/lettre/"+saisies.lettre); dspDebug = ret.o }
	async function findByRandom() {	let ret= await apiCall("/pnjs/random/"+saisies.lettre); dspDebug = ret.o }
	async function findById() {	let ret= await apiCall("/pnjs/id/"+saisies.id); dspDebug = ret.o }
	async function findData() {	let ret= await apiCall("/pnjs/data"); dspDebug = ret.o }

	// calcul de la synhèse de résultat
	async function calcResultat() {
		if (!ctx || !ctx.trouves) return addNotification("Résultats non disponibles")
		let tRes = { nb:0, total: ctx.trouves.length, pseudos: {} }
		ctx.trouves.forEach((e)=>{
			if (e) {
				tRes.pseudos[e.pseudo] ??= 0
				tRes.pseudos[e.pseudo]++
				tRes.nb++
			}
		})
		dspResultat=tRes
	}
	

	// variable de stockage du blog de l'image
	let imageDataRaw = null
	
</script>

<style>
		@import url('https://fonts.googleapis.com/css2?family=Bungee+Tint&display=swap');
	
	.rune {
	  padding: 0.3em;
		border-color: rgb(0, 0, 0, .2);
	  border-image-source: url("https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/ff-7/runemetal.png");
		border-image-repeat: stretch;
		border-image-slice: 2% 2% fill;
		font-family: "Bungee Tint"; color: red; font-weight: bold;
		cursor: pointer;
	}
	.Runes {
		font-family: "Bungee Tint"; color: red; font-size:3em; font-weight: bold; }

</style>

{#if pseudo.startsWith('Kikiadoc')}
	<div class="adminCadre">
		Admin: 
		<input type="button" on:click={()=>confirm('reset Challenge') && apiCall("/doctrineDuMal",'DELETE')} value="Reset" />
		<input type="button" on:click={()=>confirm('clear timer') && apiCall("/doctrineDuMal",'PATCH')} value="Clear Timer" />
		<input type="text" bind:value={saisies.lettre} size=5 placeholder="lettre" />
		<input type="button" on:click={findByLettre} value=">" />
		<input type="button" on:click={findByRandom} value="Random" />
		<input type="button" on:click={findData} value="gData" />
		<input type="text" bind:value={saisies.id} placeholder="id dans DB" />
		<input type="button" on:click={findById} value=">" />
	</div>
{/if}

<input type="button" value="Revoir le Lore" on:click={() => epiqStep=0} />
<input type="button" value="Résultat" on:click={calcResultat} />

{#if epiqStep==0}
	<div class="reveal">
		reference a jules vernes et au tour d'éoréa en 80 jours
		<br/>
		<Btn bind:refStep={epiqStep} step=99 val="Tu peux compter sur moi" />
	<div style="clear:both" class="br"/>
	</div>
{/if}

{#if epiqStep==99 && ctx}
	<div>
		<div>
			Doctrine à découvrir:
			<br/>
			{#each ctx.trouves as descRune,i}
				<span class="rune" on:click={()=>runeClic(i)} role="button" tabindex=0 on:keypress={null}>
					{descRune && descRune.lettre || '?'}
				</span>
			{/each}
		</div>
		<div>
			<input type="button" value="Que dois-je faire?" on:click={()=>runeClic()} />
		</div>
		<div style="font-size:0.8em" on:cdTimeout={()=>normalizeContexte()}>
			{#each Object.keys(ctx.pseudos) as pseudo,i}
				{@const status=ctx.pseudos[pseudo]}
				{#if status.lblEtat}
					{pseudo} {status.lblEtat}
					<countdown dth={status.dthFin} txtTimeout="(timeout)">
						{countDownTo(status.dthFin)}
					</countdown>
				{/if}
			{/each}
		</div>
		<div style="clear:both" class="br"/>
	</div>
{/if}

{#if epiqStep==100 && ctx}
	<Cpacman bind:audioVolume={audioVolume} cbSuccess={sortiePrison}/>
{/if}

{#if dspChoix}
	<div class="popupCadre papier">
		<div class="close" on:click={()=>dspChoix=null} on:keypress={null} role="button" tabindex=0>X</div>
		<div class="popupZone">
			<div class="popupContent">
				<div class="adminCadre" style="font-size: 0.8em">
					e:{dspChoix.t}
					iRune:{dspChoix.status && dspChoix.status.iRune || "na"}
					idDb:{dspChoix.status && dspChoix.status.pnjId || "na"}
					targetDth:{dspChoix.status && dspChoix.status.dthFin || "na"}
					proba:na%
				</div>
				{#if dspChoix.t=="clicRune"}
					<div>Clique sur un rune non découverte de la Doctrine</div>
				{/if}
				{#if dspChoix.t=="choix"}
					<div>{pseudo}, choisis un pnj à interroger pour identifier la rune #{dspChoix.iRune+1}</div>
					<div style="font-size:0.8em; font-style: italic;">
						Plus la zone de recherche est haut niveau, plus tu as de chance de recueillir une information.
						Certains PNJs peuvent être dans des donjons ou raids, tu peux obtenir leurs coordonnées en lançant
						ces instances en 
						<a href="https://fr.finalfantasyxiv.com/uiguide/party/party-how/party_usparty.html">
						unsynch
						</a>.
						N'oublie pas alors de faire ton "screen" avant de quitter l'instance.
					</div>
					{#each dspChoix.lstPnj as pnj,i}
						<div style="cursor:pointer" on:click={()=>selectionPnj(dspChoix.iRune,pnj)} role="button" tabindex=0 on:keypress={null}>
							👉{pnj.n} ({pnj.loc})
						</div>
					{/each}
				{/if}
				{#if dspChoix.t == "tentative"}
					{pseudo}, il te reste
					<countdown dth={dspChoix.status.dthFin} on:cdTimeout={()=>{dspChoix=null}}>
						{countDownTo(dspChoix.status.dthFin)}
					</countdown>
					<br/>
					Si tu as trouvé le PNJ nommé <u>{dspChoix.status.nom}</u>
					en {dspChoix.status.loc},
					indique moi ses coordonnées selon ta boussole IG et fait un screen de ton perso avec le PNJ.
					<table width="100%"><tr>
						<td style="vertical-align: top; text-align: right; width:49%">
							<div>X:<input bind:value={dspChoix.X} type="text" size=6 placeholder="xx.x" /></div>
							<div>Y:<input bind:value={dspChoix.Y} type="text" size=6 placeholder="yy.y" /></div>
							{#if dspChoix.X && dspChoix.Y && dspChoix.imageDataRaw}
								<input type="button" value="Je valide >" on:click={reponseTentative} />
							{:else if dspChoix.X && dspChoix.Y}
								Screen?
							{:else}
								Coordonnées?
							{/if}
						</td>
						<td style="width:50%">
							<Cupload cbImageRaw={(raw)=>dspChoix.imageDataRaw=raw}/>
						</td>
					</tr></table>
				{/if}
				{#if dspChoix.t == "wait"}
					Reposes-toi
					<countdown dth={dspChoix.status.dthFin} on:cdTimeout={dspChoix=null}>
						{countDownTo(dspChoix.status.dthFin)}
					</countdown>
					avant de reprendre tes aventures.
				{/if}
				{#if dspChoix.t == "trouve"}
					<div style="text-align: center">
						<div>
							({dspChoix.trouve.pseudo} {jjmmhhmmss(dspChoix.trouve.dth)})
						</div>
						<div class="Runes">{dspChoix.trouve.lettre.toUpperCase()}</div>
						<div>
							<img alt="" style="width:90%"
								src={"https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/AI-Generated/doctrineDuMal-"+dspChoix.trouve.iRune+".upload"}
							/>
						</div>
					</div>
				{/if}
				{#if dspChoix.t == "infoEncours"}
					Rends-toi en {dspChoix.loc} à la recherche de {dspChoix.nom}.
					Quand tu l'auras trouvé reviens me voir.
				{/if}
				{#if dspChoix.t == "infoErrDB"}
					Hélas, la Peluche
					<a href="https://fr.wikipedia.org/wiki/Phileas_Fogg" alt="" target="_blank">
								 Philéas Garland,
					</a>
					lors de son exploration d'Eorzéa,
					n'a pas noté correctement toutes les informations pour {dspChoix.nom}
					dans le Grimoire des Savoirs.
					<br/>
					Je suis au regrêt de devoir te demander de choisir un autre PNJ
				{/if}
			</div>
		</div>
	</div>
{/if}

{#if dspResultat}
	<div class="popupCadre papier">
		<div class="close" on:click={()=>dspResultat=false} on:keypress={null} role="button" tabindex=0>X</div>
		<div class="popupZone">
			<div class="popupContent">
				<div>Runes trouvées {dspResultat.nb}/{dspResultat.total}:</div>
				{#each Object.keys(dspResultat.pseudos) as pseudo,i }
					<div>{pseudo}: {dspResultat.pseudos[pseudo]}</div>
				<br/>
				{/each}
			</div>
		</div>
	</div>
{/if}
 
{#if dspDebug}
	{@const keys = Object.keys(dspDebug) }
	<div class="popupCadre papier">
		<div class="close" on:click={()=>dspDebug=false} on:keypress={null} role="button" tabindex=0>X</div>
		<div class="popupZone">
			<div class="popupContent">
				Total: {keys.length}
				<br/>
				{#each keys as k,i }
					{i}={k}:{JSON.stringify(dspDebug[k],null,2)}
				<br/>
				{/each}
			</div>
		</div>
	</div>
{/if}

<!-- P335.svelte -->

