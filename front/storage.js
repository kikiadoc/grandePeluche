const APITYPE='test';

const urlImg = 'https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/';
const urlApi = 'https://api.adhoc.click/api'+APITYPE;
const wsUrl = 'wss://api.adhoc.click:443/ws'+APITYPE+'/';

///////////////////////////////////////////////////////////////////////////////////////
// FORMATTAGE ET TEST REGEX
///////////////////////////////////////////////////////////////////////////////////////

function padValue(v) {
	return "00".concat(v).slice(-2);
}
function padValue3(v) {
	return "000".concat(v).slice(-3);
}

export function isPseudoValid(str) { return /^['\-A-Za-z]+$/g.test(str); }
export function isLowerNumeric(str) { return /^[a-z0-9]+$/g.test(str); }
export function alphanum2placer(str) { return (str)? str.replace(/[a-z0-9]/g,"﹇") : str; } 
export function capitalizeFirstLetter(str) { return str.charAt(0).toUpperCase() + str.slice(1); }
export function lowerFirstLetter(str) { return str.charAt(0).toLowerCase() + str.slice(1); }

// return le dth d'une string JJ/MM HH:MM, ou 0 si bad format
export function parseJJMMHHMM(s) {
	if (!s) return 0;
	let slash= s.indexOf('/');
	let spc = s.indexOf(' ');
	let dp = s.indexOf(':');
	// si pas les séparateurs dans le bon ordre, return 0
	if (slash < 0 || spc < slash || dp < spc) return 0;
	let jj = parseInt(s.substring(0,slash),10)
	if (jj<=0 || jj>31) return 0;
	let mo = parseInt(s.substring(slash+1,spc),10)
	if (mo<=0 || mo>12) return 0;
	let hh = parseInt(s.substring(spc+1,dp),10)
	if (hh<0 || hh>23) return 0;
	let mm = parseInt(s.substring(dp+1),10)
	if (mm<0 || mm>59) return 0;
	// la chaine semble ok...
	// si le mois est avant 2 mois de la date actuelle, alors l'année est la suivante
	let yy = new Date().getFullYear();
	if ( mo < new Date().getMonth()-1 ) yy++; 
	return new Date(yy, mo-1, jj, hh, mm).valueOf();
}

// ms est un nombre de millisecond
export function hhmmss(ms) {
	if (ms) {
		let dth = new Date(ms);
		return padValue(dth.getHours())+":"+padValue(dth.getMinutes())+":"+padValue(dth.getSeconds());
	}
	return "--:--:--";
}

// ms est un nombre de millisecond si Nosep, pas de fioritures
export function jjmmhhmmss(ms,noSep) {
	if (ms) {
		let dth = new Date(ms);
		let ret = (noSep)? "" : "le "
		ret = ret + padValue(dth.getDate())+"/"+padValue(dth.getMonth()+1)
		ret = ret + ( (noSep)? " " : " à " )
		ret = ret + padValue(dth.getHours())+":"+padValue(dth.getMinutes())+":"+padValue(dth.getSeconds());
		return ret;
	}
	return "...";
	
}

// ms est un nombre de millisecond --> jj@hh:mm
const tblJours=["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."]
export function jjhhmm(ms,forceJour) {
	if (ms) {
		const dth = new Date(ms);
		const dayNow = new Date().getDay();
		const day = dth.getDay();
		return ((dayNow!=day || forceJour)? tblJours[day] : "") + padValue(dth.getHours()) + ":" + padValue(dth.getMinutes());
	}
	return "...";
}

// ms est un nombre de millisecond --> durée 
export function duree(ms) {
	let delta = Math.floor(ms/60000); // nombre de minutes
	let j= Math.floor(delta / 1440); // 24*60
	let h= Math.floor( (delta - j*1440) / 60);
	let m= delta % 60;
	// console.log("duree:",delta,j,h,m)
	let ret="";
	if (j>0) ret = j+"j, ";
	if (delta >= 60) ret = ret.concat(h+"h, ");
	ret = ret.concat(m.toString(),"m");
	return ret;
}

// ms est un nombre de millisecond
export function ssms(ms) {
	if (ms) {
		return padValue(Math.floor(ms/1000))+"."+padValue3(ms%1000);
	}
	return "--.---";
}

export function hhmmssms(ms) {
        if (ms) {
                const dth = new Date(ms);
                return   padValue(dth.getHours())+":"
                        +padValue(dth.getMinutes())+":"
                        +padValue(dth.getSeconds())+"."
                        +padValue3(dth.getMilliseconds());
        }
        return "--:--:--.---";
};

export function countDownTo(dth) {
	if (dth==null || dth==undefined)
		return "--:--:--";
	const nbSec = Math.floor( (dth- Date.now()) / 1000);
	if (nbSec <= 0) return "00:00:00";
	const h = Math.floor(nbSec/3600);
	const m = Math.floor( (nbSec - h*3600) / 60);
	const s = Math.floor( nbSec % 60);
	return padValue(h) + ":" + padValue(m) + ":" + padValue(s);
}


export function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

///////////////////////////////////////////////////////////////////////////////////////
// AFFICHAGE
///////////////////////////////////////////////////////////////////////////////////////

export function scrollTop(e) {
	setTimeout( () => {
		if (e)
			document.getElementById(e).scrollIntoView({behavior: "smooth"});
		else
			document.getElementById("contenu").scrollTo({top: 0, left: 0, behavior: "smooth"});
	}, 200);
}


///////////////////////////////////////////////////////////////////////////////////////
// notifications
///////////////////////////////////////////////////////////////////////////////////////

export function addNotification(text,color,timeout,ding) {
	const notifs = document.getElementById("notifications");
	if (notifs==null) { console.log("dom id notifications not found"); return; }
	const div = document.createElement("div");
	const styleAttr = document.createAttribute("style");
	styleAttr.value = "font-size: 0.7em; cursor: pointer; background-color: "+ ((color)? color : "green") +"; border-radius: 5px; padding: 5px; margin: 5px; spacing: 5px; text-align: right";
	div.setAttributeNode(styleAttr);
	div.appendChild(document.createTextNode(text+" ⊗"));
	notifs.appendChild(div);
	const timeoutId = setTimeout(() => {  div.remove() } , (timeout) ? timeout*1000 : 5000 );
	div.onclick= function() { div.remove(); clearTimeout(timeoutId) }
	if (ding)	playDing();
}

export function newInfoPopup(i1,i2,i3,img) {
	// if (infoPopupTimer) { clearTimeout(infoPopupTimer); }
	var d= document.getElementById("infoPopup");
	var d1= document.getElementById("info1");
	var d2= document.getElementById("info2");
	var d3= document.getElementById("info3");
	var infoUrl= document.getElementById("infoUrl");
	if (d==null || d1==null || d2==null || d3==null || infoUrl==null) {
		console.error("************** newInfoPopup impossible, DOM not yet loaded")
		return;
	}
	
	d1.replaceChildren(i1 || "");

	d2.replaceChildren();
	if (i2 == null || typeof i2 != "object") {
		d2.append(i2 || "...");
	}
	else {
		i2.forEach( (text) => {
			const div = document.createElement("div");
			div.append(text)
			d2.append(div);
		});
	}
	d3.replaceChildren();
	if (i3==null || typeof i3 != "object") {
		d3.append(i3 || "...");
	}
	else {
		i3.forEach( (text) => {
			const div = document.createElement("div");
			div.append(text)
			d3.append(div);
		});
	}

	if (img) {
		infoUrl.src = img;
		infoUrl.style.display="inline";
	}
	else {
		infoUrl.style.display="none";
	}
	d2.scroll(0, 0);
	d.style.visibility = "visible";
	// infoPopupTimer = setTimeout(() => {  d.style.visibility='hidden' } , 20000 );
}

///////////////////////////////////////////////////////////////////////////////////////
// Websocket / API management
///////////////////////////////////////////////////////////////////////////////////////
let ws = null;
let wsLastClose = null; // code du dernier close du ws
let wsTimerError = null; // prochain timer de "timeout erreur" du ws
let wsTimerPing = null; // prochain timer pour emission d'un ping
		
export function disconnectFromServer(user) {
	if (ws) {
		console.log("force disconnect: ws close en cours");
		try {
			ws.close();
			ws = null;
		}
		catch(e) {
			console.log("Erreur close ws", e);
		}
	}
	else
		console.log("force disconnect: ws non connecté");
		
}
function wsTimeout() {
	console.log("wsTimeout, soucis de mode background naviateur")
}
function wsPing() {
	console.log("wsPing",Math.floor(Date.now()/1000))
	clearTimeout(wsTimerPing)
	clearTimeout(wsTimerError)
	if (ws) ws.send( JSON.stringify({op: "ping"} ));
	wsTimerError = setTimeout(wsTimeout, 90000)
}

export async function connectToServer(cbStatus, cbMessage) {
		disconnectFromServer();
		console.log("WS init connect");
    ws = new WebSocket(wsUrl);
		console.log("WS connecting");
		ws.onmessage = (webSocketMessage) => {
			try{
				// console.log("webSocketMessage",webSocketMessage);
  		  const messageBody = JSON.parse(webSocketMessage.data);
	      // console.log("MsgFromWs:", messageBody);
				// traitement des messages standards
				switch(messageBody.op) {
					case "pong" :
						// Reception d'un pong, emission d'un ping sur timer
						clearTimeout(wsTimerError); // annule le timeout d'erreur
					  wsTimerPing = setTimeout(wsPing, 45000); // ping prochain
						break;
					case "erreur" :
						addNotification(messageBody.texte,"red",60);
						break;
					default :
						cbMessage(messageBody);
				}
			}
			catch(e) {
	      console.log("Exception/ws message", e);
				addNotification("Erreur: " + wsUrl + " e=" + e.toString(), "red");
			}
	  };
		ws.onopen = (ev) => { 
			const pseudo = loadIt("pseudo","");
			const pwd = loadIt("pseudoPwd", "");
			ws.send( JSON.stringify({op: "iam", pseudo: pseudo, pwd: pwd, lastClose: wsLastClose } ));
			wsPing(); // Démarrage de la sequence ping/pong
			cbStatus(1);
		};
		ws.onclose = (ev) => {
			wsLastClose = ev.code;
			console.log("WS close:",wsLastClose);
			clearTimeout(wsTimerPing)
			cbStatus(0);
			// Si la connexion est perdu....
			if (wsLastClose == 1005) {
				// le navigateur est passé en mode "hidden" pour le tab
				// pas de message, la reco est automatique
				console.log("WS reco normalement automatique")
				newInfoPopup("Déconnecté du server multijoueurs "+wsUrl,
										[
											"Ton équipement est probablement passé en veille.",
											"Si l'indicateur multijoueurs n'est pas vert dans le bandeau en haut, "+
											"il faut fermer la fenêtre du navigateur ou recharger la page"
										],
										"Si tu as trop de message de ce type, contacte Kikiadoc sur discord");
			}
			else {
				newInfoPopup("Déconnecté du server multijoueurs "+wsUrl,
										[
											"Le code technique est "+ wsLastClose,
											"Si l'indicateur multijoueurs n'est pas vert dans le bandeau en haut, "+
											"il faut fermer la fenêtre du navigateur, et recommencer",
											"Ce message peut-être normal si ton équipement passe en veille profonde"
										],
										"Si tu as trop de message de ce type, contacte Kikiadoc sur discord");
			}
		};
		ws.onerror = (ev) => {
			clearTimeout(wsTimerPing)
			cbStatus(2);
			addNotification("Erreur avec "+wsUrl+", contacter Kikiadoc sur discord","red",60);
		}; 
  };

// Retourne toujours un objet avec un champ status de code http
export async function apiCallExtern(url,method,body)
{
	try {
		const res = await fetch(url, {
			method: method? method: 'GET', 	
			mode: "cors",
			cache: "no-cache",
			body: (body)? JSON.stringify(body) : null
		});
	  const json = await res.json();
		json.status = res.status;
		if (res.status >= 300)
				addNotification("Erreur sur "+url+ ": "+json.msg+ "("+ res.status+ ") -- contactez Kikiadoc sur discord", "red", 60);
		return json;
	}
	catch(e) {
		console.log(e);
		addNotification("Erreur imprévue sur "+url+ ", contactez Kikiadoc sur discord","red",60);
		return { status: 503 };
	}
}
export async function apiCall(url,method, body)
{
	try {
		const user = loadIt("pseudo","");
		const pwd = loadIt("pseudoPwd", "")
		const res = await fetch(urlApi+url+"?u="+user+"&p="+pwd , {
			method: method? method: 'GET', 	
			mode: "cors",
			cache: "no-store",
			body: (body)? JSON.stringify(body) : null
		});
	  const json = await res.json();
		json.status = res.status;
		if (res.status >= 300)
				addNotification("Erreur sur "+urlApi+url+ ": "+json.msg+ "("+ res.status+ ") -- contactez Kikiadoc sur discord", "red", 60);
		return json;
	}
	catch(e) {
		console.log(e);
		addNotification("Erreur imprévue sur "+urlApi+url+ ", contactez Kikiadoc sur discord","red",60);
		return { status: 503 };
	}
}

///////////////////////////////////////////////////////////////////////////////////////
// GESTION DU STOCKAGE
///////////////////////////////////////////////////////////////////////////////////////

export function loadIt(cle,defaut)
{
	// console.log("loadIt:", cle);
	let valeur = localStorage.getItem(cle);
	try { valeur = (valeur==null) ? defaut : JSON.parse(valeur);	}
	catch(e)	{
		console.log("loadIt error: ",e);
		valeur=defaut;
	}
	return valeur;
}

export function storeIt(cle,valeur)
{
	let xVal = JSON.stringify(valeur);
	console.log("storeIt:", cle);
	localStorage.setItem(cle, xVal);
}

export function removeIt(cle)
{
	localStorage.removeItem(cle);
}

export function clearStorage()
{
	if (confirm("Attention, si tu effaces tes données locales, "+
							"tu devras contacter Kikiadoc sur discord pour t'autoriser une nouvelle identification sécurisée "+
							"et tu devras resaisir tout ce que tu as déjà indiqué pour continuer!  Es-tu sûr ?")) {
		localStorage.clear();
		location.reload();
		alert("Vos données locales ont été effacées, si vous voyez ce message, fermez le navigateur ou l'application pour terminer le ménage !");
	}
	return;
}

///////////////////////////////////////////////////////////////////////////////////////
// GESTION DES HAUT FAITS
///////////////////////////////////////////////////////////////////////////////////////
export function hautFait(hf,lvl) {
	if (hf && lvl) apiCall("/hautsFaits/"+hf+"/"+lvl,'PUT');
}


///////////////////////////////////////////////////////////////////////////////////////
// GESTION DE L'AUDIO
///////////////////////////////////////////////////////////////////////////////////////
const urlMp3 = 'https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/';
const audioDescs = {
	"oracle" : { mp3: urlMp3+"oracle.mp3#t=00:00:00", vol: 0.6 },
	"peergynt" : { mp3: urlMp3+"Peer-gynt.mp3#t=00:00:50", vol: 1.1, repeat:1 },
	"Help" : { mp3: urlMp3+"Help.mp3#t=00:00:00", vol: 1.0 },
	"QueenMagic" : { mp3: urlMp3+"QueenMagic.mp3#t=00:00:00", vol: 1.1 },
	"Camelot" : { mp3: urlMp3+"Camelot.mp3#t=00:00:00", vol: 0.9, repeat: 1 },
	"BlaBlaBla": { mp3: urlMp3+"BlaBlaBla.mp3#t=00:00:00", vol: 0.8, transient: 1 },
	"Patience": { mp3: urlMp3+"Patience.mp3#t=00:00:00", vol: 0.7 },
	"Amelie": { mp3: urlMp3+"Amelie.mp3#t=00:00:00", vol: 0.7 },
	"call-to-attention": { mp3: urlMp3+"call-to-attention.mp3#t=00:00:00", vol: 0.7 },
	"phrase-suivante": { mp3: urlMp3+"phrase-suivante.mp3#t=00:00:00", vol: 0.7 },
	"Wonderful": { mp3: urlMp3+"Wonderful.mp3#t=00:00:00", vol: 0.7 }, 
	"May": { mp3: urlMp3+"May.mp3#t=00:00:10", vol: 1.2, repeat:1 },
	"Wald": { mp3: urlMp3+"Waldschrein.mp3#t=00:00:10", vol: 0.5 },
	"Benabar-foret-extrait":  { mp3: urlMp3+"Benabar-foret-extrait.mp3#t=00:00:00", vol: 0.5, repeat: 1 },
	"Ding":  { mp3: urlMp3+"Ding.mp3#t=00:00:00", vol: 3.0 },
	"prout-long":  { mp3: urlMp3+"prout-long.mp3#t=00:00:00", vol: 1.0 },
	"prout-court":  { mp3: urlMp3+"prout-court.mp3#t=00:00:00", vol: 1.0 },
	"Shame":  { mp3: urlMp3+"Shame.mp3#t=00:00:42", vol: 1.5 },
	"Memory":  { mp3: urlMp3+"Memory.mp3#t=00:00:00", vol: 2.0, transient: 1 },
	"Mauvaise":  { mp3: urlMp3+"Mauvaise.mp3#t=00:00:00", vol: 3.0, transient: 1 },
	"Au revoir":  { mp3: urlMp3+"Au revoir.mp3#t=00:00:00", vol: 1.0, transient: 1 },
	"Viens":  { mp3: urlMp3+"Viens.mp3#t=00:00:30", vol: 1.0, transient: 1 },
	"Come":  { mp3: urlMp3+"Come.mp3#t=00:00:00", vol: 2.0, transient: 1 },
	"Money":  { mp3: urlMp3+"Money.mp3#t=00:00:47", vol: 1.0, transient: 1 },
	"Alice":  { mp3: urlMp3+"Alice.mp3#t=00:00:00", vol: 1.0 },
	"Alex-nes":  { mp3: urlMp3+"Alex-nes.mp3#t=00:00:00", vol: 1.0, repeat: 1 },
	"Demons":  { mp3: urlMp3+"Demons.mp3#t=00:00:00", vol: 1.0, repeat: 1 },
	"BienMal":  { mp3: urlMp3+"BienMal.mp3#t=00:00:00", vol: 1.0, repeat: 1 },
	"CitesDor":  { mp3: urlMp3+"CitesDor.mp3#t=00:00:00", vol: 1.0, repeat: 0 },
	"SweetDreams":  { mp3: urlMp3+"SweetDreams.mp3#t=00:00:00", vol: 1.2, repeat: 0 },
	"Muppet":  { mp3: urlMp3+"Muppet.mp3#t=00:00:00", vol: 0.9, repeat: 0 }
};

// flag d'arret musique d'ambiance
let audioAmbiance = loadIt('audioAmbiance',true);
let audioIgnorePauseEvent = false; // cas particulier d'une pause demandé, par exemple avant une video, pour ne pas basculer le mode d'ambiance
// attentio, le audioVolume est entre 0 et 1, mais le truc stocke est entre 0 et 100
let audioVolume = loadIt('audioVolume',30)/100; // mofiable par le main

// Mofif du facteur de volume par le main (entre 0 et 100)
export function setupAudio(vol) {
	storeIt('audioVolume', vol);
	// audiovolume pour calcul entre 0 et 1
	audioVolume = vol/100;
}

// Calcul le volume mixé (pour les components)
export function getMixedAudioVolume(vol) {
	return Math.min(audioVolume*vol,1.0);
}

// calcul du volume des musiques
function getSpecAudioByName(nom) {
	let selected = audioDescs[nom];
	if (selected == null || selected == undefined) {
		console.log("mixer issue:",nom);
		addNotification("Mixer audio param issue: " +nom+ ", contacter Kikiadoc sur discord",'red',60); 
		selected = audioDescs.oracle;
	}
	console.log("Sound:"+nom,"audioVolume:"+audioVolume, "selVol:", selected.vol,"mixVol:",Math.min(selected.vol*audioVolume,1.0)); 
	return { url: selected.mp3,	vol: Math.min(selected.vol*audioVolume,1.0), repeat: selected.repeat, transient: selected.transient };
};

// test si un DOM e est en cours d'audio playing
function isAudioPlaying(e) {
	return e && e.currentTime > 0 && !e.paused && !e.ended && e.readyState > 2;
}

// si pas de fond sonore (onclick sur document)
let audioTryDone = false;
export function audioTry() {
	if (audioTryDone) return;
	const ap=document.getElementById("musique");
	if (ap && (ap.src.indexOf('#')==-1) ) {
		audioTryDone = true;
		if (!audioAmbiance) { addNotification("Musique d'ambiance désactivée, clic sur ▶ en bas pour la réactiver","orange",10)}
		playSound(loadIt('lastMusic',"oracle"));
	}
}
export function playSound(music,force) {
	let ap=document.getElementById("musique");
	if (! ap)	return;
	if (music==null) { playDing(); return }
	let nom = "oracle";
	if (typeof music != "string") 
		addNotification("Erreur sur playSound, object is deprecated, contactez Kikiadoc","red",30);
	else
		nom = music;

	let newAudio = getSpecAudioByName(nom);
	if (! newAudio.transient)  storeIt('lastMusic',nom);

	if (force || (ap.src != newAudio.url)) {
		// console.log("Sound:",newAudio); 
		// ap.pause();
		ap.src = newAudio.url;
		ap.loop = false;
		ap.muted = false;
		ap.volume = newAudio.vol;
		if (audioAmbiance)
			ap.play();
		if (!ap.onpause) ap.onpause = function(e) {
			// addNotification("Musique pause","green",5);
			// Si pause demandé par l'appli, on ignore le switch de mode d'ambiance
			if (audioIgnorePauseEvent) { audioIgnorePauseEvent=false; return; }
			if (audioAmbiance) {
				storeIt('audioAmbiance',audioAmbiance=false);
				// addNotification("Musique d'ambiance désactivée","orange",5);
			}
		}
		if (!ap.onplay) ap.onplay = function(e) {
			// addNotification("Musique play","green",5);
			if (! audioAmbiance) {
				storeIt('audioAmbiance',audioAmbiance=true);
				// addNotification("Musique d'ambiance activée","green",5);
			}
		}
		if (!ap.onended) ap.onended = function() {
			// addNotification("Musique ended","green",5);
			const backGroundName=loadIt('lastMusic','peergynt');
			let backGround=getSpecAudioByName(backGroundName);
			if (!backGround.repeat) backGround=getSpecAudioByName('peergynt');
			console.log("audio finie", backGround);
			ap.volume = backGround.vol;
			ap.src= backGround.url
			ap.play();
		};
		if (!ap.onseeked) ap.onseeked = function() {
			// addNotification("Musique seeked","green",5);
		}
	}
	else
		console.log("Musique inchangée");
}
export function playDing(mp3) {
	let ap=document.getElementById("ding");
	if (! ap)	return;
	let ding=getSpecAudioByName(mp3 || "Ding");
	// console.log("ding:",ding); 
	// ap.pause();
	ap.src=ding.url;
	ap.loop= false;
	ap.volume = ding.vol;
	ap.muted = false;
	ap.play(); 
}

export function audioPause() {
	let ap=document.getElementById("musique");
	if (ap && ap.src.indexOf("mp3")>0) { audioIgnorePauseEvent=true; ap.pause();  }
}

export function audioResume() {
	let ap=document.getElementById("musique");
	if (ap && ap.src.indexOf("mp3")>0 && audioAmbiance) ap.play();
}

///////////////////////////////////////////////////////////////////////////////////////
// GESTION DE LA VIDEO
///////////////////////////////////////////////////////////////////////////////////////
let videoCb=null;

// tTime == "d,e" ou d est le début et e la fin
export function playVideo(mp4,cb,dontStopMusique,tTime) {
	if (mp4==null) return;
	videoCb=cb;
	if (!dontStopMusique) audioPause();
	let divVideo = document.getElementById("divVideo");
	let video = document.getElementById("video");
	divVideo.style.display="block";
	video.src=urlImg+mp4+".mp4" + ((tTime)? "#t="+tTime :"") ;
	if (!dontStopMusique)
		video.volume= audioVolume*0.5;
	else
		video.volume=0;
	video.play();
}

export function closeVideo() {
	let divVideo = document.getElementById("divVideo");
	let video = document.getElementById("video");
	video.pause();
	// video.src=null; // affectation null cause un 404 !
	divVideo.style.display="none";
	audioResume();
	if (videoCb) videoCb();
}

	/////////////////////////////////////////////////////////////////////
	// Gestion du wakelock / visibility
	/////////////////////////////////////////////////////////////////////
let wakeLock = null;
let wakeTimerId = null;
async function requestWakeLock() {
	try {
		console.log("requestWakeLock");
		if (! navigator.wakeLock) {
			console.log("WakeLock non disponible");
			return;
		}
		if (wakeLock) wakeLock.release();
		wakeLock = await navigator.wakeLock.request();
		wakeLock.addEventListener('release', () => {
			console.log('Screen Wake Lock released:');
		});
		console.log('Wake Lock activé:');
		clearTimeout(wakeTimerId);
		wakeTimerId = setTimeout(() => {
							wakeLock.release();
							wakeLock = null;
		}, 4*3600000);
	}
	catch (err) {
			console.log("Erreur WakeLock", err);
	}
};
let lastVisibility = null;
function visibilityChange() {
	console.log('visibilityChange', document.visibilityState, "old:", lastVisibility);
	// Si changement de visibility
	if (lastVisibility != document.visibilityState) {
		lastVisibility = document.visibilityState;
		if (document.visibilityState=="visible") {
			audioResume();
			// le wakelock a du être annulé, on redemande
			requestWakeLock();
		}
		if (document.visibilityState=="hidden") {
			let audioBack = loadIt('audioBack',true);
			if (!audioBack)	audioPause();
		}
	}
}
export function startWakeLock() {
	console.log('startWakeLock');
	document.addEventListener("visibilitychange", visibilityChange );
	requestWakeLock();
}


///////////////////////////////////////////////////////////////////////////////////////
// Gestion de l'autorefresh du client
///////////////////////////////////////////////////////////////////////////////////////
const nbRefreshMilli = 3 * 60 * 60 * 1000;
setTimeout(() => { location.reload(); } , nbRefreshMilli );



