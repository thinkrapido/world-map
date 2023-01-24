
export class Zoom {
    private _position: number[] = [0, 0]
    private _top: number = 0
    private _bottom: number = 0
    private _left: number = 0
    private _right: number = 0
    constructor(private size: number[], public _level: number) {
        this.position = size.map((d: number) => d / 2)
    }
    set position(v: number[]) {
        this._position  = v
        this._top       = (this._position[1] + this.size[1] / 2 - this.spread[1]) - this.size[1] / 2
        this._bottom    = (this._position[1] + this.size[1] / 2 + this.spread[1]) - this.size[1] / 2
        this._left      = (this._position[0] + this.size[0] / 2 - this.spread[0]) - this.size[0] / 2
        this._right     = (this._position[0] + this.size[0] / 2 + this.spread[0]) - this.size[0] / 2
    }
    set level(v: number) {
        if (0 <= v || v >= 10) {
            throw new Error("level not in range [1, 9]")
        }
        this._level = v
    }
    get level(): number {
        return this._level
    }

    private get spread(): number[] {
        return this.size.map((d: number) => d / (this._level + 1))
    }

    get top(): number {
        return this._top
    }
    get bottom(): number {
        return this._bottom
    }
    get left(): number {
        return this._left
    }
    get right(): number {
        return this._right
    }
}
