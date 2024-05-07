<script>
	import { onMount, onDestroy  } from 'svelte';
	import { loadIt, storeIt, apiCall, urlImg  } from './storage.js';
	import { playSound, playDing, newInfoPopup, addNotification, playVideo } from './storage.js';
	import Epiq from './Epiq.svelte';
	import Uch from './Uch.svelte';

	export let wsCallComponents;
	export let pseudo;
	export let pageDesc = null

	const pageEpiqLbl = "P"+pageDesc.n + "_epiqStep"

	onMount(() => { 
		if (wsCallComponents) wsCallComponents.add(myWsCallback);
		init();
	});
	onDestroy(() => {
		if (wsCallComponents) wsCallComponents.delete(myWsCallback);
	});
	
	function myWsCallback(m) {
		if (m.op=="dirac") { getResultat(); return true; }
	}

	let step = loadIt(pageEpiqLbl,0);
	$: storeIt(pageEpiqLbl,step);

	function init() {
		getResultat();
	}
	let resultat = { minDth: 0, pseudos: []}
	async function getResultat() {
		let ret = await apiCall('/hautsFaits/dirac')
		if (ret.status==200) {
			let tmpResultat = {minDth: Date.now()+60000, pseudos: [] }
			// calcul du minDth pour le bonus et le tableau d'affichage
			Object.keys(ret.o.pseudos).forEach( (e)=> {
				const p = ret.o.pseudos[e]
				tmpResultat.pseudos.push({pseudo:e, dth: p.dth})
				tmpResultat.minDth=Math.min(p.dth,tmpResultat.minDth)
			})
			
			// sync
			resultat = tmpResultat
		}
	}

	const tbl4 = [0,1,2,3]
	const lstPeluche = [
		{ nom: "Peluche de Brina" , val: 12, tPos:0 , img: "Brina", lodestone: ""},
		{ nom: "Peeriefool en peluche" , val: 6, tPos:1 , img: "Peeriefool", lodestone: ""},
		{ nom: "Peluche d'Edda" , val: 15, tPos: 2 , img:"Edda", lodestone: ""},
		{ nom: "Peluche de Calca" , val: 1, tPos: 3 , img:"Calca", lodestone: ""},
		{ nom: "Chevalier aubergine en peluche" , val: 13, tPos: 4 , img: "ChevalierAubergine", lodestone: "" },
		{ nom: "Baron ail en peluche" , val: 3, tPos: 5 , img: "BaronAil", lodestone: "" },
		{ nom: "Roi tomate en peluche" , val: 10, tPos: 6 , img: "RoiTomate", lodestone: "" },
		{ nom: "Prince oignon en peluche" , val: 8, tPos: 7 , img: "PrinceOignon", lodestone: "" },
		{ nom: "Kojin en peluche" , val: 2, tPos: 8 , img: "Kojin", lodestone: "" },
		{ nom: "Ours en peluche" , val: 16, tPos: 9 , img:"Ours", lodestone: "" },
		{ nom: "Mog en peluche" , val: 5, tPos: 10 , img:"Mog", lodestone: "" },
		{ nom: "Namazu en peluche" , val: 11, tPos: 11 , img:"Namazu", lodestone: "" },
		{ nom: "Pièce ishgardaise" , val: 7, tPos: 12 , img: "PieceIshgardaise", lodestone: "" },
		{ nom: "Pièce wyverne" , val: 9, tPos: 13 , img: "PieceWyverne", lodestone: "" },
		{ nom: "Fuath en peluche" , val: 4, tPos: 14 , img: "Fuath", lodestone: "" },
		{ nom: "Pièce dragon" , val: 14, tPos: 15 , img: "PieceDragon", lodestone: "" }
	]

	const initPos = [5,13,4,8,12,1,0,6,9,14,2,10,15,3,7,11]
	const solPos = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]
	let memPos = null
	let currentPos = loadIt("P"+pageDesc.n + "_currentPos",initPos)
	$: storeIt("P"+pageDesc.n + "_currentPos",currentPos)
	$: calc(currentPos)

	let somme={h: [], v:[], d:[], ch: [], cv:[], cd:[]}
	async function calc() {
		let tmpCalcTbl = []
		for (let idxMat=0; idxMat<16; idxMat++) {
			const peluche = lstPeluche[currentPos[idxMat]||0]
			tmpCalcTbl[idxMat]=peluche.val		
		}
		
		let tmpSomme={h: [], v:[], d:[], ch: [], cv:[], cd:[]}
		tmpSomme.h[0] = tmpCalcTbl[0]+tmpCalcTbl[1]+tmpCalcTbl[2]+tmpCalcTbl[3]
		tmpSomme.h[1] = tmpCalcTbl[4]+tmpCalcTbl[5]+tmpCalcTbl[6]+tmpCalcTbl[7]
		tmpSomme.h[2] = tmpCalcTbl[8]+tmpCalcTbl[9]+tmpCalcTbl[10]+tmpCalcTbl[11]
		tmpSomme.h[3] = tmpCalcTbl[12]+tmpCalcTbl[13]+tmpCalcTbl[14]+tmpCalcTbl[15]
		tmpSomme.v[0] = tmpCalcTbl[0]+tmpCalcTbl[4]+tmpCalcTbl[8]+tmpCalcTbl[12]
		tmpSomme.v[1] = tmpCalcTbl[1]+tmpCalcTbl[5]+tmpCalcTbl[9]+tmpCalcTbl[13]
		tmpSomme.v[2] = tmpCalcTbl[2]+tmpCalcTbl[6]+tmpCalcTbl[10]+tmpCalcTbl[14]
		tmpSomme.v[3] = tmpCalcTbl[3]+tmpCalcTbl[7]+tmpCalcTbl[11]+tmpCalcTbl[15]
		tmpSomme.d[0] = tmpCalcTbl[0]+tmpCalcTbl[5]+tmpCalcTbl[10]+tmpCalcTbl[15]
		tmpSomme.d[1] = tmpCalcTbl[3]+tmpCalcTbl[6]+tmpCalcTbl[9]+tmpCalcTbl[12]

		tmpSomme.ch[0] = (tmpSomme.h[0]==34)? "sOk stars":"sKo papier"
		tmpSomme.ch[1] = (tmpSomme.h[1]==34)? "sOk stars":"sKo papier"
		tmpSomme.ch[2] = (tmpSomme.h[2]==34)? "sOk stars":"sKo papier"
		tmpSomme.ch[3] = (tmpSomme.h[3]==34)? "sOk stars":"sKo papier"
		tmpSomme.cv[0] = (tmpSomme.v[0]==34)? "sOk stars":"sKo papier"
		tmpSomme.cv[1] = (tmpSomme.v[1]==34)? "sOk stars":"sKo papier"
		tmpSomme.cv[2] = (tmpSomme.v[2]==34)? "sOk stars":"sKo papier"
		tmpSomme.cv[3] = (tmpSomme.v[3]==34)? "sOk stars":"sKo papier"
		tmpSomme.cd[0] = (tmpSomme.d[0]==34)? "sOk stars":"sKo papier"
		tmpSomme.cd[1] = (tmpSomme.d[1]==34)? "sOk stars":"sKo papier"
		somme = tmpSomme;

		// verif si solution trouvee
		tmpSomme.trouve = (tmpSomme.h[0]==34) && (tmpSomme.h[1]==34) && (tmpSomme.h[2]==34) && (tmpSomme.h[3]==34) &&
											(tmpSomme.v[0]==34) && (tmpSomme.v[1]==34) && (tmpSomme.v[2]==34) && (tmpSomme.v[3]==34) &&
											(tmpSomme.d[0]==34) && (tmpSomme.d[1]==34)

		// sync IHM
		somme = tmpSomme;
		// sync server
		if (tmpSomme.trouve) {
			let ret = await apiCall('/dirac','PUT')
			// retourne 200 ou 2001
			if (ret.status==200)	addNotification("Tu as déjà activé le Dirac des Quatre")
			newInfoPopup("Tu as aligné les Peluches",
									 [
										 "En alignant les peluches tu as activé le Dirac Des Dimensions.",
										 "Plus vous serez nombreux à avoir activé le Dirac des Dimensions, plus vos gains seront importants"
										])
		}
						
	}
	
	let dspSelChoix = null;
	function selChoix(idx) {
		currentPos[dspSelChoix]=idx;
		dspSelChoix = null;
	}
	let dspResultat = null

	
</script>
<style>
	table { width: 95%}
	td {width:15%; text-align: center}
	.sOk {color:green}
	.sKo {color:red}
</style>
{#if pseudo=="Kikiadoc"}
	<div class="adminCadre">
		Admin:
		<input type="button" on:click={()=>currentPos=initPos} value="ReinitPos" />
		<input type="button" on:click={()=>currentPos=solPos} value="setPos" />
		<input type="button" on:click={()=>console.log(currentPos)} value="dspPos" />
		<input type="button" on:click={()=>apiCall("/hautsFaits/dirac",'DELETE')} value="clearHautFait" />
	</div>
{/if}

<div>
	<input type="button" on:click={()=> step=0} value="Réafficher le lore" />
	<input type="button" on:click={()=> dspResultat=true} value="Résultat" />
	<input type="button" on:click={()=> memPos=currentPos} value="Sauver" />
	{#if memPos}<input type="button" on:click={()=> currentPos=memPos} value="Restaurer" />{/if}
</div>
{#if step == 0}
	<div class="reveal">
		{pseudo}, je suis désolée, mais je n'ai pas réussi l'incantation de la Restauration du Temps.
		Je pense que les Cristaux-Jouvencelles n'ont pu catalyser le sort,
		et qu'il faut un véritable Cristal-Mère pour cela.
		<br/>
		Mais peut-être que tu n'étais pas la?
		<br/>
		<Epiq bind:step={step} oui=1 ouiVal="Si, je m'en souviens bien" non=1 nonVal="Montre moi ce qui s'est passé"  nonVideo="ff-6-dontgiveup"/>
	</div>
{/if}

{#if step == 1}
	<div class="reveal">
		Je viens de contacter les Quatre dans l'Ortho-temps et
		ils m'ont indiqué que, selon leurs connaissances,
		il est possible de matérialiser dans l'Univers Connu un objet
		qui a été dissous dans les Dimensions.
		<br />
		Et c'est ce qui s'est passé pour le Cristal de l'Uchronie.
		<br />
		Les Quatre m'ont indiqué un mécanisme fabuleux: Le Dirac des Dimensions.
		<br />
		Certains parlent de réaligner des planètes, mais cela n'impacte que les 4 dimensions
		de l'Univers Connu.
		Réaligner les Peluches selon un Dirac des Dimensions, cela impacte les 12 Dimensions de l'Univers Quantique.
		<br/>
		<Epiq bind:step={step} oui=2 ouiVal="Le Dirac des Dimensions?" />
	</div>
{/if}

{#if step == 2}
	<div class="reveal">
		Oui, te souviens-tu que, lors du Kiki's Event VII, Hypostasis,
		les Quatre ont utilisé le Chronogyre, pour explorer
		la 5ème dimension et compléter alors la Matrice des Dimensions?
		<br />
		Le Dirac des Dimensions est un outil permettant de s'affranchir des Dimensions!
		<br />
		<Epiq bind:step={step} oui=3 ouiVal="Je me souviens du Chronogyre" non=3 nonVideo="ff-5-chronogyre" nonVal="Redis-moi pour le Chronogyre" />
	</div>
{/if}

{#if step == 3}
	<div class="reveal">
		Le Dirac des Dimensions permet de choisir et positionner des Peluches afin de provoquer
		un flux inter-interdimensionnel et matérialiser l'objet dispersé.
		<br />
		Selon les conseils des Quatre, 
		j'ai construit un Dirac des Dimensions que tu peux modifier, je te l'afficherai un peu plus tard
		<br />
		Quand je leur ai parlé du Cristal de l'Uchronie, ils m'ont indiqué que
		la somme de chacun des vecteurs dimensionnels devra être de 34
		afin d'en provoquer la matérialisation.
		<br />
		<Epiq bind:step={step} oui=4 ouiVal="Waou! Mais c'est compliqué!" />
	</div>
{/if}

{#if step == 4}
	<div class="reveal">
		Oh oui!
		Mais tu sais que les Quatre sont nos amis!
		<br/>
		<u>Ils m'ont alors indiqué qu'ils avaient construit un Dirac des Dimensions dans la chambre de 
		même nom dans la maison de cl de Kikiadoc à titre d'exemple.</u>
		<br />
		Ils m'ont aussi indiqué qu'il suffirait de positionner sur mon Dirac les Peluches comme dans la Chambre,
		et alors,
		il suffira <u>d'échanger deux peluches</u> pour aligner les dimensions sur la valeur 34
		et d'activer alors le Dirac.
		<br />
		En plus, tu peux compter sur mon bavard Assistant Discord pour <u>indiquer la solution
		dès qu'un Aventurier l'a trouvée</u>!
		<br />
		<Epiq bind:step={step} oui=5 ouiVal="En en bref?" />
	</div>
{/if}

{#if step == 5}
	<div class="reveal">
		Rends-toi dans la chambre du Dirac des Dimensions de la maison de cl de Kikiadoc.
		Notes alors les positions des Peluches et reproduit les sur mon propre Dirac des Dimensions.
		Trouve alors l'échange de 2 peluches qui permettra d'aligner toutes les combinaisons à 34.
		<i><u>Il suffit de modifier 2 peluches</u></i>
		Ce dernier échange va provoquer l'activation du Dirac des Dimensions ciblant le Cristal de l'Uchronie.
		<br />
		<Epiq bind:step={step} oui=6 ouiVal="Et pour les gains?" />
	</div>
{/if}
{#if step == 6}
	<div class="reveal">
		Plus il y aura d'Aventuriers ayant aligner des Peluches, plus le gains seront importants pour chacun.
		(Exemple: 2 aventuriers, 1M chacun, mais si 10 aventuriers ont alignés les peluches, c'est 3M chacun )
		Le premier qui identifie l'échange de peluches à réaliser gagne un bonus de 2M.
		<br />
		<u>Mon assistant Discord indiquera quelle est la solution dès qu'elle sera connue.</u>
		Mais tu devras quand même aligner les peluches.
		<br />
		<Epiq bind:step={step} oui=99 ouiVal="Montre moi ton Dirac des Dimensions" />
	</div>
{/if}

{#if step==99}
	<div class="">
		<table>
			<tr>
					<td class="d {somme.cd[0]}">{somme.d[0]}<div style="text-align:right">◿</div></td>
					<td class="v {somme.cv[0]}">{somme.v[0]}<br/>▽</td>
					<td class="v {somme.cv[1]}">{somme.v[1]}<br/>▽</td>
					<td class="v {somme.cv[2]}">{somme.v[2]}<br/>▽</td>
					<td class="v {somme.cv[3]}">{somme.v[3]}<br/>▽</td>
					<td class="d {somme.cd[1]}">{somme.d[1]}<div style="text-align:left">◺</div></td>
			</tr>
			{#each tbl4 as l  }
				<tr>
					<td class="{somme.ch[l]}">{somme.h[l]} ▷</td>
					{#each tbl4 as c}
						{@const idxMat=l*4+c}
						{@const peluche=lstPeluche[currentPos[idxMat]||0]}
						<td on:click={()=> dspSelChoix=idxMat} on:keypress={null}>
							<div style="position: relative; cursor:pointer">
								<img style="width:80%" src="{urlImg}diracdesquatre/{peluche.img}.png" alt="" />
								<div style="position: absolute; top: 30%; left:30%">{peluche.val}</div>
							</div>
						</td>
					{/each}
					<td class="{somme.ch[l]}">◁ {somme.h[l]}</td>
					
				</tr>
			{/each}
			<tr>
					<td class="d {somme.cd[1]}"><div style="text-align:right">◹</div>{somme.d[1]}</td>
					<td class="v {somme.cv[0]}">△<br/>{somme.v[0]}</td>
					<td class="v {somme.cv[1]}">△<br/>{somme.v[1]}</td>
					<td class="v {somme.cv[2]}">△<br/>{somme.v[2]}</td>
					<td class="v {somme.cv[3]}">△<br/>{somme.v[3]}</td>
					<td class="d {somme.cd[0]}"><div style="text-align:left">◸</div>{somme.d[0]}</td>
			</tr>
		</table>
	</div>
{/if}

{#if dspSelChoix!==null}
	<div class="popupCadre papier">
		<div class="close" on:click={() => dspSelChoix=null} on:keypress={null} role="button" tabindex=0>X</div>
		<div class="popupZone">
			<div class="popupContent" style="font-size:0.8em">
					<div>
						Pour cet emplacement,
						<br/>
						choisis une peluche ou assimilée:
						{#each lstPeluche as p,i}
							<div style="cursor:pointer" on:click={() => selChoix(i)} on:keypress={null} role="button" tabindex=0>
								<hr/>
								<img src="{urlImg}diracdesquatre/{p.img}.png" alt="" />
								<br/>
								{p.nom} ({p.val})
							</div>
						{/each}
					</div>
			</div>
		</div>
	</div>
{/if}

{#if dspResultat!==null}
	<div class="popupCadre stars">
		<div class="close" on:click={() => dspResultat=null} on:keypress={null} role="button" tabindex=0>X</div>
		<div class="popupZone">
			<div class="popupContent" style="font-size:0.8em">
				<div>
					Résultats:
				</div>
				{#each resultat.pseudos as p,i}
					<div >
						{p.pseudo} {#if p.dth==resultat.minDth}(bonus){/if}
					</div>
				{/each}
			</div>
		</div>
	</div>
{/if}

<!-- p308.svelte -->
