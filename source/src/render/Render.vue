<template>
    <canvas ref="canvas"></canvas>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import Particle from '@/particles/particles/Particle2D';
import Graphics from './Graphics';

@Component({
  components: {}
})
export default class Render extends Vue {
    @Prop()particles!: Array<Array<Particle>>;
    @Prop()graphices!: Array<Graphics>;

    private render = true;
    private circles: {[key: string]: HTMLCanvasElement} = {};

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
        ctx.fillStyle = Graphics.BACKGROUND_COLOR;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.graphices) {
            for (let i = 0; i < this.graphices.length; i++) {
                const g: Graphics = this.graphices[i];
                if (g.radius) {
                    this.drawCircle(ctx, g.x, g.y, g.radius, g.color);
                }
            }
        }
        
        for (let j = 0; j < this.particles.length; j++) {
            
            const particles: Array<Particle> = this.particles[j];
            
            for (let i = 0; i < particles.length; i++) {
                const particle: Particle = particles[i];
                this.drawCircle(ctx, particle.x, particle.y, particle.collisionRadius, particle.color);
            }
        }
    }

    private drawCircle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string): void {
        const key = r + color;
        if (!this.circles[key]) {
            const canvas: HTMLCanvasElement = document.createElement('canvas');
            canvas.height = canvas.width = r * 2;
            const context: CanvasRenderingContext2D = canvas.getContext('2d')!;
            context.beginPath();
            context.arc(r, r, r, 0, 2 * Math.PI, false);
            context.fillStyle = color;
            context.fill();

            this.circles[key] = canvas;
        }

        const d = r * 2;
        ctx.drawImage(this.circles[key]!, 0, 0, d, d, x - r, y - r, d, d);
    }
}

</script>