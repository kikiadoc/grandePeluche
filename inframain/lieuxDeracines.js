
const gbl = require('../infraback/gbl.js');
const collections = require('../infraback/collections.js');
const wsserver = require('../infraback/wsserver.js');
const pseudos = require('../infraback/pseudos.js');

let initStatus = [
	{ x: 22.3, y: 26.2, zone: "Forêt de l'est"         ,l:  0, pub: { tLoc: 20, d:0.1, txt: "#1"  , tTime:"0:00:15", r:"∀" } },
	{ x: 21.8, y: 17.8, zone: "Il mheg"                ,l:  1, pub: { tLoc: 30, d:0.1, txt: "#2"  , tTime:"0:00:20", r:"∂" } },
	{ x: 21.5, y: 38.5, zone: "Kholusia"               ,l:  2, pub: { tLoc: 10, d:0.1, txt: "#3"  , tTime:"0:00:20", r:"Ж" } },
	{ x: 18.5, y: 14.6, zone: "Noscéa centrale"        ,l:  3, pub: { tLoc: 25, d:0.1, txt: "#4"  , tTime:"0:00:20", r:"Љ" } },
	{ x: 30.3, y: 24.2, zone: "Haute noscéa"           ,l:  4, pub: { tLoc: 17, d:0.1, txt: "#5"  , tTime:"0:00:20", r:"Ф" } },
	{ x: 17.5, y: 25.3, zone: "Avant-pays Dravanien"   ,l:  5, pub: { tLoc: 29, d:0.1, txt: "#6"  , tTime:"0:00:20", r:"Ҕ" } },
	{ x: 31.4, y: 36.8, zone: "Coerthas occidental"    ,l:  6, pub: { tLoc: 11, d:0.1, txt: "#7"  , tTime:"0:00:20", r:"б" } },
	{ x: 22.6, y: 30.6, zone: "Thanalan septentrional" ,l:  7, pub: { tLoc:  5, d:0.1, txt: "#8"  , tTime:"0:00:20", r:"Ѭ" } },
	{ x: 13.0, y: 34.5, zone: "Les Lacs"               ,l:  8, pub: { tLoc: 18, d:0.1, txt: "#9"  , tTime:"0:00:20", r:"П" } },
	{ x:  6.1, y: 24.7, zone: "Les Steppes d'Azim"     ,l:  9, pub: { tLoc: 26, d:0.1, txt: "#10" , tTime:"0:00:20", r:"Ђ" } },
	{ x: 22.3, y: 11.6, zone: "Mer de rubis"           ,l: 10, pub: { tLoc:  3, d:0.1, txt: "#11" , tTime:"0:00:20", r:"Я" } },
	{ x: 13.8, y:  8.5, zone: "Khugane"                ,l: 11, pub: { tLoc: 24, d:0.1, txt: "#12" , tTime:"0:00:20", r:"Ѩ" } },
	{ x: 16.6, y: 28.7, zone: "Forêt du nord"          ,l: 12, pub: { tLoc: 34, d:0.1, txt: "#13" , tTime:"0:00:20", r:"Ѯ" } },
	{ x: 22.1, y:  5.1, zone: "Mor Dhona"              ,l: 13, pub: { tLoc: 14, d:0.1, txt: "#14" , tTime:"0:00:20", r:"Ӣ" } },
	{ x: 28.8, y: 24.6, zone: "Noscéa orientale"       ,l: 14, pub: { tLoc:  6, d:0.1, txt: "#15" , tTime:"0:00:20", r:"Ӹ" } },
	{ x: 26.7, y: 21.1, zone: "Forêt centrale"         ,l: 15, pub: { tLoc: 31, d:0.1, txt: "#16" , tTime:"0:00:20", r:"ל" } },
	{ x: 36.6, y: 16.3, zone: "Thavnair"               ,l: 16, pub: { tLoc: 35, d:0.1, txt: "#17" , tTime:"0:00:20", r:"צ" } },
	{ x:  5.0, y:  3.4, zone: "Doma"                   ,l: 17, pub: { tLoc:  2, d:0.1, txt: "#18" , tTime:"0:00:20", r:"ש" } },
	{ x: 23.8, y:  9.3, zone: "Azys Lla"               ,l: 18, pub: { tLoc: 36, d:0.1, txt: "#19" , tTime:"0:00:20", r:"ͻ" } },
	{ x: 39.8, y: 18.8, zone: "Azys Lla"               ,l: 19, pub: { tLoc: 19, d:0.1, txt: "#20" , tTime:"0:00:20", r:"Π" } },
	{ x: 31.8, y: 39.3, zone: "Pays Dravanien"         ,l: 20, pub: { tLoc: 38, d:0.1, txt: "#21" , tTime:"0:00:20", r:"γ" } },
	{ x: 12.8, y:  9.4, zone: "Kholusia"               ,l: 21, pub: { tLoc:  7, d:0.1, txt: "#22" , tTime:"0:00:20", r:"ε" } },
	{ x: 31.0, y:  5.3, zone: "Les Pics"               ,l: 22, pub: { tLoc: 21, d:0.1, txt: "#23" , tTime:"0:00:20", r:"θ" } },
	{ x: 33.4, y: 28.7, zone: "Elpis"                  ,l: 23, pub: { tLoc: 37, d:0.1, txt: "#24" , tTime:"0:00:20", r:"λ" } },
	{ x: 32.4, y: 25.3, zone: "Pays Dravanien"         ,l: 24, pub: { tLoc:  0, d:0.1, txt: "#25" , tTime:"0:00:20", r:"ξ" } },
	{ x: 38.5, y: 12.7, zone: "Pays Dravanien"         ,l: 25, pub: { tLoc: 28, d:0.1, txt: "#26" , tTime:"0:00:20", r:"փ" } },
	{ x: 17.0, y: 22.1, zone: "Coerthas occidental"    ,l: 26, pub: { tLoc:  8, d:0.1, txt: "#27" , tTime:"0:00:20", r:"֍" } },
	{ x: 20.4, y: 21.3, zone: "Noscéa orientale"       ,l: 27, pub: { tLoc:  1, d:0.1, txt: "#28" , tTime:"0:00:20", r:"ք" } },
	{ x: 17.8, y: 30.4, zone: "Forêt du sud"           ,l: 28, pub: { tLoc: 15, d:0.1, txt: "#29" , tTime:"0:00:20", r:"Ϗ" } },
	{ x: 22.8, y: 21.1, zone: "Thanalan oriental"      ,l: 29, pub: { tLoc: 32, d:0.1, txt: "#30" , tTime:"0:00:20", r:"Ϣ" } },
	{ x: 34.8, y: 18.2, zone: "Les marges"             ,l: 30, pub: { tLoc: 23, d:0.1, txt: "#31" , tTime:"0:00:20", r:"Ϯ" } },
	{ x: 28.6, y: 27.4, zone: "Forêt du nord"          ,l: 31, pub: { tLoc: 39, d:0.1, txt: "#32" , tTime:"0:00:20", r:"Ώ" } },
	{ x: 33.7, y: 22.9, zone: "Ecume de Dravania"      ,l: 32, pub: { tLoc: 12, d:0.1, txt: "#33" , tTime:"0:00:20", r:"Ξ" } },
	{ x: 17.4, y: 26.3, zone: "Forêt de l'est"         ,l: 33, pub: { tLoc: 33, d:0.1, txt: "#34" , tTime:"0:00:20", r:"β" } },
	{ x: 22.5, y: 23.2, zone: "Mare Lamentorum"        ,l: 34, pub: { tLoc:  9, d:0.1, txt: "#35" , tTime:"0:00:20", r:"α" } },
	{ x: 14.6, y: 18.8, zone: "Thanalan occidental"    ,l: 35, pub: { tLoc: 27, d:0.1, txt: "#36" , tTime:"0:00:20", r:"Ϡ" } },
	{ x: 20.5, y: 26.0, zone: "Thanalan occidental"    ,l: 36, pub: { tLoc: 13, d:0.1, txt: "#37" , tTime:"0:00:20", r:"Ͷ" } },
	{ x: 37.2, y: 25.1, zone: "Ultima Thule"           ,l: 37, pub: { tLoc:  4, d:0.1, txt: "#38" , tTime:"0:00:20", r:"δ" } },
	{ x:  9.9, y: 13.8, zone: "Brumée"                 ,l: 38, pub: { tLoc: 22, d:0.1, txt: "#39" , tTime:"0:00:20", r:"ΰ" } },
	{ x: 12.2, y: 12.0, zone: "Hisgard l'assise"       ,l: 39, pub: { tLoc: 16, d:0.1, txt: "#40" , tTime:"0:00:20", r:"Ϣ" } }
];

let questions = [
 { c:"Chambre du temps"          ,r:0,q:"A coté de quel pnj est L'orchestion de table?"                             ,p:["Eon","Chronos","Kairos"] },
 { c:"Chambre du temps"          ,r:1,q:"A coté de quel pnj est le livre de correspondance?"                        ,p:["Eon","Chronos","Kairos"] },
 { c:"Chambre du temps"          ,r:2,q:"Combien y a-t-il d'horloges sur le mur derrière Kairos?"                   ,p:[1,2,3,4,5,6] },
 { c:"Chambre du temps"          ,r:3,q:"Combien de piédestaux dans la salle de Kairos"                             ,p:[3,6,9,12,15] },
 { c:"Chambre du temps"          ,r:3,q:"Combien de torches murales EN TOUT derrière Eon, Chronos et Kairos"        ,p:[1,2,3,4,5,6] },
 { c:"Le pont de l'Enterprise"   ,r:4,q:"Combien d'écrans panoramiques permettent de voir un reflet (lune)"         ,p:[1,2,3,4,5,6] },
 { c:"Le pont de l'Enterprise"   ,r:1,q:"Quelle est la couleur des fleurs (lupins) derrière le commandant Kirk"     ,p:["blanc","violet","vert","noir","jaune","bleu"] },
 { c:"Le pont de l'Enterprise"   ,r:4,q:"Combien de moniteurs sont incrustés dans le panneau derrière Mr Spock"     ,p:[1,2,3,4,5,6,7] },
 { c:"Le pont de l'Enterprise"   ,r:2,q:"Combien de panneaux indiquent le danger du réacteur au sud ouest du pont?" ,p:[0,1,2,3,4] },
 { c:"Le pont de l'Enterprise"   ,r:4,q:"Quel est la couleur de l'uniforme de Nyota Uhura"                          ,p:["jaune","noir","vert","bleu","rouge"] },
 { c:"Le pont de l'Enterprise"   ,r:3,q:"Quel est la couleur de l'uniforme de Mr Spock"                             ,p:["jaune","noir","vert","bleu","rouge"] },
 { c:"Chambre du 4ème pouvoir"   ,r:4,q:"Combien de lampes carbuncles éclairent les tables du 4ème pouvoir"         ,p:[2,3,4,5,6,7,8] },
 { c:"Chambre du 4ème pouvoir"   ,r:5,q:"Combien de lampes 'col de cygne' éclairent les tables et les tableaux"     ,p:[0,2,4,6,8,10] },
 { c:"Chambre du 4ème pouvoir"   ,r:4,q:"Combien de tableaux sont exposés sur les murs"                             ,p:[0,1,2,3,4,6,8] },
 { c:"Chambre de la force"       ,r:5,q:"Combien de flambeaux éclairent la chambre"                                 ,p:[1,2,3,4,5,6,8] },
 { c:"Chambre de la force"       ,r:0,q:"Quel est couleur de la fleur la plus proche de Yoda"                       ,p:["blanc","multicolore","noir","jaune","vert","rouge"] },
 { c:"Chez l'Oracle des Savoirs" ,r:4,q:"Combien d'affiches ou tableaux dans le coin secret du sud ouest"           ,p:[0,1,2,3,4,5,6,7,8] },
 { c:"Chez l'Oracle des Savoirs" ,r:2,q:"Combien d'affiches ou tableaux dans le coin secret du nord ouest"          ,p:[0,1,2,3,4,5,6,7,8] },
 { c:"Chez l'Oracle des Savoirs" ,r:3,q:"Combien d'affiches ou tableaux dans le coin secret du nord est"            ,p:[0,1,2,3,4,5,6,7,8] },
 { c:"Chez l'Oracle des Savoirs" ,r:6,q:"Combien d'affiches ou tableaux dans le coin secret du sud est"             ,p:[0,1,2,3,4,5,6,7,8] },
 { c:"de la Gravitation"         ,r:5,q:"Combien de lampe du cristarium (flamme bleu)"                              ,p:[0,1,2,3,4,5,6,7,8] },
 { c:"de la Gravitation"         ,r:4,q:"Combien de peluche de Bunbuku en haut de la structure"                     ,p:[2,4,8,10,16,20,25] },
 { c:"Le labyrinthe"             ,r:5,q:"Quel est la couleur de la tenue de Dédale"                                 ,p:["blanc","noir","jaune","vert","bleu","rose"] },
 { c:"Le labyrinthe"             ,r:0,q:"Quel est le type d'orchestrion à gauche en entrant"                        ,p:["standard","de table", "phonographe"] },
 { c:"Le Kiki's Sauna"           ,r:2,q:"Combien de chopes de bière se trouvent sur le comptoir"                    ,p:[0,1,2,3,4] },
 { c:"Le Kiki's Sauna"           ,r:3,q:"Combien de tabourets 'champignon' se trouvent devant le comptoir"          ,p:[0,1,2,3,4] },
];

const matrixCol=4;

let currentStatus = { dthInit: Date.now() }

// infosStatiques
infosStatiques= { lieux: [], questions: questions }
for (let i=0; i < initStatus.length; i++) {
	infosStatiques.lieux[i] = {};
	infosStatiques.lieux[i] = Object.assign(infosStatiques.lieux[i],initStatus[i].pub);
}

// Contexte
let ctx = collections.get("lieuxDeracines",true)

// ctx::=
// tPseudo: pseudo de qui a trouvé
// tDth: dth de la découverte
// pCur: position actuelle
// pPseudo: pseudo qui a positionné au bon endroit
ctx.lieux ||= [];
for (let i=0; i < initStatus.length; i++) {
	ctx.lieux[i] ??= { }
	ctx.lieux[i].pCur ??= i
}

// sceptres
let sceptres = collections.get("lieuxDeracines_Sceptres",true)
sceptres.pseudos ??= {};
function sceptresInc(pseudo,n) {
	return sceptres.pseudos[pseudo] = (sceptres.pseudos[pseudo] || 0) + n
}
function sceptresGet(pseudo) {
	sceptres.pseudos[pseudo] ??= 0;
	return sceptres.pseudos[pseudo]
}

function clearTrouve(i) {
	ctx.lieux[i].tPseudo = null;
	ctx.lieux[i].tDth = null;
}
function clearTrouves() {
	for (let i=0; i < initStatus.length; i++) {
		clearTrouve(i);
	}
}
function resetCur() {
	for (let i=0; i < initStatus.length; i++) {
		ctx.lieux[i].pCur = i
	}
}

function getStatus() {
	return ctx;
}

// distance entre deux cases de la matrice
function distance(from,to) {
	let fx = Math.floor(from/matrixCol);
	let fy = from - fx*matrixCol;
	let tx = Math.floor(to/matrixCol);
	let ty = to - tx*matrixCol;
	let d = Math.abs(fx-tx) + Math.abs(fy-ty)
	// console.log("distance:",fromPos,to,d,fx,fy,tx,ty)
	return d
}


// pseudo indique reponse r a la question q
// 200: inc ok + nbSceptres, 202: bad rep
function resoudre(reqPaths,pseudo) {
	// recup parametres
	let q = parseInt(reqPaths[3],10);
	let r = parseInt(reqPaths[4],10);
	if (q===NaN || q<0 || q>=questions.length || r===NaN || r<0 ) gbl.exception("swap bad index",400);
	// verif reponse
	if (questions[q].r != r) gbl.exception( "bad reponse" ,202);
	// reponse ok
	let s = sceptresInc(pseudo, 1)
	gbl.exception( {s:s, m:"reponse ok"} ,200);
}

// pseudo echange runes from et rune to (indice du tableau, pas de la matrice)
function swapLieu(reqPaths,pseudo) {
	// recup coordonnées des lieux
	let from = parseInt(reqPaths[3],10);
	let to = parseInt(reqPaths[4],10);
	if (from===NaN || from<0 || from>=initStatus.length || to===NaN || to<0 || to>=initStatus.length ) gbl.exception("swap bad index",400);
	// conversion en coordonnées de matric
	let fCur = ctx.lieux[from].pCur
	let tCur = ctx.lieux[to].pCur
	// recup des targets
	let fLoc = initStatus[from].pub.tLoc
	let tLoc = initStatus[to].pub.tLoc
	console.log("lieuxSwap:",from,"@",fCur,">",fLoc+" <-> ",to,"@",tCur,">",tLoc);
	// Verification des credits
	let s = sceptresGet(pseudo)
	let d = distance(fCur,tCur)
	if (d > s) gbl.exception( {s:s, m:"désynchro client, sceptre req>dispo:"+s },202)
	// Verification que pas en position finale
	if (fLoc == fCur) gbl.exception( {s:s, m:"désynchro client, rune vérouillée:"+fLoc },202)
	if (tLoc == tCur) gbl.exception( {s:s, m:"désynchro client, rune vérouillée:"+tLoc },202)
	// Permutation des lieux
	ctx.lieux[from].pCur = tCur
	ctx.lieux[to].pCur = fCur
	// nouveau solde
	s = sceptresInc(pseudo, -d)
	wsserver.broadcastSimpleOp("lieuxDeracines");
	gbl.exception( {s:s, m:"swap ok"} ,201);
}

function putLieu(reqPaths,pseudo) {
	let i = parseInt(reqPaths[3],10);
	let x = parseFloat(reqPaths[4]);
	let y = parseFloat(reqPaths[5]);
	if (isNaN(i) || isNaN(x) || isNaN(y)) gbl.exception("NaN param",400);
	if (i<0 || i>=initStatus.length) gbl.exception("bad index",400);
	// verif que l'element est a découvrir
	if (ctx.lieux[i].trouveDth) gbl.exception("dejà trouve, clienSynch ?",400);
	// verif des coords
	let tX = initStatus[i].x
	let tY = initStatus[i].y
	let tD = initStatus[i].pub.d
	// si bonnes coordonnées...
	if (x>=tX-tD && x<=tX+tD && y>=tY-tD && y<=tY+tD) {
		ctx.lieux[i].tPseudo = pseudo;
		ctx.lieux[i].tDth = Date.now();
		collections.save(ctx);
		sceptresInc(pseudo, 1)
		collections.save(sceptres);
		wsserver.broadcastSimpleOp("lieuxDeracines");
		wsserver.broadcastNotification("J'ai trouvé le lieu déraciné #"+(i+1),pseudo);
		gbl.exception("Ok",201);
	}
	// mauvaises coordonnées...
	gbl.exception("bad coordonnees",208);
}

exports.httpCallback = (req, res, method, reqPaths, body, pseudo, pwd) => {
	pseudos.check(pseudo,pwd);
	switch (method) {
		case "OPTIONS":
			res.setHeader('Access-Control-Allow-Methods', 'PUT, DELETE');
			gbl.exception("AllowedCORS",200);
		case "GET":
			switch(reqPaths[2]) {
				case "static":
					gbl.exception(infosStatiques,200)
				case "dynamic":
					gbl.exception(getStatus(),200)
			}
			gbl.exception("bad op",400)
		case "PUT":
			switch(reqPaths[2]) {
				case "trouve":
					putLieu(reqPaths,pseudo)
					break;
				case "swap":
					swapLieu(reqPaths,pseudo)
					break;
				case "resoudre":
					resoudre(reqPaths,pseudo)
					break;
			}
			gbl.exception("bad op",400)
		case "DELETE":
			pseudos.check(pseudo,pwd,true); // admin
			switch(reqPaths[2]) {
				case "trouves":
					clearTrouves();
					wsserver.broadcastSimpleOp("lieuxDeracines");
					collections.save(ctx);
					gbl.exception("ok",200)
				case "sceptres":
					sceptres.pseudos = {};
					collections.save(sceptres)
					gbl.exception("ok",200)
			}
	}
}



console.log("lieuxderacines loaded");

