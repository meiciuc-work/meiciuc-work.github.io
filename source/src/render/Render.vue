<template>
    <canvas ref="canvas"></canvas>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import Particle from '@/particles/particles/Particle2D';

@Component({
  components: {}
})
export default class Render extends Vue {
    @Prop()particles!: Array<Array<Particle>>;
    @Prop()graphices!: Array<Graphics>;

    static BACKGROUND_COLOR = '#e5c29d';
    static VENUE_BACKGROUND_COLOR = '#9f7d5b';

    private render = true;

    mounted() {
        this.handelWindowResize();
        window.addEventListener('resize', this.handelWindowResize);
    }

    destroyed() {
        console.log('Game', 'destroyed')

        window.removeEventListener('resize', this.handelWindowResize);
    }

    private handelWindowResize = (): void => {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    private get canvas(): HTMLCanvasElement {
        return (this.$refs.canvas as HTMLCanvasElement);
    }

    public update(time: number): void {
        if (!this.particles || !this.render) {
            return;
        }
        
        const ctx: CanvasRenderingContext2D = this.canvas.getContext('2d')!;
        ctx.fillStyle = Render.BACKGROUND_COLOR;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.graphices) {
            for (let i = 0; i < this.graphices.length; i++) {
                const g: Graphics = this.graphices[i];
                ctx.fillStyle = g.color;
                ctx.fillRect(g.x - g.radius / 2, g.y - g.radius / 2, g.radius, g.radius);
            }
        }
        
        for (let j = 0; j < this.particles.length; j++) {
            
            const particles: Array<Particle> = this.particles[j];
            
            for (let i = 0; i < particles.length; i++) {
                const particle: Particle = particles[i];
                const halfRadius = particle.collisionRadius / 2;
                ctx.fillStyle = particle.color;
                ctx.fillRect(particle.x - halfRadius, particle.y - halfRadius, particle.collisionRadius, particle.collisionRadius);
            }
        }
    }
}

export class Graphics {
    public x: number;
    public y: number;
    public radius: number;
    public color: string;
    constructor(x: number, y: number, radius: number, color: string = Render.VENUE_BACKGROUND_COLOR) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }
}
</script>