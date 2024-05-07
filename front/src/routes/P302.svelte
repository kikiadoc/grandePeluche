<script>
	import { onMount, onDestroy } from 'svelte';
	import { loadIt, storeIt, apiCall, newInfoPopup, addNotification, jjhhmm } from './storage.js';
	import Epiq from './Epiq.svelte'
	import Uch from './Uch.svelte'

	export let pseudo = null;
	export let page = null
	export let pageDone = null
	export let wsCallComponents; 
	export let pageDesc = null

	const pageEpiqLbl = "P"+pageDesc.n + "_epiqStep"
	const pageRuneLbl = "P"+pageDesc.n + "_runesTrouves"
	const pageLivreLbl = "P"+pageDesc.n + "_runesLivres"
	
	onMount(() => { 
		if (wsCallComponents) wsCallComponents.add(myWsCallback);
	});
	onDestroy(() => {
		if (wsCallComponents) wsCallComponents.delete(myWsCallback);
	});

	function myWsCallback(m) {
	}

	let epiqStep = loadIt(pageEpiqLbl,0);
	$: storeIt(pageEpiqLbl,epiqStep); 

	// Gestion des runes
	let runesTrouvees = loadIt(pageRuneLbl,[]);
	$: storeIt(pageRuneLbl,runesTrouvees)
	$: setupRunes(-1,epiqStep); // force le recalcul des runes selon l'avancement de l'épique
	let runeC = []; // classe 
	let runeIndex = -2; // -2 a calculer, -1 tout trouvé, 0..3 rune à trouver
	// clic sur une rune pour découvrir la destination
	function clicRune(i) {
		console.log("clicRune",i,runeIndex, runesTrouvees)
		if (i!=runeIndex) return
		if (Math.random() < 0.1) runesTrouvees[i]=1
		setupRunes(i)
		if (runeIndex == -1) {
			newInfoPopup("Bravo!","Tu as identifiés toutes les runes","Rends-toi à Teotihuacan")
		} 
	}
	function setupRunes(iClic) {
		console.log("setupRunes",epiqStep,runesTrouvees)
		if (epiqStep != 2) return
		// calcul des possibles
		let possibles = []
		for (let i = 0; i<4; i++)
			if (!runesTrouvees[i]) possibles.push(i);
		// si plusieurs possibilites, supprime celle du dernier clic
		if (possibles.length >=2)	possibles = possibles.filter((i)=> i!=iClic)
		let l = possibles.length;
		let t = -1
		console.log("setupRunes",possibles,runesTrouvees)
		if (l>0) t = possibles[Math.floor(Math.random()*l)];
		for (let i=0; i<4; i++) {
			if (runesTrouvees[i])
				runeC[i] = "runeOk stars"
			else
				runeC[i] = (i==t)? "blinkFlag runeKoTarget" : "runeKo stars"
		}
		runeIndex = t;
	}
	let runesLivre = loadIt(pageLivreLbl,[]);
	$: storeIt(pageLivreLbl,runesLivre)
	$: checkRunes(runesLivre,epiqStep); // force le recalcul des runes selon l'avancement de l'épique
	let flagLivre = false; // indique que les runes du livre sont trouvées
	// Verification du o tempora o mores
	function checkRunes() {
		let r0= (runesLivre[0] || "").toLowerCase();
		let r1= (runesLivre[1] || "").toLowerCase();
		let r2= (runesLivre[2] || "").toLowerCase();
		let r3= (runesLivre[3] || "").toLowerCase();
		flagLivre = (r0=="o" && r1=="tempora" && r2=="o" && r3=="mores")
		// if (epiqStep==3 && flagLivre) newInfoPopup("Runes d'annulation", "Tu as identifié les runes!")
	}

	// affichage des resultats
	let dspResultats = false;
	async function calcResultats() {
		let ret = await apiCall("/hautsFaits/Teotihuacan",'GET')
		if (ret.status !=200) return;
		// sync IHM
		dspResultats=ret.o
	}
	
</script>

<style>
	.runeKoTarget { cursor: pointer; background-color: black; color: black; visibility: none}
	.runeKo { cursor: not-allowed; background-color: black; color: black; visibility: none}
	.runeOk { cursor: not-allowed; background-color: black; color: white}
</style>

<Uch fullDisplay=0 wsCallComponents={wsCallComponents} pseudo={pseudo} />

<div class="adminCadre">
	<input type="button" value="InitRunes" on:click={()=>{runesTrouvees=[]; setupRunes();} }>
</div>
<div>
	<Epiq bind:step={epiqStep} rst=0 rstVal="Réafficher le lore" />
	<input type="button" value="Haut Fait" on:click={()=>calcResultats()} />
</div>

{#if epiqStep==0}
	<div class="reveal">
		<div style="font-size: 0.8em">
			<i>Ce lore est imaginaire, même si basé sur de véritables hypothèses historiques en cours d'étude</i>
			<br/>
		</div>
		{pseudo}, j'ai décrypté quelques éléments du Grand Grimoire de la Magie.
		Ces nouveaux éléments mentionnent 
		<a href="https://fr.wikipedia.org/wiki/Teotihuacan" target="_blank">Teotihuacan</a>.
		<br/>
		Il y fait mention d'un Schisme du Temps à la fin de l'age Patlachique, le premier age de la cité.
		<br/>
		<Epiq bind:step={epiqStep} ouiVal="Dis m'en plus !" oui=1 
			ouiVideo="ff14-6-teotihuacan-challenge" />
	</div>
{/if}

{#if epiqStep==1}
	<div class="reveal">
		J'espère que cela t'a un peu éclairé sur cette cité-état qui a été bâtie
		il y a plus de 2000 années Eorzéennes.
		<div class="br"/>
		Le Grand Grimoire des Savoirs indique que le premier age de Teotihuacan était un age où
		la bienveillance était de mise, qu'un quadriumvirat gouvernait la cité,
		que la petite pyramide de la Lune avait été édifiée afin de vénérer les multiples
		dieux de façon pacifique.
		<div class="br"/>
		Mais cela change totalement lors du second age de la cité, l'age Tzacualli.
		Les rites changent drastiquement:
		<br/>
		<u>Des sacrifices humains sont pratiqués au nom d'un dieu unique, le régime devient une dictature</u>.
		<br/>
		Puis ce sera, en quelques siècles, le déclin de la cité jusque la disparition de
		sa civilisation.
		<br/>
		Je pense que le Grand Grimoire de la Magie mentionne, sous le nom de Schisme du Temps,
		un sort maléfique qui aurait transporté les fondements de la société
		du premier age ailleurs dans l'espace et le temps, mais que l'on peut retrouver cette
		cité-état dans le temps présent.
		<br/>
		Selon moi, cela pourrait être la cause de ce changement entre le premier et le second age,
		mais comment en être sur ?
		<br/>
		Veux-tu m'aider à comprendre l'Histoire de 
		<a href="https://fr.wikipedia.org/wiki/Teotihuacan" target="_blank">Teotihuacan</a>?
		<br/>
		<Epiq bind:step={epiqStep} ouiVal="Ca semble passionnant" oui=2 />
	</div>
{/if}
{#if epiqStep==2}
	<div class="reveal">
		{pseudo}, j'ai vu des runes ensorcelées dans un coin de la page du Grimoire de la Magie.
		<br/>
		Je pense qu'elles indiquent la localisation de 
		<a href="https://fr.wikipedia.org/wiki/Teotihuacan" target="_blank">Teotihuacan</a>
		dans le temps présent.
		<br/>
		{#if runeIndex>=0}
			Je n'ai pas la dextérité nécessaire pour révéler ces runes,
			mais peut-être que toi, tu peux ?
			<br/>
			Voici les runes à découvrir:
		{:else}
			Tu as découvert les runes ensorcelées !
		{/if}
		<div>
			<span class={runeC[0]} on:click={()=>clicRune(0)} role="button" tabindex=0 on:keypress={null}>Moogle,</span>
			<span class={runeC[1]} on:click={()=>clicRune(1)} role="button" tabindex=0 on:keypress={null}>Empyrée,</span>
			<span class={runeC[2]} on:click={()=>clicRune(2)} role="button" tabindex=0 on:keypress={null}>Sect. 9</span>
			<span class={runeC[3]} on:click={()=>clicRune(3)} role="button" tabindex=0 on:keypress={null}>Appart 7</span>
		</div>
		{#if runeIndex>=0}
			<div style="font-size: 0.8em"><i>A chaque clic, tu as une petite chance de découvrir une rune</i></div>
		{:else}
			<span class="blinkMsg">Rends-toi dans la cité-état dans le temps présent!</span>
			<br/>
			<Epiq bind:step={epiqStep} ouiVal="Ca y est, je suis dans Teotihuacan" oui=3 />
		{/if}
	</div>
{/if}
{#if epiqStep==3}
	<div class="reveal">
		Les Peluches Archéologues ont découvert des squelettes dans les souterrains de la Pyramide de la Lune
		du temps passé révélant les exactions proférées à partir du Second Age.
		<br/>
		Mais si c'est le sort du Schisme du Temps qui est responsable de cette situation, peut être
		que des traces de cette incantation existent encore sous la pyramide de la lune du temps présent...
		<br/>
		Alors explore l'intérieur de la Pyramide de la Lune du temps présent, localise le livre
		ayant servi à incanter le Schisme du Temps. Je pense qu'il s'y trouve une séquence runique d'annulation
		du sort, alors indique la moi.
		<div style="font-size: 0.8em">
			<i>
				Localise le livre de correspondance sous la pyramide dans l'appartement IG,
				(il faudra "pousser" les pierres de la pyramide pour aller dans la cavité intérieure),
				laisse un message dessus style "coucou je suis passé par ici" pour valider ton passage
				et indique ci-dessous la séquence runique indiquée sur le livre pour continuer
			</i>
		</div>
		<input type="text" bind:value={runesLivre[0]} placeholder="﹇" maxlength=1 size=2 />
		<input type="text" bind:value={runesLivre[1]} placeholder="﹇﹇﹇﹇﹇﹇﹇" maxlength=7 size=14 />
		,
		<input type="text" bind:value={runesLivre[2]} placeholder="﹇" maxlength=1 size=2 />
		<input type="text" bind:value={runesLivre[3]} placeholder="﹇﹇﹇﹇﹇" maxlength=5 size=12 />
		<div>
			{#if flagLivre}
				<span class="blinkMsg">Tu as trouvé les runes d'annulation, laisse un message sur le livre</span>
				<br/>
				<Epiq bind:step={epiqStep}
					ouiVal="J'ai laissé un message sur le livre de Teotihuacan!" oui=5 ouiHautFait="Teotihuacan" />
			{:else}
				...
			{/if}
		</div>
	</div>
{/if}

{#if epiqStep==5}
	<div class="reveal">
		Merci {pseudo} pour cette information fondamentale. 
		<div class="br" />
		De nombreux lieux d'Eorzéa semblent être dans la même situation que Teotihuacan.
		<div class="br" />
		J'examine actuellement de nombreux feuillets du Grand Grimoire de la Magie afin
		de dénombrer tous les lieux déracinés de l'Histoire, et grâce à toi, je connais la
		séquence runique permettant de les transporter dans l'Histoire.
		<div class="br" />
		J'espère qu'à partir du dimanche 24 mars à 20h (heure de Paris),
		tu pourras m'aider à les localiser précisement.
		<div class="br" />
		<i>
		Tu peux réafficher le lore de ce challenge en cliquant sur 'Réafficher le lore' ou
		revenir ici en cliquant sur <i>{pageDesc.texte}</i> dans ta liste des Possibles.
		<br/>
		Si tu partages ces informations avec tes amis, n'oublie pas qu'ils doivent
		aussi suivre cette quête afin d'obtenir le Haut Fait de Teotihuacan.
		Tu peux voir la liste actuelle des Aventuriers ayant obtenu le Haut Fait Teotihuacan
		en cliquant sur 'Haut fait'
		</i>
		<br/>
		<Epiq bind:step={epiqStep} bind:page={page} bind:pageDone={pageDone} ouiPageDone={pageDesc.n} 
			ouiVal="Merci Grande Peluche" oui=5 ouiPage=0/>
	</div>
{/if}

{#if dspResultats}
	{@const tblPseudos = Object.keys(dspResultats.pseudos) }
	<div class="popupCadre stars">
		<div class="close" on:click={() => dspResultats=false} on:keypress={null} role="button" tabindex=0>X</div>
		<div class="popupZone">
			<div class="popupContent" >
				<div>Teotihuacan</div>
				<div>Runes d'annulation découvertes:</div>
				{#each tblPseudos as iPseudo, i}
					<div style="font-size:0.8em">
						{iPseudo} ({jjhhmm(dspResultats.pseudos[iPseudo].dth)})
					</div>
				{/each}
			</div>
		</div>
	</div>
{/if}

<!-- P302.svelte -->
