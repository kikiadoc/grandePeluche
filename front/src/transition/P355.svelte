<script>
	import { onMount, onDestroy } from 'svelte';
	import { loadIt, storeIt, apiCall, urlImg } from "./storage.js"
	import { addNotification, newInfoPopup, playVideo, playDing, clickSur } from "./storage.js"

	import Btn from './z/Btn.svelte'
	import Ctrad from './Ctrad.svelte'
	
	export let wsCallComponents
  export let pseudo
  // export let page
  export let pageDesc = null
  // export let pageDone = []
	// export let pseudoList = []
	
	const pageEpiqLbl = "P"+pageDesc.n + "_epiqStep"
	const pageSaisiesLbl = "P"+pageDesc.n + "_saisies"

	// etape epique
	let epiqStep = loadIt(pageEpiqLbl,0)
  $: storeIt(pageEpiqLbl,epiqStep)
	// etat des saisies
	let saisies = loadIt(pageSaisiesLbl,{tableaux:[],nombres:[],traductions:[]})
  $: storeIt(pageSaisiesLbl,saisies)

	let timeoutId = null

	// Gestion des reload, refresh etc..
	onMount(() => {
		if (wsCallComponents) wsCallComponents.add(myWsCallback)
		loadEtat(null)
		// timeoutId = setInterval(onTimer,1000)
	})
	onDestroy(() => {
		if (wsCallComponents) wsCallComponents.delete(myWsCallback)
		// clearInterval(timeoutId)
	})
	// callback sur le websocket
	function myWsCallback(m) {
		// if (m.op=="torches") {	console.log('reloadEtat'); loadEtat(m); return true }
	}

	const tableaux = [
		{ n: "Le bazar argenté", t:1 },
		{ n: "Le Moulin des Bois", t:4 },
		{ n: "Les Piques pendues", t:2 },
		{ n: "Pierrechantantes", t:5 },
		{ n: "La Tour de Cristal", t:3 },
		{ n: "Le temple enseveli de Qarn", t:0 }
	]
	const peluches = [
		{n: 48},
		{n: 3},
		{n: 4},
		{n: 5},
		{n: 6},
		{n: 16}
	]
	// etat actue du challenge (maj par get ou WS)
	let etat = null

	// chargement de l'état (mWs msg du websocket ou d'un autre requete null)
	async function loadEtat(mWs) {
		/*
		let ret = (!mWs)?  await apiCall("/torches/etat") : mWs
		if ( !ret.o || !ret.o.historique)
			return addNotification("Erreur sur chargement de l'état du challenge, contacte Kikiadoc","red",30)
		ret.o.dthDiffered = ret.o.relaxDthByPseudo[pseudo] || 0
		etat = ret.o
		recalcEtat()
		*/
	}

	// vérif si tous les tableaux sont OK
	function isTableauxValid() {
		for (let i=0;i<tableaux.length;i++) 
			if (saisies.tableaux[i] != i) return false
		return true
	}

	// popup de traduciton des nombres
	let dspTraduire = null
	function traduire(i) {
		console.log("traduire",i,saisies.nombres[i])
		dspTraduire = { i: i, nbAsc: saisies.nombres[i] }
	}

	// verif si traductions faites (mais pas forcement valides)
	function isTraductionsFaites() {
		for (let i=0;i<peluches.length;i++) 
			if (!saisies.traductions[i]) return false
		return true
	}
	
	// affichage des hautfaits/résultats
	let dspResultats = null
	async function calcResultats() {
		dspResultats = etat.historique
	}
	
</script>
<style>

</style>

{#if pseudo.startsWith("Kikiadoc")}
	<div class="adminCadre">
		Admin:
	  <input type="button" on:click={()=> saisies={tableaux:[],nombres:[],traductions:[]} } value="ResetSaisies" />
	</div>
{/if}

<div>
  <input type="button" on:click={()=> epiqStep=0} value="Revoir le lore" />
	<input type="button" value="Résulats" />
</div>

{#if epiqStep==0}
	<div>
		<div>
			Souviens-toi {pseudo},
			<br/>
			OSS117 a détruit l'un des site se préparant à diffuser le Gaz de Possession.
			<div class="br" />
			C'est une Peluche Emérite: elle s'en est sortie indemme et m'a envoyé de nombreux débris de l'explosion.
			<br />
			En les examinant, 6 d'entre-eux ont attiré mon attention car ils indiquent des lieux d'Eorzéa.
			<div class="br" />
			Je les ai insérés dans les 6 tableaux que tu peux voir dans la Crypte des Valeureux, au sous-sol de la maison de CL de Kikiadoc.
			Sauras-tu m'aider en identifiant les lieux associés?
		</div>
		<Btn bind:refStep={epiqStep} step=10 val="J'en suis sûr" />
	</div>
{/if}

{#if epiqStep==10}
	<div>
		<div>Les tableaux 1,2,3 sont au nord du sous-sol, les 4,5,6 sont au sud.</div>
		<img src={urlImg+"ff-7/maison-cl-sous-sol.png"} style="width:20%; float:right" alt="" />
		{#each tableaux as _,n}
			<div>
				{n+1}:
				<select bind:value={saisies.tableaux[n]}>
					<option value=0>Choisir...</option>
					{#each tableaux as t,i}
						<option value={t.t}>{t.n}</option>
					{/each}
				</select>
			</div>
		{/each}
		<Btn bind:refStep={epiqStep} step=20 val="J'ai identifié les lieux" ifFct={()=>isTableauxValid()}
			koMsg="Tu n'as pas correctement identifié les tableaux"
			/>
		<div style="clear:both" class="br"/>
	</div>
{/if}

{#if epiqStep==20}
	<div>
		Rend-toi dans la chambre du 4ème Pouvoir de la maison de CL de Kikiadoc.
		<br />
		Examine les tables tactiques qui s'y trouvent et note ci-dessous les nombres indiqués par les Nouveaux Anciens
		selon le code du Boulier.
		<br/>
		Pour chaque nombre, traduit le en langage Eorzéen en cliquant sur ">".
		<img src={urlImg+"ff-7/maison-cl-sous-sol.png"} style="width:20%; float:right" alt="" />
		{#each peluches as _,i}
			<div>
				{i+1}: 
				<input type="texte" placeholder="nombre" size=4 bind:value={saisies.nombres[i]} />
				<input type="button" value=">" on:click={()=>traduire(i)} />
				{saisies.traductions[i] || ""}
			</div>
		{/each}
		<div>Quand tu as fini, clique ci-dessous</div>
		<Btn bind:refStep={epiqStep} step=30 val="J'ai tout traduit" ifFct={()=>isTraductionsFaites()}
			msg="En cas d'erreur, tu peux cliquer sur revoir le lore et modifier tes informations"
			koMsg="Tu n'as pas traduits les 6 nombres" koDing='prout-long'
			/>
		<div style="clear:both" class="br"/>
	</div>
{/if}

{#if epiqStep==30}
	<div>
		Selon tes traductions, les Nouveaux Anciens mentionne un lieu à
		<br/>
		{#each peluches as _,i}
			<span>{saisies.traductions[i]} </span>
		{/each}
		<div class="br" />
		Vas-y et indique-moi comment ce lieu est nommé par les Nouveaux Anciens.
		<br/>
		<i>(c'est indiqué sur le livre de correspondance de ce lieu)</i>
		<br/>
		<input type="text" placeholder="nom Ancien" bind:value={saisies.nomAncien}
			on:keypress={(e)=> e.keyCode==13 && clickSur('nomAncien')}
			/>
		<Btn id="nomAncien" bind:refStep={epiqStep} step=40 val=">" ifFct={()=>(saisies.nomAncien||"").toLowerCase()=="la source"}
			koMsg="Ce n'est pas ce qui est indiqué sur le livre de correspondance du lieu" koDing="prout-long" />
		<div style="clear:both" class="br"/>
	</div>
{/if}

{#if epiqStep==40}
	<div>
		La Source, j'ai lu quelque chose à ce propos dans le Grimoire de la Magie.
		<br/>
		<div style="clear:both" class="br"/>
	</div>
{/if}

{#if epiqStep==99 && etat}
	<div>
	</div>
{/if}

{#if dspTraduire}
	<div class="popupCadre papier">
		<div class="close" on:click={()=>dspTraduire=false} on:keypress={null} role="button" tabindex=0>X</div>
		<div class="popupZone">
			<div class="popupContent">
				traduction... {dspTraduire.nbAsc}
				<Ctrad ascVal={dspTraduire.nbAsc} cbResolve={(r)=>{if (r) saisies.traductions[dspTraduire.i] = r.phrase || r.nbEor; dspTraduire=null}} />
			</div>
		</div>
	</div>
{/if}

{#if dspResultats}
	<div class="popupCadre papier">
		<div class="close" on:click={()=>dspResultats=false} on:keypress={null} role="button" tabindex=0>X</div>
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
<!-- P355.svelte -->
