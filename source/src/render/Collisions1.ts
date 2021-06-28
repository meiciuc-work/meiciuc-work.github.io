import ActionCallback from '@/particles/actions/ActionCallback';
import BoundingBox from '@/particles/actions/BoundingBox';
import CollisionZone from '@/particles/actions/CollisionZone';
import Move from '@/particles/actions/Move';
import SpeedLimit from '@/particles/actions/SpeedLimit';
import TurnTowardsPoint from '@/particles/actions/TurnTowardsPoint';
import ZonedAction from '@/particles/actions/ZonedAction';
import Emitter from '@/particles/emitters/Emitter';
import ParticleEvents from '@/particles/events/ParticleEvents';
import Particle2D from '@/particles/particles/Particle2D';
import CircleZone from '@/particles/zones/CircleZone';
import RectangleZone from '@/particles/zones/RectangleZone';
import { FrameTickProvider } from '@ash.ts/tick';
import Graphics from './Graphics';
import { KeyPoll } from './KeyPoll';
import * as Keyboard from './Keyboard';
import { Point } from '@/particles/zones/Zone2D';

export default class Collisions {

    private emitters: Array<Emitter> = [];
    public particles: Array<Particle2D> = [];
    public graphices: Array<Graphics> = [];

    private MAX_BOTS_COUNT = 50;
    private MAX_VENUES_COUNT = 100;
    private MAX_PARTICLE_DELTA_MOTION = 100;

    constructor() {
        this.setupEmitter();
    
        // const tickProvider = new FrameTickProvider();
        // tickProvider.add(delta => this.update(delta));
        // tickProvider.start();
    }

    public update(time: number) {
        for (let i = 0; i < this.emitters.length; i++) {
            this.emitters[i].update(time);
        }
    }

    
    private setupEmitter(): void {
        // common emitter
        const emitter: Emitter = new Emitter();
        emitter.actions = [
            new Move(),
            new SpeedLimit(190, false),
            new BoundingBox(10, 10, window.innerWidth - 10, window.innerHeight - 10)
        ];
        this.emitters.push(emitter);
        this.particles  = emitter.particles;

        // add Venius
        this.createVenues(emitter);
        this.createHero(emitter);

        while (this.particles.length < this.MAX_BOTS_COUNT) {
            this.createBot(emitter, this.getBotNewDestinationPoint());
        }

        emitter.addEventListener(ParticleEvents.BOUNDING_BOX_COLLISION, () => {
            console.log('BOUNDING_BOX_COLLISION')
        });
    }

    private createVenues(emitter: Emitter): void {
        const venues: Array<Graphics> = [];
        for (let i = 0; i < this.MAX_VENUES_COUNT; i++) {
            const x = this.getRandom(100, window.innerWidth - 100);
            const y = this.getRandom(100, window.innerHeight - 100);
            const r = this.getRandom(7, 15);

            // new CollisionZone(new PointZone({x: x, y: y}), 1)
            // emitter.addAction(new GravityWell(1, x, y, 100));
            emitter.addAction(new CollisionZone(new CircleZone({x, y}, r)))
            venues.unshift(new Graphics(x, y, r))
            this.graphices.push(venues[0]);
        }
    }

    private createHero(emitter: Emitter): void {
        // hero emitter
        const hero: Particle2D = new Particle2D();
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

        this.createHeroControlModule(heroEmitter, hero);
    }

    private createHeroControlModule(heroEmitter: Emitter, hero: Particle2D): void {
        let pointed = false;
        let keyboarded = false;

        const destinationZone: RectangleZone = new RectangleZone();
        const turnTowardsPoint: TurnTowardsPoint = new TurnTowardsPoint(window.innerWidth - 100, window.innerHeight - 100, 500);

        const zonedAction: ZonedAction = new ZonedAction(
                new ActionCallback(() => {
                    // end pointed
                    pointed = false;
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
            // start pointed
            pointed = true;
            keyboarded = !pointed;

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
        });

        const keyPoll = new KeyPoll();
        const tickProvider = new FrameTickProvider();
        tickProvider.add(delta => {
            let down = false;
            if (keyPoll.isDown(Keyboard.W) || keyPoll.isDown(Keyboard.UP)) {
                down = true;
                hero.velY = -60;
            } else if (keyPoll.isDown(Keyboard.S) || keyPoll.isDown(Keyboard.DOWN)) {
                down = true;
                hero.velY = 60;
            } else if (!pointed) {
                hero.velY = 0;
            }
            if (keyPoll.isDown(Keyboard.A) || keyPoll.isDown(Keyboard.LEFT)) {
                down = true;
                hero.velX = -60;
            } else if (keyPoll.isDown(Keyboard.D) || keyPoll.isDown(Keyboard.RIGHT)) {
                down = true;
                hero.velX = 60;
            } else if (!pointed) {
                hero.velX = 0;
            }

            if (down) {
                // end pointed
                pointed = false;
                keyboarded = !pointed;
                heroEmitter.removeAction(turnTowardsPoint);
                heroEmitter.removeAction(zonedAction);
            } else if (keyboarded) {
                keyboarded = false;
                hero.velX = 0;
                hero.velY = 0;
            }
        });
        tickProvider.start();
    }

    private createBot(emitter: Emitter, point: Point): void {
        // create particle
        const hero: Particle2D = new Particle2D();
        hero.x = point.x;
        hero.y = point.y;
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

            const point: Point = this.getBotNewDestinationPoint()
            turnTowardsPoint.x = point.x;
            turnTowardsPoint.y = point.y;
        
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

    private getBotNewDestinationPoint(): Point {
        const x = this.getRandom(100, window.innerWidth - 100);
        const y = this.getRandom(100, window.innerHeight - 100);
        let br = false;
        for (let i = 0; i < this.graphices.length; i++) {
            const g: Graphics = this.graphices[i];
            const r = g.radius * 1.5;
            if (g.x - r < x && g.x + r > x && g.y - r < y && g.y + r > y) {
                br = true;
                break;
            }
        }
        if (br) {
            return this.getBotNewDestinationPoint();
        } else {
            return {x, y};
        }
    }

    private createParticle(): Particle2D {
        const particle: Particle2D = new Particle2D();
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