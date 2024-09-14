<script>
	import { onMount, onDestroy } from 'svelte';
	import { loadIt, storeIt, apiCall } from "./storage.js"
	import { addNotification, newInfoPopup, playVideo, urlCdn, countDownTo } from "./storage.js"

	import Epiq from './z/Epiq.svelte'
	
	export let wsCallComponents
  export let pseudo
  export let page
  export let pageDesc = null
  // export let pageDone = []
	// export let pseudoList = []
	
	const pageEpiqLbl = "P"+pageDesc.n + "_epiqStep"
	let step = loadIt(pageEpiqLbl,0)
  $: storeIt(pageEpiqLbl,step)

	// Gestion des reload, refresh etc..
	onMount(() => {
		if (wsCallComponents) wsCallComponents.add(myWsCallback)
		loadEtat(null)
	})
	onDestroy(() => {
		if (wsCallComponents) wsCallComponents.delete(myWsCallback)
		clearTimeout(recalcTimerId)
	})
	// callback sur le websocket
	function myWsCallback(m) {
		if (m.op=="torches") {	console.log('reloadEtat'); loadEtat(m); return true }
	}

	// etat actue du challenge (maj par get ou WS)
	let etat = null
	// etat calule du challenge pour affichage
	let cEtat = {}
	
	// chargement de l'état (mWs msg du websocket ou d'un autre requete null)
	async function loadEtat(mWs) {
		let ret = (!mWs)?  await apiCall("/torches/etat") : mWs
		if ( !ret.o || !ret.o.historique)
			return addNotification("Erreur sur chargement de l'état du challenge, contacte Kikiadoc","red",30)
		ret.o.dthDiffered = ret.o.relaxDthByPseudo[pseudo] || 0
		etat = ret.o
		recalcEtat()
	}

	// recalcul les parametres d'affichage (sur timer)
	let recalcTimerId = null
	function getSievert(ms) {
		return (ms<=0)?  0 : Math.floor( (Math.exp(ms/250000000) -1) * 1000000)
	}
	function recalcEtat() {
		// si challenge termine
		if (!etat.question) return cEtat.dspDth = cEtat.dspDthDiffered = cEtat.dspNbSieverts = null
		// calcul des éléments d'IHM
		const now = Date.now()
		cEtat.dspDth = (etat.question.dth > now)? countDownTo(etat.question.dth) : null
		cEtat.dspDthDiffered = (etat.dthDiffered > now)? countDownTo(etat.dthDiffered) : null
		cEtat.dspNbSieverts = getSievert(etat.dthDiffered-now)
		// relance le timer si affichage des dth (pas encore de proposition)
		recalcTimerId = (cEtat.dspDth || cEtat.dspDthDiffered)? setTimeout(recalcEtat,1000) : null
	}

	// proposition d'un réponse
	async function propose() {
		let ret = await apiCall("/torches/propose/"+cEtat.proposition,'PUT')
		cEtat.proposition = null
		if (ret.status==200) { playVideo("ff-7/ff-7-torches-1") } // la sync se fera par le WS
		if (ret.status==201) { playVideo("ff-7/ff-7-torches-2") } // la sync se fera par le WS
		if (ret.status==202) { addNotification("Mauvaise réponse, tu as été irradié","yellow",10,"prout-long"); loadEtat(ret) } // mauvaise réponse
	}
	
	// affichage des hautfaits/résultats
	let dspResultats = null
	async function calcResultats() {
		dspResultats = etat.historique
	}
	
</script>
<style>
	.rouge { color: red}
	.vert { color: lightgreen}
	.blanc { color: white}
</style>

{#if pseudo.startsWith("Kikiadoc")}
	<div class="adminCadre">
	  <input type="button" on:click={()=> newInfoPopup("debug",["etat:",JSON.stringify(etat,null,2),"cEtat:",JSON.stringify(cEtat,null,2)])} value="Adm LocalDump" />
	  <input type="button" on:click={()=> confirm("Reset torche?") && apiCall('/torches/admReset','PATCH')} value="Adm Reset" />
	  <input type="button" on:click={()=> confirm("Go next torche?") && apiCall('/torches/admNext','PATCH')} value="Adm Next" />
	</div>
{/if}

<div>
  <input type="button" on:click={()=> step=0} value="Revoir le lore" />
  <input type="button" on:click={()=> calcResultats()} value="Résultats" />
	{#if etat && cEtat}
		{@const cls = (cEtat.dspNbSieverts >0) ? "rouge" : "vert"}
		🏆: {etat.historique.length}/{etat.NBQUESTIONS}
		<a class={cls} href="https://fr.wikipedia.org/wiki/Liste_des_unit%C3%A9s_de_mesure_de_radioactivit%C3%A9" target="_blank" >
			☢: {cEtat.dspNbSieverts} µSv
		</a>
	{/if}
</div>

{#if step==0}
	<div>
		<div>
			{pseudo}, tu le sais déjà, de nombreuses Peluches ont été lobotomisées. 
			C'est un grand danger pour l'Univers Connu et je pense en connaitre la cause: le Gaz de la Possession.
		</div>
		<Epiq bind:step={step} oui=1 ouiVal="Le Gaz de la Possession?" />
	</div>
{/if}
{#if step==1}
	<div>
			Oui le Gaz de la Possession.
		<div class="br" />
		Selon le dernier rapport de la peluche espionne 
		<a href="https://fr.wikipedia.org/wiki/Hubert_Bonisseur_de_La_Bath" target="_blank">OSS117</a>,
		il existe un laboratoire secret
		fabriquant une nouvelle arme de destruction massive: la Torchère de l'Hégémonie.
		<br/>
		Cette arme est très dangeureuse car radioactive et capable de libérer
		le pire des neurotoxiques connus,
		le fameux Gaz de la Possession.
		<br />
		<Epiq bind:step={step} oui=2 ouiVal="Que faire?" />
	</div>
{/if}
{#if step==2}
	<div>
		<a href="https://fr.wikipedia.org/wiki/Hubert_Bonisseur_de_La_Bath" target="_blank">OSS117</a>
		indique que la dissipation du neurotoxique est sans danger s'il est effectue dans les limbes,
		au delà de l'atmosphère d'Eorzéa.
		<br/>
		Elle va envoyer la Torchère dans les limbes, afin qu'elle s'y consume,
		mais si la Torchère retombe en Eorzéa, il faudra la renvoyer dans les limbes.
		<div calss="br" />
		Et soudain...
		<br />
		<Epiq bind:step={step} oui=3 ouiVal="Et soudain???" />
	</div>
{/if}
{#if step==3}
	<div>
		Soudain, une énorme explosion s'est produite du coté de Station Neuf
		et la transmission d'OSS117 s'est interrompue.
		<br/>
		Je suis sure qu'elle a provoqué cette explosion
		pour envoyer la Torchère de l'Hégémonie dans les limbes.
		<br/>
		Et j'espère qu'elle n'est pas blessée.
		<br/>
		<Epiq bind:step={step} oui=4 ouiVal="Que faire maintenant?" />
	</div>
{/if}
{#if step==4}
	<div>
		Je m'en vais quérir les Peluches
		<a href="https://fr.wikipedia.org/wiki/Galil%C3%A9e_(savant)" target="_blank">Galileo Galilei</a>
		et
		<a href="https://fr.wikipedia.org/wiki/Marie_Curie" target="_blank">Marie Curie</a>
		afin d'analyser la situation.
		<br/>
		Je suis sur qu'elles te seront d'une grande aide si tu souhaites contribuer à la destruction de la Torchère.
		<br/>
		<Epiq bind:step={step} oui=99 ouiVal="Tu peux compter sur moi!" />
	</div>
{/if}

{#if step==99 && etat && cEtat}
		{#if !etat.question}
			<div class="blinkMsg">La Torchère de l'Hégémonie s'est consumée dans les limbes éthérées.</div>
			<i>Ce challenge est terminé</i>
			<br/>
			<Epiq bind:page={page} bind:step={step}
					oui=99 ouiPage=0 ouiVal="Merci Grande Peluche"
					non=99 nonVideo="ff-7/ff-7-torches-2" nonVal="Revoir la vidéo finale"
					rst=0 rstVal="Revoir le Lore"
				/>
		{:else}
			<div>
				Selon la Peluche
				<a href="https://fr.wikipedia.org/wiki/Galil%C3%A9e_(savant)" target="_blank">Galileo Galilei</a>,
				{#if cEtat.dspDth}
					la Torchère de l'Hégémonie retombera en {etat.question.z} dans {cEtat.dspDth}.
				{:else}
					la Torchère de l'Hégémonie est retombée en {etat.question.z}.
				{/if}
			</div>
			{#if cEtat.dspDthDiffered}
				<div>
					Au vu de l'irradiation résiduelle de ton corps, et selon la Peluche
					<a href="https://fr.wikipedia.org/wiki/Marie_Curie" target="_blank">Marie Curie</a>,
					il faut que tu attendes encore <span style="color:red">{cEtat.dspDthDiffered}</span> pour
					t'approcher de la Torchère sans risque pour ta santé.
				</div>
				<div style="font-style:italic; font-size: 0.7em">
					L'irradiation résiduelle de ton corps est calculée selon tes résultats actuels (réussites et erreurs)
				</div>
			{/if}
			{#if cEtat.dspDth==null && cEtat.dspDthDiffered==null}
				<div>
					Tu peux localiser précisement la Torchère en répondant à la question suivante:
					<br/>
					{etat.question.q}
					<br/>
					{#each etat.question.o as o,i}
						{@const cls= (cEtat.proposition==i)? "selOui":"selNon"}
						<span class={cls} on:click={()=>cEtat.proposition=i} role="button" tabindex=0 on:keypress={null} >
							{o} &nbsp;
						</span>
					{/each}
					{#if cEtat.proposition !== undefined}
						<input type="button" value="Je confirme" on:click={()=>propose()} />
					{/if}
				</div>
				<div style="font-style:italic; font-size: 0.7em">
					Attention, en cas de mauvaise réponse, tu seras quand meme exposé aux radiations de la Torchère
					et tu devras patienter afin que ton niveau résiduel de radiations redevienne tolérable.
				</div>
			{/if}
		{/if}
{/if}

{#if dspResultats}
	<div class="popupCadre papier">
		<div class="close" on:click={()=>dspResultats=false} on:keypress={null} role="button" tabindex=0>X</div>
		<div class="popupZone">
			<div class="popupContent">
				Voici les étapes actuelles du renvoi dans les limbes éthérées de la torche de l'Hégémonie
				<br/>
				{#each dspResultats as e,i}
					<span>{e} &nbsp;</span>
				{/each}
			</div>
			<div>Total: {dspResultats.length}</div>
		</div>
	</div>
	
{/if}
<!-- P350.svelte -->
