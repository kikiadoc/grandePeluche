<script>
	import { onMount, onDestroy  } from 'svelte';
	import { loadIt, storeIt, newInfoPopup, apiCall, addNotification, urlImg  } from './storage.js';
	import Epiq from './Epiq.svelte';

	export let wsCallComponents; 
	export let pseudo; 
	export let page;
	export let pageDone = [];
	export let pageDesc = null

	const pageEpiqLbl= "P"+pageDesc.n+"_epiqStep"
	const pageRuneLbl= "P"+pageDesc.n+"_clefRunique"
	
	onMount(() => { if (wsCallComponents) wsCallComponents.add(myWsCallback); init() });
	onDestroy(() => { if (wsCallComponents) wsCallComponents.delete(myWsCallback) });

	async function myWsCallback(m) {
		if (m.op=="notif" && m.fromPseudo==pseudo && epiqStep==3) {
			epiqStep=4;
			newInfoPopup("Voila !","tu sais maintenant envoyer un message aux autres joueurs connectés");
		}
		else
		if (m.op=="hf_uchronieInitiatique") {
			console.log("wsnovices=",m.o)
			novices = m.o;
		}
	}

	// init...
	function init() {
		getNovices();
	}
	
	// Gestion de l'épique
	let epiqStep = loadIt(pageEpiqLbl, 0);
	$: storeIt(pageEpiqLbl,epiqStep);

	// gestion clef runique (le pseudo)
	let clefRunique = loadIt(pageRuneLbl,null); // saisie de la clef
	$: storeIt(pageRuneLbl,clefRunique);
	function checkClef() {
		if (clefRunique && pseudo && clefRunique.toLowerCase()==pseudo.toLowerCase()) {
			if (novices.nb >= maxNovices)
				newInfoPopup("Inscriptions closes",
										 [
											 "Désolé mais le nombre maximum de participants est dépassé",
											 "Tu ne peux pas progresser plus avant dans cette quête"
										 ],
										 "Tu peux regarder les événements précédents dans la liste des Possibles"
									)
			else
				epiqStep=6
		}
		else {
			newInfoPopup("Ce n'est pas la bonne clef runique","Tu devrais regarder à nouveau la vidéo")
		}
	}

	// gestion des novices
	const maxNovices = 20
	let novices = { pseudos: {} };
	let dspNoviciat = false;
	async function getNovices() {
		let ret = await apiCall('/hautsFaits/uchronieInitiatique');
		// if (ret.status == 200) console.log("novices=",ret.o)
		if (ret.status == 200) novices = ret.o;
		novices.nb = Object.keys(novices.pseudos).length
	}
	
</script>

<style>
	
</style>
{#if pseudo.startsWith('Kikiadoc')}
	<div class="adminCadre">
		Admin: 
		<input type="button" value="resetNoviciat" on:click={()=>apiCall("/hautsFaits/uchronieInitiatique",'DELETE')} />
	</div>
{/if}


<input type="button" value="Revoir le Lore" on:click={() => epiqStep=0} />
<input type="button" value="Voir le noviciat" on:click={() => dspNoviciat=true} />
{#if epiqStep==0}
	<div class="reveal">
		<img src={urlImg+"gamemaster.jpg"} style="width:20%; float:right" alt="" />
		Bienvenue {pseudo} dans l'<b>Uchronie</b>, le Kiki's Event VIII.
		{#if novices.nb > maxNovices}
			<div class="adminCadre">
				<div class="blinkMsg" style="color:red; font-size:1.2em">
					Les inscriptions sont closes, car le quota de participants est déjà dépassé.
				</div>
				<i>Pour voir la liste des inscrits ou vérifier que tu es déjà inscrit, clique sur le bouton "voir le noviciat".</i>
				<br/>
				Tu peux continuer un peu cette quête initiatique, mais ton inscription ne sera pas validée.
			</div>
		{/if}
		<div class="br"/>
		En plus d'être la Grande Peluche Oracle des Savoirs du Bois Bandé,
		Kikiadoc m'a confié une nouvelle mission!
		<div class="br"/>
		<u>Être ton Game Master Numérique</u>!
		<div class="br"/>
		Si la musique d'ambiance est actuellement trop forte à ton goût, tu peux la désactiver en cliquant
		sur 🔊 en haut à droite de ton écran, mais ne "mute" pas l'onglet de ton navigateur.
		Je t'expliquerai un peu plus tard comment gérer l'audio.
		<div class="br"/>
		Comme dit souvent Kikiadoc, l'important c'est que tu t'amuses, que tu aies du plaisir, 
		que tu ne sois pas bloqué ni ennuyé pour une quelconque raison et qu'il n'y ai jamais de perdant!
		Alors, en cas de soucis, de bug ou d'incompréhension,
		n'hésite pas à MP @Kikiadoc sur Discord ou d'utiliser le canal #discussions.
		Je crois même que Kikiadoc propose un
		<a href="https://fr.wikipedia.org/wiki/Prime_aux_bogues" target="_blank">
			bug bounty
		</a>
		avec des gils en récompense.
		<div class="br"/>
		Enfin, lorsque je t'indique des éléménts du lore, comme maintenant,
		tu auras souvent des boutons à la fin de mes explications.
		Il te faudra choisir l'une des options proposées.
		<br/>
		Ici, il n'y en a qu'une: J'ai compris. Clique dessus!
		<div class="br"/>
		<Epiq bind:step={epiqStep} 
			oui=1 ouiVal="J'ai compris" />
		<div style="clear:both" class="br"/>
	</div>
{/if}
	
{#if epiqStep==1}
	<div class="reveal">
		<img src={urlImg+"lore.jpg"} style="width:20%; float:right" alt="" />
		Tu peux réafficher
		le lore d'un challenge <u>à tout moment</u> en cliquant
		sur le bouton "Revoir le lore" (ou équivalent) juste en dessous du bandeau
		du site afin de te remémorer mes explications.
		<br/>
		Même au milieu d'un challenge,
		<u>tu ne perdras aucun Haut Fait d'Importance que tu auras déjà réalisé</u>. 
		<br/>
		Tu peux passer à la suite en cliquant 'J'ai compris' ci-dessous ou
		tester le rebalayage du lore avec le bouton 'Revoir le lore'.
		<div class="br"/>
		<Epiq bind:step={epiqStep} 
			oui=2 ouiVal="J'ai compris" />
		<div style="clear:both" class="br"/>
	</div>
{/if}
	
{#if epiqStep==2}
	<div class="reveal">
		<img src={urlImg+"audio.jpg"} style="width:20%; float:right" alt="" />
		Mon assistant AudioBlaster m'a indiqué que le bandeau de
		gestion de l'audio qui se trouvait en bas de ton écran provoquait anomalies et déviances:
		Il était inféodé à Firefox, Chrome et autres.
		<div class="br" />
		AudioBlaster m'a proposé alors une ergonomie grandement simplifiée:
		<div class="br" />
		En <u>cliquant sur 🔊 ou 🔇, en haut à droite de ton écran</u>,
		tu peux activer ou désactiver l'ambiance sonore
		tout en laissant les autres flux actifs(*) car ils peuvent être source d'une information importante.
		<br/>
		En <u>cliquant sur ton pseudo dans le bandeau du site</u>,
		tu peux indiquer à AudioBlaster le volume global que tu souhaites pour tous les flux audios.
		Il se chargera alors du mixage tout en respectant les paramètres du mixer de ton appareil.
		<br/>
		Si Audioblaster détecte que ta fenêtre n'est plus apparente,
		il coupera la musique d'ambiance, c'est la "pause automatique".
		<br/>
		Mais AudioBlaster ne peut pas tout(**) car Windows le laisse parfois dans l'ignorance.
		Aussi, pour désactiver l'audio si la pause automatique ne fonctionne pas pour toi,
		tu pourras toujours minimiser ton navigateur
		ou désactiver/réactiver l'ambiance par le bouton 🔊.
		<div class="br"/>
		<u>Dernier point et c'est important</u>: Si tu avais "mute" l'onglet de ton navigateur
		du fait du redémarrage de musiques non désirées, tu peux maintenant "demute" l'onglet afin de toujours
		profiter des notifications sonores même si tu as désactivé l'ambiance.
		<div class="br" />
		Voila, vérifie ou modifie tes paramètres audio du site
		et en cas de soucis avec les nouvelles capacités d'AudioBlaster
		tu peux MP @kikiadoc sur discord(***).
		<div class="br"/>
		<Epiq bind:step={epiqStep} 
			oui=3 ouiVal="J'ai paramétré mon audio" />
		<div style="font-size:0.7em">
			(*) AudioBlaster gère actuellement 4 flux audios: ambiances, notifications, synthèses vocales, vidéos.
			Lors de l'affichage de vidéos, tu gardes la possibilité de te positionner, de faire pause,
			ou d'en modifier le volume. Toutefois, ces modifications ne s'appliquent qu'à la vidéo en cours.
			<br/>
			(**)
			<a href="https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API" alt="" target="_blank">
				C'est une lacune du standard "Page visibility API".
			</a>
			<br/>
			(***)
			AudioBlaster a parfois quelques difficultés lors de synchro avec des vidéos, Kikiadoc en est torturé!
			Mais n'hésite pas à mp Kikiadoc sur discord.
		</div>
		<div style="clear:both" class="br"/>
	</div>
{/if}

{#if epiqStep==3}
	<div class="reveal">
		<img src={urlImg+"multijoueurs.jpg"} style="width:30%; float:right" alt="" />
		Dans le bandeau supérieur, <u>ton pseudo et l'indicateur "multijoueurs" doivent toujours être verts</u>.
		Cela indique que tu es bien connecté à mes assistants LogicServer et SyncServer
		<div class="br" />
		C'est grâce à eux deux que tu pourras progresser lors des challenges et
		être synchronisé en temps réel(*) avec ce que font les autres joueurs lors des compétitions ou des coopérations.
		Mais ils permettent aussi la communication entre les connectés!
		<div class="br" />
		<u>Envoie maintenant un message aux autres connectés en cliquant sur "multijoueurs"</u>.
		Cela pourrait bien t'aider lors de futurs challenges.
		Quand tu l'auras envoyé tu passeras à la suite de cette quête initiatique. 
		<div class="br"/>
		<Epiq bind:step={epiqStep} 
			oui=3 ouiVal="Je n'ai pas encore envoyé de messages" ouiMsg="Alors clique sur multijoueurs"
			non=4 nonVal="Je sais déjà comment envoyer des messages"
			/>
		<div style="font-size:0.7em">(*) Pour les tekos IT: 
			<a href="https://docs.google.com/presentation/d/1J0lS2HCwqHOObIsbB2IgGe4ODiviIvyo3_5dYZ4Gpy8/edit?usp=sharing" target="_blank">
				Architecture
			</a>,
			envie de voir les sources du site? mp @kikiadoc car spoilers!
		</div>
		<div style="clear:both" class="br"/>
	</div>
{/if}

{#if epiqStep==4}
	<div class="reveal">
		<img src={urlImg+"hof-lalalex.png"} style="width:30%; float:right" alt="" />
		Maintenant, passons aux choses sérieuses!
		<div class="br"/>
		A la fin du Kiki's Event VII, les Maîtres Jedi des Savoirs ont permis aux Quatre
		d'explorer l'Ortho-Temps.
		<div class="br"/>
		Un peu après, avec l'aide de quelques Aventuriers,
		j'ai pu établir une communication avec les Quatre,
		puis récupérer le Grand Grimoire de la Magie en Camelot.
		C'est en commencant son analyse que 
		j'ai compris que les Jardins Suspendus existaient dans le temps présent
		alors même que le Grand Grimoire des Savoirs indiquait
		qu'ils avaient disparus il y a bien longtemps.
		<div class="br"/>
		Je pense que c'est le premier symptôme identifié de l'Uchronie de l'Univers Connu. 		
		<br/>
		Te souviens-tu de ces Aventures?
		<div class="br"/>
		<Epiq bind:step={epiqStep} 
			oui=5 ouiVal="Non, je n'y ai pas participé" ouiVideo="ff14-avant-uchronie" ouiMsg="Voila ce que tu as manqué"
			non=5 nonVal="Oui, un peu, j'y étais" nonVideo="ff14-avant-uchronie" nonMsg="Souviens-toi"
			rst=5 rstVal="Oui, clairement" rstMsg="Si tu souhaites revoir la vidéo de ces aventures plus tard, tu pourras réafficher le lore" />
		<div style="clear:both" class="br"/>
	</div>
{/if}

{#if epiqStep==5}
	<div class="reveal">
		<img src={urlImg+"typewriter.jpeg"} style="width:30%; float:right" alt="" />
		Je me dois maintenant de vérifier que tu es vraiment motivé pour participer à ce nouvel événement.
		<br/>
		Pour cela, tu dois m'indiquer la clef runique qui te permettra de participer.
		Je te l'ai indiqué dans le dernier teaser vidéo.
		<div class="br" />
		{#if pageDesc.betaActive}
			<span style="color:red">tu es en avant-première, utilise l'option du boulet ;)</span>
			<div class="br" /> 
		{/if}
		Si tu l'as oubliée, tu peux utiliser l'option du boulet en dessous😉
		<br/>
		Indique ta clef runique personnelle:
		<br/>
		<input bind:value={clefRunique} type="text" placeholder="clef runique" size=15 />
		<input type="button" value="►" on:click={()=>checkClef()}/>
		<div class="br"/>
		<Epiq bind:step={epiqStep} 
			oui=5 ouiVal="Je suis un boulet, montre moi à nouveau la vidéo" ouiVideo="ff-6-teaser3"	/>
		<div style="clear:both" class="br"/>
	</div>
{/if}

{#if epiqStep==6}
	<div class="reveal">
		<img src={urlImg+"deepAI/ref-cl.png"} style="width:30%; float:right" alt="" />
		Bien {pseudo}, tu sembles motivé!
		<div class="br" />
		Il me reste à vérifier que tu peux facilement te TP vers les maisons de Kikiadoc.
		<div class="br"/>
		Si tu n'es pas encore ami IG avec Kikiadoc Lepetiot @ Moogle,
		envoie lui une demande d'ami pour avoir les TP directs vers ses maisons.
		S'il n'est pas connecté sur le jeu, tu peux le mp @Kikiadoc sur discord!
		<div class="br"/>
		Pour terminer cette quête initiatique, fais un TP vers la maison de CL de Kikiadoc
		(Moogle, Brumée, secteur 19, slot 5).
		Entre dans la maison et consulte le message du propriétaire sur le livre de correspondance. Suis alors les consignes.
		<div class="br"/>
		<Epiq bind:step={epiqStep}
			oui=6 ouiVal="Explique moi pour le livre de correspondance"
			ouiMsg="Le livre se trouve dans la maison, près de l'entrée et à gauche en entrant. Clic sur l'icon 🠟 au dessus du livre. Lis alors le message du propriétaire et laisse un message selon la consigne en cliquant sur l'icon crayon 🖉"
			non=7 nonVal="J'ai écrit le message demandé sur le livre" 
			nonFct={()=>{apiCall('/hautsFaits/uchronieInitiatique','PUT').then((ret)=>{if (ret.status==200) addNotification("Tu es déjà un novice de l'Uchronie","lightgreen",10)})}}
			/> 
		<div style="clear:both" class="br"/>
	</div>
{/if}
{#if epiqStep==7}
	<div class="reveal">
		<img src={urlImg+"hautfait.png"} style="width:30%; float:right" alt="" />
		Bravo {pseudo}, tu as fini la quête initiatique de l'Uchronie et tu as gagné
		1 million de gils au titre de ton engagement à participer.
		<div class="br"/>
		Si tu partages ces informations avec des amis, n'oublie pas qu'il faut qu'ils suivent aussi
		cette quête initiatique pour valider leur statut de Novice de l'Uchronie: Il ne leur suffit pas d'indiquer
		un message sur le livre de correspondance de la maison de CL de Kikiadoc.
		<div class="br"/>
		A coté du bouton 'Revoir le lore' tu auras souvent un bouton indiquant la progression
		actuelle des Aventuriers dans le challenge. Ici, tu peux cliquer sur 'Voir le noviciat'
		<div class="br"/>
		Tu peux aussi revenir à cette quête initiatique depuis la Liste de tes Possibles
		en cliquant sur <i>{pageDesc.texte}</i>
		<div class="br"/>
		<Epiq bind:step={epiqStep} bind:page={page} bind:pageDone={pageDone} 
			oui=7 ouiVal="Merci Grande Peluche" ouiPageDone={pageDesc.n} ouiPage=0
			/>
		<div style="clear:both" class="br"/>
	</div>
{/if}

{#if dspNoviciat}
	{@const novicesTbl = Object.keys(novices.pseudos)}
	<div class="popupCadre papier">
		<div class="close" on:click={()=>dspNoviciat=false} on:keypress={null} role="button" tabindex=0>X</div>
		<div class="popupZone">
			<div class="popupContent">
				Noviciat de l'Uchronie:
				<br/>
				{novicesTbl.length} novices ont terminé cette quête initiatique:
				<br/>
				{#each novicesTbl as novice,i}
					{#if i>0}, {/if}{novice}
				{/each}
			</div>
		</div>
	</div>
{/if}

<!-- P300.svelte -->

