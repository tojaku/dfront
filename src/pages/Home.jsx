import { onMount, createSignal, Show } from "solid-js";
import { pb } from "../services/pocketbase";

export default function Home() {
    const appName = import.meta.env.VITE_APP_NAME;

    const [aboutApplication, setAboutApplication] = createSignal(null);

    onMount(async () => {
        try {
            const result = await pb.collection("static").getFirstListItem("key='about_app'");
            setAboutApplication(result.content);
            import.meta.env.DEV && console.log("[onMount] App description loaded");
        } catch (error) {
            import.meta.env.DEV && console.warn("[onMount]", error.message);
        }
    });

    return (
        <div class="hero min-h-[50vh] bg-base-200">
            <div class="hero-content text-center">
                <div class="max-w-xl">
                    <h1 class="text-5xl font-bold text-sky-600">Dobro došli</h1>
                    <p class="text-xl py-6">
                        Dobro došli na aplikaciju <span class="text-orange-400 uppercase">{appName}</span>.
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