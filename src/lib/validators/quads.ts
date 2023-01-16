
import { rm_px } from "$lib/utils/d3"
import { zip } from "../utils/transformations"

enum Quadrant {
    A, B, C, D,
}

export class Quad {

    private a: Quad|null = null
    private b: Quad|null = null
    private c: Quad|null = null
    private d: Quad|null = null

    constructor(
        private top: number, 
        private right: number, 
        private bottom: number, 
        private left: number, 
        private coordinates: number[][] = [],
    ) {}

    mid_horizontal(): number {
        return (this.right + this.left) / 2
    }
    mid_vertical(): number {
        return (this.bottom + this.top) / 2
    }
    new_A_quad(): Quad {
        return new Quad(
            this.top, 
            this.mid_horizontal(), 
            this.mid_vertical(), 
            this.left
        )
    }
    new_B_quad(): Quad {
        return new Quad(
            this.top, 
            this.right, 
            this.mid_vertical(), 
            this.mid_horizontal()
        )
    }
    new_C_quad(): Quad {
        return new Quad(
            this.mid_vertical(), 
            this.mid_horizontal(), 
            this.bottom, 
            this.left
        )
    }
    new_D_quad(): Quad {
        return new Quad(
            this.mid_vertical(), 
            this.right, 
            this.bottom, 
            this.mid_horizontal()
        )
    }

    quadrant(position: number[]): Quadrant {
        const [longitude, latitude] = position
        if (longitude < this.mid_horizontal()) {
            if (latitude < this.mid_vertical()) {
                return Quadrant.A
            }
            else {
                return Quadrant.C
            }
        }
        else {
            if (latitude < this.mid_vertical()) {
                return Quadrant.B
            }
            else {
                return Quadrant.D
            }
        }
    }
    append(position: number[]) {
        let quad
        switch(this.quadrant(position)) {
            case Quadrant.A:
                quad = this.a || this.new_A_quad()
                quad.coordinates.push(position)
                this.a = quad
                break;
            case Quadrant.B:
                quad = this.b || this.new_B_quad()
                quad.coordinates.push(position)
                this.b = quad
                break;
            case Quadrant.C:
                quad = this.c || this.new_C_quad()
                quad.coordinates.push(position)
                this.c = quad
                break;
            case Quadrant.D:
                quad = this.d || this.new_D_quad()
                quad.coordinates.push(position)
                this.d = quad
                break;
            }
    }
    distribute(level: number) {
        if (level <= 0) {
            return
        }

        this.coordinates.forEach((position) => this.append(position))
        this.coordinates = []

        level -= 1

        if (this.a) { this.a.distribute(level) }
        if (this.b) { this.b.distribute(level) }
        if (this.c) { this.c.distribute(level) }
        if (this.d) { this.d.distribute(level) }
    }

    draw_dot(sel: any) {
        const count = this.coordinates.length
        if (count) {
                // draw dot

            let size = 7
            let fontSize = 7
            if (count <= 50) {
                size = 6
            }
            if (count > 50) {
                size = 10
                fontSize = 9
            }
            if (count > 100) {
                size = 15
                fontSize = 12
            }
    
            // mean
            const [cx, cy] = this.coordinates.reduce(
                (acc, v) => zip(acc, v).map(d => d[0] + d[1]),
                [0, 0]
            ).map(d => d / count)

            if (count > 30) {
                sel.append('circle')
                    .attr('cx', cx)
                    .attr('cy', cy)
                    .attr('r', size)
                    .attr('fill', '#4F50CC')
                    .attr('stroke', '#E0E7FF')
                const t = sel.append('text')
                    .attr('x', cx)
                    .attr('y', cy)
                    .text(count)
                    .style('fill', '#E0E7FF')
                fix_positioning_of_text(t)
            }
            else {
                this.coordinates.forEach((position) => {
                    const [cx, cy] = position
                    sel.append('circle')
                        .attr('cx', cx)
                        .attr('cy', cy)
                        .attr('r', 3)
                        .attr('fill', '#4F50CC')
                        .attr('stroke', '#E0E7FF')
                })
            }
            
        }
        else {
            if (this.a) { this.a.draw_dot(sel) }
            if (this.b) { this.b.draw_dot(sel) }
            if (this.c) { this.c.draw_dot(sel) }
            if (this.d) { this.d.draw_dot(sel) }
        }
    }
}

const fix_positioning_of_text = (sel: any) => {
    const {width, height, ..._} = sel.node().getBoundingClientRect()
    const position = [sel.attr('x'), sel.attr('y')].map(rm_px)
    sel.attr('x', position[0] - width / 2)
    sel.attr('y', position[1] + height / 3)
}





























