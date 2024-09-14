
const gbl = require('../infraback/gbl.js');
const collections = require('../infraback/collections.js');
const pseudos = require('../infraback/pseudos.js');
const wsserver = require('../infraback/wsserver.js');
const discord = require('../infraback/discord.js');

const USINESGAZCOLNAME="usinesGaz"
const UNLOCKDELAI = 60000 // 15*60000 // temps avant un nouvel unlock
const TROUVEDELAI = 120000 // 18*60*60000 // temp avant un nouveau trouvé
const OUVERTDELAI = 180000 // 28*60*60000 // temp d'ouverture d'un Avaloir

let etat = normalize(collections.get(USINESGAZCOLNAME,true))

let soluces = [
	/*  0 */ {x:3.3, y:19.5}, // station neuf
	/*  1 */ {x:0, y:0},
	/*  2 */ {x:0, y:0},
	/*  3 */ {x:0, y:0},
	/*  4 */ {x:0, y:0},
	/*  5 */ {x:0, y:0},
	/*  6 */ {x:0, y:0},
	/*  7 */ {x:0, y:0},
	/*  8 */ {x:0, y:0},
	/*  9 */ {x:31.5, y:7.5}, // L'hoirie recouvrée
	/* 10 */ {x:0, y:0},
	/* 11 */ {x:0, y:0},
	/* 12 */ {x:0, y:0},
	/* 13 */ {x:0, y:0},
	/* 14 */ {x:0, y:0},
	/* 15 */ {x:0, y:0},
	/* 16 */ {x:0, y:0},
	/* 17 */ {x:0, y:0},
	/* 18 */ {x:0, y:0},
	/* 19 */ {x:0, y:0},
	/* 20 */ {x:0, y:0},
	/* 21 */ {x:0, y:0},
	/* 22 */ {x:0, y:0},
	/* 23 */ {x:0, y:0},
	/* 24 */ {x:0, y:0},
	/* 25 */ {x:0, y:0},
	/* 26 */ {x:0, y:0},
	/* 27 */ {x:0, y:0},
	/* 28 */ {x:0, y:0},
	/* 29 */ {x:0, y:0},
	/* 30 */ {x:0, y:0},
	/* 31 */ {x:0, y:0},
	/* 32 */ {x:0, y:0},
	/* 33 */ {x:0, y:0},
	/* 34 */ {x:0, y:0},
	/* 35 */ {x:0, y:0},
	/* 36 */ {x:0, y:0},
	/* 37 */ {x:0, y:0},
	/* 38 */ {x:0, y:0},
	/* 39 */ {x:0, y:0}
]

function normalize(etat) {
	// etat.lieux[] = { status, unlockPseudo, unlockDth, findPseudo, findDth}
	etat.lieux ??= new Array(40)
	for (let i=0; i < 40; i++) etat.lieux[i] ??= new Object({status:"lock", i:i})
	etat.unlockDelai = UNLOCKDELAI
	etat.trouveDelai = TROUVEDELAI
	etat.ouvertDelai = OUVERTDELAI
	return etat
}

function syncClients() {
	wsserver.broadcastSimpleOp(USINESGAZCOLNAME,etat)
	collections.save(etat)
}

function getNbTrouve() {
	return etat.lieux.reduce((a,e)=>e.status=="trouve"? a+1: a,0)
}

function doTrouve(reqPaths,pseudo) {
	const i= gbl.checkInt(reqPaths[3],0,39)
	const x= gbl.checkFloat(reqPaths[4],0.0,99.9)
	const y= gbl.checkFloat(reqPaths[5],0.0,99.9)
	const lieu=etat.lieux[i]
	if (lieu.status!="unlock") gbl.exception('Deja trouve, client unsynch?',400)
	// vérif du timer
	if (Date.now() > lieu.unlockDth+OUVERTDELAI) gbl.exception('ouvertDelai... client unsyinch',400)
	// verif des coordonnées
	if ( !gbl.isDistance(x,y,soluces[i].x,soluces[i].y,0.2)) gbl.exception("via ws",201)
	// coodonnées OK
	lieu.status="trouve"
	lieu.trouvePseudo=pseudo
	lieu.trouveDth=Date.now()
	syncClients()
	// msg discord...
	const nbTrouve = getNbTrouve()
	const termine = nbTrouve==etat.lieux.length
	discord.postMessage("hegemonie", 
			"**Challenge des Avaloirs**\n\n"+ pseudo + " a découvert l'extrémité de l'avaloir #"+i + " de la station Alpha \n\n" +
			( (termine)? ("C'était le dernier, le challenge est terminé"+ "\n<"+gbl.pCloudUrl+"ff-7/ff-7-stationalpha-final.mp4>")
				   			 : ("Il en reste "+(etat.lieux.length-nbTrouve)+" à découvrir.") )
		, true)
	gbl.exception( {termine: termine, nbTrouve: nbTrouve} ,200)
}

exports.httpCallback = async (req, res, method, reqPaths, body, pseudo, pwd) => {
	pseudos.check(pseudo,pwd);
	switch (method) {
		case "OPTIONS":
			res.setHeader('Access-Control-Allow-Methods', 'DELETE');
			gbl.exception("AllowedCORS",200);
		case "GET":
			gbl.exception(etat,200)
		case "POST":
			switch(reqPaths[2]) {
				case "unlock":
					let i= gbl.checkInt(reqPaths[3],0,39)
					if (etat.lieux[i].status!="lock") gbl.exception('Pas lock, client unsynch?',400)
					etat.lieux[i].status="unlock"
					etat.lieux[i].unlockPseudo=pseudo
					etat.lieux[i].unlockDth=Date.now()
					syncClients()
					gbl.exception("via ws",200)
				case "trouve":
					doTrouve(reqPaths,pseudo)
			}
			gbl.exception("bad PUT",400)
		case "DELETE":
			pseudos.check(pseudo,pwd,true); // admin
			switch(reqPaths[2]) {
				case "admResetChallenge":
					etat.lieux = null
					normalize(etat)
					syncClients()
					gbl.exception(etat,200)
				case "admResetTimers":
					let userId = reqPaths[3] || pseudo	
					for (let i=0; i<40; i++) {
						if (etat.lieux[i].trouvePseudo==userId) { etat.lieux[i].trouveDth=0 }
						if (etat.lieux[i].unlockPseudo==userId) { etat.lieux[i].unlockDth=0 }
					}
					syncClients()
					gbl.exception(etat,200)
			}
			gbl.exception("bad DELETE",400)
	}
	gbl.exception("bad meth usinesGaz",400)
}


console.log("usinesGaz loaded");

