import Vue from 'vue'
import App from './render/App.vue'
import createFps from 'fps-indicator';

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app');

createFps({style: 'padding: 20px; color: #ffffff; text-shadow: 0 0 4px black;'});
