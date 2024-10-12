import { createEffect, createSignal, onMount } from "solid-js";
import { pb } from "../services/pocketbase";

export default function CollectionSelector(props) {
    const [items, setItems] = createSignal([]);
    const [search, setSearch] = createSignal("");
    const [totalPages, setTotalPages] = createSignal(0);

    const itemsPerPage = 5;
    const minSearchLength = 3;
    const itemsSort = "-created";

    onMount(async () => {
        await loadItems();
    });

    createEffect(async () => {
        if (search().length < minSearchLength) {
            setItems([]);
            setTotalPages(0);
            return;
        }
        await loadItems();
    });

    async function loadItems() {
        try {
            let filter = `${props.display}~'%${search()}%'`;
            const result = await pb.collection(props.collection).getList(1, itemsPerPage, {
                sort: itemsSort,
                filter: filter
            });

            setItems(result.items);
            setTotalPages(result.totalPages);
        } catch (error) {
            import.meta.env.DEV && console.warn("Items not loaded", error.message);
        }
    }

    function itemSelect(item) {
        props.selected(item);
    }

    return (
        <>
            <div class="my-2">
                <input type="text" name="search" class="input input-bordered w-full" placeholder="Traži..."
                    value={search()} onInput={(event) => setSearch(event.target.value)} />
            </div>

            <div class="flex flex-col gap-2">
                <For each={items()} fallback={<div class="text-[0.6em] uppercase">Nema rezultata</div>}>
                    {(item) => (
                        <div class="flex items-center gap-2">
                            <button class="btn btn-sm btn-outline" onClick={() => { itemSelect(item) }}>Odaberi</button>
                            <div class="flex-1">
                                <div class="text-sm">{item[props.display]}</div>
                            </div>
                        </div>
                    )}
                </For>
            </div>

            <Show when={totalPages() > 1}>
                <div class="text-xs italic mt-2">Prikazuje se najviše {itemsPerPage} rezultata</div>
            </Show>

        </>
    );
}