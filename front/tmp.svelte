<script>
	import { onMount, onDestroy, tick } from 'svelte';
	// standard
	import { isLowerNumeric, lowerFirstLetter, capitalizeFirstLetter, isPseudoValid} from './storage.js';
	import { loadIt, storeIt, clearStorage} from './storage.js';
	import { addNotification, newInfoPopup, scrollTop} from './storage.js';
	import { connectToServer, disconnectFromServer, apiCall, apiCallExtern } from './storage.js';
	import { hhmmss, jjmmhhmmss, countDownTo, geUtcMsFrom } from './storage.js';
	import { playSound, playDing, setupAudio, audioTry } from "./storage.js";
	import { playVideo, closeVideo } from "./storage.js";
	import { startWakeLock, crypoCreateKeyPair } from "./storage.js";

	import P0 from './P0.svelte';
	import P1 from './P1.svelte';
	/*
	// ONLYCOMPILED	import P201 from './P_201.svelte';
	// OBSOLETE	import P202 from './P_202.svelte'; 
	// ONLYCOMPILED	import P203 from './P203.svelte'; 
	// ONLYCOMPILED	import P204 from './P204.svelte'; 
	// ONLYCOMPILED import P205 from './P205.svelte'; 
	// ONLYCOMPILED import P206 from './P206.svelte'; 
	import P300 from './P300.svelte';
	import P301 from './P301.svelte';
	import P302 from './P302.svelte';
	import P303 from './P303.svelte';
	import P304 from './P304.svelte';
	import P305 from './P305.svelte';
	import P306 from './P306.svelte';
	import P308 from './P308.svelte';
	import P309 from './P309.svelte';
	*/

	let version='PROD 24.05.09.18.02';  // SERA MODIFIE LORS DU COMMIT EN STAGING OU PROD ne pas changer

	// Gestion des reload, refresh etc..
	onMount(() => {
		const splash = document.getElementById("splash");
		if (splash)	setTimeout(() => {  splash.remove(); } , 1500);
		startWakeLock();
		init();
	});
	onDestroy(() => {
		disconnectFromServer();
		clearTimeout(timerIdList); 
	});

	function init() {
		if (pseudo!="") 
			connectToServer(wsCbStatus, wsCbMessage,version);
		else
			page = 0; // force login
	}
	function initAfterKeyValidation() {
		let es = loadIt("elipticSecurity", {})
		if (es.newPwd) {
			console.log("es.newPwd", es.newPwd)
			storeIt('pseudoPwd',es.newPwd)
			playSound();
			loadJetons();
			initList();
			checkPageValid();
		}
		else
			addNotification("Erreur initAfterKeyValidation","red",60)
	}

	//
	// Configuration générale
	//
	let pseudo = loadIt('pseudo',"");
	let pseudoPwd = loadIt('pseudoPwd',"");
	let lastPage = -1;
	let page = loadIt('page',0);
	let pageDone = loadIt('pageDone',[]);
	let pageComponent = null;
	let pageDesc = null;
	let pseudoList=[]; //chargement par WS
	let showAdmin = false; // affiche les infos d'admin

	//
	// Liste des pages de jeu
	// (page list n'est pas const pour permettre le refresh)
	let pageList = [
		{n: 1, texte: "Visiter l'IPA, l'Institut Peluchique de l'Audiovisuel", music: "Alice",
		 start: geUtcMsFrom(2024, 1, 2, 19, 0, 0),
		 // start: geUtcMsFrom(2024, 4, 24, 19, 0, 0),
		 end: geUtcMsFrom(2034, 1, 1, 19, 0, 0),
		 always: true,
		 component: P1
		},
		/*
		{n: 300, texte: "L'initiatique du Kiki's Event VIII", music: "FrontTitles",
		 start: geUtcMsFrom(2024, 3, 21, 19, 0, 0),
		 end: geUtcMsFrom(2024, 3, 22, 19, 0, 0),
		 betaTest: true,
		 component: P300
		},
		{n: 301, texte: "Les victimes de l'Uchronie", music: "ForeverYoung", 
		 start: geUtcMsFrom(2024, 3, 22, 19, 0, 0),
		 end: geUtcMsFrom(2024, 4, 3, 18, 0, 0),
		 preReq: 300,
		 component: P301
		}, 
		{n: 302, texte: "Le Schisme du temps", music: "MythsSword", 
		 start: geUtcMsFrom(2024, 3, 23, 19, 0, 0),
		 end: geUtcMsFrom(2024, 3, 31, 18, 0, 0),
		 preReq: 300,
		 component: P302
		}, 
		{n: 303, texte: "Les Lieux Déracinés", music: "celebrations", 
		 start: geUtcMsFrom(2024, 3, 24, 19, 0, 0),
		 end: geUtcMsFrom(2024, 3, 31, 18, 0, 0),
		 phase: 0,
		 preReq: 300,
		 component: P303
		}, 
		{n: 304, texte: "Le retour spatio-temporel", music: "outfoxing", 
		 start: geUtcMsFrom(2024, 3, 25, 19, 0, 0),
		 end: geUtcMsFrom(2024, 3, 31, 18, 0, 0),
		 preReq: 300,
		 component: P304
		}, 
		{n: 305, texte: "L'explosion du Laboratoire", music: "Paradise-Vangelis", 
		 start: geUtcMsFrom(2024, 3, 27, 19, 0, 0),
		 end: geUtcMsFrom(2024, 3, 31, 18, 0, 0),
		 preReq: 300,
		 component: P305
		}, 
		{n: 306, texte: "Le cristal de l'Uchronie", music: "Depasse", 
		 start: geUtcMsFrom(2024, 3, 28, 19, 0, 0),
		 end: geUtcMsFrom(2024, 3, 31, 18, 0, 0),
		 preReq: 300,
		 component: P306
		}, 
		{n: 307, texte: "La Restauration du Temps", music: "Wald", 
		 start: geUtcMsFrom(2024, 3, 29, 19, 0, 0),
		 end: geUtcMsFrom(2024, 3, 31, 20, 0, 0),
		 phase: 1,
		 incantDth: geUtcMsFrom(2024, 3, 31, 18, 0, 0),
		 preReq: 300,
		 component: P303
		}, 
		{n: 308, texte: "Le Dirac des Quatre", music: "Extravaganza", 
		 start: geUtcMsFrom(2024, 4, 1, 18, 0, 0),
		 end: geUtcMsFrom(2024, 4, 4, 18, 0, 0),
		 preReq: 300,
		 component: P308
		}, 
		{n: 309, texte: "Epilogue du Kiki's Event VIII", music: "FarmerBelleJournee", 
		 start: geUtcMsFrom(2024, 4, 2, 18, 0, 0),
		 end: geUtcMsFrom(2024, 4, 5, 18, 0, 0),
		 preReq: 300,
		 component: P309
		}, 
		{n: 206, texte: "DeepAI", music: "BienMal",
		 start: new Date(2024, 1-1, 20, 20, 0, 0).valueOf(),
		 end: new Date(2024,1-1, 30, 20, 0, 0).valueOf(),
		 viewAfter: true,
		 // ONLYCOMPILED component: P206
		}, 
		{n: 205, texte: "Jungle Boogie", music: "Muppet",
		 start: new Date(2024, 1-1, 5, 20, 0, 0).valueOf(),
		 end: new Date(2024,2-1, 9, 20, 0, 0).valueOf(),
		 viewAfter: true,
		 // ONLYCOMPILED component: P205
		}, 
		{n: 204, texte: "Les Jardins Suspendus", music: "Alex-nes",
		 start: new Date(2023, 12-1, 9, 20, 0, 0).valueOf(),
		 end: new Date(2023,12-1, 23, 20, 0, 0).valueOf(),
		 viewAfter: true,
		 // ONLYCOMPILED component: P204
		}, 
		{n: 203, texte: "Brocéliande", music: "Benabar-foret-extrait",
		 start: new Date(2023, 10-1, 18, 20, 0, 0).valueOf(),
		 end: new Date(2023, 10-1, 21, 21, 0, 0).valueOf(),
		 viewAfter: true,
		 // preReq: 202,
		 // ONLYCOMPILED component: P203 
		}, 
		{n: 202, texte: "Quête initiatique de Brocéliande", music: "Benabar-foret-extrait",
		 start: new Date(2023, 10-1, 11, 20, 0, 0).valueOf(),
		 end: new Date(2023, 10-1, 21, 21, 0, 0).valueOf(),
		 viewAfter: true,
		 // ONLYCOMPILED component: P202
		},
		{n: 201, texte: "La transition magique", music: "Benabar-foret-extrait",
		 start: new Date(2023, 10-1, 11, 20, 0, 0).valueOf(),
		 end: new Date(2023, 9-1, 8, 21, 0, 0).valueOf(),
		 viewAfter: true,
		 // ONLYCOMPILED component: P201
		},
		*/
	];

	function checkPageValid() {
		let ok=false;
		pageList.forEach( (e) => { if (e.n == page) ok=true;}) ;
		console.log("Page stockee gérée?:",page, ok);
		if (!ok && page!=0) page=0;
	}
	
	/////////////////////////////////////////////////////////////////////
	// Gestion des parametres audio
	/////////////////////////////////////////////////////////////////////
	let audioVolume = loadIt('audioVolume',30); // volume relatif des audios et videos
	$: storeIt('audioVolume', audioVolume);
	let audioBack = loadIt('audioBack',true); // flag de pause automatique désactivée
	$: storeIt('audioBack', audioBack);
	let audioAmbiance = loadIt('audioAmbiance',true); // flag d'activation musique d'ambiance
	$: storeIt('audioAmbiance', audioAmbiance);
	// global react sur param audios
	$: setupAudio(audioVolume,audioBack,audioAmbiance);
	
	// play audio des qu'un click...
	document.addEventListener("click", audioTry, { once: true });
	
	/////////////////////////////////////////////////////////////////////
	// gestion du changement de page
	/////////////////////////////////////////////////////////////////////
	$: { pageChange(page) }	
	function pageChange() {
		if (page != lastPage) {
			storeIt('page', page);
			storeIt('pageDone', pageDone);
			lastPage = page;
			scrollTop()
			// Recherche la description de la page
			let wPageDesc = pageList.find((e) => e.n == page);
			// Si trouvé, 
			if (wPageDesc) {
				playSound(wPageDesc.music);
				pageComponent = (wPageDesc.component)? wPageDesc.component : null;
			}
			else {
				console.log("wPageDesc not found")
				playSound(null);
				pageComponent = null;
			}
			pageDesc = wPageDesc;
		}
	}

	/////////////////////////////////////////////////////////////////////
	// Gestion du websocket / multijoueurs
	/////////////////////////////////////////////////////////////////////

	let wsCallComponents = new Set();
	let wsStatus = 0;
	// v: 0 disconnect, 1 connected, 2 erreur, 3 transient: validation token
	function wsCbStatus(v) {
		switch(v) {
			case 0:
			case 1:
			case 2:
				wsStatus = v;
				break;
			case 3:
				let es = loadIt("elipticSecurity",{})
				storeIt("pseudoPwd", pseudoPwd = es.newPwd);
				initAfterKeyValidation()
				break;
			default:
				addNotification("Erreur wsCbStatus="+v+", contacter Kikiadoc","red",60)
		}
	}

	let dspAdminMsg = null;
	function wsCbMessage(m) {
		console.log("wsCbMessage",m);
		let done=false;
		switch(m.op) {
			case "pseudoList":
				pseudoList = m.pseudoList;
				done = true;
				break;
			case "notif":
				if (m.fromPseudo) {
					flagChat=true;
					addNotification(m.fromPseudo+": "+m.texte,"orange");
					playDing(); 
				}
				else
					addNotification(m.texte);
				if (m.admin) { 
					dspAdminMsg = m.texte;
					playDing("call-to-attention");
				}
				if (m.toPseudo == pseudo) {
					if (m.fromPseudo)
						newInfoPopup("Message personnel de "+m.fromPseudo,m.toTexte,"");
					else
						newInfoPopup("Message personnel de la Grande Peluche",m.toTexte,"");
					playDing("call-to-attention");
				}	
				if (m.mp3) playDing(m.mp3);
				chatMsgList.push(m);
				chatMsgList = chatMsgList; // forece refresh
				done=true;
				break;
			case "collection":
				if (m.name=="jetons") { loadJetons();	done=true; }
				break;
		};
		// appel des composants enregistrés
		wsCallComponents.forEach( (cb) => {
					if ( cb(m) ) done=true;
		});
		if (done==false) console.log("WS op non géré: ", m);
	}


	/////////////////////////////////////////////////////////////////////
	// Gestion du pseudo
	/////////////////////////////////////////////////////////////////////
	// Popup pseudo
	let dspPseudo=false;
	function toggleDspPseudo() {
		dspPseudo = ! dspPseudo;
	}
	// fonctions diverses liés au pseudo
	function keyPseudo(e) {
		if (e.keyCode==13) registerPseudo();
	}
	async function registerPseudo()	{
		let enregistrer = document.getElementById("enregistrerPseudo");
		if (enregistrer.style.color=="red")	{
			newInfoPopup("Patience ! ","Les vérifications sont en cours","Patience");
			return;
		}
		enregistrer.style.color="red";
		try {	await registerPseudoTech();	} catch(e) {} ;
		enregistrer.style.color="black";
	}

	async function registerPseudoTech()	{
		let newPseudo = capitalizeFirstLetter(document.getElementById("pseudoRequest").value.replaceAll(' ','').toLowerCase())
		let nomIG = capitalizeFirstLetter(document.getElementById("nomRequest").value.replaceAll(' ','').toLowerCase())
		let monde = capitalizeFirstLetter(document.getElementById("mondeRequest").value.replaceAll(' ','').toLowerCase())
		if (!isPseudoValid(newPseudo) || !isPseudoValid(nomIG)) {
			newInfoPopup("Invalide!","Ton prénom et nom doivent respecter les regles de nommage de FF14","");
			return;
		}

		let ret = null; // resulta de requete
		addNotification("Vérif / lodestone...")
		// acces lodestone via proxy sur adhoc.click (pour eviter les reponses opaques)
		ret = await apiCall("/lodestone/check/"+newPseudo+"/"+nomIG+"/"+monde)
		if (ret.status==202) {
			newInfoPopup("Tu es inconnu du lodestone",
									 ["Je n'ai pas trouvé "+newPseudo+" "+nomIG+"@"+monde+" sur le Lodestone de FF14",
										"Vérifie bien les prénom, nom et monde que tu as indiqué",
										"Attention, il ne faut pas indiquer ton mot de passe pour FF14",
									 ],
									 "si cette erreur persiste, contacte Kikiadoc sur discord"
									)
			return;
		}
		if (ret.status!=200) {
			newInfoPopup("Erreur d'accès sur le lodestone",
									 ["Je ne peux pas vérifier ton existance sur le lodestone de FF14",
										"car le lodestone ne me répond pas"
									 ],
									 "Recommence dans quelques minutes"
									)
			return;
		}
		const ff14Id = ret.o.ff14Id

		if (! confirm(newPseudo+" "+nomIG+"@"+monde+"(Lodestone Id="+ff14Id+"),\n"+
								"tu vas recevoir un pseudo et une clé personnelle sera enregistrée sur ton appareil (PC ou smartphone).\n"+
								"En cas de changement d'équipement ou d'erreur, il faudra contacter Kikiadoc sur discord"))
			return;
		
		addNotification("Création de ta clé de crypto elliptique...","green",3)
		let jwkPublicKey = await crypoCreateKeyPair()
		if (! jwkPublicKey ) {
			newInfoPopup("ATTENTION erreur GRAVE","Génération de la clé de crypto elliptique impossible","Contacte Kikiadoc")
			return;
		}
		addNotification("Enregistrement de ton perso sur le server...","green",3)
		ret = await apiCall("/pseudos","PUT",
			{pseudo: newPseudo, nom: nomIG, monde: monde, ff14Id: ff14Id, jwkPublicKey: jwkPublicKey}
		);
		if (ret.status==200) {
			addNotification(ret.o.pseudo+" enregistré");
 			storeIt("pseudo",ret.o.pseudo); pseudo=ret.o.pseudo;
			if (newPseudo!=ret.o.pseudo)
				newInfoPopup("Note bien ton pseudo","Le pseudo "+newPseudo+" est déjà attribué, je t'ai donc assigné le pseudo "+ret.o.pseudo);
			init();
		}
		else
		if (ret.status==403) {
			newInfoPopup("Contacte Kikiadoc sur Discord","Un joueur identique existe déjà dans mon Grimoire de Sécurité, tu as peut-être effacé les données de ton appareil ou changé d'appareil","Impossible d'enregistrer ton pseudo");
		}
		else {
			addNotification(ret.erreur+"("+ret.status+")","red",60 );
			newInfoPopup("ATTENTION","il y a eu un soucis lors de l'enregistrement de ton Pseudo","Si besoin, contacter Kikiadoc sur Discord");
		}
	}
	

	/////////////////////////////////////////////////////////////////////
	// jetons
	/////////////////////////////////////////////////////////////////////
	let jetons = {};
	let lastSoldeJetons = loadIt('lastSoldeJetons',0);
	let flagJetonClass="";
	// comme c'est la premiere fonction serverur appelée en http
	// positionne aussi la validité d'utilisateur
	async function loadJetons() {
		let json = await apiCall("/collections/jetons");
		if (json.status == 200)
			jetons = json.o.data;
			if (jetons[pseudo]==undefined)
				jetons[pseudo] = { solde: 0};
			flagJetonClass = (jetons[pseudo].solde != lastSoldeJetons) ? "blinkFlag" : "";
			lastSoldeJetons = jetons[pseudo].solde;
	}
	// Popup jetons
	let dspJetons=false;
	function toggleDspJetons() {
		dspJetons = ! dspJetons;
		flagJetonClass="";
		storeIt('lastSoldeJetons',lastSoldeJetons);
	}
	async function donneJeton(p) {
		if (confirm("Donner un jeton de Camelot à " + p + "?")) {
			let retJson = await apiCall("/jetons/"+p,"PUT");
			if (retJson && retJson.msg) newInfoPopup("",retJson.msg,"");
		}
	}

	/////////////////////////////////////////////////////////////////////
	// Popup mutijoueurs
	/////////////////////////////////////////////////////////////////////
	let dspMultiPopup=false;
	let messageText = null; // via bind
	let messageScrollArea = null; // via bind
	let chatMsgList=[];
	let flagChat=false;
	$: if(chatMsgList && messageScrollArea) { console.log("autoscoll updated values") ; scrollToBottom(messageScrollArea) }
  async function scrollToBottom(node) {
		await tick();
		node.scroll({ top: node.scrollHeight, behavior: 'smooth' });
	};
	function sendMsg() {
		if (messageText) {
			apiCall("/chatMsg","POST", {texte: messageText} );
			playSound("BlaBlaBla");
			messageText=null;
		}
	}
	function sendAdmin() {
		if (messageText) apiCall("/adminMsg","POST", {texte: messageText, admin:true} ) ;
		messageText=null;
	}

	/////////////////////////////////////////////////////////////////////
	// Gestion de l'assistance
	/////////////////////////////////////////////////////////////////////
	let dspAssistance = false;

	/////////////////////////////////////////////////////////////////////
	// gestion de la liste des challenges
	/////////////////////////////////////////////////////////////////////
	const timerStart = 24* 3600000; // 24H
	const timerEnd = 24* 3600000; // 24H

	function listClick(infoPage) {
		const dthNow = Date.now();
		if (infoPage.start==0 || infoPage.end==0) {
			newInfoPopup(infoPage.texte,"Cette page du Grimoire des Possibles est encore masquée par une épaisse brume éthérée","Aucune info sur la date de début");
		}
		else
		if (dthNow <= infoPage.start && !infoPage.betaActive) {
			newInfoPopup(infoPage.texte,"Ce n'est pas encore commencé","Profite de l'ambiance sonore...");
		}
		else
		if (dthNow >= infoPage.end) {
			newInfoPopup(infoPage.texte,"C'est terminé","Trop tard pour participer !!");
			if (infoPage.viewAfter) {
				page=infoPage.n;
				return;
			}
		}

		// si challenge possible
		if ( infoPage.start && infoPage.end && (dthNow >= infoPage.start) && (dthNow <= infoPage.end)) {
			// Si prerequis...
			if ( infoPage.preReq>0 && (pageDone.find((e) => e==infoPage.preReq)==undefined) )
				newInfoPopup("Initiatique requise",
										 "Pour accéder à cette quête, vous devez avoir terminé l'initiatique associée",
										 "");
			else {
				page=infoPage.n;
				return;
			}
		}
		else {
			if (infoPage.betaTest){
				newInfoPopup("Accès en avant-première",
										 ["Tout n'est pas encore finalisé pour "+infoPage.texte,
											"Si remarque ou soucis, mp @kikiadoc ou message sur #discussions sur discord",
											"Ce que tu feras en avant-première pourra être réinitialisé si besoin",
											"mais tes gains éventuels resteront acquis"],
										  "Amuses-toi bien!");
				page=infoPage.n;
				return;
			}
			else if (pseudo.startsWith("Kikiadoc") && confirm("AccèsAdmin?") ) {
				page=infoPage.n;
				return;
			}
		}
		// Pas de changemenet de page, on active quand meme l'audio de la page voulue
		playSound(infoPage.music || "Amelie");
	}
	
	let dthNow = Date.now();
	function initList() {
		setupTimerList();
	}

	//setup timer
	let timerIdList = null;
	function setupTimerList() {
		dthNow = Date.now();
		let timer = 60000; // 1 minute
		for (const infoPage of pageList) {
			// clcul du libele de l'item de la liste
			infoPage.lbl = "Heu... ya un bug !";
			if (infoPage.start == 0 || infoPage.end == 0) {
				infoPage.cls= (infoPage.start)? "near" : "future";
				infoPage.lbl = "Masqué par une brume éthérée";
			}
			else if ( (dthNow <= infoPage.start-timerStart)) {
				infoPage.cls="near";
				infoPage.lbl = "Débute "+ jjmmhhmmss(infoPage.start);
			}
			else if ( (dthNow > infoPage.start-timerStart) && (dthNow <= infoPage.start)) {
				infoPage.cls="near";
				infoPage.lbl = "Débute dans " + countDownTo(infoPage.start) ;
				timer = 1000;
			}
			else if ( (dthNow > infoPage.end-timerEnd)  && (dthNow <= infoPage.end)) {
				infoPage.cls="active";
				infoPage.lbl = "Se termine dans " + countDownTo(infoPage.end) ;
				timer = 1000;
			}
			else if ( (dthNow >= infoPage.start)  && (dthNow <= infoPage.end)) {
				infoPage.cls="active";
				infoPage.lbl = "Se termine " + jjmmhhmmss(infoPage.end);
			}
			else if ( (dthNow >= infoPage.end) ) {
				infoPage.cls="past";
				infoPage.lbl = "Terminé " + jjmmhhmmss(infoPage.end);
			}
			// beta active ?
			infoPage.betaActive = infoPage.betaTest && (dthNow <= infoPage.start)

		}
		timerIdList = setTimeout(setupTimerList,timer);
		// refresh list
		pageList = pageList;
	}
	
</script>

<style lang="scss">
	body {
		position: fixed;
		color: white;
		background-color: transparent;
		font-family: "Times New Roman", Times, serif;
		font-size: 1.5em; 
		top:0;
		left:0;
		width:100%;
		height:100%;
		right:0;
		bottom:0;
		margin:0;
		text-shadow: 0px 0.10em 0.1em black, 0px -0.1em 0.1em black, 0px 0.20em 0.2em black, 0px -0.2em 0.2em black;
	}
	.contenu { position: fixed; top: 3em; left: 0; bottom: 0.1em; 
							overflow: scroll; scrollbar-width: thin;
							width: 100%; padding: 0 0 0 0; /* top | right | bottom | left */
					 }
	::-webkit-scrollbar { width: 9px;}
	::-webkit-scrollbar-track { background: transparent;}
	::-webkit-scrollbar-thumb { background: rgba(155, 155, 155, 0.5);  border-radius: 20px;  border: transparent; }							
	
	/* PC */
	@media (pointer: fine) and (max-width: 900px)  {
		body { font-size: 1.5em }
		.contenu { width: 100%; padding: 0 0 0 0; }
	}
	@media (pointer: fine) and (min-width: 900px) and (max-width: 1399px)  {
		body { font-size: 1.6em;  }
		.contenu { width: 90%; padding: 0 5% 0 5% }
	}
	@media (pointer: fine) and (min-width: 1400px) {
		body { font-size: 1.7em;  }
		.contenu { width: 80%; padding: 0 10% 0 10% }
	}
	/* smartphone portait */
	@media (pointer: coarse) and (orientation: portrait) {
		body { font-size: 5.8vw; } /* 4.8 */
  }
	/* smartphone landscape */
	@media (pointer: coarse) and (orientation: landscape) {
		body { font-size: 5.8vh; } /* 4.8 */
  }
	notifications {	top: 0px; right: 0px; position: fixed; z-index: 20000; width: 50%; }
	.pseudo { top: 0px; right: 0%; height: 2em; background-size:cover;	position: fixed; z-index: 1000; 	cursor: pointer; }
	.wsClass { top: 1.1em; right: 0px; height: 3%; position: fixed; z-index: 1000; 	cursor: pointer; }
	.wsClass0 { color: red }
	.wsClass1 { color: lightgreen }
	.wsClass2 { color: red }
	
	titre {
		background-color: grey;
		vertical-align: top; 
		position: fixed;
		left: 0;
		top: 0;
		width: 100%;
		height: 3em;
		cursor: pointer;
		font-size: 1em;
		z-index:5000;
	}
	audio {
		width: 100%;
		height: 1.5em;
		background-color: grey;
		position: fixed;
		left: 0px;
		bottom: 0px;
		text-shadow: none ;
		font-family: "Times New Roman", Times, serif;
		z-index:5000;
	}
	back {
		background-image: url("https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/Oracle.png");
		width: 100%;
		height: 100%;
		background-color: pink;
		background-position: center;
		background-size: cover;
		position: fixed;
		z-index: -1;
		margin: 0;
		padding: 0;
		border:0;
		left: 0;
		top: 1.8em;
	}

	.info1 { font-size: 0.8em; height: 10% }
	.infoUrl { float: left; width:20%; height: 20%; padding: 2px }
	.info2 { font-size:1em; max-height: 10em; overflow: auto }
	.info3 { font-size:0.6em; height: 10% }

	label { cursor: pointer; }
	input {	font-family: "Times New Roman";	font-size: 1em;	}
	select {	font-family: "Times New Roman";	font-size: 1em;	}

	.future { cursor: pointer; color: red; font-style: italic; }
	.near { cursor: pointer; color: orange; font-style: italic; }
	.past { cursor: pointer; color: lightgrey; font-style: italic; }
	.active { cursor: pointer; color: lightgreen}
	.dejaFaite { color:orange; text-decoration: underline;  }

	:global(.divVideo) { display: none; z-index: 6000; position: fixed; top:0; left: 0;
						height: 80%; max-height: 80%; width: 80%; max-width: 80%; transform: translate(10%,10%); }
	:global(.video) { border: 0.2em solid white; height: 100%; max-height: 100%; width: 100%; max-width: 100%;  }

	.button { border: 0.2em outset white; cursor: pointer}

	/* popup de multi - envoi de messages */
	.messageCadre { border: 5px solid black; }
	.inputText {    font-family: "Times New Roman"; font-size: 1em; width: 75%; }
	.messageButton {  font-family: "Times New Roman"; font-size: 1em; width: 20%; cursor: pointer     }
	.messageText {    font-family: "Times New Roman"; font-size: 1em; width: 75%      }

	.beta { color:white; background-color: green;
					border: 2px solid white; border-radius: 5px;
				  font-size: 0.6em;
				  padding: 0.1em; 
	}

	:global(.adminCadre) { border: 2px solid red; background-color: black; margin: 2px }

	:global(.scrollbar) { scrollbar-color: white green; scrollbar-width: thin; overflow-y: auto }

	:global(.close) {
		position: absolute;
		z-index: 5001;
		right: -0.3em;
		top: -0.5em;
		font-size: 2em;
		background: #E2E8F0;
		color: #64748B;
		border-radius: 6px;
		border: 2px outset yellow;
		cursor: pointer;
		display: block;
		overflow: visible;
		text-shadow: none;
	}

	:global(.papier) {
		background-color: grey;
		background-image: url("https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/texture-papier-noir.jpg");
		background-position: center;
	}
	:global(.stars) {
		background-color: grey;
		background-image: url("https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/stars.gif");
		background-position: center;
	}
	:global(.popupCadre) {
		z-index: 7000;
		position: fixed;
		border: 2px outset red;
		border-radius: 10%;
		border-width: 5%;
		top: 20%;
		left: 20%;
    transform: translate(-10%, 0%);
		overflow: visible;
	}
	:global(.popupZone) {
		padding: 0.5em 0.5em 1.0em 0.5em;
	}
	:global(.popupContent) {
		max-height: 15.9em;
		min-height: 4em;
		min-width: 10em;
		scrollbar-color: white grey;
		scrollbar-width: thin;
		overflow-y: auto;
	}

	:global(.reveal) {
		border: 0.1em solid white;
		padding: 0.2em;
		margin-top: 0.5em;
		background-position: center;
		background-repeat: no-repeat; 
		background-size: cover; 
		background-color: black;
		background-image: url('https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/texture-papier-noir.jpg');
		color: white;
		animation-duration: 10s;
		animation-name: revealFrames;
		animation-iteration-count: 1;
	}
	:global(.revealSimple) {
		color: white;
		animation-duration: 10s;
		animation-name: revealFrames;
		animation-iteration-count: 1;
	}
	@keyframes revealFrames {
	  from { color: black; }
		50% {color: #C0C0C0 }
	  to { color: white; }
	}
	:global(.spacer) {
		min-height: 2.5em;
	}
	:global(.br) {
		min-height: 0.4em;
	}

	:global(.blinkCadre) {
		color: white;
		outline: 2px solid white;
		animation-duration: 2s;
		animation-name: flagFrames;
		animation-iteration-count: infinite;
	}
	:global(.blinkFlag) {
		color: white;
		outline: 2px solid white;
		border-radius: 25%;
		animation-duration: 2s;
		animation-name: flagFrames;
		animation-iteration-count: infinite;
	}
	
	@keyframes flagFrames {
		from { outline-color: black; }
		to { outline-color: white; }
	}

	:global(.blinkMsg) {
		text-decoration-line: underline;
		text-decoration-style: double;
		text-decoration-color: black;
		animation-duration: 2s;
		animation-name: msgFrames;
		animation-iteration-count: infinite;
	}
	@keyframes msgFrames {
		from { text-decoration-color: black; }
		to { text-decoration-color: white; }
	}

	:global(a) {
		color: white; /* lightgreen; */
		text-decoration: unset; /* underline; */
		cursor: pointer;
	}
	:global(a:hover) {
		color:lightgreen;
		text-decoration: unset; /* underline; */
		cursor: pointer;
	}
	:global(a:after) {
  content: "🔎";
  color: lightgreen;
	}

	:global(.buttonGreen) {
		background-color: lightgreen;
	}
	:global(.buttonRed) {
		background-color: red;
	}

</style> 

<body id="topPage">
	<back>&nbsp;</back>
	<notifications id="notifications"></notifications>
	<titre>
		<div on:keydown={null} on:click={() => { page = 0; window.scroll(0,0); }} role="button" tabindex="0">
			<span style="font-size: 1.0em">Kiki's mini-jeux</span>
			<br/>
			<span style="font-size: 0.6em">Enjoy ({version || 'DEV'})</span>
		</div>
		<div class="pseudo">
			{#if wsStatus==1}
				<span style="color: lightgreen" on:click={toggleDspPseudo} on:keydown={null} role="button" tabindex=0>
					{pseudo}
				</span>
				{#if jetons[pseudo]}
					<span on:click={toggleDspJetons} on:keydown={null} role="button" tabindex=0>
						<span class="{flagJetonClass}">🪙{jetons[pseudo].solde}</span>
					</span>
				{/if}
			{:else}
				<span style="color: red;" on:click={toggleDspPseudo} on:keydown={null} role="button" tabindex=0>
					{pseudo || "pseudo"} non validé
				</span>
			{/if}
			<span on:click={() => audioAmbiance= !audioAmbiance} on:keydown={null} role="button" tabindex=0>
				{#if audioAmbiance}🔊{:else}🔇{/if}
			</span>
		</div>
		<div class="wsClass wsClass{wsStatus}" id="syncStatus" on:click={() => {dspMultiPopup = !dspMultiPopup} } on:keydown={null} role="button" tabindex=0 >
			{#if flagChat}<span class="blinkFlag">💬</span>{/if}
			multijoueurs
		</div>
	</titre>
	
	<!-- controle multimedias -->
	<audio style="visibility: hidden" id="ding" src="" />
	<audio style="visibility: hidden" id="musique" src="" />
	<!-- video 1920 x 1080 -->
	<div id="divVideo" class="divVideo">
		<div class="close" on:click={closeVideo} on:keypress={null} role="button" tabindex=0>X</div>
		<video id="video" class="video stars" width="1920" height="1080" autoplay controls disablePictureInPicture
			playsinline onloadstart="this.volume={audioVolume/100}">
			<track kind="captions" />
		</video> 
	</div>

	<div id="infoPopup" class="popupCadre stars" style="z-index:8000; visibility: hidden" onclick="document.getElementById('infoPopup').style.visibility='hidden'">
		<div class="close">X</div>
		<div class="popupZone">
			<div class="popupContent">
				<div id="info1" class="info1">info 1</div>
				<img id="infoUrl" class="infoUrl" alt="" src=""/>
				<div id="info2" class="info2" >info 2</div>
				<div id="info3" class="info3">info 3</div>
			</div>
		</div>
	</div>
		
	<div id="contenu" class="contenu">
		{#if pseudo.startsWith("Kikiadoc")}
			<div class="adminCadre" style="font-size: 0.4em">
				<input type="button" value="show/hide Admin" on:click={() => showAdmin=!showAdmin} />
			</div>
			{#if showAdmin}
				<P0 wsCallComponents={wsCallComponents} pseudo={pseudo} initWS={init} bind:jetons={jetons} ></P0>
			{/if}
		{/if}
		{#if page == 0}
			<p>Bienvenue {pseudo}</p> 
			<p>Je suis la Grande Peluche Oracle Des Savoirs du Bois Bandé.</p>
			{#if !pseudo }
					<div>Pour participer, tu dois m'indiquer EXACTEMENT tes prénom, nom et monde InGame:</div>
					<div>
						<label>
							<input type="text" placeholder="prénomIG" id="pseudoRequest" maxlength=15 on:keypress={keyPseudo}>
						</label>
						<label>
							<input type="text" placeholder="nomIG" id="nomRequest" maxlength=15 on:keypress={keyPseudo}>
						</label>
						<select id="mondeRequest">
							<option>Cerberus</option>
							<option>Louisoix</option>
							<option>Moogle</option>
							<option>Omega</option>
							<option>Phantom</option>
							<option>Ragnarok</option>
							<option>Sagittarius</option>
							<option>Spriggan</option>
							<option>Alpha</option>
							<option>Lich</option>
							<option>Odin</option>
							<option>Phoenix</option>
							<option>Raiden</option>
							<option>Shiva</option>
							<option>Twintania</option>
							<option>Zodiark</option>
						</select>
						<label>
							<input type="button" value="Valider ►" id="enregistrerPseudo" on:click={registerPseudo}>
						</label>
					</div>
			{:else}
				<div>Voici ce que je connais de tes Possibles:</div>
				<div class="active">
					👉 
					<a class="active" target="_blank" 
						href="https://docs.google.com/spreadsheets/d/1IFig4FDv1lN5biAz7I9oOKUY2TKgv31qiatovx1UEpw/edit?usp=sharing"
						on:click={() => playSound("Money")}
					>
						Consulter le grimoire des gains
					</a>
				</div>
	
				{#each pageList as page, i}
					{#if page.sep}
						<div class="">
							{page.texte}
						</div>
					{:else}
					{#if !page.hidden || pseudo.startsWith("Kikiadoc")}
						<div class="{page.cls}" >
							<div on:click={() => listClick(page)} role="button" tabindex=0 on:keydown={null}>
								<div class="">
									👉
									{#if page.hidden}<span class="beta">hidden</span>{/if}
									{#if page.betaActive}<span class="beta">Avant-première</span>{/if}
									{page.texte}
									{#if !page.always}
										<br/>
										(
										{#if (pageDone.find((e) => e==page.n)!=undefined) }<span class="dejaFaite">Déjà faite</span>, {/if}
										{page.lbl}
										)
									{/if}
								</div>
							</div>
						</div>
					{/if}
					{/if}
				{/each}
			{/if}
			<hr/>
			<div style="cursor: pointer; color:lightgreen" on:click={() => dspAssistance = !dspAssistance} role="button" tabindex=0 on:keydown={null}>
				👉 Assistance technique
				{#if dspAssistance}⏫{:else}⏬{/if}
			</div>
			{#if dspAssistance}
				<div class="adminCadre">
					<div>Si tu as des "errreurs imprévues":</div>
					<div>
						👉
						<a class="active" href="https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/securite/index.html" target="_blank">
							Vérification du non blocage de ton adresse IP par les mécanismes de sécurité de la Grande Peluche.
						</a>
					</div>
					<hr />
					<div>Si tu souhaites des informations techniques sur la conception du site:</div>
					<div>
						👉
						<a class="active" href="https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/Architecture et conception du site ff14.adhoc.click.pdf" target="_blank">
							Deep dive technique
						</a>
					</div>
					<hr />
					<div>N'utilise l'option suivante qu'en cas de soucis et après avoir contacté Kikiadoc sur discord</div>
					<div>
						👉 <span style="cursor: pointer; color: red" on:click={clearStorage} role="button" tabindex=0 on:keydown={null}>
						Effacer les données stockées sur ton appareil et liées à ce site: ff14.adhoc.click</span>
					</div>
				</div>
			{/if}
		{/if}
	
		{#if page != 0}
			<!-- inclusion dynamique d'un composant Pnnn -->
			{#if pageComponent !== null}
				<svelte:component this={pageComponent}
					bind:page={page} bind:pageDone={pageDone} 
					pageDesc={pageDesc}
					wsCallComponents={wsCallComponents} pseudo={pseudo}
				/>
			{:else}
				<div>
					Le contenu de page n'est pas disponible dans cette configuration
				</div>
			{/if}
		{/if}
	
		{#if page == 0}
			<p style="font-size: 0.7em">
				Sur ce site, ta vie privée est préservée au maximum:
				aucun cookie tiers, pas de lien avec d'autres sites, pas de publicite, pas de traçage. 
				Le stockage des informations nécessaires privilégie le stockage local sur ton appareil, 
				le serveur ne conserve que ton pseudo IG, une clé publique pour valider ton pseudo
				et les infos strictement liées au mode multijoueurs ou certains challenges
			</p>
			<p style="font-size: 0.7em">
				Pour assurer ta sécurité, tout en restant simple d'usage, tes transactions sont protégées
				contre l'usurpation d'identité par des clés furtives et signées par
				une clé privée élliptique stockée uniquement sur ton appareil.
				Ces clés sont générées de façon transparente et sans action de ta part, 
				afin que tu ne puisses pas réutiliser 
				un mot de passe utilisé sur un autre site et ne pas t'obliger à utiliser 
				tes identifiants Google, Discord, FesseLivre, TikToqué ou autres...
			</p>
		{/if}
			
		<div class="spacer" />
		<div class="spacer" />
	</div>

	{#if dspMultiPopup}
		<div class="popupCadre papier">
			<div class="close" on:click={() => { dspMultiPopup = false; flagChat=false} } on:keypress={null} role="button" tabindex=0>X</div>
			<div class="popupZone">
				<div class="popupContent">
					<div>
						{pseudoList.length} connecté{#if pseudoList.length > 1}s{/if} :
						{#each pseudoList as name, i}
							{name} &nbsp;
						{/each}
					</div>
					<div bind:this={messageScrollArea} class="messageCadre scrollbar" style="height: 7em" >
						{#each chatMsgList as o,i}
							<div>{hhmmss(o.dth)} ({(o.fromPseudo)? o.fromPseudo : "Grande Peluche"}) {o.texte}</div>
						{/each}
					</div>
					<div>
						<input class="messageText" bind:value={messageText} type="text" maxlength="140" on:keypress={(e) => {if (e.keyCode==13) sendMsg()}}/>
						<input class="messageButton" type="button" value="►" on:click={sendMsg} />
						{#if pseudo=="Kikiadoc"}
							<input class="messageButton" type="button" value="AdminAlert" on:click={sendAdmin} />
						{/if}
					</div>
				</div>
			</div>
		</div>
	{/if}

	
	{#if dspPseudo}
		{@const desc = loadIt("pseudoDesc",{})}
		{@const es= loadIt("elipticSecurity",{})}
		<div class="popupCadre papier">
			<div class="close" on:click={toggleDspPseudo} on:keypress={null} role="button" tabindex=0>X</div>
			<div class="popupZone">
				<div class="popupContent">
					<div>Ton pseudo est {pseudo || ".. ha, mais faut t'identifier"}</div>
					<div>({desc.prenom} {desc.nom} @{desc.monde})</div>
					<div>Tu {(es.jwkPrivateKey)? "as une" : "n'as pas de"} clé crypto elliptique sur cet appareil</div>
					{#if wsStatus==1}
						<div style="color:lightgreen">Je t'ai bien identifié, mais attention ton pseudo n'est utilisable que sur cet appareil</div>
					{:else}
						<div style="color:red">
							Il semble que ton appareil n'a pas été validé par mon Grimoire
							de Sécurité, alors il te faut contacter Kikiadoc sur Discord pour analyser ta situation
						</div>
					{/if}
					<div>
						Mon volume audio est actuellement de {audioVolume}% avant mixage par ton appareil.
						{#if ! audioAmbiance}
							<br/>
							<span style="color:red">
								Pour vérifier ou modifer le volume, active la musique d'ambiance
								en cliquant sur 🔊 en haut à droite de ton écran.
							</span>
						{/if}
					</div>
					<div>
						<input style="width:80%" bind:value={audioVolume} id="newVolumeAudio" type="range" min=0 max=100 />
					</div>
					<div>
						<label><input bind:checked={audioBack} type="checkbox" /> Désactiver la pause automatique</label>
					</div>
				</div>
			</div>
		</div>
	{/if}
	
	{#if dspJetons}
		<div class="popupCadre papier">
			<div class="close" on:click={toggleDspJetons} on:keypress={null} role="button" tabindex=0>X</div>
			<div class="popupZone">
				<div class="popupContent">
					<div style="font-size: 0.8em">
						Les jetons de Camelot peuvent être gagnés en participant aux activités.
						<br/>
						Ils sont parfois échangeables pour obtenir une récompense selon les challenges...
						<br/>
						Tu peux aussi en donner à d'autres participants
					</div>
					{#if jetons[pseudo].solde > 0 }
						<div>Tu as {jetons[pseudo].solde} jeton{#if jetons[pseudo].solde > 1}s{/if} de Camelot dans mon coffre</div>
						{#if pseudoList.length > 1}
							Tu peux donner un jeton à un connecté : 
							{#each pseudoList as name, i}
								{#if name != pseudo }
									<span class="button" on:click={() => donneJeton(name) } type="button" on:keypress={null} role="button" tabindex=0> {name} </span>
								{/if}
							{/each}
						{:else}
							Tu ne peux pas donner de jetons de Camelot, tu es le seul connecté.
						{/if}
					{:else}
						<div>Tu n'as aucun jeton de Camelot dans mon coffre</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}

	{#if dspAdminMsg}
		<div class="popupCadre papier" style="z-index:99999">
			<div class="close" on:click={()=>dspAdminMsg=null} on:keypress={null} role="button" tabindex=0>X</div>
			<div class="popupZone">
				<div class="popupContent" style="color:red; font-size:1.2em">
					<div>Message important:</div>
					<div class="blinkMsg">
						{dspAdminMsg}
					</div>
				</div>
			</div>
		</div>
	{/if}
	
</body>
	
<!-- page +page.svelte -->
