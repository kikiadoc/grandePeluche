#!/usr/bin/env node

const gbl = require('../infraback/gbl.js');
const pseudos = require('../infraback/pseudos.js');
const collections = require('../infraback/collections.js');
const httpserver = require('../infraback/httpserver.js');
const wsserver = require('../infraback/wsserver.js');
const phrasesDiscoveringEngine = require('../infraback/phrasesDiscoveringEngine.js');
const filRouge = require('../infraback/filRouge.js');
const votation = require('../infraback/votation.js');
const hautsFaits = require('../infraback/hautsFaits.js');
const broceliande = require('../infraback/broceliande.js');
const jetons = require('../infraback/jetons.js');
const tictactoes = require('../infraback/tictactoes.js');
const voirVideos = require('../infraback/voirVideos.js');
const discord = require('../infraback/discord.js');
const adminTest = require('../infraback/adminTest.js');
const deepAI = require('../infraback/deepAI.js');
const lieuxDeracines = require('../inframain/lieuxDeracines.js');

//
const uchronieFilRougeQr = require('../inframain/uchronieFileRougeQr.js').uchronieFilRougeQr;
let uchronieFilRouge = new filRouge (uchronieFilRougeQr,"uchronieFilRouge",55*60*1000, 65*60*1000) ;
//
const decouvrirJardins = require('../inframain/decouvrirJardins.js');

////////////// OLD FASHION !!
// Parametrage uchonieIntro
const uchronieIntroPhrases = [
		"Ceci est un message que nous, les Quatre, envoyons depuis l'Ortho-Temps",
		"En explorant une nouvelle dimension, nous faisons d'extraordinaires découvertes",
		"Ainsi, l'axe du temps classique n'est pas immutable",
		"On a vu des personnes disparaitre du présent classique et se retrouver ailleurs dans le passé",
		"Un objet peut changer d'aspect, des claviers changer la disposition de leurs touches",
		"Ces perturbations ont forcement une origine",
		"Selon Anakin, ce pourrait être un effet qui ne soit pas lié aux Dimensions",
		"Hikaru a appelé ce phénomène l'Uchronie, Luke l'a appelé la Magie",
		"Robin est certain que celà constitue une menace pour l'Univers Connu",
		"Grande Peluche, prépare des Chevaliers de l'Uchonie, c'est important. Amicalement, les Quatre"
] ;
let uchronieIntro = new	phrasesDiscoveringEngine (uchronieIntroPhrases,"uchronieIntro") ;
//////////////




async function httpCallback(req, res, method, reqPaths, body, pseudo, pwd) {
	switch(reqPaths[1]) {
		case "collections": collections.httpCallback(req, res, method, reqPaths, body, pseudo, pwd); break;
		case "uchronieFilRouge": uchronieFilRouge.httpCallback(req, res, method, reqPaths, body, pseudo, pwd); break;
		case "broceliande": broceliande.httpCallback(req, res, method, reqPaths, body, pseudo, pwd); break;
		case "jetons": jetons.httpCallback(req, res, method, reqPaths, body, pseudo, pwd); break;
		case "pseudos": pseudos.httpCallback(req, res, method, reqPaths, body, pseudo, pwd); break;
		case "hautsFaits": hautsFaits.httpCallback(req, res, method, reqPaths, body, pseudo, pwd); break;
		case "tictactoes": tictactoes.httpCallback(req, res, method, reqPaths, body, pseudo, pwd); break;
		case "decouvrirJardins": decouvrirJardins.httpCallback(req, res, method, reqPaths, body, pseudo, pwd); break;
		case "voirVideos": voirVideos.httpCallback(req, res, method, reqPaths, body, pseudo, pwd); break;
		case "uchronieIntro": uchronieIntro.httpCallback(req, res, method, reqPaths, body, pseudo, pwd); break;
		case "discord": discord.httpCallback(req, res, method, reqPaths, body, pseudo, pwd); break;
		case "deepAI": await deepAI.httpCallback(req, res, method, reqPaths, body, pseudo, pwd); break;
		case "lieuxDeracines": await lieuxDeracines.httpCallback(req, res, method, reqPaths, body, pseudo, pwd); break;
		case "adminTest": await adminTest.httpCallback(req, res, method, reqPaths, body, pseudo, pwd); break;
	}
	gbl.exception( { m: method, rp: reqPaths, body: body, pseudo: pseudo, pwd: pwd  } ,404);
}
function wsCallback(jsonMessage) {
	gbl.exception("Wscallback Bad opcode",400);
};


/////////////
console.log("HTTPPORT=",process.env.HTTPPORT);
console.log("WSPORT=",process.env.WSPORT);
httpserver.start(httpCallback, parseInt(process.env.HTTPPORT,10) || 7072);
wsserver.start(wsCallback, parseInt(process.env.WSPORT,10) || 7073);
discord.start(null);



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// OBSOLETE 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//
//////////////
// Parametrage votTransfoMagique (votation standard)
/*
const votTransfoMagiqueInit = {
		name: "votTransfoMagique",	// pour être gérable comme une collection
		texte: "Horaires de la Transformation Magique",
		votesOuverts: true,
		choix: [ "Oui, sûr", "Possible", "Non"],
		poids: [ 2, 1, -1],
		colors: [ "lightgreen", "lightgreen", "lightgrey" ],
		options: [
			{ lbl: "vendredi 8 septembre à 20H" },
			{ lbl: "vendredi 8 septembre à 21H" },
			{ lbl: "samedi 9 septembre à 14H" },
			{ lbl: "samedi 9 septembre à 20H" },
			{ lbl: "samedi 9 septembre à 21H" },
			{ lbl: "dimanche 10 septembre à 14H" },
			{ lbl: "dimanche 10 septembre à 20H" },
			{ lbl: "dimanche 10 septembre à 21H" },
			{ lbl: "lundi 11 septembre à 20H" },
			{ lbl: "lundi 11 septembre à 21H" },
			{ lbl: "mercredi 13 septembre à 20H" },
			{ lbl: "mercredi 13 septembre à 21H" },
			{ lbl: "jeudi 14 septembre à 20H" },
			{ lbl: "jeudi 14 septembre à 21H" }
		 ],
		dynOption: true,
		dynJeton: true,
		pseudos: {},
		jetons: {}
		// pseudos sera peuplés par des 
		// toto: [ 0,2 ] etc... avec les réponses a chaque options (attention à la gestion dy dynamqiue)
		// jetons sera peuplée par des pseudos quand un jeton est gagné
};
let votTransfoMagique = new votation (votTransfoMagiqueInit) ;

	if (reqPaths[1]=="votTransfoMagique")
		votTransfoMagique.httpCallback(req, res, method, reqPaths, body, pseudo, pwd);
*/
