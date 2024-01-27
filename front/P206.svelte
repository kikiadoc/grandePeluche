<script>
	import { onMount, onDestroy } from 'svelte';
	import { apiCall, loadIt, storeIt } from './storage.js';
	import Epiq from './Epiq.svelte';

	export let wsCallComponents; 
	export let pseudo;
	export let page;

	onMount( () => { if (wsCallComponents) wsCallComponents.add(myWsCallback); loadResultats()	} );
	onDestroy( () => { if (wsCallComponents) wsCallComponents.delete(myWsCallback);	} );
	function myWsCallback(m) {
		if (m.op=="deepAI") { loadResultats() }
	}

	// Gestion de l'épique
	let epiqStep = loadIt("P206_epiqStep", 0);
	$: storeIt("P206_epiqStep",epiqStep);

	// collection de résultats.
	const nbPostsMax = 6;
	let resultats = null;

	// chargement des résultats
	async function loadResultats() {
		let ret = await apiCall("/deepAI/resultats")
		if (ret.status!=200) return;
		let tmpResultats = ret.o;
		// calcul du tableau des pseudos
		tmpResultats.tblPseudos = Object.keys(tmpResultats.pseudos)
		// init du nbPosts des pseudos
		tmpResultats.nbPosts = {}
		for (const iPseudo of tmpResultats.tblPseudos) tmpResultats.nbPosts[iPseudo] = 0;
		// init des scores par categorie
		tmpResultats.score = {}
		for (const cat of tmpResultats.catLst) tmpResultats.score[cat] = null;
		// balayge de la matrice
		for (const cat of tmpResultats.catLst) {
			for (const iPseudo of tmpResultats.tblPseudos) {
				const tblRes = tmpResultats.pseudos[iPseudo][cat]
				if (tblRes) {
					for (const res of tblRes) {
						// ona un score a comptabiliser
						tmpResultats.nbPosts[iPseudo] ++;
						const score = res.score
						// score dans cette categoerie et ipseudo
						if (tmpResultats.score[cat]) {
							if (tmpResultats.catSrt[cat]) {
								if (score < tmpResultats.score[cat]) tmpResultats.score[cat] = score
							}
							else {
								if (score > tmpResultats.score[cat]) tmpResultats.score[cat] = score
							}
						}
						else
							tmpResultats.score[cat] = score
					}
				}
				else {
					// pas de score dans cette categoerie et ipseudo
				}
			}
		}
		// commit IHM
		resultats = tmpResultats
	}

	// Variables pour admin
	let admPseudo = null;
	
</script>
<style>
	 td {border: 1px solid white}
</style>
{#if pseudo.startsWith("Kikiadoc")}
	<div class="adminCadre">
		DeepAI admin
		<br/>
		<input type="text" placeholder="pseudo" bind:value={admPseudo}/>
		<input type="button" value="admDelete" on:click={()=> { apiCall("/deepAI/"+admPseudo,'DELETE')}} />
	</div>
{/if}
{#if epiqStep!=0}
	<input type=button value="Réafficher le lore" on:click={()=>{epiqStep=0}} />
{/if}


{#if epiqStep==9}
	<div>
		Voici l'état actuel des évaluations de DeepAI
		<br/> 
		{#if resultats}
			{#if resultats.nbPosts[pseudo] === undefined }
				<div style="color: lightgreen">Tu peux poster des screens sur Discord.</div>
			{:else if resultats.nbPosts[pseudo]<nbPostsMax}
				<div style="color: lightgreen">Tu peux encore poster {nbPostsMax-resultats.nbPosts[pseudo]} screens sur Discord.</div>
			{:else}
				<div style="color: red">Tu ne peux plus poster de screen sur Discord.</div>
			{/if}
			<table>
				<tr>
					<th></th>
					{#each resultats.catLst as cat,i}
						<td>{resultats.catLbl[cat]}</td>
					{/each}
				</tr>
				{#each resultats.tblPseudos as pseudo,i}
					<tr>
						<td class="papier">{pseudo}</td>
						{#each resultats.catLst as cat,j}
							{#if resultats.pseudos[pseudo][cat]}
								<td class={(resultats.pseudos[pseudo][cat].length>1)?"stars":"papier"}>
									{#each resultats.pseudos[pseudo][cat] as screen,k}
										<div>
											<a href="{screen.url}" target="_blank">
												{screen.score}
											</a>
										</div>
									{/each}
								</td>
							{:else}
								<td>???</td>
							{/if}
						{/each}
				{/each}
				<tr>
					<td>Meilleur score:</td>
						{#each resultats.catLst as cat,i}
							<td>
								{(resultats.score[cat])? resultats.score[cat] : "Non disponible"}
								<div style="font-size: 0.6em">
									({resultats.catVal[cat]})
								</div>
							</td>
						{/each}
			</table>
		{:else}
			<div>Pas d'entretien réalisé</div>
		{/if}
	</div>
{/if}

{#if epiqStep==0}
	<div class="reveal">
		{pseudo},
		<br/>
		tu sais que mon équipe se compose d'assistantes et assistants en qui je dois avoir une totale confiance.
		<br/>
		Ainsi, même si mon assistant Discord peut être un peu bavard, il a toute ma confiance.
		<br/>
		C'est aussi le cas de la Grande Peluche Cuisinière, capable de faire des miracles culinaires
		tels que proposer un menu permettant à tous de replier l'espace.
		<br/>
		Le collège des Peluches Historiennes et Géographes a aussi démontré son Grand Savoir
		en aidant les Quatre à définir la Stratégie Finale et neutraliser la Grande Menace.
		<br/>
		Tous ces Hauts Faits ont motivé de nombreuses vocations chez les Peluches.
		<br/>
		<Epiq bind:step={epiqStep} oui=1 ouiVal="Envisages-tu de recruter?" />
	</div>
{/if}
{#if epiqStep==1}
	<div class="reveal">
		Oui {pseudo}, mais j'ai quelques doutes sur les compétences des candidats, en particulier ceux
		indiquant disposer d'une Intelligence Artificielle.
		<br/>
		Pourtant, quelle Peluche n'a pas révé d'être assistée dans ses tâches 
		par une Intelligence Articielle	pertinente ?
		<br/>
		Ainsi, j'ai reçu les peluches
		<a href="https://chat.openai.com/" target="_blank">chatGPT</a>,
		<a href="https://bard.google.com/chat" target="_blank">Google Bard</a> et
		<a href="https://deepai.org/chat" target="_blank">DeepAI</a>
		car toutes se vantaient
		dans leur CV de pouvoir répondre à toutes mes questions concernant FF14...
		<br/>
		Elles se sont souvent montrées incohérentes dans leurs réponses, 
		j'ai même mis certaines d'entre elles dans mon
		<a href="https://docs.google.com/document/d/10nt-_jjk82ILducwYGxNFTL3YwqZTYuL3EDnSjV6GyY/edit?usp=sharing" alt="" target="_blank">
		bétisier.</a>
		<br/>
		Si vous souhaitez des tonnes de brèves de comptoirs, n'hésitez pas à engager
		une conversation, elles sont intarissables mais les sites et discords spécialisés sont bien plus intéressants
		si vous souhaitez des réponses exactes!
		<br/>
		NEXT! En fait je ne leur ai pas dit ça, je les ai poliment remerciées de leurs venues.
		<br/>
		Mais alors qu'elle allait sortir de mon bureau, DeepAI s'est retournée et m'a dit:
		<br/>
		<i>Grande Peluche Oracle des Savoirs du Bois Bandé, vous avez raison, le baratin sur FF14 n'est pas mon fort,
		ma vraie spécialité ce sont les screens.</i>
		<br/>
		<Epiq bind:step={epiqStep} oui=2 ouiVal="Les screens?"
			ouiMsg="Les explications de ce mini jeu sont très importantes, tu pourras toujours les réafficher en cliquant sur 'Réafficher le lore' sans perturber tes screens et les scores"
			/>
	</div>
{/if}
{#if epiqStep==2}
	<div class="reveal">
		Voyant mon air intéressé, elle a continué en me disant ceci:
		<br/>
		<i>Je suis capable de vérifier quasi instantanément
		si un lieu ressemble à un autre, peu importe qu'il pleuve ou qu'il vente, que ce soit la nuit ou le jour
		et celà grâce à mon Intelligence Artificielle.</i>
		<br/>
		Présenté comme cela, elle pourrait être une assistante de grande valeur, mais quand je lui ai demandé
		de comparer la maison de CL de Kikiadoc à une autre maison à colombage d'un autre secteur de Brumée,
		elle m'a dit <i>oui, ca ressemble beaucoup</i>...
		<br/>
		Ca, tout le monde pourrait le dire, mais, au moins, ce n'était pas une connerie!
		<br/>
		Bref, elle semble avoir certaines compétences, mais je n'ai pas le temps de poursuivre son entretien.
		<br/>
		<Epiq bind:step={epiqStep} oui=3 ouiVal="Souhaites-tu que je teste ses compétences?" />
	</div>
{/if}
{#if epiqStep==3}
	<div class="reveal">
		Ô {pseudo}, tu sais combien j'apprécie ton aide.
		<br/>
		Pour évaluer les compétences de DeepAI, j'aurai besoin que tu fasses des screens en /gpose.
		Tu pourras faire 2 screens dans chacune des 3 catégories.
		<br/>
		Les trois catégories sont : La maison de cl de Kikiadoc, la maison personnelle de Kikiadoc, et une autre
		que j'aime appeler le screen pourri de la maison de cl de Kikiadoc.
		<br/>
		Le principe est que pour chacun de tes screens, DeepAI fasse une évaluation de la "ressemblance"
		entre ton screen et le screen de référence de mon grimoire.
		<br/>
		Les screens doivent être fait en "/gpose". Aucune option de gpose ne doit être utilisée sauf:
		Le zoom (à sélectionner), la luminosité (uniquement si besoin, normalement pas utile),
		la profondeur de champ (à mettre au maximum pour éviter les flous),
		et la suppression des personnages, comme ci-dessous:
		<br/>
		<img src="https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/deepAI/gpose.png" alt="" style="width:95%" />
		<br/>
		Je vais maintenant te décrire plus précisement les screens à réaliser
		<br/>
		<Epiq bind:step={epiqStep} oui=4 ouiVal="Oui, montre-moi la maison de CL" />
	</div>
{/if}
{#if epiqStep==4}
	<div class="reveal">
		Le premier est un screen de la maison de cl de Kikiadoc (Moogle, Brumée, secteur 19, slot 5).
		<br />
		Pour ce screen, il faut reproduire, aussi fidèlement que possible,
		le screen de référence ci-dessous, même angle, même zoom...
		Il a été pris en début de matinée par temps clair/dégagé.
		<br/>
		DeepAI sera alors consultée afin d'obtenir un score de similitude.
		<br/>
		Plus <u>ton score est proche de zéro</u>, plus ton image est "similaire" et c'est l'objectif
		<br/>
		<img src="https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/deepAI/ref-cl.png" alt="" style="width:95%" />
		<br/>
		<Epiq bind:step={epiqStep} oui=5 ouiVal="Et la maison personnelle?" />
	</div>
{/if}
{#if epiqStep==5}
	<div class="reveal">
		Le deuxième est un screen de la maison personnelle de Kikiadoc (Moogle, Shirogane, secteur 22, slot 46)
		<br />
		Pour ce screen, il faut reproduire, aussi fidèlement que possible,
		le screen de référence ci-dessous, même angle, même zoom...
		Il a été pris en milieu de matinée par temps clair/dégagé.
		<br/>
		DeepAI sera alors consultée afin d'obtenir un score de similitude.
		<br/>
		Plus <u>ton score est proche de zéro</u>, plus ton image est "similaire" et c'est l'objectif
		<br/>
		<img src="https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/deepAI/ref-perso.png" alt="" style="width:95%" />
		<br/>
		<Epiq bind:step={epiqStep} oui=6 ouiVal="Et la troisième catégorie?" />
	</div>
{/if}
{#if epiqStep==6}
	<div class="reveal">
		Le troisième screen est différent: C'est le screen Pourri! Il ne s'agit pas de reproduire au mieux,
		mais au moins bien!
		Il faut qu'il soit le plus "différent" de la maison de cl de Kikiadoc, tout en étant un screen de
		la maison de cl de Kikiadoc!
		<br/>
		Pour cela, il faudra avoir toujours la maison de cl de Kikiadoc sur le screen et elle doit occuper
		au minimum 1/4 du screen environ.
		Tu peux choisir une autre position pour ton perso, un autre angle de vue, une autre heure,
		une autre météo, un autre zoom... (mais pas d'autre option de /gpose que les précédentes).
		<br/>
		DeepAI sera alors consultée afin d'obtenir un score de similitude.
		<br/>
		Mais pour cette catégorie, <u>plus ton score est important</u>, plus ton image est "différente".
		L'objectif est d'obtenir un <u>score le plus élevé possible</u> dans cette catégorie (le screen le + différent)
		<br/>
		<u>A titre d'exemple<u>, voici un screen pourri:
		<br/>
		<img src="https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/deepAI/ref-autre.png" alt="" style="width:95%" />
		<br/>
		<Epiq bind:step={epiqStep} oui=7 ouiVal="Et que dois-je faire des screens?" />
	</div>
{/if}
{#if epiqStep==7}
	<div class="reveal">
		Je te l'ai déjà dit, je n'ai pas le temps de m'occuper de tout cela,
		alors j'ai délégué à mon assistant Discord la suite de
		l'entretien d'embauche de DeepAI.
		<br/>
		Il attend tes screens dans le canal DeepAI du discord. Tu pourras indiquer 2 screens dans chaque catégorie.
		Tu as plusieurs jours pour poster tes screens, alors réfléchis bien avant de poster, en particulier ton
		second screen dans chacune des 3 catégories.
		<br/>
		Après avoir posté un screen, mon assistant Discord va te demander de le valider.
		<br/>
		ATTENTION, dès que tu auras validé un screen, c'est définitif, tu ne pourras pas le changer.
		En effet, DeepAI pourrait me faire un procès au tribunal des Prud'Peluches pour travail dissimulé à l'embauche
		si je la sollicite trop.
		<div style="font-size: 0.8em; font-style: italic;">
			NDLR: Une autre raison bassement matérielle est que chaque appel à 
			DeepAI est payant. Il ne me reste qu'un crédit pour environ 80 analyses d'images,
			et je ne souhaite pas remettre des euros dans le nourrain de DeepAI pour l'instant.
			<br/>
			De façon générale, pour utiliser les services d'AI depuis des programmes (via des API),
			tu n'es plus dans le scope de tests gratuits et donc tu dois payer.
			<br/>
		</div>
		<Epiq bind:step={epiqStep} bind:page={page} oui=8 ouiVal="J'ai tout compris" non=3 nonVal="Redis moi" />
	</div>
{/if}
{#if epiqStep==8}
	<div class="reveal">
		Quelques dernières infos à ne pas négliger!
		<br/>
		Tu peux consulter les résultats des entretiens à tout moment tout en continuant tes screens.
		<br/>
		N'oublie pas que tu peux réafficher mes instructions en cliquant sur "réafficher le lore"
		en haut de l'écran juste en dessous du bandeau.
		<br/>
		<u>Un dernier mot sur les gains:</u>
		<br/>
		10 Millions de gils seront répartis entre les participants au prorata du nombre de
		screens postés (6 screens: coef 6, 1 screen: coef 1)
		<br/>
		Le gagnant de chaque catégorie recevra un bonus de 2M de gils.
		<br/>
		<i><u>NB: La fonction d'interface avec les fonctions d'intelligence artificielle de DeepAI est expérimentale...</u></i>
		<br/>
		Dans le cas où DeepAI est très perturbée par vos screens et retourne des résultats peu pertinents,
		n'oublie pas que c'est un entretien d'embauche!
		Il te faudra alors considérer que ce mini-jeu est une loterie et que DeepAI est un peu conne!
		<br/>
		<Epiq bind:step={epiqStep} bind:page={page} oui=9 ouiVal="Voir les résultats des entretiens" />
		<br/>
		<u>PS: Petit rappel</u>
		<br/>
		1) Se positionner, cadrer et zoomer comme demandé selon chaque screen (ou le contraire pour le troisième)
		<br/>
		2) Poster avec une bonne résolution de screen sans dépasser 1920x1200
		<br/>
		3) Toujours effacer du /gpose les personnages
		<br />
		4) Ne pas tricher en publiant une copie d'un screen de référence, car dans ce cas, le score
		sera de 0 indiquant une image strictement identique (et le screen ne sera pas valide)
		<br/>
		<Epiq bind:step={epiqStep} bind:page={page} oui=9 ouiVal="Voir les résultats des entretiens" />
	</div>
{/if}


<!-- P206.svelte -->

