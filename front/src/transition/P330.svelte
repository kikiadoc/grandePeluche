<script>
	import { onMount, onDestroy  } from 'svelte';
	import { loadIt, storeIt, newInfoPopup, apiCall, addNotification, urlImg, urlCdn  } from './storage.js'
	import { playSound, playVideo, jjmmhhmmss, scrollTop, clickSur } from './storage.js'
	import Epiq from './z/Epiq.svelte'
	import Btn from './z/Btn.svelte'
	import Cupload from './Cupload.svelte'

	export let wsCallComponents; 
	export let pseudo; 
	export let page;
	export let pageDone = [];
	export let pageDesc = null
	export let audioBack
	export let audioAmbiance
	export let audioVolume

	const LBL_NOVICIAT = "l'Hégémonie" // usage en texte
	const TEC_NOVICIAT = "hegemonieInitiatique" // usage en code pour haut fait
	const DIS_NOVICIAT = "hegemonie" // usage en code pour discord
	const WS_NOVICIAT = "hf_"+TEC_NOVICIAT
	const MAXNOVICES = 20
	const pageEpiqLbl= "P"+pageDesc.n+"_epiqStep"
	const pageIpLbl= "P"+pageDesc.n+"_ip"
	
	onMount(() => { if (wsCallComponents) wsCallComponents.add(myWsCallback); init() });
	onDestroy(() => { if (wsCallComponents) wsCallComponents.delete(myWsCallback) });

	async function myWsCallback(m) {
		if (m.op=="notif" && m.fromPseudo==pseudo && epiqStep==30) {
			epiqStep=35;
			newInfoPopup("Voila !","tu sais maintenant envoyer un message aux autres joueurs connectés");
			scrollTop()
		}
		else
		if (m.op==WS_NOVICIAT) {
			getNovices(m);
		}
	}

	// Gestion de l'épique
	let epiqStep = loadIt(pageEpiqLbl, 0);
	$: storeIt(pageEpiqLbl,epiqStep);

	// init...
	let myConf = {}
	async function init() {
		let ret = await apiCall("/clientConfig")		
		if (ret.status==200) myConf = ret.o
		getNovices();
	}
	
	// données saisies
	let saisies = {}

	// gestion des novices
	let novices = { pseudos: {} };
	let dspNoviciat = false;
	async function getNovices(msgWs) {
		let ret = msgWs || await apiCall('/hautsFaits/'+TEC_NOVICIAT);
		if (ret.status == 200) novices = ret.o;
		novices.nb = Object.keys(novices.pseudos).length
	}
	async function addNovice() {
		const hfLvl = (novices && novices.nb < MAXNOVICES)? 0:1
		let ret
		ret = await apiCall('/discord/reqGrant/'+DIS_NOVICIAT,'PUT')
		ret = await apiCall('/hautsFaits/'+TEC_NOVICIAT+'/'+hfLvl,'PUT')
		if (ret.status==200) addNotification("Tu es déjà un novice de "+LBL_NOVICIAT,"lightgreen",10)
		if (ret.status==201 && hfLvl>=1) newInfoPopup("Attention","Je t'ai inscrit dans la liste d'attente car le quota de participants est atteint","Contacte Kikiadoc sur Discord")
		return true
	}

	// boutons d'assistance pour le reglage audio
	async function audioRien() {
		audioAmbiance = true;
		audioBack=false
		audioVolume=50
		playSound("LOTR-connaissances",true)
		newInfoPopup("Aucun son n'est audible",
								[
									"J'ai réinitialisé le volume d'AudioBlaster à 50% et relancé la bande sonore depuis le début",
									"Si tu n'entends toujours rien, vérifie que le son du navigateur est activé au niveau du mixer global de ton appareil",
									"Sur Windows, vérifie aussi que tu n'as pas 'mute' l'onglet du site et que le son de ton navigateur est autorisé",
									"Sur Smartphone, vérifie aussi que tu n'as pas désactivé l'autorisation de son du site",
									"Si tu n'entends toujours rien, contacte Kikiadoc sur Discord"
								])
		
	}
	async function audioFaible() {
		audioAmbiance = true;
		audioBack=false
		playSound("LOTR-connaissances",true)
		newInfoPopup("Le volume est trop faible",
								[
									"Clique sur ton pseudo en haut de ton écran et augmente le volume d'AudioBlaster",
									"Si, même à 100%, c'est toujours trop faible, augmente le volume du navigateur dans le mixer global de ton appareil",
									"Si tu as encore un soucis, contacte Kikiadoc sur Discord"
								])
	}
	async function audioFort() {
		audioAmbiance = true;
		audioBack=false
		playSound("LOTR-connaissances",true)
		newInfoPopup("Le volume est trop fort",
								[
									"Clique sur ton pseudo en haut de ton écran et baisse le volume d'AudioBlaster jusque 10%",
									"Si tu entends trop fort, même à 10%, baisse le volume du navigateur dans le mixer global de ton appareil",
									"Si tu as encore un soucis, contacte Kikiadoc sur Discord"
								])
	}

	// Saisie de l'adresse ip via la page d'assistance
	let ipSaisie = loadIt(pageIpLbl,null); // saisie de l'ip'
	$: storeIt(pageIpLbl,ipSaisie);
	async function ipCheck() {
		if (myConf.ip == ipSaisie) {
			epiqStep = 40
			scrollTop()
		}
		else
			newInfoPopup("Mauvaise réponse",
									[
										"Ton adresse IP est "+myConf.ip,
										"C'est ce qui est normalement indiqué dans la page d'assistance",
										"Tape exactement ton adresse: Quatres nombres séparés par un point (.), pas de blanc au début ou a la fin"+
										" et pas de fioritures, l'assistance de saisie sur smartphone peut être une source de problème"
									])
	}
</script>

<style>
	
</style>
{#if pseudo.startsWith('Kikiadoc')}
	<div class="adminCadre">
		Admin: 
		<input type="button" value="resetNoviciat" on:click={()=>apiCall('/hautsFaits/'+TEC_NOVICIAT,'DELETE')} />
		<input type="button" value="ReEnd" on:click={()=>{epiqStep=90}} />
	</div>
{/if}


<input type="button" value="Revoir le Lore" on:click={() => epiqStep=0} />
<input type="button" value="Voir le noviciat" on:click={() => dspNoviciat=true} />

{#if epiqStep==0}
	<div class="reveal">
		<img src={urlImg+"gamemaster.jpg"} style="width:20%; float:right" alt="" />
		Bienvenue {pseudo} dans <b>{LBL_NOVICIAT}</b>, le Kiki's Event IX.
		{#if novices.nb >= MAXNOVICES && !novices.pseudos[pseudo]}
			<div class="adminCadre">
				<div style="color:red">Les inscriptions automatiques sont closes, car le quota de participants est atteint.</div>
				<div class="blinkMsg">Si tu souhaites participer car tu es motivé, termine ce challenge puis contacte Kikiadoc sur Discord.</div>
				<i>Pour voir la liste des inscrits, clique sur le bouton "voir le noviciat" en haut de la page.</i>
			</div>
		{/if}
		<div class="br"/>
		Comme lors du précédent événement, 
		Kikiadoc m'a confié la lourde mission d'être ton Game Master Numérique.
		<div class="br"/>
		<u>Lit attentivement mes instructions</u>
		<br/>
		Les quelques minutes nécessaires à terminer cette quête Initiatique pourront te
		paraître longues, voire pénibles mais c'est le moyen pour que tu participes aux futurs challenges
		dans les meilleures conditions.
		Tu découvriras aussi le début de la trame épique de l'événement.
		<div class="br"/>
		Lorsque, comme maintenant, je t'indique des éléménts du Lore,
		tu auras souvent des boutons à la fin de mes explications.
		Il te faudra choisir l'une des options proposées.
		<br/>
		Ici, il n'y en a qu'une: J'ai compris. Clique dessus!
		<br/>
		<Btn bind:refStep={epiqStep} step=5 val="J'ai compris" />
		<div style="clear:both" class="br"/>
	</div>
{/if}

{#if epiqStep==5}
	<div class="reveal">
		<img src={urlImg+"gamemaster.jpg"} style="width:20%; float:right" alt="" />
		En cas de soucis, d'incompréhension ou d'une simple hésitation,
		c'est MP @Kikiadoc sur Discord ou via le canal #discussions.
		Il ne supporterai pas que tu sois bloqué, ennuyé ou frustré!
		<br/>
		Il n'y a pas de mauvaises questions:
		Si Kikiadoc considère la réponse à ta question comme un "spoiler", il te dira que c'est un "spoiler" 😜
		<br/>
			Et si tu découvres un bug notable, il y a même un
			<a href="https://fr.wikipedia.org/wiki/Prime_aux_bogues" target="_blank">
				bug bounty
			</a>
			avec des gils en récompense!
		<br/>
		<Btn bind:refStep={epiqStep} step=10 val="C'est cool" />
		<div style="clear:both" class="br"/>
	</div>
{/if}
	
{#if epiqStep==10}
	<div class="reveal">
		<img src={urlImg+"audio.jpg"} style="width:20%; float:right" alt="" />
		Tu as probablement déjà entendu mon Assistant AudioBlaster.
		Il gère la musique d'ambiance, les notifications sonores, la synthèse vocale et les vidéos(*).
		<div class="br"/>
		Je vais t'aider à bien le paramétrer.
		<div class="br"/>
		A tout moment, en <u>cliquant sur 🔊 ou 🔇, en haut à droite de ton écran</u>,
		tu peux activer ou désactiver l'ambiance sonore
		tout en laissant les autres flux actifs (notifs, vidéos...)
		car ils peuvent être sources d'informations importantes.
		<div class="br"/>
		Pour les autres paramètres d'AudioBlaster, clique sur ton pseudo en haut à droite de ton écran.
		<div class="br"/>
		{#if audioAmbiance}
			Ton volume actuel de mixage audio est {audioVolume}%.
			{#if audioVolume < 10 }
				<span class="blinkMsg">Conseil: Augmente le volume</span>
			{/if}
			{#if audioVolume > 80 }
				<span class="blinkMsg">Conseil: Baisse le volume</span>
			{/if}
			<br/>
			{#if audioBack}
				Attention, l'ambiance sonore continuera même si ta fenêtre n'est plus visible
				<span class="blinkMsg">(ce n'est pas conseillé)</span>
			{:else}
				Audioblaster coupera la musique d'ambiance automatiquement s'il détecte que ton navigateur est masqué,
				mais ça fonctionne pas dans tous les cas (**).
			{/if}
		{:else}
			<span style="color:red" class="blinkMsg">Active l'ambiance sonore en cliquant sur 🔇 afin de parametrer AudioBlaster</span>.
		{/if}
		<div class="br"/>
		{#if audioAmbiance}
			<div>Comment est l'audio du site actuellement?</div>
			<div>
				<input type="button" on:click={audioRien} value="Je n'entend rien" />
				<input type="button" on:click={audioFaible} value="Le som est trop faible" />
				<input type="button" on:click={audioFort} value="Le som est trop fort" />
				<Btn bind:refStep={epiqStep} step=20 val="C'est parfait" 
						msg="N'oublie pas que tu peux toujours activer/désactiver l'ambiance sonore avec les boutons 🔊 ou 🔇"	/>
			</div>
			<div class="br"/>
		{/if}
		<div style="font-size:0.7em">
			(*) Lors de l'affichage de vidéos, tu gardes la possibilité de te positionner, de faire pause,
			ou d'en modifier le volume. Toutefois, ces modifications ne s'appliquent qu'à la vidéo en cours.
			<br/>
			(**) Il y a des cas où Audioblaster ne coupe pas automatiquement l'audio si tu bascules vers le jeu
			(plusieurs écrans sur PC ou si tu laisses apparente la page sur smartphone).
			<a href="https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API" alt="" target="_blank">
				Le standard "Page visibility API" ne permet pas de détecter la perte de "focus".
			</a>
			Dans ce cas, minimise ton navigateur sur Windows, repasse sur la page d'accueil de ton Smartphone.
			Tu peux toujours désactiver manuellement la musique d'ambiance par 🔇 (tu devras alors la réactiver manuellement)
		</div>
		<div style="clear:both" class="br"/>
	</div>
{/if}

{#if epiqStep==20}
	<div class="reveal">
		<img src={urlImg+"lore.jpg"} style="width:20%; float:right" alt="" />
		N'hésite pas à cliquer sur les liens marqués d'une
		<a href="https://fr.wikipedia.org/wiki/Hyperlien" target="_blank">loupe</a>
		ou d'un TODO: MODIFIER LA VIDEO
		<span class="videoLink" on:click={()=>playVideo('ff-7-teaser0c')} role=button tabindex=0 on:keypress={null}>
			projecteur
		</span>
		à tout moment: 
		Peluche célèbre IG ou IRL, Endroit épique, Fait notable ou explication technique approfondie,
		suivre un lien est toujours une surprise!
		<div class="br"/>
		A tout moment, tu peux cliquer sur "Revoir le lore" en haut de page.
		Et même si, par exemple, tu fermes involontairement ton navigateur au milieu d'un challenge,
		tu ne perdras aucune donnée saisie ou Haut Fait réalisé.
		<div class="br"/>
		Attention toutefois à ne pas purger les "données de site" de ton navigateur.
		Si tu fais cela, tu perdras ta clé privée(*), tes données saisies et tu ne pourras pas te reconnecter.
		Il faudra alors contacter Kikiadoc sur Discord.
		<br/>
		<Btn bind:refStep={epiqStep} step=30 val="J'ai compris" />
		<div style="font-size:0.8em">
			(*) La clé privée est utilisée pour signer tes requetes vers le serveur.
			C'est une sorte de générateur de mots de passe automatiques et éphémères,
			c'est bien plus sécurisé que l'usage d'un mot de passe classique.
			Elle est obligatoire pour que le serveur t'authentifie
		</div>
		<div style="clear:both" class="br"/>
	</div>
{/if}
	
{#if epiqStep==30}
	<div class="reveal">
		<img src={urlImg+"multijoueurs.jpg"} style="width:30%; float:right" alt="" />
		Dans le bandeau supérieur, <u>ton pseudo et l'indicateur "multijoueurs" doivent toujours être verts</u>.
		Cela indique que tu es bien connecté à mes assistants LogicServer et SyncServer.
		Tu peux alors participer aux challenges, qu'ils soient en solo, en compétition ou en coopération temps réel.
		<div class="br" />
		Prendre le temps de lire le texte du Lore, regarder les vidéos en intégralité,
		et même les vidéos qui peuvent poper au milieu d'un challenge, 
		<u>celà n'impacte jamais tes résultats</u>, et est parfois une source d'info pour aller plus vite!
		<div class="br" />
		LogicServer et SyncServer permettent aussi des fonctions comme la communication entre les connectés!
		<u>En cliquant sur "multijoueurs" tu peux envoyer un message aux autres connectés.</u>
		<br />
		<Btn val="Je n'ai pas encore envoyé de messages" 
			msg="Alors clique sur multijoueurs dans le bandeau en haut du site" />
		<Btn bind:refStep={epiqStep} step=35 val="Je sais comment envoyer des messages" />
		<div style="clear:both" class="br"/>
	</div>
{/if}

{#if epiqStep==35}
	<div class="reveal">
		<img src={urlImg+"ff-7/checksec.png"} style="width:30%; float:right" alt="" />
		SyncServer, LogicServer, Hildiscord, AudioBlaster...
		<div class="br" />
		Il me reste à te présenter CheckSec, mon Tank Gardien. 
		Il nous protège des incessantes agressions liées à la cybersécurité.
		J'espère que tu n'attireras jamais son regard. Quand il enrage, il est pire que l'œuil de Sauron.
		<div class="br" />
		Si le site ne répond pas alors que d'autres sites
		répondent correctement, c'est probablement que tu as attiré sur toi l'œuil de CheckSec
		et qu'il t'a bloqué.
		<div class="br" />
		Si tel est le cas, c'est probablement parce que:
		<br/>
		➤ Ton IP est "proche" d'une IP malveillante
		<br/>
		➤ Tu n'as pas respecté la navigation prévue sur le site (même involontairement)
		<div class="br" />
		CheckSec vérifie aussi en temps réel le nombre de connexions actives vers le site.
		Si vous êtes plusieurs à partager ta connexion Internet, indique le à Kikiadoc.
		Normalement à 2, ca doit passer, mais à 3 ça bloque et tu risques le ban automatique.
		<div class="br" />
		En cas de soucis technique, Kikiadoc te demandera de consulter la
		<a href="https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/securite/index.html" target="_blank">
			page d'assistance
		</a>
		<div class="br" />
		Jettes-y un
		<a href="https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/securite/index.html" target="_blank">
			coup d'oeil dés maintenant
		</a>
		, celà t'aidera en cas de soucis ultérieurs !
		<div class="br" />
		<Btn bind:refStep={epiqStep} step=40 val="J'ai regardé la page d'assistance" />
		<div class="br" />
		PS: Si le développement d'un site comme la Grande Peluche t'intéresse, consulte le document
		<a href="{urlCdn}Architecture et conception du site ff14.adhoc.click.pdf" target="_blank">
			Architecture, conception, et code source
		</a>
		<div style="clear:both" class="br"/>
	</div>
{/if}

{#if epiqStep==40}
	<div class="reveal">
		<img src={urlImg+"hof-lalalex.png"} style="width:30%; float:right" alt="" />
		Maintenant, passons aux choses sérieuses!
		<p>
			Lors du Kiki's Event VIII, les 
			<span class="videoLink" on:click={()=>playVideo('ff-6-trailer')} on:keypress={null} role="button" tabindex=0>
				Aventuriers de l'Uchronie
				ont restauré l'Histoire
			</span>.
		</p>
		<p>
			Un peu après, les Aventuriers ont résolu l'énigme du damier à ruban du Premier Age
			et ont permis d'identificer 
			<span class="videoLink" on:click={()=>playVideo('ff14-innommable-trailer')} on:keypress={null} role="button" tabindex=0>
				Méphitophélès
			</span>
			comme le véritable maître de la Magie.
			C'est lui qui avait tenté de reprendre le contrôle d'Eorzéa en utilisant l'Uchronie.
		</p>
		Te souviens-tu de tout celà?
		<div class="br"/>
		<Btn val="Non, je n'y ai pas participé"
			msg="Alors clique sur les liens videos de cette page pour voir ce que tu as manqué" />
		<Btn bind:refStep={epiqStep} step=50 val="Oui. J'y étais"
			msg="Si tu souhaites revoir les vidéos de ces aventures plus tard, tu pourras te rendre à l'IPA, l'Institut Peluchique de l'Audiovisuel (dans la liste de tes Possibles)"/>
		<Btn bind:refStep={epiqStep} step=50 val="Je viens de regarder les vidéos"
			msg="Si tu souhaites revoir les vidéos de ces aventures plus tard, tu pourras te rendre à l'IPA, l'Institut Peluchique de l'Audiovisuel (dans la liste de tes Possibles)"/>
		<div style="clear:both" class="br"/>
	</div>
{/if}
{#if epiqStep==50}
	<div class="reveal">
		<img src={urlImg+"hof-lalalex.png"} style="width:30%; float:right" alt="" />
		Depuis quelques temps, je suis très inquiète car 
		j'ai découvert de nouveaux chapîtres dans le Grimoire de la Magie.
		Ils mentionnent {LBL_NOVICIAT}, mais je n'en comprend pas de nombreux passages.
		<p>
			Et surtout, je ne comprend pas pourquoi de nombreuses Peluches semblent avoir perdu leurs âmes.
			Elles semblent encore en vie, capable de se nourrir et de travailler, mais leurs âmes semblent totalement possédées.
		</p>
		<p>
			J'ai pu établir une communication avec les Quatre qui explorent toujours l'Ortho-Temps.
			Ils m'ont affirmé que les	5 dimensions de l'Univers Connu ne sont pas corrompues.
		</p>
		<Btn bind:refStep={epiqStep} step=70 val="C'est inquiétant" />
		<div style="clear:both" class="br"/>
	</div>
{/if}

{#if epiqStep==70}
	<div class="reveal">
		<img src={urlImg+"deepAI/ref-cl.png"} style="width:30%; float:right" alt="" />
		Oui, c'est même très inquiétant.
		<div class="br" />
		Il me reste à vérifier avec toi quelques points.
		Le premier est que tu peux facilement te TP vers les maisons de Kikiadoc.
		<div class="br"/>
		Si tu n'es pas encore ami IG avec Kikiadoc Lepetiot @ Moogle,
		envoie lui une demande d'ami pour avoir les TP directs vers ses maisons.
		S'il n'est pas connecté sur le jeu, tu peux le mp @Kikiadoc sur discord!
		<div class="br"/>
		Fais maintenant un TP vers la maison de CL de Kikiadoc
		(Moogle, Brumée, secteur 19, slot 5). 
		Si ton perso n'est pas sur Moogle, tu peux utiliser
		l'éthérite d'une capitale pour changer de monde.
		<a href="https://fr.finalfantasyxiv.com/lodestone/playguide/contentsguide/worldvisit/" alt="" target="_blank">
			(Tutorial)
		</a>
		<br/>
		<u>Ces TPs coutent quelques Gils, mais pas d'Euros! N'utilise pas les options payantes de transfert de monde</u>
		<div class="br"/>
		Quand tu es devant la maison de CL de Kikiadoc, va dans le jardin et dirige toi vers le servant Kikiadoc Lebogosse
		<br/>
		<Btn bind:refStep={epiqStep} step=80 val="Je suis dans le jardin" />
		<div style="clear:both" class="br"/>
	</div>
{/if}

{#if epiqStep==80}
	<div class="reveal">
		<img src={urlImg+"boussole.png"} style="width:50%; float:right" alt="" />
		Maintenant que tu es dans le jardin de la maison de CL de Kikiadoc,
		tu es à proximité du servant Kikiadoc Lebogosse. (voir l'image ci-contre)
		<br/>
		A plusieurs occasions lors de futurs challenges, tu devras indiquer
		les coordonnées indiquées par ta boussole IG et/ou m'envoyer un screen.
		<div class="br"/>
		Positionne-toi où se trouve le servant Kikiadoc Lebogosse
		dans le jardin de telle sorte que ta boussole indique X: 8.6 et Y: 11.7.
		<div class="br"/>
		Indique-moi alors les coordonnées et dépose un screen où les noms des servants ou pnjs sont lisibles.
		<div style="font-size: 0.8em;  font-style: italic;">
			Si cet entrainement avec la boussole et un screen te paraît pénible, voir en fin de la page.
			<br/>
			Sur Smartphone, tu peux faire un photo de ton écran mais attention
			à la netteté de ta photo.
			<br/>
		</div>
		<table width="95%"><tr>
			<td style="vertical-align: top; text-align: right; width: 50%">
				X:<input type="number" placeholder="*8.6*" size=6 step="0.1" bind:value={saisies.X} />
				<br/>
				Y:<input type="number" placeholder="*11.7*" size=6 step="0.1" bind:value={saisies.Y} />
				<br/>
				{#if saisies.X!='8.6' || saisies.Y!='11.7'}
					Coordonnées invalides
				{:else if !saisies.imageDataRaw}
					Screen non défini
				{:else}
					<Btn bind:refStep={epiqStep} step=90 val="C'est OK ➤" />
				{/if}
				<br/>
			</td>
			<td style="vertical-align: top; width: 50%">
				<Cupload cbImageRaw={(raw)=>saisies.imageDataRaw=raw} />
			</td>
		</tr></table>
		<div style="clear:both" class="br"/>
		<div style="font-size: 0.8em;  font-style: italic;">
			Ce test permet de vérifier que des "assistants à la saisie"
			ne viennent pas perturber ta saisie de valeurs numériques ou un upload.
			<br/>
			Tant que tu n'as pas validé, tu peux tester différentes méthode pour faire un
			screen (Ex: appareil photo sur smartphone, drap/drop sur windows...)
			<br/>
			Enfin, Kikidoc n'a pas trouvé d'IA suffisamment fiable pour faire de la
			comparaison automatique d'images issues du jeu. Il pourra manuellement
			invalider un screen trop éloigné de la solution.
			<br/>
			N.B: Dans cette Initiatique ton screen ne sera pas réellement uploadé sur le serveur.
			N'en profite pas pour mettre une
			<span class="videoLink" on:click={()=>playVideo('ff-7/photocopie-fesses')} role=button tabindex=0 on:keypress={null}>
				photocopie de tes fesses!
			</span>
		</div>
	</div>
{/if}

{#if epiqStep==90}
	<div class="reveal">
		Ton initiation touche à sa fin.
		<br/>
		Entre dans la maison de CL de Kikiadoc et consulte le message du propriétaire sur le livre de correspondance.
		Suis alors les consignes.
		<div class="br"/>
		<Btn val="Explique moi pour le livre de correspondance"
			msg="Le livre se trouve dans la maison, près de l'entrée et à gauche en entrant, sur une demi-cloison. Clic sur l'icon 🠟 au dessus du livre. Lis alors le message du propriétaire et laisse un message selon la consigne en cliquant sur l'icon crayon 🖉" />
		<Btn bind:refStep={epiqStep} step=99 val="J'ai écrit le message demandé sur le livre" ifFct={()=>addNovice()} />
		<div style="clear:both" class="br"/>
	</div>
{/if}

{#if epiqStep==99}
	<div class="reveal">
		<img src={urlImg+"hautfait.png"} style="width:30%; float:right" alt="" />
		Bravo {pseudo}, tu as fini la quête initiatique de {LBL_NOVICIAT} et tu as déjà gagné
		1 million de gils sous reserve de ta participation aux challenges.
		<div class="br"/>
		<u>Je t'ai envoyé un MP sur Discord car tu as maintenant accès au canal Discord de cet événement.</u>
		<div class="br"/>
		En haut de page, tu auras souvent un bouton indiquant la progression
		actuelle des Aventuriers dans le challenge en cours. Ici, tu peux cliquer sur 'Voir le noviciat'
		<div class="br"/>
		Tu peux revenir à cette quête initiatique depuis ta Liste des Possibles
		en cliquant sur <i>{pageDesc.texte}</i> puis la rebalayer en cliquant sur "Revoir le Lore"
		<div class="br"/>
		<Btn bind:refPageDone={pageDone} pageDone={pageDesc.n} bind:refPage={page} page=0 val="Merci Grande Peluche"  />
		<div style="clear:both" class="br"/>
	</div>
{/if}

{#if dspNoviciat}
	<div class="popupCadre papier">
		<div class="close" on:click={()=>dspNoviciat=false} on:keypress={null} role="button" tabindex=0>X</div>
		<div class="popupZone">
			<div class="popupContent">
				<div>Novices de {LBL_NOVICIAT}:</div>
				{#each Object.keys(novices.pseudos) as p,i}
					{@const confirmer = (novices.pseudos[p].lvl)? "(à confirmer)":""}
					<div style="font-size:0.9em">{p}: {jjmmhhmmss(novices.pseudos[p].dth)} {confirmer}</div>
				{/each}
				<div>{novices.nb} participants</div>
			</div>
		</div>
	</div>
{/if}

<!-- P330.svelte -->

