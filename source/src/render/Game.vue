<template>
    <render ref="render" :particles="particles" :graphices="graphices"></render>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { FrameTickProvider } from '@ash.ts/tick';
import Render, { Graphics } from './Render.vue';
import Emitter from '@/particles/emitters/Emitter';
import Move from '@/particles/actions/Move';
import DeathZone from '@/particles/actions/DeathZone';
import MouseGravity from '@/particles/actions/MouseGravity';
import MouseAntiGravity from '@/particles/actions/MouseAntiGravity';
import SpeedLimit from '@/particles/actions/SpeedLimit';
import TurnTowardsPoint from '@/particles/actions/TurnTowardsPoint';
import TweenPosition from '@/particles/actions/TweenPosition';
import ZonedAction from '@/particles/actions/ZonedAction';
import ActionCallback from '@/particles/actions/ActionCallback';
import BoundingBox from '@/particles/actions/BoundingBox';
import CollisionZone from '@/particles/actions/CollisionZone';
import RectangleZone from '@/particles/zones/RectangleZone';
import PointZone from '@/particles/zones/PointZone';
import Particle from '@/particles/particles/Particle2D';
import Action from '@/particles/actions/Action';
import Particle2D from '@/particles/particles/Particle2D';

@Component({
  components: {
      Render
  }
})
export default class Game extends Vue {

    private emitters: Array<Emitter> = [];
    private particles: Array<Array<Particle>> = [];
    private graphices: Array<Graphics> = [];

    private MAX_BOTS_COUNT = 100;
    private MAX_VENUES_COUNT = 500;
    private MAX_PARTICLE_DELTA_MOTION = 100;

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
        // this.setupPachenkoEmitter();
        this.setupVenuesEmitter();
    }

    private setupVenuesEmitter(): void {
        // common emitter
        const emitter: Emitter = new Emitter();
        emitter.actions = [
            new Move(), 
            new BoundingBox(10, 10, window.innerWidth - 10, window.innerHeight - 10)
        ];

        // add Veniuses
        const venues: Array<Graphics> = [];
        for (let i = 0; i < this.MAX_VENUES_COUNT; i++) {
            const x = this.getRandom(100, window.innerWidth - 100);
            const y = this.getRandom(100, window.innerHeight - 100);

            emitter.addAction(
                new CollisionZone(new PointZone({x: x, y: y}), 1)
            );
            venues.unshift(new Graphics(x, y, 10))
            this.graphices.push(venues[0]);
        }
    
        this.emitters.push(emitter);
        this.particles.push(emitter.particles);

        this.createHero(emitter);

        for (let i = 0; i < this.MAX_BOTS_COUNT; i++) {
            this.createBot(emitter);
        }
    }

    private createHero(emitter: Emitter): void {
        // hero emitter
        const hero: Particle = new Particle();
        hero.x = 200;
        hero.y = 100;
        hero.velX = 0;
        hero.velY = 0;
        hero.collisionRadius = 5;
        hero.color = '#ff0000';

        emitter.addParticle(hero);

        const heroEmitter: Emitter = new Emitter();
        heroEmitter.addParticle(hero);
        this.emitters.push(heroEmitter);
        this.particles.push(heroEmitter.particles);

        const destinationZone: RectangleZone = new RectangleZone();
        const turnTowardsPoint: TurnTowardsPoint = new TurnTowardsPoint(window.innerWidth - 100, window.innerHeight - 100, 500);

        const zonedAction: ZonedAction = new ZonedAction(
                new ActionCallback(() => {
                    heroEmitter.removeAction(turnTowardsPoint);
                    heroEmitter.removeAction(zonedAction);
                    hero.velX = 0;
                    hero.velY = 0;
                }, 
                false
            ), 
            destinationZone
        );
        
        document.body.addEventListener('click', (e: MouseEvent) => {
            hero.velX = 60;
            hero.velY = 60;

            turnTowardsPoint.x = e.clientX;
            turnTowardsPoint.y = e.clientY;
            if (!heroEmitter.hasAction(turnTowardsPoint)) {
                heroEmitter.addAction(turnTowardsPoint);
            }

            const precision = 3;
            destinationZone.left = turnTowardsPoint.x - precision;
            destinationZone.top = turnTowardsPoint.y - precision;
            destinationZone.right = turnTowardsPoint.x + precision;
            destinationZone.bottom = turnTowardsPoint.y + precision;
            if (!heroEmitter.hasAction(zonedAction)) {
                heroEmitter.addAction(zonedAction);
            }
        })
    }

    private createBot(emitter: Emitter): void {
        // create particle
        const hero: Particle = new Particle();
        hero.x = this.getRandom(100, window.innerWidth - 100);
        hero.y = this.getRandom(100, window.innerHeight - 100);
        hero.collisionRadius = 5;
        hero.color = '#0000cc';

        // add particle to main emitter
        emitter.addParticle(hero);

        // create own control memitter
        const destinationZone: RectangleZone = new RectangleZone();
        const turnTowardsPoint: TurnTowardsPoint = new TurnTowardsPoint(0, 0, 500);
        const startWalkToNextZone = () => {
            hero.velX = this.getRandom(-100, 100);
            hero.velY = this.getRandom(-100, 100);

            turnTowardsPoint.x = this.getRandom(100, window.innerWidth - 100);
            turnTowardsPoint.y = this.getRandom(100, window.innerHeight - 100);
        
            const precision = 5;
            destinationZone.left = turnTowardsPoint.x - precision;
            destinationZone.top = turnTowardsPoint.y - precision;
            destinationZone.right = turnTowardsPoint.x + precision;
            destinationZone.bottom = turnTowardsPoint.y + precision;
        }
        const zonedAction: ZonedAction = new ZonedAction(
                new ActionCallback(() => {
                    startWalkToNextZone();
                }, 
                false
            ), 
            destinationZone
        );

        const heroEmitter: Emitter = new Emitter();
        heroEmitter.actions = [
            turnTowardsPoint,
            zonedAction
        ];
        heroEmitter.addParticle(hero);
        this.emitters.push(heroEmitter);

        // start bot
        startWalkToNextZone();
    }

    private setupPachenkoEmitter(): void {
        const emitter: Emitter = new Emitter();
        emitter.actions = [
            new Move(), 
            new DeathZone(new RectangleZone(100, 100, window.innerWidth - 100, window.innerHeight - 100), true),
            // new MouseGravity(300, mouse, 100)
            // new SpeedLimit(50, true)
            // new MouseAntiGravity(10, mouse, 1)
        ];

        for (let i = 0; i < this.MAX_VENUES_COUNT; i++) {
            const x = this.getRandom(100, window.innerWidth - 100);
            const y = this.getRandom(100, window.innerHeight - 100);
            emitter.addAction(
                new CollisionZone( 
                    new PointZone({x: x, y: y}),
                    1
                )
            );

            this.graphices.push(new Graphics(x, y, 10));
        }

        this.emitters.push(emitter);
        this.particles.push(emitter.particles)
    }

    private update(time: number) {
        this.updateEmitters(time);
        this.updateRender(time);
    }

    private updateEmitters(time: number): void {
        for (let i = 0; i < this.emitters.length; i++) {
            this.emitters[i].update(time);
        }

        // TODO counters
        // if (this.emitters.length) {
        //     const emitter: Emitter = this.emitters[0];
        //     const length = emitter.particles.length;
        //     for (let i = length; i < this.MAX_BOTS_COUNT; i++) {
        //         emitter.addParticle(this.createParticle());
        //     }
        // }
    }

    private updateRender(time: number): void {
        (this.$refs.render as Render).update(time);
    }

    private createParticle(): Particle {
        const particle: Particle = new Particle();
        particle.collisionRadius = 5;
        particle.color = '#705da4';
        particle.x = this.getRandom(window.innerWidth * .2, window.innerWidth * .8);
        particle.y = this.getRandom(window.innerHeight * .2, window.innerHeight * .8);
        particle.velX = this.getRandom(-this.MAX_PARTICLE_DELTA_MOTION, this.MAX_PARTICLE_DELTA_MOTION);
        particle.velY = this.getRandom(-this.MAX_PARTICLE_DELTA_MOTION, this.MAX_PARTICLE_DELTA_MOTION);
        return particle;
    }

    private getRandom(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min)) + min;
    }
}
</script>