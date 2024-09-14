
const gbl = require('../infraback/gbl.js');
const collections = require('../infraback/collections.js');
const pseudos = require('../infraback/pseudos.js');
const wsserver = require('../infraback/wsserver.js');
const discord = require('../infraback/discord.js');
const pnjs = require('../inframain/pnjs.js');
const uploadFile = require('../inframain/uploadFile.js');

const DELAYRECHERCHE=30*60000
const DELAYPRISON=24*60*60000 // delai de sortie automatique de la prison
const DELAYTROUVEBASE=30*60000
const DELAYTROUVECOEF=120*60000
const DELAYFAIL=15*60000

const DOCTRINECOLNAME="doctrineDuMal"
const DOCTRINE="Doctrine du mal"
const DOCTRINELEN=DOCTRINE.length

const CHANCEPRISON=0.15
const CHANCEGAGNE=0.8
const CHANCEPATCH=0.05 // bonus par patch du jeu donne jusque .35 de chance en +

const DISTANCEVALIDE=0.4

const IMAGEMIN=20000
const IMAGEMAX=10000000

let ctx = normalize(collections.get(DOCTRINECOLNAME,true))

function normalize(ctx) {
	ctx.pseudos ??= {}	// activité du pseudo
	ctx.trouves ??= new Array(DOCTRINE.length) // indexé par la string DOCTRINE
	return ctx
}

function syncClients() {
	wsserver.broadcastSimpleOp(DOCTRINECOLNAME,ctx)
	collections.save(ctx)
}

// compte le nobre de runes trouvees par le pseudo
function nbTrouve(pseudo) {
	return ctx.trouves.reduce( (a, c) => a + ((c && c.pseudo==pseudo)? 1: 0) ,0)
}

// compte le nobre de runes NON trouvees
function nbNonTrouve() {
	return ctx.trouves.reduce( (a, c) => a - ((c && c.pseudo)? 1: 0) ,DOCTRINE.length)
}


// propsition: retourne 200 si tentative acceptée, 201 si refusée car inchérence dans la DB garland
async function tentative(pseudo,i,pnjId) {
	// verfi du timer (il faut que le précédent timer soit echu)
	if (ctx.pseudos[pseudo] && ctx.pseudos[pseudo].dthFin < Date.now) gbl.exception("timer non echu, client desynch",400)
	// verif param
	let iRune = gbl.checkInt(i,0,DOCTRINE.length-1)
	// charge et verif DB garland
	let pnjDesc = await pnjs.getById(pnjId,pseudo)
	if (!pnjDesc || !pnjDesc.garland || !pnjDesc.garland.npc || ! pnjDesc.garland.npc.coords) gbl.exception("Garland incomplet "+pnjId,201)
	// timer ok
	ctx.pseudos[pseudo]={etat: "tentative", iRune: iRune, pnjId: pnjId, nom: pnjDesc.nom, l: pnjDesc.l, loc: pnjDesc.loc, dthFin: Date.now()+DELAYRECHERCHE }
	syncClients()
	gbl.exception("via ws",200)
}

// propsition: retourne 200 si rune trouvée, 201 si erreur coord, 202 si rune failed, 203 si capturé
async function proposition(pseudo,pX,pY,imageBody) {
	// verfi params
	let x = parseFloat(pX)
	let y = parseFloat(pY)
	if (!x || !y) gbl.exception("doctrine du mal, bad coords par client",400)
	if (imageBody.lenght < IMAGEMIN) gbl.exception("doctrine du mal, image trop petite par client",400)
	if (imageBody.lenght > IMAGEMAX) gbl.exception("doctrine du mal, image trop grande par client",400)
	
// contexte du pseudo
	let ctxPseudo = ctx.pseudos[pseudo]
	console.log("ctxPseudo=",ctxPseudo)
	if (!ctxPseudo || ctxPseudo.etat!="tentative" ) gbl.exception("doctrine du mal, erreur de logique client",400)
	// verfi du timer et si échéance, comme si failed
	if (ctxPseudo.dthFin < Date.now()) gbl.exception("timer echu",202)
	// recupere la description complete du pnj
	let pnjDesc = await pnjs.getById(ctxPseudo.pnjId,pseudo)
	// verif coordonnees dans la DB
	if (!pnjDesc || !pnjDesc.garland || !pnjDesc.garland.npc || ! pnjDesc.garland.npc.coords) gbl.exception("garlandDB corruption, id="+ctxPseudo.pnjId+",contacte immediatement Kikiadoc",400)
	// verif distance a 0.2 près
	let tX = pnjDesc.garland.npc.coords[0]
	let tY = pnjDesc.garland.npc.coords[1]
	console.log("ccord:",x,y,tX,tY)
	if (! gbl.isDistance(x,y,tX,tY,DISTANCEVALIDE) ) gbl.exception("erreur de coordonnées",201)
	// les coordonnées sont les bonnes...	
	// calcul des chances
	let chance = Math.random()
	let chanceBonus = CHANCEPATCH * (pnjDesc.garland.npc.patch || 1)
	console.log("chance/chanceBonus:",chance,chanceBonus)
	// si pas de chance, aller en prison...
	if (chance <= CHANCEPRISON) {
		ctx.pseudos[pseudo]={etat: "prison", dthFin: Date.now()+DELAYPRISON }
		syncClients()
		gbl.exception("go prison",203)
	}
	// si pas trouvé avec bonus, pas de bol
	if (chance+chanceBonus < CHANCEGAGNE) {
		ctx.pseudos[pseudo]={etat: "relax", dthFin: Date.now()+DELAYFAIL }
		syncClients()
		gbl.exception("perdu",202)
	}
	// rune trouvée...
	console.log("Rune trouvee pseudo/#rune/dejatrouve:",pseudo, ctxPseudo.iRune, nbTrouve(pseudo) )
	await uploadFile.uploadFileByName("doctrineDuMal-"+ctxPseudo.iRune,imageBody, pseudo)
	ctx.trouves[ctxPseudo.iRune] = { iRune: ctxPseudo.iRune, lettre: DOCTRINE.charAt(ctxPseudo.iRune) , pseudo: pseudo, dth: Date.now() }
	ctx.pseudos[pseudo]={etat: "relax", dthFin: Date.now()+DELAYTROUVEBASE+(DELAYTROUVECOEF*(nbTrouve(pseudo)-1)) }
	syncClients()
	const nbRestant = nbNonTrouve()
	const trailer = (nbRestant<=0)?  "\nToutes les runes sont trouvées, **le challenge est terminé**" : (nbRestant==1)? "\nIl reste une rune à découvrir" : "\nIl reste "+nbRestant+" runes à découvrir"; 
	discord.postMessage("hegemonie","**Challenge de la Doctrine**\n"+pseudo+" a découvert la rune #"+(ctxPseudo.iRune+1)+trailer)
	gbl.exception(ctx.trouves[ctxPseudo.iRune],200)
}

async function sortiePrison(pseudo) {
	ctx.pseudos[pseudo]={etat: "relax", dthFin: Date.now()+DELAYFAIL }
	syncClients()
	gbl.exception("sortie de prison, via ws",200)
}
exports.httpCallback = async (req, res, method, reqPaths, body, pseudo, pwd) => {
	pseudos.check(pseudo,pwd);
	switch (method) {
		case "OPTIONS":
			res.setHeader('Access-Control-Allow-Methods', 'PUT, PATCH, DELETE');
			gbl.exception("AllowedCORS",200);
		case "GET":
			gbl.exception(ctx,200)
		case "POST":
			switch(reqPaths[2]) {
				case "proposition":
					await proposition(pseudo,reqPaths[3],reqPaths[4],body)
			}
			gbl.exception("bad POST",400)
		case "PUT":
			switch(reqPaths[2]) {
				case "tentative":
					await tentative(pseudo,reqPaths[3],reqPaths[4])
				case "sortiePrison":
					await sortiePrison(pseudo)
			}
			gbl.exception("bad PUT",400)
		case "PATCH":
			pseudos.check(pseudo,pwd,true); // admin
			ctx.pseudos[pseudo]={etat: "relax", dthFin: Date.now() }
			syncClients()
			gbl.exception("via ws",200)
		case "DELETE":
			pseudos.check(pseudo,pwd,true); // admin
			ctx = collections.reset(DOCTRINECOLNAME)
			ctx = normalize(ctx)
			syncClients()
			gbl.exception("via ws",200)
	}
	gbl.exception("bad meth doctrineDuMal",400)
}


console.log("doctrineDuMal loaded");

