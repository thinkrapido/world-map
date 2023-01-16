<script context="module" lang="ts">
    export async function load(url: string) {
        const response = await fetch(url);
        return await response.json();
    }
</script>  
  
<script lang="ts">

    import { debouncer } from "./utils/debounce";
    import { d3_select, rm_px } from "./utils/d3"
	import { onMount } from "svelte";
	import * as d3 from "d3";
	import { pairs } from "./utils/transformations";
    import { Quad } from "./validators/quads"



    let div: any
    let worldMap: any
    let dots1: any
    let dots2: any
    let dots3: any
    let dotActive: any
    
    let coastline: any = []
    let lines: any = []

    let validatorCoordinates: any = []
    let quads: Quad = new Quad(180, -180, -180, 180)
    $: {
        const [scX, scY] = get_scales()
        const [width, height] = canvas_size()
        const [top, left] = [0, 0]
        const [bottom, right] = [height, width]
        quads = new Quad(top, right, bottom, left, validatorCoordinates.map(projection).map((k: any) => [scX(k[0]), scY(k[1])]))
        quads.distribute(5)
        rerender()
    }
    $: {
        lines = coastline
            .map(map_coastlines)
            .filter((k: any[]) => k.length > 2)
        rerender()            
    }


    onMount(async () => {
        coastline = await load(`/coastline.json`)
        validatorCoordinates = await load(`/validator-coordinates.json`)
        render()
    })

    const render = () => {
        div = d3_select(div)
        dots1 = d3_select(dots1)
        dots2 = d3_select(dots2)
        dots3 = d3_select(dots3)
        dotActive = d3_select(dotActive)
        worldMap = d3_select(worldMap)
        render_coastlines()
        render_dots1()
    }

    const rerender = debouncer(() => {
        d3_select(worldMap).selectChildren().remove()
        render()
    }, 1)

    const render_coastlines = () => {
        if (!lines.length) {
            return
        }
        const [scX, scY] = get_scales()
        lines.forEach((line: any) => {
            const g = worldMap.append('g')
                .selectAll('line')
                .data(pairs(line))
                .enter()
                .append('line')
                .attr('x1', (d: any) => scX(d[0][0]))
                .attr('y1', (d: any) => scY(d[0][1]))
                .attr('x2', (d: any) => scX(d[1][0]))
                .attr('y2', (d: any) => scY(d[1][1]))
                .attr('stroke', 'black')
                .attr('stroke-width', 1)
        })
    }
    const render_dots1 = () => {
        quads.draw_dot(d3_select(dots1))
    }

    const projection = d3.geoMercator()

    const map_coastlines = (k: any[]) => k
        .filter((k: any, i: number) => !(i % 13))
        .map(projection)

    const get_scales = () => {
        const [width, height] = canvas_size()
        const scX = d3.scaleLinear().domain([0, 1000]).range([0, width])
        const scY = d3.scaleLinear().domain([-90, 440]).range([0, height])
        return [scX, scY]
    }
    const canvas_size = () => {
        if (!div) {
            return [0, 0]
        }
        div = d3_select(div)
        return [div.style('width'), div.style('height')].map(rm_px)
    }

</script>

<div bind:this={div}>
    <svg>
        <g bind:this={worldMap}/>
        <g bind:this={dots1}/>
        <g bind:this={dots2}/>
        <g bind:this={dots3}/>
        <g bind:this={dotActive}/>
    </svg>    
</div>


<style>

    * {
        position: relative;
    }

    div {
        width: 800px;
        height: 400px;

        margin: 0 auto;
        border: 1px solid blue;
    }
    svg {
        width: 100%;
        height: 100%;
    }

</style>