import { onMount, createSignal } from "solid-js";
import { readItems } from "@directus/sdk";
import { directus, getAccessToken } from "../../services/directus.js";
import { useAuth } from "../../components/AuthProvider.jsx";

export default function List() {
    const [user, setUser] = useAuth();

    const [items, setItems] = createSignal([]);
    const [error, setError] = createSignal(false);

    onMount(async () => {
        try {
            let query = {
                filter: {
                    "user_created": {
                        "_eq": "$CURRENT_USER"
                    }
                }
            };
            if (user() !== null) {
                query = { ...query, ...await getAccessToken() };
                import.meta.env.DEV && console.log("Access token attached to query");
            }

            const result = await directus.request(readItems("panels", query));
            setItems(result);
            import.meta.env.DEV && console.log("Items fetched", result.length);
        } catch (error) {
            setError(true);
            import.meta.env.DEV && console.error(error);
        }
    });

    return (
        <>
            <For each={items()}>{(item, i) =>
                <div>
                    {item.title}
                </div>
            }</For>

            <Show when={error() === true}>
                <div role="alert" class="alert alert-error">
                    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Dogodila se greška prilikom učitavanja ploča. Ukoliko se problem ponovi, kontaktirajte administratora.</span>
                </div>
            </Show>
        </>
    );
}