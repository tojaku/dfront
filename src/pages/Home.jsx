import { onMount, createSignal, Show } from "solid-js";
import { A } from "@solidjs/router";
import { getItems } from "../services/directus.js";

export default function Home() {
    const appName = import.meta.env.VITE_APP_NAME;
    const adminUrl = import.meta.env.VITE_DIRECTUS_URL;

    const [aboutApplication, setAboutApplication] = createSignal(null);

    onMount(async () => {
        try {
            const result = await getItems("static", {
                filter: {
                    "id": {
                        "_eq": "about_application"
                    }
                }
            }, false);

            if (result !== null) {
                setAboutApplication(result[0].content);
                import.meta.env.DEV && console.log("[onMount] Application description loaded");
            }
        } catch (error) {
            import.meta.env.DEV && console.error(error);
        }
    });

    return (
        <div class="hero min-h-[50vh] bg-base-200">
            <div class="hero-content text-center">
                <div class="max-w-xl">
                    <h1 class="text-5xl font-bold text-sky-600">Dobro došli</h1>
                    <p class="text-xl py-6">
                        Dobro došli na aplikaciju <span class="text-orange-400">{appName}</span>. Mogućnosti za rad s aplikacijom nalaze se u gornjem dijelu stranice.
                        Ukoliko želite pristupiti sučelju za upravljanje, to možete učiniti na sljedećoj <A class="link text-sky-600 hover:text-sky-400" href={adminUrl} target="_blank">vezi</A>.
                    </p>
                    <Show when={aboutApplication() !== null}>
                        <h3 class="text-2xl font-bold text-sky-300">O aplikaciji</h3>
                        <p class="prose w-fit max-w-none text-lg py-4" innerHTML={aboutApplication()} />
                    </Show>
                </div>
            </div>
        </div>
    );
}