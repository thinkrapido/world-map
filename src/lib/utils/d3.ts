
import * as d3 from "d3"

export const d3_select = (sel: any): any => {
    if (!sel || !sel.select) {
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

