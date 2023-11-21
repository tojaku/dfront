import { onMount, createSignal } from "solid-js";
import { A } from "@solidjs/router";
import { readItem } from "@directus/sdk";
import { directus } from "../services/directus.js";

export default function Home() {
    const appName = import.meta.env.VITE_APP_NAME;
    const adminUrl = import.meta.env.VITE_DIRECTUS_URL;

    const [aboutApplication, setAboutApplication] = createSignal(null);

    onMount(async () => {
        try {
            const result = await directus.request(readItem("static", "about_application"));

            if (result !== null) {
                import.meta.env.DEV && console.log("Application description loaded");
                setAboutApplication(result.content);
            }
        } catch (error) {
            import.meta.env.DEV && console.warn("Application description could not be loaded due to error");
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