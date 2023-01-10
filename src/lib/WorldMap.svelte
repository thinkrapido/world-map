<script context="module" lang="ts">
    export async function load() {
        const response = await fetch(`/coastline.json`); // stored in static folder
        const coastline = await response.json();
        return coastline
    }
</script>  
  
<script lang="ts">

    import { debouncer } from "./utils/debounce";
    import { d3_select } from "./utils/d3"
	import { onMount } from "svelte";



    let worldMap: any
    export let coastline: any


    onMount(async () => {
        const coastline = await load()
        console.log(coastline)
        render()
    })

    const render = () => {
        worldMap = d3_select(worldMap)
    }

    const rerender = debouncer(() => {
        render()
    }, 1)


</script>

<div>
    <svg>
        <g bind:this={worldMap}>
            <circle cx="50" cy="50" r="20" />
        </g>
    </svg>    
</div>


<style>

    * {
        position: relative;
    }

    div {
        width: 800px;
        height: 600px;

        margin: 0 auto;
        border: 1px solid blue;
    }
    svg {
        width: 100%;
        height: 100%;
    }

</style>