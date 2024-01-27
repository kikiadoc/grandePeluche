const gbl = require('../infraback/gbl.js');
const collections = require('../infraback/collections.js');
const jetons = require('../infraback/jetons.js');
const wsserver = require('../infraback/wsserver.js');
const pseudos = require('../infraback/pseudos.js');



class filRouge {
	// Fields
	qr = [];
	colCtx = {};
	timerId = null;

	constructor(qr, colName, refreshMinMs, refreshMaxMs) {
		this.qr = qr;
		this.colCtx = collections.get(colName,true);
		this.colCtx.refreshMin = refreshMinMs || 60000;
		this.colCtx.refreshMax = refreshMaxMs || 90000;
		this.colCtx.nbIdx = this.qr.length;
		this.colCtx.currentIdx ??= 0;
		this.colCtx.pseudos ??= {};
		this.newFilRouge(this,0);
	}

	trouve(pseudo, i, r) {
		if (i!=this.colCtx.currentIdx ) gbl.exception("mauvais index, client unsynch?",400);
		if (decodeURI(r).toLowerCase() != this.colCtx.currentR.toLowerCase() ) gbl.exception("mauvaise réponse",202);
		let uchPseudo = this.getPseudo(pseudo);
		let trouve = uchPseudo.trouves[i];
		if (trouve) gbl.exception("Déjà trouvé, client unsynch?",400);
		uchPseudo.trouves[i] = { dth: Date.now() };
		collections.save(this.colCtx);
		// jetons.inc(pseudo,1);
		wsserver.broadcastCollection(this.colCtx);
		wsserver.broadcastNotification(pseudo+" a identifie la victime #"+(i+1));
		gbl.exception("bonne réponse",201);
	}
	
	getPseudo(pseudo) {
		let ret = this.colCtx.pseudos[pseudo];
		if (ret) return ret;
		this.colCtx.pseudos[pseudo]={ trouves: {}  }
		return this.colCtx.pseudos[pseudo];
	}

	// param thisObj nécessaire pour le setTimeout
	newFilRouge(thisObj, inc) {
		console.log("-------newFilRouge------------");
		const i = (thisObj.colCtx.currentIdx+inc) % thisObj.qr.length;
		thisObj.colCtx.currentIdx = i;
		console.log(thisObj.colCtx.name,thisObj.colCtx.currentIdx,"->",i,'/', thisObj.qr.length );
		thisObj.colCtx.currentDthStart = Date.now();
		thisObj.colCtx.currentQ = thisObj.qr[i].q;
		thisObj.colCtx.currentR = thisObj.qr[i].r;
		thisObj.colCtx.currentU = thisObj.qr[i].url;
		// thisObj.colCtx.maxJetons = thisObj.qr.length;
		// Calcul du delai de fin
		const refresh = Math.floor(thisObj.colCtx.refreshMin + ( (thisObj.colCtx.refreshMax-thisObj.colCtx.refreshMin) * Math.random() ));
		thisObj.colCtx.renewTimer = refresh;
		wsserver.broadcastCollection(thisObj.colCtx);
		// positionne le "next" sur timer
		if (this.timerId) clearTimeout(this.timerId)
		this.timerId = setTimeout(thisObj.newFilRouge, refresh, thisObj, 1);
		collections.save(thisObj.colCtx);
		console.log("thisObj@timer",thisObj.colCtx);
		console.log("-------------------");
	}

	get() {
		gbl.exception(this.colCtx,200);
	}

	httpCallback (req, res, method, reqPaths, body, pseudo, pwd) {
		// le reqpaths[1] doit etre le nom de la collection backend
		if (reqPaths[1] != this.colCtx.name) gbl.exception("backend collection mismatch",500);
		if (method=="OPTIONS") {
			res.setHeader('Access-Control-Allow-Methods', 'PUT');
			gbl.exception("AllowedCORS",200);
		}
		if (method=="PUT") {
			pseudos.check(pseudo,pwd);
			this.trouve(pseudo,parseInt(reqPaths[2]),reqPaths[3]);
		}
		if (method=="GET") {
			switch (reqPaths[2]) {
				case null:
				case undefined:
					pseudos.check(pseudo,pwd);
					this.get();
				case "adminNew":
					pseudos.check(pseudo,pwd,true);
					this.newFilRouge(this, 1);
					this.get();
				case "adminClear":
					pseudos.check(pseudo,pwd,true);
					this.getPseudo(pseudo).trouves={};
					collections.save(this.colCtx);
					wsserver.broadcastCollection(this.colCtx);
					this.get();
				default:
					pseudos.check(pseudo,pwd);
					this.trouve(pseudo,parseInt(reqPaths[2]),reqPaths[3]);
			}
		}
		gbl.exception("badop",400);
	}

}

module.exports = filRouge;
console.log("filRouge loaded");

