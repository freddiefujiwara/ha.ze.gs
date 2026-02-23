import { createApp, nextTick } from "vue";
import App from "./App.vue";
import { bootstrapBrowser } from "./app.js";
import "./styles.css";

createApp(App).mount("#app");

nextTick(() => {
  bootstrapBrowser(document, fetch);
});
