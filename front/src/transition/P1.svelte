<script>
	import { onMount, onDestroy, setContext } from 'svelte';
	import { apiCall, newInfoPopup } from "./storage.js"
	import Entree from './P1_E.svelte';

	export let pseudo = "TBD"
	export let wsCallComponents; 

	// Gestion des reload, refresh etc..
	onMount(() => {
		if (wsCallComponents) wsCallComponents.add(myWsCallback);
		init();
	});
	onDestroy(() => {
		if (wsCallComponents) wsCallComponents.delete(myWsCallback);
	});
	// callback sur le websocket
	function myWsCallback(m) {
		if (m.op=="voirVideos") {
			loadVideos();
			return true;
		}
	}

	
	// grimoire a étendre
	let grimoire = null
	// etat actuel de lecture des videos
	let statusVideos = { maxVideosVues: 0, videos: {} };
	// pour sync IHM, selon maj statusVideos
	let gMaxVues = null;
	let gNbVues = null;
	$: recalcGlobal(statusVideos);

	// function init de chargement du contexte
	async function init() {
		loadVideos();
	}

	// function de recalcul de la synthèse pour l'IHM
	function recalcGlobal(s) {
		console.log("recalc",statusVideos);
		if (!statusVideos) return;
		gMaxVues = statusVideos.maxVideosVues;
		gNbVues = Object.keys(statusVideos.videos).length;
	}

	// chargement de l'état des videos du joueur
	async function loadVideos() {
		let videos = await apiCall("/voirVideos/me");
		if (videos.status == 200) {
			statusVideos = videos.o;
		}
	}
	// indique videos bien visionnée par le jopueur
	// usage par les nested via le contexte
	// la maj du statusVideos se fera via le websocket
	async function videoVisionnee(nom) {
		// console.log("putVideo",nom);
		if (statusVideos.jeuOuvert)
				await apiCall("/voirVideos/me/"+nom,"PUT");
	}
	// recupère le classement actuel complet et l'affiche
	async function afficheSynthese() {
		let videos = await apiCall("/voirVideos/classement");
		if (videos.status == 200) {
			let classementVideos = videos.o;
			let nbParticipants = 0;
			let nbVues = 0;
			let scores = []
			for (const pseudo in classementVideos.pseudos) {
				const nbVideos = Object.keys(classementVideos.pseudos[pseudo].videos).length;
				nbParticipants++;
				nbVues += nbVideos;
				scores.push( {pseudo: pseudo, score: nbVideos})
			}
			// tri des scores
			scores.sort( (a,b) => { return (a.score > b.score)? -1 : (a.score < b.score)? 1 : 0 } )
			// calcul du resultat a afficher
			let resultats = [];
			scores.forEach((e)=> resultats.push(e.pseudo+" ("+e.score+" videos)"))
			newInfoPopup("Classement actuel",resultats,"Participants: "+nbParticipants);
		}
	}

	// export dans le contexte 
	setContext('P1', { videoVisionnee });	
	
</script>

<style>
	.titre {
		font-size: 1.2em;
		text-align: center;
		/* border: solid black 1px; */
		font-weight: bold;
	}
	:global(.grimoire) {
		cursor: pointer;
		font-weight: bold;
	}
	:global(.ouvert) {
		border: 2px solid lightgreen; 
		background-color:black;
		font-size: 0.8em;
	}
	:global(.evt) {
		text-decoration: underline;
	}
	:global(.event) {
		font-weight: bold;
		font-size: 1.2em;
		text-decoration: underline;
		cursor:pointer;
	}
	.synthese {
		font-style: italic;
		font-weight: bold;
		/* word-break: break-all; */
	}
	.gains {
		font-style: italic;
		color: red;
	}
	.quote {
		font-style: italic;
	}
	.imageDroite {
		width: 40%;
		float: right;
	}
	.imageFull {
		width: 100%;
	}
	:global(.videoDroite) {
		width: 100%;
		max-height: 70dvh; 
		/*float: right; */
	}
	:global(.fin) {
		clear: both;
	}
</style> 

	{#if pseudo=="Kikiadoc"}
		<div  class="adminCadre">
			ADMIN! <br/>
			<input type="button" value="admStartJeu" on:click={() => apiCall("/voirVideos/admStart","PUT")} />
			<input type="button" value="admStopJeu" on:click={() => apiCall("/voirVideos/admStop","PUT")} />
			<input type="button" value="admRecalc" on:click={() => apiCall("/voirVideos/admRecalc","PUT")} />
			<input type="button" value="admREINITALLPSEUDOS" on:click={() => apiCall("/voirVideos/admReinit","PUT")} />
		</div>
	{/if}

	<div class="titre">
		Bienvenue à l'IPA-GBBB,
		<br/>
		l'Institut Peluchique de l'Audiovisuel de
		<br/>
		la Grande Bibliothèque du Bois Bandé
		<br/>
		<br/>
		<div style="font-size: 0.7em">
			Les Peluches ont regroupé ici l'Histoire des Aventuriers de ces quatre dernières années.
			<br/>
			Je suis sûre que tu retrouveras tes Hauts Faits parmi ces incunables des temps modernes.
			<div class="papier" style="font-style: italic; border:2px solid red">
				{#if statusVideos && statusVideos.jeuOuvert}
					{pseudo}, tu as visionné {gNbVues} vidéos du précieux fonds documentaire de l'IPA.
				{/if}
			</div>
			<br/>
		</div>
	</div>

	<div class="event">Les Evénements et mini jeux</div>

	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="uchronie" texte="Event VIII: L'Uchronie (mars 2024)" ext="evt" details=true
			mp4="ff-6-trailer">
			<div class="synthese">
				Synthèse de l'événement
			</div>
			<div class="gains">
				Les gagnants se sont répartis plus de 388 millions de Gils
			</div>
	</Entree>

<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="deepAI" texte="DeepAI (Janvier 2024)"
			mp4="ff14-deepai-teaser">
			<div class="synthese">
				Les Aventuriers ont aidé la Grande Peluche à évaluer DeepAI,
				une Intelligence Artificielle!
				<br/>
				Elle n'était pas au niveau, et elle ne fera pas partie de l'équipe de
				le Grande Peluche
			</div>
	</Entree>

	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="jungleBoogie" texte="Jungle Boogie (Janvier 2024)"
			mp4="ff14-venteprivee-2024">
			<div class="synthese">
				Les Aventuriers ont aidé la Grande Peluche à évaluer DeepAI,
				une Intelligence Artificielle!
			</div>
	</Entree>

	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="avantUchronie" texte="L'avant Uchronie (décembre 2023)"
			mp4="ff14-avant-uchronie">
			<div class="synthese">
				Alors que les Quatre explorent l'Ortho-Temps, l'Univers Connu semble perturbé par la Magie.
			</div>
			<div class="gains">
				Les Aventuriers se sont répartis 90 millions de Gils en participant à ces mini-jeux.
			</div>
	</Entree>

	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="broceliande" texte="Brocéliande (octobre 2023)"
		mp3="Benabar-foret-extrait" vol="0.2" >
		<img src="https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/Minijeu-Broceliande.png" class="imageDroite" alt=""/>
		<div class="synthese">
			Les Aventuriers de Brocéliande ont réussi à mener mon Emissaire au Chateau de Camelot,
			bien au dela des terres Sylphes, dans la forêt de Sombrelinceul, et découvrir le Grand Grimoire de la Magie.
		</div>
		<div class="gains">
			Les aventuriers se sont répartis 30 millions de Gils, le grand gagant est Fang avec 7,5 millions de Gils.
		</div>
		<div class="chapitre">
			La forêt de Sombrelinceul avait été recouverte de maléfices telle qu'était la foret de Brocéliande,
			lors de l'ère de la Magie.
		</div>
		<div class="chapitre">
			Les Aventuriers de Brocéliande ont alors dissipé les nombreux maléfices en résolvant des énigmes, puis ils
			ont établi un itinéraire permettant de partir de la Grande Bibliothèque du Bois Bandé et rejoindre le chateau
			de Camelot.
		</div>
	</Entree>

	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="transition" texte="La transition Magique (septembre 2023)"
		mp3="QueenMagic" vol="0.4">
			<div class="synthese">
				Alors que les Quatre, à l'issue du Event VI, Hypostasis, sont parti explorer de nouvelles dimensions
				et étendre l'Univers Connu, j'ai recu un message interdimensionnel que je n'avais pas réussi à comprendre.
				Grace aux Aventuriers, j'ai pu le décrypter !
			</div>
			<div class="gains">
				Les aventuriers se sont répartis 22,5 millions de Gils en participant au décryptage du message.
			</div>
			<div class="chapitre">
				De ce message, en voici le décryptage:
				<div class="quote">
					Ceci est un message que nous, les Quatre, envoyons depuis l'Ortho-Temps.
					<br/>
					En explorant une nouvelle dimension, nous faisons d'extraordinaires découvertes
					<br/>
					Ainsi, l'axe du temps classique n'est pas immutable
					<br/>
					On a vu des personnes disparaitre du présent classique et se retrouver ailleurs dans le passé.
					<br/>
					Un objet peut changer d'aspect, des claviers changer la disposition de leurs touches
					<br/>
					Ces perturbations ont forcement une origine
					<br/>
					Selon Anakin, ce pourrait être un effet qui ne soit pas lié aux Dimensions.
					<br/>
					Hikaru a appelé ce phénomène l'Uchronie, Luke l'a appelé la Magie.
					<br/>
					Robin est certain que celà constitue une menace pour l'Univers Connu.
					<br/>
					Grande Peluche, prépare des Chevaliers de l'Uchonie, c'est important.
					<br/>
					Amicalement, les Quatre.
				</div>
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="vacances" texte="En vacances, je n'oublie rien (Août 2023)">
			<div class="synthese">
				Partir en vacances seul n'est pas forcement un total plaisir.
				J'ai proposé aux Aventuriers de résoudre 24 énigmes, mais avec de la collaboration!
				Ainsi, pour qu'un Aventurier valide une énigme, il fallait qu'un autre Aventurier le lui permette.
				Les Aventuriers ont toujours trouvé des partenaires pour valider leurs réponses! 
			</div>
			<div class="gains">
				Les aventuriers se sont répartis 36,6 millions de Gils en découvrant les énigmes.
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="godot" texte="En attendant Godot (juin 2023)"
			mp4="godot">
			<div class="synthese">
				Les félicités insulaires de FF14 sont des endroits paradisiaques.
				<br/>
				Tels que dans la pièce "En Attendant Godot" de Samuel Beckett, les arbres de mon île semblent
				changer au fil du temps.
				<br/>
				J'ai proposé aux Aventuriers d'identifier ces changements.
				<br/>
				Ils l'ont fait!
			</div>
			<div class="gains">
				Les aventuriers se sont répartis 10,3 millions de Gils en découvrant les différences.
			</div>
			<img src="https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/Minijeu-Godot.png" class="imageFull" alt="" />
	</Entree>
	
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="hypostasis" texte="Event VII: Hypostasis (mai 2023)" ext="evt" details=true
			mp4="ff-5-trailer">
			<div class="synthese">
				Synthèse de l'événement
			</div>
			<div class="gains">
				Les gagnants se sont répartis plus de 350 millions de Gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="adage" texte="L'adage (février 2023)"
			mp4="ff-5-slogan">
			<div class="synthese">
				Alors que le Event VII, approchait, j'ai proposé aux Aventuriers d'en découvir son adage.
			</div>
			<div class="chapitre">
				La solution "Hypostatis, Quatre Corps, une ame" a été rapidement trouvée.
			</div>
			<div class="gains">
				Les aventuriers se sont répartis 10 millions de Gils.
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="prive" texte="Les Ventes Privées (Janvier 2023)"
			mp4="ff-5-venteprivee">
			<div class="synthese">
				Le mois de Janvier est l'occasion d'importantes promotions à l'HV de Moodle
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="mascottes" texte="Les mascottes de l'île (décembre 2022)"
			mp4="ff-5-mascottes">
			<div class="synthese">
				A l'occasion de la Noël 2022, un voyage sur une félicité insulaire permet de se réchauffer!
			</div>
			<div class="chapitre">
				Les Aventuriers ont identifié les mascottes en lévitation.
			</div>
			<div class="gains">
				Les aventuriers se sont répartis 10 millions de Gils.
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="mascottes_t" texte="Teaser des mascottes de l'île (décembre 2022)"
			mp4="ff-5-demain-mascottes">
			<div class="synthese">
				A l'occasion de la Noël 2022, un voyage sur une félicité insulaire permet de se réchauffer!
			</div>
			<div class="chapitre">
				Les Aventuriers ont identifié les mascottes en lévitation.
			</div>
			<div class="gains">
				Les aventuriers se sont répartis 10 millions de Gils.
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="jardin" texte="Le Jardin Extraordinaire (novembre 2022)"
			mp4="ff-5-jardinextraordinaire">
			<div class="synthese">
				Les Aventuriers ont déterminé les appétences des animaux de la Félicité insulaire
			</div>
			<div class="chapitre">
				La sexualité des animaux de le Félicité insulaire est libre.
				<br/>
				Certains sont célibataires, d'autres en couple hétéro, d'autres en couple homo...
			</div>
			<div class="gains">
				Les aventuriers se sont répartis 8 millions de Gils.
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="ascension" texte="Event VI: L'ascension d'Anakin (septembre 2022)" ext="evt" details=true
			mp4="ff-4-trailer">
			<div class="synthese">
				Les Compagnons de l'Ascension ont vaincu Sauron du Mordor et empêché la destruction de l'Univers Connu
			</div>
			<div class="gains">
				Les Compagnons de l'Ascension se sont répartis plus de 320 millions de Gils.
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="miaous" texte="Les miaous de la mi-août (Août 2022)"
			mp4="ff-4-teaser0c">
			<div class="synthese">
				Les Aventuriers de la mi-août ont découvert les 4 lieux
			</div>
			<div class="chapitre">
				Et Tsunehito a indiqué que le chat du troisème lieu était un... chien !!
			</div>
			<div class="gains">
				Les Aventuriers se sont répartis 5 millions de Gils.
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="afterpride" texte="L'after Pride (Juin 2022)"
			mp4="ff-4-teaser0b">
			<div class="synthese">
				Un mini jeu tout simple où il faut identifier 3 lieux.
			</div>
			<div class="gains">
				Les Aventuriers se sont répartis 3 millions de Gils.
			</div>
	</Entree>

	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="ultimate" texte="Event V: Ultimate Walker (février 2022)" ext="evt" details=true
			mp4="ff-3-trailer">
			<div class="synthese">
				La synthèse d'Ultimate Walker
			</div>
			<div class="gains">
				Les Ultimes Aventuriers se sont répartis plus de 320 millions de Gils.
			</div>
	</Entree>

	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="retour" texte="Event IV: le Retour du Lala (septembre 2021)" ext="evt" details=true
			mp4="ff-2-final">
			<div class="synthese">
				La synthèse de l'événement !
			</div>
			<div class="gains">
				Les participants se sont répartis plus de 200 millions de Gils
			</div>
	</Entree>

	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="quinzaine" texte="Event III: La quinzaine LGBT (mai 2021)" ext="evt" details=true
			mp4="ff-1-quinzaine-final">
			<div class="synthese">
				La synthèse du Event II, la quinzaine LGBT
			</div>
			<div class="gains">
				Les participants se sont répartis plus de 140 millions de gils
			</div>
	</Entree>
	
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="anniv" texte="Event II: L'anniversaire de Didi et Kiki (Décembre 2020)" ext="evt"
			mp4="ff-0-final2">
			<div class="synthese">
				Même si je suis la Grande Peluche Oracle des savoirs, je n'ai plus le détail
				de cet événement célébrant les 36 ans de vie commune IRL de Kiki et de son Didi, seulement la synthèse
			</div>
			<div class="gains">
				Les participants se sont répartis plus de 75 millions de gils.
			</div>
	</Entree>
	
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="lala" texte="Event I: Les challenges du LALA (Juin 2020)" ext="evt"
			mp3="Memoire-qui-flanche">
			<div class="synthese">
				Hélas, je n'ai meme pas une archive vidéo de ce premier Evenement !
			</div>
			<div class="gains">
				Il y avait quelques 60 millions de gils de gains...
			</div>
	</Entree>

	<Entree type="detail" bind:grimoire={grimoire} nom="uchronie" seq="VIII" texte="L'Uchronie"/>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="uchronie_1" texte="Teaser#1"
			mp4="ff-6-teaser1">
			<div class="synthese">
				Le premier teaser de l'Uchronie
			</div>
			<div class="gains">
				Les gagnants se sont répartis plus de 388 millions de Gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="uchronie_3" texte="Démarrage"
			mp4="ff-6-teaser3">
			<div class="synthese">
				La vidéo "top chrono"
			</div>
			<div class="gains">
				Les gagnants se sont répartis plus de 388 millions de Gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="uchronie_teotihuacan" texte="Teotihuacan"
			mp4="ff14-6-teotihuacan-challenge">
			<div class="synthese">
				A la recherche des runes dans Teotihuacan
			</div>
			<div class="gains">
				Les gagnants se sont répartis plus de 388 millions de Gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="uchronie_screens" texte="Les lieux Déracinés"
			mp4="ff14-6-screens">
			<div class="synthese">
				A la recherche des lieux déracinés.
			</div>
			<div class="gains">
				Les gagnants se sont répartis plus de 388 millions de Gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="uchronie_cristal" texte="Le Cristal de l'Uchronie"
			mp4="ff-6-cristal">
			<div class="synthese">
				La vidéo "A la recherche du cristal perdu"
			</div>
			<div class="gains">
				Les gagnants se sont répartis plus de 388 millions de Gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="uchronie_incantfail" texte="La Restauration du Temps"
			mp4="ff-6-dontgiveup">
			<div class="synthese">
				La Grande Peluche incante la Restauration du Temps.
			</div>
			<div class="gains">
				Les gagnants se sont répartis plus de 388 millions de Gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="uchronie_dirac" texte="Le Dirac des Quatre"
			mp4="ff-6-epilogue">
			<div class="synthese">
				Le Dirac des Quatre est activé, la Grande Peluche incante à nouveau la Restauration du Temps
			</div>
			<div class="gains">
				Les gagnants se sont répartis plus de 388 millions de Gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="uchronie_epilogue" texte="Epilogue"
			mp4="ff-6-trailer">
			<div class="synthese">
				Hommage aux Aventuriers de l'Uchronie
			</div>
			<div class="gains">
				Les gagnants se sont répartis plus de 388 millions de Gils
			</div>
	</Entree>
	
	<!-- platsMaite souvenirMaite -->

	<Entree type="detail" bind:grimoire={grimoire} nom="hypostasis" seq="VII" texte="Hypostasis"/>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="hypostasis_0" texte="Teaser#1"
			mp4="ff-5-teaser0">
			<div class="synthese">
				Le premier teaser du Event VII - Hypostasis
			</div>
			<div class="gains">
				Les gagnants se sont répartis plus de 350 millions de Gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="hypostasis_1" texte="Teaser#2"
			mp4="ff-5-teaser1">
			<div class="synthese">
				Le deuxième teaser du Event VII - Hypostasis
			</div>
			<div class="gains">
				Les gagnants se sont répartis plus de 350 millions de Gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="hypostasis_2" texte="Teaser#3"
			mp4="ff-5-teaser2">
			<div class="synthese">
				Le troisième teaser du Event VII - Hypostasis
			</div>
			<div class="gains">
				Les gagnants se sont répartis plus de 350 millions de Gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="hypostasis_3" texte="Teaser#4"
			mp4="ff-5-teaser3">
			<div class="synthese">
				Le dernier teaser du Event VII - Hypostasis
			</div>
			<div class="gains">
				Les gagnants se sont répartis plus de 350 millions de Gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="hypostasis_troubles" texte="Troubles"
			mp4="ff-5-troubles">
			<div class="synthese">
				Les Quatre sont troublés. Les Padawans des Savoirs vont, avec mon aide, localiser le Temple du Quantique
				afin de comprendre leurs troubles. Et leur découverte est inquiétante: Les Quatre se sont perdus dans les
				dimensions Quantiques.
			</div>
			<div class="gains">
				Les gagnants se sont répartis plus de 350 millions de Gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="hypostasis_explo" texte="Vision classique"
			mp4="ff-5-explo40">
			<div class="synthese">
				Pour rétablir la vision de l'Espace Classque, les Padawans des Savoir vont indiquer
				aux Quatre de nombreux lieux qu'ils ont parcourus dans le passé.
			</div>
			<div class="gains">
				Les gagnants se sont répartis plus de 350 millions de Gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="hypostasis_gravitation" texte="La gravitation"
			mp4="ff-5-newton">
			<div class="synthese">
				Les Padawan des Savoirs ont identifiés comment provoquer un flux de gravitation classique
				en chutant sur des coussins !
			</div>
			<div class="gains">
				Les gagnants se sont répartis plus de 350 millions de Gils
			</div>
	</Entree>		
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="hypostasis_temps" texte="Le temps"
			mp4="ff-5-calendrier">
			<div class="synthese">
				Les Quatre ne percoivent plus les dimensions Classiques, 
			</div>
			<div class="gains">
				Les gagnants se sont répartis plus de 350 millions de Gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="hypostasis_hasard" texte="Le Hasard"
			mp4="ff-5-hasard">
			<div class="synthese">
				Pour stimuler les dimensions classiques, il faut proposer aux Quatre du Hasard
				et non des règles de Probabilités
			</div>
			<div class="gains">
				Les gagnants se sont répartis plus de 350 millions de Gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="hypostasis_conjonction" texte="La Conjonction"
			mp4="ff-5-rapidite">
			<div class="synthese">
				Les Jedis des Savoirs peuvent provoquer la Grande Conjonction des Dimensions
			</div>
			<div class="gains">
				Les gagnants se sont répartis plus de 350 millions de Gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="hypostasis_kermesse" texte="La Kermesse"
			mp4="ff-5-kermesse">
			<div class="synthese">
				Les Jedis des Savoirs peuvent se reposer quelques jours et participer à la chasse aux sacoches.
			</div>
			<div class="gains">
				Les gagnants se sont répartis plus de 350 millions de Gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="hypostasis_chrono" texte="Le Chronogyre"
			mp4="ff-5-chronogyre">
			<div class="synthese">
				La découverte du Chronogyre et le Vortex des Dimensions
			</div>
			<div class="gains">
				Les gagnants se sont répartis plus de 350 millions de Gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="hypostasis_epilogue" texte="L'ortho-temps"
			mp4="ff-5-epilogue">
			<div class="synthese">
				Départ des Quatres vers l'Ortho-Temps
			</div>
			<div class="gains">
				Les gagnants se sont répartis plus de 350 millions de Gils
			</div>
	</Entree>

	
	<Entree type="detail" bind:grimoire={grimoire} nom="ascension" seq="VI" texte="L'Ascension d'Anakin" />
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="ascension_0" texte="Teaser#1"
			mp4="ff-4-teaser0">
			<div class="synthese">
				Le premier teaser de l'événement Event VI, l'ascension d'anakin
			</div>
			<div class="gains">
				Les Compagnons de l'Ascension se sont répartis plus de 320 millions de Gils.
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="ascension_1" texte="Teaser#2"
			mp4="ff-4-teaser1">
			<div class="synthese">
				Le deuxième teaser de l'événement Event VI, l'ascension d'anakin
			</div>
			<div class="gains">
				Les Compagnons de l'Ascension se sont répartis plus de 320 millions de Gils.
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="ascension_2" texte="Teaser#3"
			mp4="ff-4-teaser2">
			<div class="synthese">
				Le troisième teaser de l'événement Event VI, l'ascension d'anakin
			</div>
			<div class="gains">
				Les Compagnons de l'Ascension se sont répartis plus de 320 millions de Gils.
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="ascension_3" texte="Teaser#4"
			mp4="ff-4-teaser3">
			<div class="synthese">
				Le dernier teaser de l'événement Event VI, l'ascension d'anakin
			</div>
			<div class="gains">
				Les Compagnons de l'Ascension se sont répartis plus de 320 millions de Gils.
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="ascension_4p" texte="Le 4ème Pouvoir"
			mp4="ff-4-4emepouvoir">
			<div class="synthese">
				Les Padawans des Savoirs vont aider Anakin à comprendre les Pouvoirs, et en particulier le 4ème Pouvoir.
			</div>
			<div class="gains">
				Les Compagnons de l'Ascension se sont répartis plus de 320 millions de Gils.
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="ascension_3p" texte="Le 3ème Pouvoir"
			mp4="ff-4-explo30">
			<div class="synthese">
				Les Padawans des Savoir vont aider Anakin à maitriser le troisième Pouvoir.
			</div>
			<div class="gains">
				Les Compagnons de l'Ascension se sont répartis plus de 320 millions de Gils.
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="ascension_lf" texte="Le 2d Pouvoir"
			mp4="ff-4-laforce">
			<div class="synthese">
				Les Padawans des Savoir et Yoda vont aider Anakin à maitriser le second Pouvoir.
			</div>
			<div class="gains">
				Les Compagnons de l'Ascension se sont répartis plus de 320 millions de Gils.
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="ascension_sh" texte="Le Shai-hulud"
			mp4="ff-4-shai-hulud">
			<div class="synthese">
				Pour maîtriser le 4ème Pouvoir, il faut maitriser l'épice et donc maitriser le Ver.
				Les Padawans des Savoirs vont maitriser le Shai-hulud
			</div>
			<div class="gains">
				Les Compagnons de l'Ascension se sont répartis plus de 320 millions de Gils.
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="ascension_facteur" texte="Le repos des Padawans"
			mp4="ff-4-lefacteur">
			<div class="synthese">
				Maintenant qu'Anakin semble maîtriser les 4 pouvoirs, les Padawans des Savoirs s'offre un peu de repos
			</div>
			<div class="gains">
				Les Compagnons de l'Ascension se sont répartis plus de 320 millions de Gils.
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="ascension_be" texte="Le Bene gesserit"
			mp4="ff-4-benegesserit">
			<div class="synthese">
				Pour assurer son Ascension, Anakin doit passer l'épreuve du Gom Gabbar.
				Les Jedis des Savoirs localisent le temple du Bene Gesserit et aident alors
				Anakin à passer l'épreuve du Gom Gabbar.
			</div>
			<div class="gains">
				Les Compagnons de l'Ascension se sont répartis plus de 320 millions de Gils.
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="ascension_ke" texte="L'Ascension"
			mp4="ff-4-kermesse">
			<div class="synthese">
				Anakin maitrise maintenant les 4 pouvoirs et les 3 pouvoirs.
				Les compagnons de l'Ascension passent quelques jours de vacances en découvrant quelques
				goodies. 
			</div>
			<div class="gains">
				Les Compagnons de l'Ascension se sont répartis plus de 320 millions de Gils.
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="ascension_ept" texte="L'épice pour tous"
			mp4="ff-4-epicepourtous">
			<div class="synthese">
				Maité, la Grande Peluche Cuisinière, a découvert le moyen pour que tous les
				Compagnons de l'Ascension puisse replier l'espace
			</div>
			<div class="gains">
				Les Compagnons de l'Ascension se sont répartis plus de 320 millions de Gils.
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="ascension_gm" texte="La Grande Menace"
			mp4="ff-4-grandemenace">
			<div class="synthese">
				Les Jedis des Savoirs rejoignent Anakin et Luke dans l'Antre de la Grande menace
			</div>
			<div class="gains">
				Les Compagnons de l'Ascension se sont répartis plus de 320 millions de Gils.
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="ascension_lp" texte="Lieux de paix"
			mp4="ff-4-lieuxdepaix">
			<div class="synthese">
				Pour appliquer la Stratégie Finale d'Anakin, que les Jedis des Savoirs ont pu consulter dans
				son livre de correspondance, il faut trouver les 3 lieux de Paix Premiers.
			</div>
			<div class="gains">
				Les Compagnons de l'Ascension se sont répartis plus de 320 millions de Gils.
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="ascension_st" texte="La stratégie finale"
			mp4="ff-4-distraire">
			<div class="synthese">
				La stratégie finale d'Anakin ou les Jedis des Savoirs doivent explorer de nombreux lieux.
			</div>
			<div class="gains">
				Les Compagnons de l'Ascension se sont répartis plus de 320 millions de Gils.
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="ascension_ep" texte="Epilogue"
			mp4="ff-4-epilogue">
			<div class="synthese">
				La défaite de Sauron du Mordor
			</div>
			<div class="gains">
				Les Compagnons de l'Ascension se sont répartis plus de 320 millions de Gils.
			</div>
	</Entree>

	
	<Entree type="detail" bind:grimoire={grimoire} nom="ultimate" seq="V" texte="Ultimate Walker" />
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="ultimate_0" texte="Teaser#1"
			mp4="ff-3-teaser0">
			<div class="synthese">
				Le premier trailer de l'événement Event V, Ultimate Walker
			</div>
			<div class="gains">
				Les Ultimes Aventuriers se sont répartis plus de 320 millions de Gils.
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="ultimate_1" texte="Teaser#2"
			mp4="ff-3-teaser1">
			<div class="synthese">
				Le deuxième trailer de l'événement Event V, Ultimate Walker
			</div>
			<div class="gains">
				Les Ultimes Aventuriers se sont répartis plus de 320 millions de Gils.
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="ultimate_2" texte="Teaser#3"
			mp4="ff-3-teaser2">
			<div class="synthese">
				Le troisième trailer de l'événement Event V, Ultimate Walker
			</div>
			<div class="gains">
				Les Ultimes Aventuriers se sont répartis plus de 320 millions de Gils.
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="ultimate_3" texte="Teaser#4"
			mp4="ff-3-teaser3">
			<div class="synthese">
				Le dernier teaser du Event V, Ultimate Walker
			</div>
			<div class="gains">
				Les Ultimes Aventuriers se sont répartis plus de 320 millions de Gils.
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="ultimate_temps" texte="Le carnet du Temps"
			mp4="ff-3-temps">
			<div class="synthese">
				Deux carnets sont fondamentaux car ils déterminent les voyages.
				Le premier est caché dans la chambre du temps.
				Les Ultimes Aventuriers vont le découvrir!
			</div>
			<div class="gains">
				Les Ultimes Aventuriers se sont répartis plus de 320 millions de Gils.
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="ultimate_laby" texte="Le Labyrinthe"
			mp4="ff-3-dedale">
			<div class="synthese">
				Maitriser le carnet du temps, c'est fondamental, mais
				maitriser le carnet des cieux est tout autant important.
				En les maitrisant tous les deux... 
				Un Ultime Aventurier aura tout UltimateWalker à portée de souris ou de manette !
			</div>
			<div class="gains">
				Les Ultimes Aventuriers se sont répartis plus de 320 millions de Gils.
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="ultimate_boisbande" texte="Le Bois Bandé"
			mp4="ff-3-robin">
			<div class="synthese">
				Robin, le protecteur du Bois Bandé, a contacté les Ultimes Aventuriers et sollicite leur aide.
			</div>
			<div class="gains">
				Les Ultimes Aventuriers se sont répartis plus de 320 millions de Gils.
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="ultimate_templier" texte="Les templiers"
			mp4="ff-3-templiers">
			<div class="synthese">
				Carnet du temps, carnet des cieux, les voyages, le bois bandé, c'est sympa...
				Mais une menace, classique, rode en Eorzéa...
				Ce sont les templiers!
				Les Ultimes Aventuriers vont en identifier tous les repaires
			</div>
			<div class="gains">
				Les Ultimes Aventuriers se sont répartis plus de 320 millions de Gils.
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="ultimate_youki" texte="Youki, Pépère et Mémère"
			mp4="ff-3-youki">
			<div class="synthese">
				Alors que Robin protège les Peluches du Bois Bandé, qu'Hikaru surveille la planète Arrakis, 
				il y en a qui jouent l'insouciance...
			</div>
			<div class="gains">
				Les Ultimes Aventuriers se sont répartis plus de 320 millions de Gils.
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="ultimate_rdv" texte="Le Rendez-vous"
			mp4="ff-3-rendez-vous">
			<div class="synthese">
				Hikaru est au désespoir car Robin n'est pas à leur premier rendez-vous après qu'ils se 
				soient déclaré leur Amour. Les Ultimes Aventuriers vont indiquer à Hikaru que Robin
				doit terminer ses Missions dans le Bois Bandé.
			</div>
			<div class="gains">
				Les Ultimes Aventuriers se sont répartis plus de 320 millions de Gils.
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="ultimate_temple" texte="Le Temple Marin"
			mp4="ff-3-poseidon">
			<div class="synthese">
				Poseidon, ne pouvant accepter l'Amour unissant Robin et Hikaru, entre en enrage.
				Les Ultimes Aventuriers vont réussir à sauver les poisson du Temple Marin.
			</div>
			<div class="gains">
				Les Ultimes Aventuriers se sont répartis plus de 320 millions de Gils.
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="ultimate_voyage" texte="Starfleet"
			mp4="ff-3-touriste">
			<div class="synthese">
				Après avoir déjoué un attentant de Dark Vador visant l'Enterprise,
				les Ultimes Aventuriers ont participé au Challenge de Starfleet et ont gagné un voyage
				sur l'Enterprise. Ils ont préféré offrir le voyage à Robin pour qu'il accompagne Hikaru dans sa mission.
			</div>
			<div class="gains">
				Les Ultimes Aventuriers se sont répartis plus de 320 millions de Gils.
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="ultimate_pol" texte="Power Of Love"
			mp4="ff-3-power-of-love">
			<div class="synthese">
				Plusieurs jours d'intense activité des Ultimes Aventuriers ont permis de diffuser le
				Power Of Love dans tout l'Univers Connu
			</div>
			<div class="gains">
				Les Ultimes Aventuriers se sont répartis plus de 320 millions de Gils.
			</div>
	</Entree>

	
	<Entree type="detail" bind:grimoire={grimoire} nom="retour" seq="IV" texte="Le Retour du LALA" />
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="retour_0" texte="Teaser#1"
			mp4="ff-2-teaser">
			<div class="synthese">
				Le premier Teaser du Retour du LALA
			</div>
			<div class="gains">
				Les participants se sont répartis plus de 200 millions de Gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="retour_1" texte="Teaser#2"
			mp4="ff-2-teaser2">
			<div class="synthese">
				Le deuxième Teaser du Retour du LALA
			</div>
			<div class="gains">
				Les participants se sont répartis plus de 200 millions de Gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="retour_2" texte="Teaser#3"
			mp4="ff-2-teaser3">
			<div class="synthese">
				Le troisième Teaser du Retour du LALA
			</div>
			<div class="gains">
				Les participants se sont répartis plus de 200 millions de Gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="retour_3" texte="Teaser#4"
			mp4="ff-2-teaser4">
			<div class="synthese">
				Le dernier Teaser du Retour du LALA
			</div>
			<div class="gains">
				Les participants se sont répartis plus de 200 millions de Gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="retour_lanternes" texte="Les LA-LAnternes volées"
			mp4="ff-2-lalanternes">
			<div class="synthese">
				Les aventuriers vont découvrir que 2 lanternes ont été volées dans le sauna
			</div>
			<div class="gains">
				Les participants se sont répartis plus de 200 millions de Gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="retour_lantsol" texte="Les LALAnternes (soluce)"
			mp4="ff-2-lalanternes-sol">
			<div class="synthese">
				La solution des LA-LAnternes
			</div>
			<div class="gains">
				Les participants se sont répartis plus de 200 millions de Gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="retour_outes" texte="LALA où t'es?"
			mp4="ff-2-lalaoutes">
			<div class="synthese">
				Des lieux à découvrir...
			</div>
			<div class="gains">
				Les participants se sont répartis plus de 200 millions de Gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="retour_table" texte="LALA table ronde"
			mp4="ff-2-tableronde">
			<div class="synthese">
				Rejoingnez la table ronde avec des amis!
			</div>
			<div class="gains">
				Les participants se sont répartis plus de 200 millions de Gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="retour_khloe" texte="Khloe, LALAmie"
			mp4="ff-2-khloe">
			<div class="synthese">
				Faire plaisir à Khloe, notre LALAmie.
			</div>
			<div class="gains">
				Les participants se sont répartis plus de 200 millions de Gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="retour_gloubi" texte="Gloubiboul-LALA-ga"
			mp4="ff-2-gloubiboulga">
			<div class="synthese">
				Découvrir la recette du GloubibouLALAga
			</div>
			<div class="gains">
				Les participants se sont répartis plus de 200 millions de Gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="retour_glousol" texte="Gloubiboul-LALA-ga (soluce)"
			mp4="ff-2-gloubi-soluce">
			<div class="synthese">
				Soluce la recette du GloubibouLALAga
			</div>
			<div class="gains">
				Les participants se sont répartis plus de 200 millions de Gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="retour_tralala" texte="Touch my tra-LALA"
			mp4="ff-2-boumboumboum">
			<div class="synthese">
				A la découverte de backrooms cachées !
			</div>
			<div class="gains">
				Les participants se sont répartis plus de 200 millions de Gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="retour_trasol" texte="Touch my tra-LALA (soluce)"
			mp4="ff-2-boum-soluce">
			<div class="synthese">
				Soluce des backrooms cachées !
			</div>
			<div class="gains">
				Les participants se sont répartis plus de 200 millions de Gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="retour_lalabi" texte="LALAbitant"
			mp4="ff-2-rapidite">
			<div class="synthese">
				Trouvez l'habitant, le LALABITANT, à l'aide d'indices qui seront découverts sur discord.
			</div>
			<div class="gains">
				Les participants se sont répartis plus de 200 millions de Gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="retour_disco" texte="LALA discothèque"
			mp4="ff-2-disco">
			<div class="synthese">
				Les Aventuriers doivent découvrir les 3 lieux possibles de la nouvelle discothèque.
			</div>
			<div class="gains">
				Les participants se sont répartis plus de 200 millions de Gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="retour_vivre" texte="Vivre et ne pas LALAisser mourir"
			mp4="ff-2-lala007">
			<div class="synthese">
				Les Aventuriers ne doivent pas laisser mourir les plantations.
			</div>
			<div class="gains">
				Les participants se sont répartis plus de 200 millions de Gils
			</div>
	</Entree>

	
	<Entree type="detail" bind:grimoire={grimoire} nom="quinzaine" seq="III" texte="La Quinzaine LGBT+" />
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="quinzaine_intro" texte="Teaser"
			mp4="ff-1-quinzaine-teaser">
			<div class="synthese">
				Le teaser du Event III
			</div>
			<div class="gains">
				Les participants se sont répartis plus de 140 millions de gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="quinzaine_potager" texte="Le Potager"
			mp4="ff-1-quinzaine-potager">
			<div class="synthese">
				Relever en premier la floraison des plantes du potager
			</div>
			<div class="gains">
				Les participants se sont répartis plus de 140 millions de gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="quinzaine_sauna" texte="Le sauna"
			mp4="ff-1-quinzaine-slip">
			<div class="synthese">
				Trouver un sauna coquin et pourrir le noob qui insulte les lalas !
			</div>
			<div class="gains">
				Les participants se sont répartis plus de 140 millions de gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="quinzaine_gogo" texte="Le GogoDancer"
			mp4="ff-1-quinzaine-gogodancer">
			<div class="synthese">
				Le plus grand Gogodancer a perdu ses plugs !
			</div>
			<div class="gains">
				Les participants se sont répartis plus de 140 millions de gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="quinzaine_khloe" texte="Khloe la généreuse"
			mp4="ff-1-quinzaine-khloe">
			<div class="synthese">
				Faire ami-ami avec Khloe
			</div>
			<div class="gains">
				Les participants se sont répartis plus de 140 millions de gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="quinzaine_roses" texte="La vie en rose"
			mp4="ff-1-quinzaine-roses">
			<div class="synthese">
				Découvrir des roses
			</div>
			<div class="gains">
				Les participants se sont répartis plus de 140 millions de gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="quinzaine_roses_sol" texte="La vie en rose (soluce)"
			mp4="ff-1-quinzaine-roses-soluce">
			<div class="synthese">
				La soluce de la découverte des roses
			</div>
			<div class="gains">
				Les participants se sont répartis plus de 140 millions de gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="quinzaine_crypte" texte="La crypte"
			mp4="ff-1-quinzaine-crypte">
			<div class="synthese">
				Retrouver les lieux ou sont tombés des Héros
			</div>
			<div class="gains">
				Les participants se sont répartis plus de 140 millions de gils
			</div>
	</Entree>
	<Entree statusVideos={statusVideos} bind:grimoire={grimoire} nom="quinzaine_coquinou" texte="Le coquinou (soluce)"
			mp4="ff-1-quinzaine-coquinou">
			<div class="synthese">
				Découvrir des indices sur discord pour identifier le Coquinou du Club
			</div>
			<div class="gains">
				Les participants se sont répartis plus de 140 millions de gils
			</div>
	</Entree>

	
	<div>&nbsp;</div>
	<div>
		Voila, ceci termine les Archives du Bois Bandé relatives aux mini jeux et aux événements
		organisés par Kikiadoc Lepetiot depuis plus de 3 ans.
	</div>
	<div>&nbsp;</div>

<!-- P1.svelte -->
