
const gbl = require('../infraback/gbl.js');
const pseudos = require('../infraback/pseudos.js');
const simpleObjects = require('../infraback/simpleObjects.js');
const WebSocket = require('ws');

const clients = new Map();

let clientPong = {op: "pong", clientVersion: simpleObjects.load("clientVersion").version }

exports.forceClientVersion = () => {
	let v = simpleObjects.load("clientVersion").version
	clientPong = {op: "pong", clientVersion: v }
	return v;
}

function broadcastClient(o) {
	let jsonMsg = JSON.stringify(o);
	console.log("broadcastClient:" , o.op);
	// console.log("broadcastClient:" , jsonMsg);
	clients.forEach((meta,ws) => {
		ws.send(jsonMsg);
	});
}

function broadcastPing() {
  clients.forEach((meta,ws) => {
		if (ws.estVivant) {
			ws.estVivant = false;
   		// console.log("ping:", meta);
   		ws.ping();
  	}
  	else {
			console.log('Authoritative disconnect, no ping/pong', meta);
			ws.close();
  	}
  });
}

setInterval(broadcastPing, 10000);

function broadcastPseudoList () {
  let pseudoList = [];
  clients.forEach( (meta,ws) => {
	 	pseudoList.push(meta.pseudo);
	});
	broadcastClient({op : "pseudoList", pseudoList : pseudoList });
}

exports.isConnected = (pseudo) => {
  clients.forEach((meta,ws) => {
    if (meta.pseudo==pseudo) return true;
  });
  return false;
}

exports.sendToPseudo = (pseudo,op, o) => {
	let jsonMsg = JSON.stringify( { op: op, o: o, dth: Date.now() } );
	clients.forEach((meta,ws) => {
		if (meta.pseudo == pseudo) 
			ws.send(jsonMsg);
	});
}

exports.broadcastNotification = (texte, fromPseudo, mp3, toPseudo, toTexte, admin ) => {
	broadcastClient({
		op : "notif",
		texte : texte,
		fromPseudo: fromPseudo,
		mp3: mp3,
		toPseudo: toPseudo,
		toTexte: toTexte,
		admin: admin,
		dth: Date.now()
	});
}


exports.broadcastCollection = (col) => {
	broadcastClient({
		op : "collection",
		name : col.name,
		versionDth : col.versionDth || 0,
		dth: Date.now()
	});
}

exports.broadcastRaw = (o) => {
	o.dth = Date.now();
	broadcastClient(o);
}

exports.broadcastSimpleText = (texte, ding) => {
	broadcastClient({
		op : "notif",
		mp3: (ding)? "Ding" : null,
		texte : texte,
		dth: Date.now()
	});
}

exports.broadcastSimpleOp = (op, o) => {
	broadcastClient( { op: op, o: o, status:200, dth: Date.now() } );
}

exports.start = (wsCallback, port) => {
  const wss = new WebSocket.Server({ port: port });

  wss.on('connection', (ws,req) => {
    let metadata = { id: gbl.uuidv4() , ip: req.headers['x-forwarded-for'].split(',')[0].trim() };

    console.log('Connexion:',metadata);

    clients.set(ws, metadata);

    ws.on('ping', (m) => {
	    ws.estVivant=true;
	    ws.pong();
	    // console.log('ping recu:', metadata, m);
    });
    ws.on('pong', (m) => {
	    ws.estVivant=true;
	    // console.log('pong recu :', metadata, m);
    });
    ws.on('message', async (m) => {
			try {
				let p = m.toString();
				let jMsg = JSON.parse(p);
				console.log("WSmessage:",metadata.pseudo,jMsg);
				switch (jMsg.op) {
					case "iam":
						let pseudoDesc = await pseudos.asyncSetPwdSession(jMsg.pseudo,jMsg.pwd,jMsg.newPwd,jMsg.signature,jMsg.publicKey,metadata)
						if (pseudoDesc) {
							metadata.pseudo = jMsg.pseudo;
							ws.send(JSON.stringify( { op: "elipticKeyOk", pseudoDesc: pseudoDesc } ));
							// fermeture des autres connexions du pseudo
  						clients.forEach( (metaScan,wsScan) => {
								if (metaScan.pseudo == jMsg.pseudo && wsScan != ws)  {
									wsScan.send(JSON.stringify({op : "erreur", texte: "Une autre connexion est activée, fermeture de cette connexion"}));
									wsScan.close();
								}
							});
							exports.broadcastNotification(jMsg.pseudo+ " s'est connecté");
							broadcastPseudoList();
						}
						else {
							ws.send(JSON.stringify( { op: "erreur", texte:"Version client invalide, recharge la page (F5)" } ));
							ws.close();
						}
						break;
					case "ping":
						ws.send(JSON.stringify( clientPong ));
						break;
					default:
						wsCallback(jMsg);
				}
			}
			catch(ev) {
				console.log("WS INBOUND msg:", m.toString(), "exception:" , ev);
				ws.send(JSON.stringify({op : "erreur", code: ev.code, msg: ev.msg, o: ev.o, name : ev.name }));
				ws.close();
			}
    });

    ws.on("close", (e) => {
			try {
 				console.log("WS Close:",metadata, "reason:", e);
				clients.delete(ws);
				broadcastPseudoList();
				exports.broadcastNotification(metadata.pseudo+ " s'est déconnecté");
				switch(e) {
					case 1000:
					case 1001: // deconnexion "normale"
					case 1005: // deconnexion par fermeture WS pour inactivité browser
					case 1006: // pas de ping/pong ou mode veille
					default:
				}
			}
			catch(ev) {
				console.log("WS CLOSE invalide:", ev);
			}
    });

    ws.estVivant=true;
    ws.ping();

  }); 

  console.log("Websocket server started:",port);

};


console.log('wsserver loaded');
