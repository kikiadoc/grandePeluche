const gbl = require('../infraback/gbl.js');
const pseudos = require('../infraback/pseudos.js');
const wsserver = require('../infraback/wsserver.js');
const collections = require('../infraback/collections.js');
const discord = require('../infraback/discord.js');


// liste des questions/reponses
const lstQR = [
	{ z: "zone0", q: "question0", r: 0, o: ["r0","r1","r2","r3"] },
	{ z: "zone1" ,q: "question1", r: 1, o: ["r0","r1","r2","r3"] },
	{ z: "zone2" ,q: "question2", r: 2, o: ["r0","r1","r2","r3"] },
	{ z: "zone4" ,q: "question3", r: 3, o: ["r0","r1","r2","r3"] }
]

// Equilibrage final
// temps de pop 45 minutes
// facteur de relax 200 minutes
// mauvaise réponse 30 minutes
// voir le googlesheet pour équilibrage
const RELAXNOUVELLE = 2 * 60000 // 45	// nombre de ms en arrondi pour calcul nouvelle question
const RELAXBYREPONSE = 3 * 60000 // 120	// nombre de ms en delay par réponse déjà faite
const RELAXBYERREUR = 1 * 60000 // 30	// nombre de ms en delay par réponse déjà faite

// etat du challenge
let etatTorches = normalizeTorches(collections.get("torches", true))

function normalizeTorches(t) {
	t.historique ??= []   	// contien des { pseudo, idx, dth } des bonnes réponses
	t.relaxDthByPseudo ??= {}  // index par le pseudo, date/heure de trouvaille possible (peut ere inférieur a question.dth)
	t.question ??= nouvelleQuestion(t) // question actuelle { idx, q , o, dth } dth est le début de la question
	t.RELAXBYREPONSE = RELAXBYREPONSE 	// pour valeur identique entre clien et server
	t.RELAXBYERREUR = RELAXBYERREUR 	// pour valeur identique entre clien et server
	t.NBQUESTIONS = lstQR.length				// nombre de questions au total
	console.log("Noamalized:",t)
	return t
}

function admResetTorches() {
	etatTorches = normalizeTorches(collections.reset("torches"))
}

// sycnho les clients, et notif discord si pseudo indiqué
function syncClients(pseudo) {
	// broadcast sur le WS
	wsserver.broadcastSimpleOp('torches',getEtat())
	// si pseudo, la torchere vient d'etre envoyée
	if (pseudo) {
		// si il y a encore au moins une question
		if (etatTorches.question)
			discord.postMessage("hegemonie",
				pseudo + " a renvoyé la torchère de l'Hégémonie dans les limbes." + 
				"\nSelon la Peluche Galileo Galilei, elle devrait retomber en " + etatTorches.question.z + " à <t:"+Math.floor(etatTorches.question.dth/1000) +":T>"+
				"\nConsulte la Grande Peluche pour connaitre l'heure précise où tu pourras t'en approcher car cela dépend de ton niveau d'irradiation actuel"
				,true)
		else
			discord.postMessage("hegemonie",
				pseudo + " a renvoyé la torchère de l'Hegémonie dans les limbes et elle s'y est consumée!" +
				"\n\nLe challenge est terminé, mais pas tes Aventures!"+
				"\n<"+gbl.pCloudUrl+"ff-7/ff-7-torches-2.mp4>"
				,true)
	}
}

// retourne une nouvelle question ou null si plus de question disponible
function nouvelleQuestion(t) {
	// recupere les indices non utilisés
	let trouves = new Array(lstQR.length).fill(false)
	t.historique.forEach( (e) => trouves[e.idx] = true )
	// determine les possibles
	let possibles = []
	for (let i=0; i < lstQR.length; i++) { if (!trouves[i]) possibles.push(i)	}
	// verfie qu'il y a encore des possibles...
	if (possibles.length <=0) return null
	// recupere l'indice dans les trouves
	let idx = possibles[Math.floor(Math.random() * possibles.length)]
	// dth = date de pop selon relax
	let dth = ( Math.floor( Date.now() / RELAXNOUVELLE )+1) * RELAXNOUVELLE
	return {idx: idx, q: lstQR[idx].q, o: lstQR[idx].o, z: lstQR[idx].z, dth: dth }
}

// retourne l'etat actuel
function getEtat() {
	return etatTorches
}

// compte le nombre de bonne réponse par le pseudo
function getCountReponse(pseudo) {
	return etatTorches.historique.reduce( (acc, hist) => acc + ( (hist.pseudo==pseudo)? 1: 0 ) ,0)
}

// propose reponse (200 reponse OK, 201 ok challenge terminé, 202 mauvaise réponse, 400 erreur de synch)
function proposeReponse(pseudo,reqPaths) {
	const now = Date.now()
	// verif de la possibilite de réponse (question et dth synch)
	if ( !etatTorches.question ) gbl.exception("plus de question, err synch client/serveur",400)
	if (now < ( etatTorches.relaxDthByPseudo[pseudo] || 0 ) ) gbl.exception("pas encore possible, err synch client/serveur",400)
	// si mauvaise reponse
	if (parseInt(reqPaths[3],10) != lstQR[etatTorches.question.idx].r ) {
		etatTorches.relaxDthByPseudo[pseudo] = now + RELAXBYERREUR
		collections.save(etatTorches)
		gbl.exception(getEtat(),202)
	}
	// reponse OK
	etatTorches.historique.push( { pseudo: pseudo, idx: etatTorches.question.idx, dth: now } )
	etatTorches.question = nouvelleQuestion(etatTorches)
	etatTorches.relaxDthByPseudo[pseudo] = now + RELAXBYREPONSE * getCountReponse(pseudo)
	collections.save(etatTorches)
	wsserver.broadcastSimpleText(pseudo+" a envoyé la Torchère dans les limbes",true)
	syncClients(pseudo)
	// retourne 200 ou 201 selon que le challenge est terminé
	gbl.exception("synch by WS", (etatTorches.question)? 200:201)
}


exports.httpCallback = (req, res, method, reqPaths, body, pseudo, pwd) => {
	pseudos.check(pseudo,pwd); // auth
	switch(method) {
		case "OPTIONS": 
			res.setHeader('Access-Control-Allow-Methods', 'PUT, PATCH');
			gbl.exception("AllowedCORS",200);
		case "GET": 
			switch(reqPaths[2]) {
				case "etat":
					// GET etat retourne état courant
					gbl.exception( getEtat() , 200) 
			}
			gbl.exception("torches get",400);
		case "PUT": 
			switch(reqPaths[2]) {
				case "propose":
					proposeReponse(pseudo,reqPaths);
			}
			gbl.exception("torches put",400);
		case "PATCH": 
			pseudos.check(pseudo,pwd,true); // auth admin
			switch(reqPaths[2]) {
				case "admReset":
					admResetTorches()
					syncClients(null)
					gbl.exception("torches clear ok",200);
			}
			gbl.exception("torches patch",400);
	}
	gbl.exception("inv http op toches",400);
}

console.log("torches loaded")
