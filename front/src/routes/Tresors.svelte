<script>
  import { onMount, onDestroy } from 'svelte';
	import Case from "./Case.svelte";
	import { STATUS } from "./chasseConst.js";
	import { newInfoPopup, apiGet, addNotification, connectToServer, disconnectFromServer, loadIt, playSound } from "./storage.js";
	let qr= [
		// 0
		/* OK */ {"q": "Dans la forêt de Sombrelinceul, en haut de la tour d'Amarissaix, il y a un sergent du serpent, quel est son nom?", "r": "Matheomi", info:"Forêt de Sombrelinceul" },
		/* OK */ {"q": "Au fond du club gay de ma maison perso (TP direct via liste d'amis IG), il y a 4 aquariums. Combien de poissons y nagent? (réponse sous la forme x-y-z-t, en commencant par l'aquarium du haut à gauche (x) puis droite (y), puis en bas à gauche (z) et le dernier (t)...", "r": "4-3-4-4", info:"Maison personnelle" }, 
		/* OK */ {"q": "Quel est le nom du meilleur, l'unique, aubergiste de Gridania?", "r": "Antoinaut", info:"Gridania" },
		/* OK */ {"q": "Quel est le prénom de l'humble serviteur de Matoya que l'on peut rencontrer dans sa caverne dans l'arrière-pays Dravanien? (indique uniquement le prénom) (Discuter avec les pnjs pour savoir)", "r": "Toro", info:"Dialoguer avec un pnj" },
		/* OK */ {"q": "Quel est le nom de la bibliothèque historique archivant les Savoirs des Peluches du Bois Bandé? Consulte le livre de correspondance dans l'appartement Moogle, La coupe, secteur 16, Appart 5", "r": "Richelieu", info:"Exploration" },
		// 5
		/* OK */ {"q": "Combien y-a-t-il d'armure hinghasienne décorative dans ma maison de cl? (réponse sous la forme x-x-x pour le nombre à l'étage, le nombre au rez-de-chaussée et le nombre au sous-sol)", "r": "12-3-1", info:"Maison de CL", "img" : "https://www.garlandtools.org/files/icons/item/53178.png" },
		/* OK */ {"q": "En parlant à O'nolosi, au quai de la Torche en Noscea, on peut acheter des billets pour se rendre à ... ", "r": "Port-aux-ales", info:"Dialoguer avec un pnj" }, 
		/* OK */ {"q": "Dans la chambre du temps, combien y-a-t-il d'horloges murales au rez-de-chaussée (X) et sur la mezzanine (Y) ? Répondre sous la forme X-Y ! (chambre #5 de maison de cl)", "r": "15-2", info:"Chambre de cl" },
		/* OK */ {"q": "Il y a des monstres lvl 61 à la Queue de la Comète en Gyr Abania, quel est leur nom ? ", "r": "Saillot", info:"Gyr Abania" },
		/* OK */ {"q": "Au nord est du Camp du Guet, on peut rencontrer des dinosaures LVL 34 très rapide, leur nom ?", "r": "Velociraptor" , info:"Exploration" },
		// 10
		/* OK */{"q": "Sorocan garde ses moutons dans un enclos en X:22.0 Y:20.5 dans la steppe d'Azim, combien y-a-t-il de mouton blancs (X) et de moutons noirs (Y) ? ( les moutons hors de l'enclos ne compte pas, réponse sous la forme X-Y pour les moutons blancs et les noirs)", "r": "11-3", info:"Steppe d'Azim" }, 
		/* OK */ {"q": "A limsa Lominsa, que est le nom du vendeurs de teintures ?", "r": "Unsynrael", info:"Exploration" }, 
		/* OK */ {"q": "Le ranch de Brancharquée est protégé par des vigiles ???, c'est quoi le ??? ", "r": "Sombre", info:"Exploration" },
		/* OK */ {"q": "Quel est le nom de la liftière en X:4.4 Y:6.7 dans le Gold Saucer?", "r": "Saethrith", info:"Dans le Gold Saucer" }, 
		/* OK */ {"q": "Dans la forêt de Sombrelinceul, un pnj protégera coûte que coûte la roue à eau du Moulin des Bois, quel est son nom?", "r": "Bleidiud", info:"Dialogue avec un pnj" },
		// 15
		/* OK */ {"q": "En nouvelle Gridania, on peut acheter des fleurs, mais quel est le nom de la fleuriste?", "r": "Tanie", info:"Exploration" }, 
		/* OK */ {"q": "Quand on prend le bac en Noscea au comptoir du Jijiroon, on arrive dans un petit camp, quel est le nom du pnj le plus proche du feu de camp?", "r": "Memeroon", info:"exploration" },
		/* OK */ {"q": "Quel est le nom de la 6ème arme vendue par le préposé aux lots du Gold Saucer? (X:5.1 Y:6.7)", "r": "Khanjar", info:"Dialogue avec un pnj" }, 
		/* OK */ {"q": "Dans la forêt de Sombrelinceul, au Bannock, quel est le nom du PNJ qui entraine les archers ?", "r": "Mariustel", info:"Exploration" },
		/* OK */ {"q": "Dans les mines d'U'Ghamaro, en Noscéa extérieure, se déroule souvent un Aléa/défi lvl 48 nommé révolution ???, c'est quoi le ???", "r": "industrielle", info:"Très aléatoire" }, 
		// 20
		/* OK */ {"q": "Au Gold Saucer, quel est le nom du PNJ qui gère la boutique de mode, au coté de Masked Rose ?", "r": "Kasumi", info:"Fashion report" },
		/* OK */ {"q": "Quand on est dans Azurée, quel est le nom du PNJ qui permet de retourner à Brouillasse?", "r": "Violenne", info:"Exploration" }, 
		/* OK */ {"q": "En Noscéa, quel est le prénom du négociant du Quai de la Chute cachée?", "r": "Ozun", info:"Exploration" },
		/* OK */ {"q": "En Coerthas au dernier étage de la tour de l'oeuil, Cailean a un compagnon, quel est son nom?, ", "r": "Ignace", info:"Exploration" }, 
	];

	let pseudoList=[]
	let contenus=[];
	let pseudo = loadIt("pseudo",null);
	let globalTimerId = null;
	let pseudosQuiOntTrouve=[];
	let totalEnigmesDecouvertes=0;
	let enigmesDecouvertes=0;

	const ms5minutes = 120*1000; 
	const ms90minutes = 6*60*60*1000;
	const ms6heures = 18*3600*1000;
	
	function ilya5mimutes()		{
		return Date.now() - ms5minutes;
	}
	function ilya90minutes()		{
		return Date.now() - ms90minutes;
	}
	function ilya6heures()		{
		return Date.now() - ms6heures;
	}

  function setupCase(c) {
		c.status=null;
		c.timerDthEnd=null;
		// Calcul du status/timer de la case
		if (c.trouve) {
			 if (c.pseudo==pseudo) c.status = STATUS.OWNED;
			 else c.status = STATUS.OWNED_OTHER;
		}
		else
		if (c.pseudo == pseudo) {
			// derniere action par le joueur
			if ( ilya5mimutes() <= c.dthStart ) {
			  c.status = STATUS.ENCOURS;
				c.timerDthEnd = c.dthStart + ms5minutes ;
			}
			else if (ilya90minutes() <= c.dthStart ) {
			  c.status = STATUS.ATTENTE;
				c.timerDthEnd = c.dthStart + ms90minutes ;
			}
			else c.status = STATUS.DECOUVRIR;				
		}
		else
		if (c.pseudo != pseudo) {
			// dernière action par un autre joueur
			if ( ilya5mimutes() <= c.dthStart ) {
			  c.status = STATUS.ENCOURS_OTHER;
				c.timerDthEnd = c.dthStart + ms5minutes ;
			}
			else if ( ilya90minutes() <= c.dthStart ) {
				c.status=STATUS.ATTENTE_OTHER;
				c.timerDthEnd = c.dthStart + ms90minutes ;
			}
			else c.status = STATUS.DECOUVRIR;
		}
		else c.status = STATUS.DECOUVRIR;
    // console.log("Status Tuile", c.i, c.status);
	}

	async function getChasseAuxTresors() {
		let chasse = await apiGet("/collections/chasseauxtresors");
		if (chasse.status==200) {
			// calcul de la globalité et des status
			let flagEnattente = -1;
			let flagEncours = -1;
			let dernierTrouve = 0;
			let tmpPseudoTrouve=new Map();
			totalEnigmesDecouvertes = 0;
			enigmesDecouvertes = 0;
			chasse.items.forEach( item => {
				setupCase(item);
				if (item.status==STATUS.ATTENTE) flagEnattente = item.i;
				if (item.status==STATUS.ENCOURS) flagEncours = item.i;
				if (item.status==STATUS.OWNED)
						enigmesDecouvertes ++;
				if ((item.status==STATUS.OWNED) || (item.status==STATUS.OWNED_OTHER)) {
					totalEnigmesDecouvertes++;
					tmpPseudoTrouve.set(item.pseudo,item.i);
				}
				if (item.status==STATUS.OWNED && dernierTrouve < item.dthStart)
					dernierTrouve = item.dthStart;
			});
			// recalcul des pseudo ayant terminé une énigme
			pseudosQuiOntTrouve = [];
			tmpPseudoTrouve.forEach( (v,k) => { pseudosQuiOntTrouve.push(k); } );
			
			// synthèse pour global local
			let globalTimer = Date.now() + ms6heures;
			chasse.items.forEach( item => {
				// indique dans chaque tuile le status de l'énigme en cours
				item.flagEncours=flagEncours;
				item.flagEnattente=flagEnattente;
				item.dernierTrouve = dernierTrouve;
				item.enigmesDecouvertes = enigmesDecouvertes;
				item.totalEnigmesDecouvertes = totalEnigmesDecouvertes;
				item.nbParticipantsAyantResolu = pseudosQuiOntTrouve.length;
				// reference l'utilisateur actuel dans la tuile
				item.pseudoConnecte = pseudo;
				// Si une tuile decouverte dans moins de 6 heures, alors pas de découverte possibles
				if  ( (item.status==STATUS.DECOUVRIR) && (ilya6heures() <= dernierTrouve) ) {
					item.status=STATUS.DECOUVRIR_FUTURE;
					item.timerDthEnd = dernierTrouve + ms6heures ;
				}
				// Si une tuile en cours ou en attente, alors pas de découverte possibles
				if ( (item.status==STATUS.DECOUVRIR) && ((flagEncours>=0) || (flagEnattente>=0) ))
						item.status=STATUS.DECOUVRIR_LOCK;
				// setup timer global
				if (item.timerDthEnd && item.timerDthEnd < globalTimer)
					globalTimer = item.timerDthEnd;
			});

			// selon les timer, refresh de la collection au timer
			if (globalTimerId) {
				clearTimeout(globalTimerId);
				globalTimerId=null;
			}
			console.log("GlobalTimer:", (globalTimer - Date.now())/1000 )
			// pour eviter les contentions servers et favoriser les messages locaux
			// le global timer est a +1 sec
			globalTimerId = setTimeout(
        () => { apiGet("/logic/chasseauxtresors/resynch/0") },
				2000+ globalTimer - Date.now()
			);
			// maj des tuiles
			chasse.items.forEach( item => {
				contenus[item.i] = item;
			});
		}
	}
	

	function cbMessage(jsonMessage) {
		// console.log('cbMessage', jsonMessage); 
		if (jsonMessage.op=="loadCol" && jsonMessage.col=="chasseauxtresors")
			getChasseAuxTresors();
		else
		if (jsonMessage.op=="pseudoList") {
			pseudoList=jsonMessage.pseudoList;
		}
		else
		if (jsonMessage.op=="newInfoPopup") {
			if (jsonMessage.destUser==pseudo)
				newInfoPopup(jsonMessage.t1,jsonMessage.t2, jsonMessage.t3, jsonMessage.iconUrl);
			else
				addNotification(jsonMessage.texte);
		} 
		else
		if (jsonMessage.op=="ding") {
		}
	}

	function appelAide(user) {
		if (user==pseudo) {
			console.log('interdire aide pour soi meme');
		}
		if (confirm("Demander l'aide de "+user+"?")) {
			playSound("Help",0,false);
			addNotification(0,"Votre demande d'aide a été envoyée à "+user)
			apiGet("/logic/generic/call/"+user);
		}
	}


// The wake lock sentinel.
let wakeLock = null;

// Function that attempts to request a screen wake lock.
const requestWakeLock = async () => {
  try {
		if (! navigator.wakeLock) {
			console.log("WakeLock non disponible");
			return;			
		}
    wakeLock = await navigator.wakeLock.request();
    wakeLock.addEventListener('release', () => {
      console.log('Screen Wake Lock released:');
    });
    console.log('Wake Lock activé:');
		addNotification("coucou","","");
		
		setTimeout(() => {
			  wakeLock.release();
			  wakeLock = null;
		}, 3600000);
		
  } catch (err) {
    console.log("Erreur WakeLock", err);
  }
};

// Request a screen wake lock…
function noSleep() {
	requestWakeLock();	
}
function visibilityChange() {
	requestWakeLock();	
	// newInfoPopup("Recoucou !","","oui, cette fenetre est chiante, mais nécessaire pour des raisons techniques")
}
	
	onMount(() => {
		getChasseAuxTresors();
		connectToServer(cbMessage);
		noSleep();
		document.addEventListener("visibilitychange", visibilityChange );
	});
	onDestroy(() => {
		disconnectFromServer();		
	});
	
</script>

<style>
	tr { padding: 0; spacing: 0; border: 1px solid yellow }
</style>

<p>
	Bienvenue dans le mini jeu <b>En vacances, je n'oublie rien!</b>
</p>
<p style="color: yellow">
	Conseil de la Grande Peluche: 
	{#if enigmesDecouvertes < 2}
		<br/>
		* Résous une nouvelle énigme
	{/if}
	{#if totalEnigmesDecouvertes < 24 && pseudosQuiOntTrouve.length < 12}
		<br/>
		* Invite des amis à participer pour augmenter tes gains et les leurs !
	{/if}
	{#if totalEnigmesDecouvertes < 24 && pseudosQuiOntTrouve.length >= 12}
		<br/>
		* Résoud une énigme pour augmenter ton gain en éclats/cristaux !
	{/if}
	{#if totalEnigmesDecouvertes >= 24}
		<br/>
		* Toutes les énigmes sont découvertes, tu ne peux plus rien faire !
	{/if}
</p>
<p>
	{pseudoList.length} connecté(s):
	{#each pseudoList as pseudo}
		<button on:click={appelAide(pseudo)}>
			{pseudo}
		</button>
	{/each}
	<br/>
	{pseudosQuiOntTrouve.length} participants ont résolu une énigme ou plus:
	{#each pseudosQuiOntTrouve as pseudo, i}
			{pseudo} &nbsp;
	{/each}
	<br/>
	Enigmes découvertes: {totalEnigmesDecouvertes}/24
</p>

<table style="width:99%">
	<tr>
		<Case bind:qr={qr} bind:contenu={contenus[0]}></Case>
		<Case bind:qr={qr} bind:contenu={contenus[1]}></Case>
	</tr>
	<tr>
		<Case bind:qr={qr} bind:contenu={contenus[2]}></Case>
		<Case bind:qr={qr} bind:contenu={contenus[3]}></Case>
	</tr>
	<tr>
		<Case bind:qr={qr} bind:contenu={contenus[4]}></Case>
		<Case bind:qr={qr} bind:contenu={contenus[5]}></Case>
	</tr>
	<tr>
		<Case bind:qr={qr} bind:contenu={contenus[6]}></Case>
		<Case bind:qr={qr} bind:contenu={contenus[7]}></Case>
	</tr>
	<tr>
		<Case bind:qr={qr} bind:contenu={contenus[8]}></Case>
		<Case bind:qr={qr} bind:contenu={contenus[9]}></Case>
	</tr>
	<tr>
		<Case bind:qr={qr} bind:contenu={contenus[10]}></Case>
		<Case bind:qr={qr} bind:contenu={contenus[11]}></Case>
	</tr>
	<tr>
		<Case bind:qr={qr} bind:contenu={contenus[12]}></Case>
		<Case bind:qr={qr} bind:contenu={contenus[13]}></Case>
	</tr>
	<tr>
		<Case bind:qr={qr} bind:contenu={contenus[14]}></Case>
		<Case bind:qr={qr} bind:contenu={contenus[15]}></Case>
	</tr>
	<tr>
		<Case bind:qr={qr} bind:contenu={contenus[16]}></Case>
		<Case bind:qr={qr} bind:contenu={contenus[17]}></Case>
	</tr>
	<tr>
		<Case bind:qr={qr} bind:contenu={contenus[18]}></Case>
		<Case bind:qr={qr} bind:contenu={contenus[19]}></Case>
	</tr>
	<tr>
		<Case bind:qr={qr} bind:contenu={contenus[20]}></Case>
		<Case bind:qr={qr} bind:contenu={contenus[21]}></Case>
	</tr>
	<tr>
		<Case bind:qr={qr} bind:contenu={contenus[22]}></Case>
		<Case bind:qr={qr} bind:contenu={contenus[23]}></Case>
	</tr>
</table>
