<script context="module" lang="ts">
    export async function load(url: string) {
        const response = await fetch(url);
        return await response.json();
    }
</script>  
  
<script lang="ts">

    import { debouncer } from "./utils/debounce";
    import { d3_select, get_rect, canvas_size } from "./utils/d3"
    import { clamp } from "./utils/math"
    import { zip } from "./utils/transformations"
	import { onMount } from "svelte";
	import * as d3 from "d3";
	import { pairs } from "./utils/transformations";
    import { Quad } from "./validators/quads"
	import { Zoom } from "./zoom";



    let div_size: number[] = [0, 0]
    let div: any
    let worldMap: any
    let dots1: any
    let dots2: any
    let dots3: any
    let dotActive: any
    
    let worldMapBg: any
    let coastline: any = []
    let lines: any = []
    let zoom: any
    let mousePosition: number[] = [0, 0]

    const ZOOM_FACTOR_MAX = 9
    const ZOOM_FACTOR_MIN = 1
    let ZOOM_FACTOR = ZOOM_FACTOR_MIN
    $: {
        ZOOM_FACTOR = Math.floor(clamp(ZOOM_FACTOR, ZOOM_FACTOR_MIN, ZOOM_FACTOR_MAX))
        const [width, height] = div_size
        zoom = new Zoom([width, height], ZOOM_FACTOR)
        rerender()
    }

    let validatorCoordinates: any = []
    let quads: Quad = new Quad(180, -180, -180, 180)
    $: {
        lines = coastline
            .map(map_coastlines)
            .filter((k: any[]) => k.length > 2)
        rerender()            
    }


    onMount(async () => {
        worldMapBg = await getWorldMap()
        coastline = await load(`/coastline.json`)
        validatorCoordinates = await load(`/validator-coordinates.json`)
        mousePosition = canvas_size(div).map((d: number) => d / 2)
        div_size = canvas_size(div)
        render()
    })

    const render = () => {
        div = d3_select(div)
        worldMap = d3_select(worldMap)
        dots1 = d3_select(dots1)
        dots2 = d3_select(dots2)
        dots3 = d3_select(dots3)
        dotActive = d3_select(dotActive)
        render_worldMap()
        render_coastlines()
        render_dots1()
    }

    const rerender = debouncer(() => {
        d3_select(worldMap).selectChildren().remove()
        d3_select(dots1).selectChildren().remove()
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
    const render_worldMap = () => {
        if (!lines.length) {
            return
        }
        const scale = .43
        let svg = worldMapBg.node().innerHTML
        svg = svg.replace(/ xmlns="http:\/\/www.w3.org\/2000\/svg"/g, '')
        svg = `<g transform="translate(0,-20),scale(${scale * 1.045},${scale})">${svg}</g>`
        worldMap.html(svg)
    }
    const render_dots1 = () => {
            const [scX, scY] = get_scales()
            const [width, height] = canvas_size(div)
            const [top, left] = [0, 0]
            const [bottom, right] = [height, width]
            quads = new Quad(top, right, bottom, left, validatorCoordinates.map(projection).map((k: any) => [scX(k[0]), scY(k[1])]))
            const level = zoom.level + 3 || 4
            quads.distribute(level)
            quads.draw_dot(d3_select(dots1), level)
    }

    const projection = d3.geoMercator()

    const map_coastlines = (k: any[]) => k
        .filter((k: any, i: number) => !(i % 7))
        .map(projection)

    const get_scales = () => {
        const [width, height] = canvas_size(div)
        if (width == 0 && height == 0) {
            return [(d: number):number => 0, (d: number):number => 0]
        }
        zoom.position = mousePosition 
        const zoomX = d3.scaleLinear().domain([zoom.left, zoom.right]).range([0, width])
        const zoomY = d3.scaleLinear().domain([zoom.top, zoom.bottom]).range([0, height])
        const scX   = d3.scaleLinear().domain([0, 1000]).range([0, width])
        const scY   = d3.scaleLinear().domain([-90, 440]).range([0, height])
        const zX    = (d: number):number => zoomX(scX(d))
        zX.invert   = (d: number):number => scX.invert(zoomX.invert(d))
        const zY    = (d: number):number => zoomY(scY(d))
        zY.invert   = (d: number):number => scY.invert(zoomY.invert(d))
        return [zX, zY]
    }
    const getWorldMap = async () => {
        return d3_select(await d3.svg('/world-map.svg')).select('#Layer_1-2')
    }


    const mapResize = (node: HTMLElement, parameters?: any) => {
        
        let position: number[] = canvas_size(div).map((d: number) => d / 2)
        let dragging: boolean = false

        const wheel = (event: WheelEvent) => {
            event.preventDefault()
            ZOOM_FACTOR -= event.deltaY / 120;
            mousePosition = position
        }

        const mousemove = (event: MouseEvent) => {
            event.preventDefault()
            const rect = get_rect(node)
            position = [event.clientX - rect.clientX, event.clientY - rect.clientY]
            if (dragging) {
                mousePosition = 
                    zip(
                        position
                            .map((d: number): number => -d)
                        ,
                        canvas_size(div)
                    )
                        .map((d: number[]): number => d[0] + d[1])
                rerender()
            }
        }
        const mouseout = (event: MouseEvent) => {
            event.preventDefault()
            position = canvas_size(div).map((d: number) => d / 2)
        }
        const mousedown = (event: MouseEvent) => {
            dragging = true
        }
        const mouseup = (event: MouseEvent) => {
            dragging = false
        }

        node.addEventListener('wheel', wheel)
        node.addEventListener('mousemove', mousemove)
        node.addEventListener('mouseout', mouseout)
        node.addEventListener('mousedown', mousedown)
        node.addEventListener('mouseup', mouseup)

        return {
            destroy() {
                node.removeEventListener('wheel', wheel)
                node.removeEventListener('mousemove', mousemove)
                node.removeEventListener('mouseout', mouseout)
                node.removeEventListener('mousedown', mousedown)
                node.removeEventListener('mouseup', mouseup)
            }
        }
    }
    const reset_zoom = () => {
        mousePosition = canvas_size(div).map((d: number) => d / 2)
        ZOOM_FACTOR = ZOOM_FACTOR_MIN
        rerender()
    }

</script>

<div bind:this={div} use:mapResize on:mouseleave={reset_zoom}>
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