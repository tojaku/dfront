import { createSignal, onMount, For } from "solid-js";
import { pb } from "../services/pocketbase";
import { useAuth } from "./AuthProvider";

export default function CollectionEditor(props) {
    const user = useAuth();

    const [page, setPage] = createSignal(1);
    const [items, setItems] = createSignal([]);
    const [selected, setSelected] = createSignal(null);
    const [mode, setMode] = createSignal(null)

    const itemsPerPage = 10;
    let formContainerRef;

    onMount(async () => {
        try {
            const result = await pb.collection(props.collection).getList(page(), itemsPerPage, {
                sort: "-updated",
            });
            setItems(result.items);

            console.log(result);

            import.meta.env.DEV && console.log("[onMount] Items loaded", result.items.length);
        } catch (error) {
            import.meta.env.DEV && console.warn("[onMount]", error.message);
        }
    });

    async function loadMore() {
        console.log("loading...");

    }

    async function formSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        let data = Object.fromEntries(formData.entries());

        try {
            if (mode() === "create") {
                data.user = user().id;
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
            <div class="text-right">
                <button class="btn btn-sm  btn-outline mb-1" onClick={() => itemCreate()}>Dodaj</button>
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

            <div class="text-center">
                <button class="btn btn-sm btn-outline m-2" onClick={() => loadMore()}>Učitaj još</button>
            </div>

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