<template>
    <render ref="render" :particles="particles" :graphices="graphices"></render>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { FrameTickProvider } from '@ash.ts/tick';
import Render from './Render.vue';
import Particle from '@/particles/particles/Particle';
import Graphics from './Graphics';
import Collisions from './Collisions1';

@Component({
  components: {
      Render
  }
})
export default class Game extends Vue {

    private particles: Array<Array<Particle>> = [];
    private graphices: Array<Graphics> = [];

    private MAX_BOTS_COUNT = 100;
    private MAX_VENUES_COUNT = 500;
    private MAX_PARTICLE_DELTA_MOTION = 100;

    private collisions: Collisions | null = null;

    mounted() {
        this.setupEmitter();
    
        const tickProvider = new FrameTickProvider();
        tickProvider.add(delta => this.update(delta));
        tickProvider.start();
    }

    destroyed() {
        console.log('Game', 'destroyed')
    }

    private setupEmitter(): void {
        this.collisions = new Collisions();
        this.particles.push(this.collisions.particles);
        this.graphices = this.collisions.graphices;
    }

    private update(time: number): void {
        this.updateCollisions(time);
        this.updateRender(time);
    }

    private updateCollisions(time: number): void {
        if (this.collisions) {
            this.collisions.update(time);
        }
    }

    private updateRender(time: number): void {
        (this.$refs.render as Render).update(time);
    }

    
}
</script>