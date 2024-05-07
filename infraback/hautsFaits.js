
const gbl = require('../infraback/gbl.js');
const collections = require('../infraback/collections.js');
const pseudos = require('../infraback/pseudos.js');
const jetons = require('../infraback/jetons.js');
const ws = require('../infraback/wsserver.js');

const hautsFaits = collections.get("hautsFaits", true);

const hautsFaitsDesc = {
		broceliandeInitiatique: { jeton: 0 },
		uchronieInitiatique:	{ jeton: 0, broadcast: " rejoint le noviciat de l'Uchronie" },
		geographeJardins:	{ jeton: 0 },
		Teotihuacan:	{ jeton: 0, broadcast: " a découvert Teotihuacan" },
		mineralogistes:	{ jeton: 0, broadcast: " est Minéralogiste de l'Uchronie" },
		dirac:	{ jeton: 0, broadcast: " a activé le Dirac de Quatre" }
};
// init/normalize de la collection si besoin
function init() {
	hautsFaits.id ??= {};
	Object.keys(hautsFaitsDesc).forEach( p => {
		hautsFaits.id[p] ??= { pseudos: {} } ;
	});
}

// test si hautFait marqué pour le pseudo
function isDone(pseudo, hautFait) {
	if (!hautsFaits.id[hautFait]) gbl.exception("hautFait non valide:"+hautFait,400);
	return (hautsFaits.id[hautFait].pseudos[pseudo]) ? true : false;
}
// marque le haut fait retourne 200 si deja fait, 201 si marqué, incrémente les jetons selon le haut fait, broadcast texte si besoin
function flagIt(pseudo,hautFait) {
	if ( isDone(pseudo, hautFait) ) return 200;
	hautsFaits.id[hautFait].pseudos[pseudo] = { dth: Date.now() };
	collections.save(hautsFaits);
	if (hautsFaitsDesc[hautFait].jeton > 0) jetons.inc(pseudo,hautsFaitsDesc[hautFait].jeton);
	if (hautsFaitsDesc[hautFait].broadcast) {
		ws.broadcastSimpleText(pseudo+hautsFaitsDesc[hautFait].broadcast,true);
		ws.broadcastSimpleOp("hf_"+hautFait, hautsFaits.id[hautFait]);
	}
	return 201;
}

exports.flagIt = flagIt;

// return null ou le haut fait
exports.get = (hautFait) => {
	return hautsFaits.id[hautFait]
}

exports.httpCallback = (req, res, method, reqPaths, body, pseudo, pwd) => {
	pseudos.check(pseudo,pwd);
	if (method=="OPTIONS") {
		res.setHeader('Access-Control-Allow-Methods', 'PUT, DELETE');
		gbl.exception("AllowedCORS",200);
	}
	if (method=="PUT") {
		gbl.exception("Hautfait ok:"+reqPaths[2], flagIt(pseudo,reqPaths[2]) );
	}
	if (method=="GET") {
		switch ( reqPaths[2] ) {
			case "":
			case null:
			case undefined:
				pseudos.check(pseudo,pwd,true);
				gbl.exception(hautsFaits,200);
			default: 
				const hf = hautsFaits.id[reqPaths[2]]
				if (!hf) gbl.exception("bad hautsFaits",400);
				gbl.exception(hf,200);
		}
	}
	if (method=="DELETE") {
		pseudos.check(pseudo,pwd,true); // admin
		const hautFait = reqPaths[2];
		const hf = hautsFaits.id[hautFait]
		if (!hf) gbl.exception("bad hautsFaits",400);
		hf.pseudos = {}
		collections.save(hautsFaits);
		ws.broadcastSimpleOp("hf_"+hautFait, hf);
		gbl.exception(hf,200);
	}
	gbl.exception("bad op",400);
}

init();
console.log("hautsFaits loaded");
