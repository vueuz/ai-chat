import { createApp } from 'vue'
import App from './App.vue' // Will be replaced by BasicLayout or router view
import router from './router' // Import the router
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import './style.css'

const app = createApp(App) // App will now be the root router view container

app.use(router) // Use the router
app.use(Antd)
app.mount('#app')
