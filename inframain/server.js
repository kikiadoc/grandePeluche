#!/usr/bin/env node

const gbl = require('../infraback/gbl.js');
const pseudos = require('../infraback/pseudos.js');
const collections = require('../infraback/collections.js');
const httpserver = require('../infraback/httpserver.js');
const wsserver = require('../infraback/wsserver.js');
const votation = require('../infraback/votation.js');
const hautsFaits = require('../infraback/hautsFaits.js');
const jetons = require('../infraback/jetons.js');
const voirVideos = require('../infraback/voirVideos.js');
const discord = require('../infraback/discord.js');
const adminTest = require('../infraback/adminTest.js');
const webAuth = require('../infraback/webAuth.js');
const lodestone = require('../infraback/lodestone.js');

async function httpCallback(req, res, method, reqPaths, body, pseudo, pwd) {
	switch(reqPaths[1]) {
		case "pseudos": await pseudos.httpCallback(req, res, method, reqPaths, body, pseudo, pwd); break;
		case "collections": collections.httpCallback(req, res, method, reqPaths, body, pseudo, pwd); break;
		case "lodestone": await lodestone.httpCallback(req, res, method, reqPaths, body, pseudo, pwd); break;
		case "jetons": jetons.httpCallback(req, res, method, reqPaths, body, pseudo, pwd); break;
		case "hautsFaits": hautsFaits.httpCallback(req, res, method, reqPaths, body, pseudo, pwd); break;
		case "voirVideos": voirVideos.httpCallback(req, res, method, reqPaths, body, pseudo, pwd); break;
		case "discord": discord.httpCallback(req, res, method, reqPaths, body, pseudo, pwd); break;
		case "adminTest": await adminTest.httpCallback(req, res, method, reqPaths, body, pseudo, pwd); break;
	}
	gbl.exception( { m: method, rp: reqPaths, body: body, pseudo: pseudo, pwd: pwd  } ,404);
}
function wsCallback(jsonMessage) {
	gbl.exception("Wscallback Bad opcode",400);
};


/////////////
// Verification de l'intégrité des trucs bancales
/////////////
async function checkBeforeStart() {
	const ff14Id = await lodestone.getFF14Id("Kikiadoc","Lepetiot","Moogle");
	if (ff14Id != 12945273)
		discord.mpKiki("serveur restart, lodetsone issue (idKiki=12945273) found ff14id="+ff14Id);
}

/////////////
// Start service
/////////////
checkBeforeStart()
console.log("HTTPPORT=",process.env.HTTPPORT);
console.log("WSPORT=",process.env.WSPORT);
httpserver.start(httpCallback, parseInt(process.env.HTTPPORT,10) || 7072);
wsserver.start(wsCallback, parseInt(process.env.WSPORT,10) || 7073);
discord.start(null);

