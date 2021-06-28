export default class Graphics {
    static BACKGROUND_COLOR = '#e5c29d';
    static VENUE_BACKGROUND_COLOR = '#9f7d5b';

    public x: number;
    public y: number;
    public radius: number;
    public color: string;

    constructor(x: number, y: number, radius: number, color: string = Graphics.VENUE_BACKGROUND_COLOR) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }
}