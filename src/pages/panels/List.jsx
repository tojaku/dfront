import { onMount, createSignal, Show } from "solid-js";
import { A } from "@solidjs/router";
import { pb } from "../../services/pocketbase";

export default function PanelsList(props) {
    const [items, setItems] = createSignal([]);
    const [error, setError] = createSignal(false);

    onMount(async () => {
        try {
            const result = await pb.collection("panels").getFullList({
                sort: "-created",
            });
            setItems(result);
            import.meta.env.DEV && console.log("[onMount] Panels loaded", result.length);
        } catch (error) {
            setError(true);
            import.meta.env.DEV && console.warn("[onMount]", error.message);
        }
    });

    // TODO wire up "panel edit button"
    return (
        <>
            <div class="prose mb-8">
                <h1>Pregled ploča</h1>
            </div>
            <div class="flex flex-wrap gap-4 justify-start items-start">
                <For each={items()}>{(item, i) =>
                    <div style={`background-color: ${item.background_color}; color: ${item.font_color}`} class="w-64 min-h-[12vh] shadow-md rounded-md">
                        <div class="flex p-4 gap-1">
                            <h2 class="flex-1 text-lg font-bold"><A href={`/panels/${item.id}`} target="_blank">{item.title}</A></h2>
                        </div>
                    </div>
                }</For>
            </div>

            <Show when={error() === true}>
                <div role="alert" class="alert alert-error">
                    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Dogodila se greška prilikom učitavanja ploča. Ukoliko se problem ponovi, kontaktirajte administratora.</span>
                </div>
            </Show>
        </>
    );
}