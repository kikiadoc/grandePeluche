<script>
	import { onMount, onDestroy } from 'svelte';
	import { apiCall, loadIt, storeIt } from './storage.js';
	import Epiq from './Epiq.svelte';

	export let wsCallComponents; 
	export let pseudo;
	export let page;

	onMount( () => { if (wsCallComponents) wsCallComponents.add(myWsCallback);	} );
	onDestroy( () => { if (wsCallComponents) wsCallComponents.delete(myWsCallback);	} );
	function myWsCallback(m) {
		// pas de callback ws pour l'instant
	}

	// Gestion de l'épique
	let epiqStep = loadIt("P205_epiqStep", 0);
	$: storeIt("P205_epiqStep",epiqStep);
</script>
<style>
</style>

{#if epiqStep!=0}
	<input type=button value="Réafficher le lore" on:click={()=>{epiqStep=0}} />
{/if}
{#if epiqStep==0}
	<div class="reveal">
		{pseudo}, si tu as gagné des gils lors des mini-jeux de l'Avant 2024,
		ou que tu en avais déjà un peu auparavent,
		le temps est peut-être venu de les dépenser de façon efficiente !
		<br/>
		Car c'est maintenant le mois du Jungle Boogie !
		<br/>
		<Epiq bind:step={epiqStep} oui=1 ouiVal="C'est quoi le Jungle Boogie?" ouiVideo="ff14-venteprivee-2024" />
	</div>
{/if}
{#if epiqStep==1}
	<div class="reveal">
		Pour profiter des réductions du Jungle Boogie, il faut comparer les prix en inter-mondes via
		<a href="https://universalis.app" target="_blank">https://universalis.app</a> et ceux de Moogle.
		Voila la façon de procéder pour un objet "Grand Bassin de Jardin".
		<br/>
		<img style="width: 100%" src="https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/jungleboogie.png" alt="" />
		<br/>
		<Epiq bind:step={epiqStep} oui=2 ouiVal="Et après?" />
	</div>
{/if}
{#if epiqStep==2}
	<div class="reveal">
		Quand tu as identifié un objet que tu souhaites acheter et qu'il est en vente par un servant de Kikiadoc,
		tu peux alors mp @kikiadoc sur discord ou IG pour échanger cet objet à 50% du prix de l'HV.
		<br/>
		C'est valable pour TOUS les objets en vente par les servants de Kikiadoc, même pour
		les skins de maisonnette à plusieurs millions de Gils! 
		<br/>
		La seule contrainte est que tu ne revendes pas les objets que tu as échangés mais que tu les utilises pour toi.
		<br/>
		Voila, je t'ai tout dit. A toi d'organiser tes achats.
		<br/>
		<Epiq bind:step={epiqStep} bind:page={page} oui=3 ouiVal="Et la liste des servants ?" />
	</div>
{/if}
{#if epiqStep==3}
	<div class="reveal">
		Ah oui, j'oubliais...
		<br/>
		<u>Voici les 72 servants qui participent au Jungle Boogie, par ordre alphabétique:</u>
		<br/>
		Ils contiennent un "*kiki*" ou un nom de mannequin que tu as rencontré lors des précédentes aventures. 
		<br/>
		<u>Attention</u>, certains joueurs ont peut être nommé leurs servants de façon proche. Ainsi, si "Yoda-" est
		un participant du Jungle Boogie, le servant nommé "Yoda" n'est pas concerné.
		<br/>
		<i>
Anakin-
anakin-a-real-reborn
anakin-bc
Anakin-enfant
Anakin'
Analin-x
baroudeurakiki
Chronos-le-temps
coquinou-a-kiki
dark-vador
Dedale
Eon-l'eternite
fleuraukiki
Frere-tuck
grande-peluche-recol
grenierjoli
han-solo
Hikaru-
hikaru-bb
Hikaru-sulu
Icare-l'insouciant
James-t-kirk
Kairos-l'instant
kiki-bogosse-a-anaki
kiki-bot-a
kiki-bot-b
kiki-calinou-a
kiki-calinou-b
kiki-calinou-c
kiki-calinou-d
kiki-calinou-e
kiki-calinou-f
kiki-le-bogosse-b
kiki-le-bogosse-c
kiki-le-bogosse-d
kiki-le-bogosse-e
kiki-le-bogosse-f
kiki-min-c
kiki-min-c-hikaru
kiki's
kiki's-special
kikibot-a
kikibot-b
kikilejoli-dps-a
kikilejoli-min-a
kikilejoli-min-b
kikilejoli-min-c
kikilejoli-min-d
kikipec-a
kikireactif
Lecoquin-a
Lecoquin-b
Lecoquin-c
Lecoquin-d
Luke-
luke-bd
luke-skywalker
Luke'
Mortianna
Mr-spock
Nyota-uhura
Petit-jean
Reverende-mere
Robin-
robin-ba
Robin-des-bois
Robin-des-bois-
Sennacherib
superstock'a'kiki
Triton-le-messager
Yoda-
zeboy-a-kiki		</i>
		<br/>
		<Epiq bind:step={epiqStep} bind:page={page} oui=0 ouiPage=0 ouiVal="J'ai tout compris" non=0 nonVal="Redis-moi" />
	</div>
{/if}

<!-- P205.svelte -->

