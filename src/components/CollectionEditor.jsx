import { createSignal, onMount, For, Show } from "solid-js";
import { pb } from "../services/pocketbase";
import { useAuth } from "./AuthProvider";
import { FormDataNormalize } from "../services/misc";
import Quill from "quill";

export default function CollectionEditor(props) {
    const user = useAuth();

    const [error, setError] = createSignal(false);
    const [page, setPage] = createSignal(0);
    const [totalPages, setTotalPages] = createSignal(0);
    const [totalItems, setTotalItems] = createSignal(0);
    const [items, setItems] = createSignal([]);
    let [selected, setSelected] = createSignal(null); // so it can be connected to parent
    const [mode, setMode] = createSignal(null);
    const [search, setSearch] = createSignal("");

    const itemsPerPage = 10;
    const minSearchLength = 3;
    const itemsSort = "-created";

    let formContainerRef;

    onMount(async () => {
        if (props.selected) { // connect to parent if provided in props
            const [parentSelected, parentSetSelected] = props.selected;
            selected = parentSelected;
            setSelected = parentSetSelected;
        }

        setItems([]);
        setPage(0);
        setTotalPages(0);
        setTotalItems(0);
        await loadItems(1);
    });

    async function loadItems(page) {
        setError(false);
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

            // Optional: transform datetime (created and updated)
            result.items.forEach((element) => {
                element.created = new Date(element.created).toISOString();
                element.updated = new Date(element.updated).toISOString();
            });

            setItems((old) => [...old, ...result.items]);
            setPage(page);
            setTotalPages(result.totalPages);
            setTotalItems(result.totalItems);
        } catch (error) {
            setError(true);
            import.meta.env.DEV && console.warn("Items not loaded", error.message);
        }
    }

    async function loadNextPage() {
        const nextPage = page() + 1;
        await loadItems(nextPage);
    }

    async function submitSearch(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = FormDataNormalize(formData);
        if (data.search.length < minSearchLength) return;

        setSearch(data.search);
        setItems([]);
        await loadItems(1);
    }

    async function searchReset() {
        setSearch("");
        setItems([]);
        await loadItems(1);
    }

    async function submitForm(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        let data = FormDataNormalize(formData);

        setError(false);
        try {
            if (mode() === "create") {
                data.user = user().id;
                const result = await pb.collection(props.collection).create(data);
                setItems((old) => [result, ...old]);
            } else if (mode() === "update") {
                const merged = { ...selected(), ...data }; // merge original object with changes
                const result = await pb.collection(props.collection).update(selected().id, merged);
                setItems((old) => {
                    const index = old.findIndex(item => item.id === selected().id);
                    const fresh = [...old];
                    fresh[index] = result;
                    return fresh;
                });
            }
        } catch (error) {
            setError(true);
            import.meta.env.DEV && console.warn("Item not created or updated", error.message);
        }

        setSelected(null);
        setMode(null);

        const form = formContainerRef.querySelector("form");
        form.reset();
        modal_form.close();
    }

    function resetForm() {
        modal_form.close();
    }

    function createItem() {
        setMode("create");

        const form = formContainerRef.querySelector("form");
        form.reset();
        modal_form.showModal();
    }

    function updateItem(item) {
        setMode("update");

        const form = formContainerRef.querySelector("form");
        const elements = form.querySelectorAll("input, textarea, select");
        elements.forEach((element) => {
            if (["submit", "reset", "file"].includes(element.getAttribute("type"))) return;
            element.value = item[element.name];
            const quill = Quill.find(document.querySelector(`#quill-${element.name}`));
            if (quill) {
                quill.clipboard.dangerouslyPasteHTML(item[element.name]);
            }
        });
        setSelected(item);

        modal_form.showModal();
    }

    async function deleteItem(item) {
        setError(false);
        try {
            await pb.collection(props.collection).delete(item.id);
            setItems((old) => old.filter((element) => element.id !== item.id));
        } catch (error) {
            setError(true);
            import.meta.env.DEV && console.warn("Item not deleted", error.message);
        }
    }

    return (
        <>
            <Show when={error() === true}>
                <div role="alert" class="alert alert-error my-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Operacija nije uspjela; pokušajte ponovno.</span>
                </div>
            </Show>

            <div class="flex items-center my-2 pt-2">
                <div class="flex-1">
                    <form onSubmit={submitSearch} onReset={searchReset} class="flex gap-1 flex-wrap">
                        <input type="text" name="search" class="input input-sm input-bordered" required="" minLength={minSearchLength} />
                        <button class="btn btn-sm btn-outline" type="submit">Traži</button>
                        <button class="btn btn-sm btn-outline" type="reset">Poništi</button>
                    </form>
                </div>
                <div class="flex-1 text-sm">Prikazano: {items().length} od ukupno {totalItems()}</div>
                <button class="btn btn-sm btn-outline flex-initial" onClick={() => createItem()}>Dodaj</button>
            </div>

            <For each={items()} fallback={<div class="text-[0.6em] uppercase">Nema stavaka</div>}>
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
                        <div class="flex flex-wrap justify-end gap-1">
                            <button class="btn btn-sm btn-outline" onClick={() => updateItem(item)}>Uredi</button>
                            <button class="btn btn-sm btn-outline btn-error" onClick={() => deleteItem(item)}>Obriši</button>
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
                    <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={resetForm}>✕</button>
                    <div onSubmit={submitForm} onReset={resetForm} ref={formContainerRef}>{props.children}</div>
                </div>
            </dialog>
        </>
    );
}