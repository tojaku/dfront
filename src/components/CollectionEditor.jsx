import { createSignal, onMount, For } from "solid-js";
import { pb } from "../services/pocketbase";

export default function CollectionEditor(props) {
    const itemsPerPage = 10;

    const [items, setItems] = createSignal(null);
    const [page, setPage] = createSignal(1);

    onMount(async () => {
        try {
            const result = await pb.collection(props.collection).getList(page(), itemsPerPage, {
                sort: "-updated",
            });
            setItems(result.items);

            import.meta.env.DEV && console.log("[onMount] Items loaded", result.items.length);
        } catch (error) {
            import.meta.env.DEV && console.warn("[onMount]", error.message);
        }
    });

    function formSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        let data = Object.fromEntries(formData.entries());
        console.log(data);
    }

    return (
        <>
            <div class="text-right">
                <button class="btn btn-sm btn-success mb-1" onClick={() => { modal_form.showModal() }}>Dodaj</button>
            </div>

            <For each={items()}>
                {(item) => (
                    <div class="flex gap-1 items-center p-2 my-1 bg-base-200 rounded">
                        <For each={props.display}>
                            {(column, i) => (
                                <div class="flex flex-col flex-grow" classList={{ "border-r border-neutral": i() < props.display.length - 1 }}>
                                    <div class="text-lg">{item[column.name]}</div>
                                    <div class="text-[0.6em] uppercase">{column.label}</div>
                                </div>
                            )}
                        </For>
                        <div class="join ml-auto">
                            <button class="btn btn-sm btn-accent join-item">Uredi</button>
                            <button class="btn btn-sm btn-error join-item">Obriši</button>
                        </div>
                    </div>
                )}
            </For>

            <dialog id="modal_form" class="modal">
                <div class="modal-box w-11/12 max-w-5xl">
                    <form method="dialog">
                        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <div onSubmit={formSubmit}>{props.children}</div>
                </div>
            </dialog>
        </>
    );
}