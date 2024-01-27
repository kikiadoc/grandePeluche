
<script>
	export let nom="TBD";
	export let seq="TBD";
	export let texte="TBD";
	export let grimoire=null;

	function scrollTop(e) {
		console.log("scrolltop",e);
		setTimeout( () => {
			document.getElementById(e).scrollIntoView({behavior: "smooth"});
		}, 200);
	}

	function goEvent() {
		grimoire = nom;
		scrollTop(grimoire);
	}
</script>

<hr />
<div class="event" id="{nom}_detail" on:click={goEvent} role="button" tabindex=0 on:keypress={null} >
	Event {seq}: {texte} (détails) ⏫
</div>

<!-- P1_Detail.svelte -->

