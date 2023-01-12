
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
        return (this.right - this.left) / 2
    }
    mid_vertical(): number {
        return (this.bottom - this.top) / 2
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
                return Quadrant.B
            }
        }
        else {
            if (latitude < this.mid_vertical()) {
                return Quadrant.C
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
        if (this.coordinates.length) {
            // draw dot
console.log(this.coordinates.length)
                        // mean
                        const log = Math.log10(this.coordinates.length)
                        const [cx, cy] = this.coordinates.reduce(
                            (acc, v) => zip(acc, v).map(d => d[0] + d[1]),
                            [0, 0]
                        ).map(d => d / this.coordinates.length)
                        sel.append('circle')
                            .attr('cx', cx)
                            .attr('cy', cy)
                            .attr('r', 3 + log * 3)
                            .attr('fill', 'red')
            
            this.coordinates.forEach((position) => {
                const [cx, cy] = position
                sel.append('circle')
                    .attr('cx', cx)
                    .attr('cy', cy)
                    .attr('r', 3)
                    .attr('fill', 'blue')
                })
        }
        else {
            if (this.a) { this.a.draw_dot(sel) }
            if (this.b) { this.b.draw_dot(sel) }
            if (this.c) { this.c.draw_dot(sel) }
            if (this.d) { this.d.draw_dot(sel) }
        }
    }
}






























