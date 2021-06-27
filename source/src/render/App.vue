<template>
    <div id="app" class="wrap_container">
        <game></game>
    </div>
</template>

<script lang="ts">
import "@/styles/assets.styl";
import { Component, Vue } from "vue-property-decorator";
import Game from "./Game.vue";

@Component({
    components: {
        Game
    },
})
export default class App extends Vue {
    mounted() {
        console.log("App mounted");    
    }
}
</script>

<style lang="stylus">
    
</style>
