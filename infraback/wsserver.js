
const gbl = require('../infraback/gbl.js');
const pseudos = require('../infraback/pseudos.js');
const WebSocket = require('ws');

const clients = new Map();


function broadcastClient(o) {
	let jsonMsg = JSON.stringify(o);
	console.log("broadcastClient:" , jsonMsg);
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

exports.broadcastSimpleOp = (txt) => {
	broadcastClient( { op: txt, dth: Date.now() } );
}

exports.start = (wsCallback, port) => {
  const wss = new WebSocket.Server({ port: port });

  wss.on('connection', (ws) => {
    const id = gbl.uuidv4();
    let metadata = { id };

    console.log('Connexion:',id);

    clients.set(ws, metadata);

    ws.on('ping', (m) => {
	    ws.estVivant=true;
	    ws.pong();
	    // console.log('ping recu:', id, m);
    });
    ws.on('pong', (m) => {
	    ws.estVivant=true;
	    // console.log('pong recu :', id, m);
    });
    ws.on('message', (m) => {
			try {
				let p = m.toString();
				let jsonMessage = JSON.parse(p);
				console.log("WSmessage:",metadata.pseudo,jsonMessage.op);
				switch (jsonMessage.op) {
					case "iam":
						pseudos.check(jsonMessage.pseudo,jsonMessage.pwd);
						metadata.pseudo = jsonMessage.pseudo;
						exports.broadcastNotification(jsonMessage.pseudo+ " s'est connecté");
						broadcastPseudoList();
						break;
					case "ping":
						ws.send(JSON.stringify({op:"pong"}));
						break;
					default:
						wsCallback(jsonMessage);
				}
			}
			catch(ev) {
				console.log("WS INBOUND invalide:", m.toString() , ev);
				ws.send(JSON.stringify({op : "erreur", texte : "WS: erreur op ou pseudo/password, contactez Kikiadoc sur discord" }));
				ws.close();
			}
    });

    ws.on("close", (e) => {
			try {
 				console.log("WS Close:",id, "reason:", e);
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
