import 'bootstrap/dist/css/bootstrap.min.css';
import App from "@/App.svelte";

import { initAccounts } from "@/stores/accounts";
import { initOperatingStatus } from "@/stores/operatingStatus";

initAccounts().then(() => {
    initOperatingStatus();
});

const app = new App({ target: document.body });

export default app;
