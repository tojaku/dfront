import { onMount, createSignal, Show } from "solid-js";
import { useParams } from "@solidjs/router";

import { getItems } from "../../services/directus";

export default function PanelsView() {
    const params = useParams();

    const [item, setItem] = createSignal(null);

    onMount(async () => {
        try {
            const panelId = params.id;
            const result = await getItems("panels", {
                filter: {
                    "id": {
                        "_eq": panelId
                    }
                }
            });
            setItem(result[0]);
            import.meta.env.DEV && console.log("[onMount] Item fetched", result.length);
        } catch (error) {
            setError(true);
            import.meta.env.DEV && console.error(error);
        }
    });

    return (
        <Show when={item() !== null}>
            <div style={`background-color: ${item().background_color}; color: ${item().font_color}`} class="min-h-screen">
                Pregled
            </div>
        </Show>
    );
}