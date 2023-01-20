
import * as d3 from "d3"

export const d3_select = (sel: any): any => {
    if (!sel || !(sel._groups && sel._parents)) {
        sel = d3.select(sel)
    }
    return sel
}

export const rm_px = (value: string): number => {
    return +(value.replace('px', ''))
}
export const add_px = (value: number): string => {
    return `${value}px`
}

export interface Rect {
    x: number
    y: number
    clientX: number
    clientY: number
    width: number
    height: number
}
export const get_rect = (node: HTMLElement|SVGAElement): Rect => {
    const { left, top, x, y, width, height, ..._} = node.getBoundingClientRect()
    return { x, y, clientX: window.scrollX + left, clientY: window.scrollY + top, width, height }
}