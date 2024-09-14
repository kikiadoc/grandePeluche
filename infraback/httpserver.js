
const http = require('http');
const process = require('process');

const gbl = require('../infraback/gbl.js');
const pseudos = require('../infraback/pseudos.js');
const collections = require('../infraback/collections.js');
const wsserver = require('../infraback/wsserver.js');
const jetons = require('../infraback/jetons.js');

var callBackHttp = () => { gbl.exception("httpCallBack not defined", 500); };


async function standardHttpRequest(req,res,met,reqPaths,bodyData,pseudo,pwd) {
	let ret;
	switch (met+reqPaths[1]) {
		case "POSTchatMsg":
			pseudos.check(pseudo,pwd);
			wsserver.broadcastNotification(JSON.parse(bodyData.toString()).texte,pseudo);
			gbl.exception("Message envoyé", 200);
		case "POSTadminMsg":
			pseudos.check(pseudo,pwd,true);
			wsserver.broadcastNotification(JSON.parse(bodyData.toString()).texte,pseudo,null,null,null,true);
			gbl.exception("Message envoyé", 200);
	}
}

function listenerFct(req, res) {
    try {
			const reqDth= process.hrtime.bigint() // Date.now();
      let bodyData = "";
      req.on("data", (chunk) => {
        bodyData = bodyData.concat(chunk);
      });

      req.on("end", async () => {
				const startDth= process.hrtime.bigint() // Date.now();
        try {
      		const myUrl = new URL("http://localhost" + req.url);
      		const reqPaths = myUrl.pathname.split('/');
      		const pseudo = myUrl.searchParams.get('u');
      		const pwd = myUrl.searchParams.get('p');
				  res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-store');
	  			console.log("-->Req",req.method,req.url);
	  			if (req.method=="HEAD") gbl.exception("Not available",404);
	  			await standardHttpRequest(req,res,req.method,reqPaths,bodyData,pseudo,pwd);
	  			await callBackHttp(req,res,req.method,reqPaths,bodyData,pseudo,pwd); 
	  			gbl.exception("Bad path",404);
        }
        catch(e) {
					const endDth= process.hrtime.bigint() // Date.now();
					const tr = { load: Number(startDth-reqDth)/1000000, run: Number(endDth-startDth)/1000000, dth: Date.now()  }
          if (e.code && e.msg) {
						e.tr=tr
						res.statusCode=e.code;
           	res.end(JSON.stringify(e));
						jsonTime = Number(process.hrtime.bigint()-endDth)/1000000
	  				console.log("<--Ret",req.method,req.url,e.code, "ms: (load/run/json)", tr.load, tr.run, jsonTime);
          }
          else {
						res.statusCode=500;
            res.end('{ "code": "500", "msg" : "voir log serveur" }');
	  				console.log("Ret=",req.method,req.url,e,"ms:", tr);
          }
        }
      });
    }
    catch(e) {
      console.log(e);
    }
}


exports.start = (callback,port) => {
	callBackHttp = callback;
	const server = http.createServer(listenerFct)
	server.listen(port);
	console.log("Http server started:",port);
}


console.log('httpserver loaded');




// OBSOLETE (tentative de full async, fonctionne mais + complexe)
// const server = http.createServer(listenerAsync)
// templates pour la promise
// function noopOk(e) { }
// function noopKo(e) { }

// function listenerAsync(req,res) {
// 	let promise = new Promise( (ok,err) => { listenerFct(req,res); ok('!!!') } )
//	promise.then(noopOk, noopKo);
// }




