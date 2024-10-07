import { createSignal, onMount, For, Show } from "solid-js";
import { pb } from "../services/pocketbase";
import { useAuth } from "./AuthProvider";
import { FormDataNormalize } from "../services/misc";

export default function CollectionEditor(props) {
    const user = useAuth();

    const [page, setPage] = createSignal(0);
    const [totalPages, setTotalPages] = createSignal(0);
    const [items, setItems] = createSignal([]);
    const [selected, setSelected] = createSignal(null);
    const [mode, setMode] = createSignal(null);
    const [search, setSearch] = createSignal("");

    const itemsPerPage = 10;
    const minSearchLength = 3;
    const itemsSort = "-created";

    let formContainerRef;

    async function loadItems(page) {
        try {
            let filter = "";
            if (search().length >= minSearchLength) {
                props.display.forEach((element, i) => {
                    filter += `${element.name}~'%${search()}%'`;
                    if (i < props.display.length - 1) filter += " || ";
                });
            }

            const result = await pb.collection(props.collection).getList(page, itemsPerPage, {
                sort: itemsSort,
                filter: filter
            });

            // TODO transform dates
            /*
            {
                "collectionId": "pbbo66j3jrpsw7v",
                "collectionName": "timers",
                "created": "2024-10-05 17:35:19.198Z",
                "end_message": "Sretan rođendan",
                "goal_time": "2025-05-26 12:00:00.000Z",
                "id": "5rdt8wtgdfnu5r1",
                "title": "Proslava rođendana",
                "updated": "2024-10-05 17:35:25.393Z",
                "user": "juwp3oattxkhkah"
            }
            */

            /*
            The specified value "2025-05-26 12:00:00.000Z" does not conform to the required format.  
            The format is "yyyy-MM-ddThh:mm" followed by optional ":ss" or ":ss.SSS".
            */

            setItems((old) => [...old, ...result.items]);
            setPage(page);
            setTotalPages(result.totalPages);

            import.meta.env.DEV && console.log("[loadItems] Items loaded", result.items.length);
        } catch (error) {
            import.meta.env.DEV && console.warn("[loadItems]", error.message);
        }
    }

    onMount(async () => {
        setItems([]);
        await loadItems(1);
    });

    async function loadNextPage() {
        const nextPage = page() + 1;
        await loadItems(nextPage);
    }

    async function searchSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const searchTerm = formData.get("search");
        if (searchTerm.length < minSearchLength) return;

        setSearch(searchTerm);
        setItems([]);
        await loadItems(1);
    }

    async function searchReset() {
        setSearch("");
        setItems([]);
        await loadItems(1);
    }

    async function formSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        let data = FormDataNormalize(formData);

        try {
            if (mode() === "create") {
                data.user = user().id;

                // TODO transform dates
                /*
                {
                    "title": "Novi brojač",
                    "end_message": "Sretan kraj novog brojača",
                    "goal_time": "2024-10-07T17:00",
                    "user": "juwp3oattxkhkah"
                }
                */

                const result = await pb.collection(props.collection).create(data);
                setItems((old) => [result, ...old]);
                import.meta.env.DEV && console.log("[formSubmit] Item created");
            } else if (mode() === "update") {
                const result = await pb.collection(props.collection).update(selected().id, data);
                setItems((old) => {
                    const index = old.findIndex(item => item.id === selected().id);
                    const fresh = [...old];
                    fresh[index] = result;
                    return fresh;
                });
                import.meta.env.DEV && console.log("[formSubmit] Item updated");
            }
        } catch (error) {
            import.meta.env.DEV && console.warn("[formSubmit]", error.message);
        }

        setSelected(null);
        setMode(null);

        const form = formContainerRef.querySelector("form");
        form.reset();
        modal_form.close();
    }

    function itemCreate() {
        setMode("create");

        const form = formContainerRef.querySelector("form");
        form.reset();
        modal_form.showModal();
    }

    function itemUpdate(item) {
        setMode("update");

        const form = formContainerRef.querySelector("form");
        const elements = form.querySelectorAll("input, textarea, select");
        elements.forEach((element) => {
            if (["submit", "reset"].includes(element.getAttribute("type"))) return;
            element.value = item[element.name];
        });
        setSelected(item);

        modal_form.showModal();
    }

    async function itemDelete(item) {
        try {
            await pb.collection(props.collection).delete(item.id);
            setItems((old) => old.filter((element) => element.id !== item.id));
            import.meta.env.DEV && console.log("[itemDelete] OK");
        } catch (error) {
            import.meta.env.DEV && console.warn("[itemDelete]", error.message);
        }
    }

    return (
        <>
            <div class="flex my-2 pt-2">
                <div class="join flex-grow">
                    <form onSubmit={searchSubmit} onReset={searchReset}>
                        <input type="text" name="search" class="input input-sm input-bordered join-item" required="" minLength={minSearchLength} />
                        <button class="btn btn-sm btn-outline join-item" type="submit">Traži</button>
                        <button class="btn btn-sm btn-outline join-item" type="reset">Poništi traženje</button>
                    </form>
                </div>
                <button class="btn btn-sm btn-outline ml-auto" onClick={() => itemCreate()}>Dodaj</button>
            </div>

            <For each={items()}>
                {(item) => (
                    <div class="flex gap-1 items-center p-1 my-1 bg-base-200 rounded">
                        <For each={props.display}>
                            {(column, i) => (
                                <div class="flex flex-col flex-grow p-1" classList={{ "border-r border-neutral": i() < props.display.length - 1 }}>
                                    <div class="text-lg">{item[column.name]}</div>
                                    <div class="text-[0.6em] uppercase">{column.label}</div>
                                </div>
                            )}
                        </For>
                        <div class="join ml-auto">
                            <button class="btn btn-sm btn-outline join-item" onClick={() => itemUpdate(item)}>Uredi</button>
                            <button class="btn btn-sm btn-outline btn-error join-item" onClick={() => itemDelete(item)}>Obriši</button>
                        </div>
                    </div>
                )}
            </For>

            <Show when={totalPages() > page()}>
                <div class="text-center">
                    <button class="btn btn-sm btn-outline m-2" onClick={() => loadNextPage()}>Učitaj još</button>
                </div>
            </Show>

            <dialog id="modal_form" class="modal">
                <div class="modal-box w-11/12 max-w-5xl">
                    <form method="dialog">
                        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <div onSubmit={formSubmit} ref={formContainerRef}>{props.children}</div>
                </div>
            </dialog>
        </>
    );
}