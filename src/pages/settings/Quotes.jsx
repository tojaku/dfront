import { createSignal } from "solid-js";
import CollectionEditor from "../../components/CollectionEditor";
import { useAuth } from "../../components/AuthProvider";
import FormButtons from "../../components/FormButtons";
import { pb } from "../../services/pocketbase";
import { FormDataNormalize } from "../../services/misc";

export default function SettingsQuotes(props) {
    const user = useAuth();

    const [error, setError] = createSignal(false);
    const [progress, setProgress] = createSignal({ value: 0, max: 0 });

    async function submitForm(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = FormDataNormalize(formData);

        const quotesArray = data.quotes.trim().split('\n\n');
        const quotes = quotesArray.map(quoteBlock => {
            const lines = quoteBlock.trim().split('\n');
            const content = lines[0].trim();
            const author = lines[1] ? lines[1].trim() : 'Nepoznato';
            return { content, author };
        });

        create_multiple_form.close();
        setError(false);
        setProgress({ value: 0, max: quotes.length });
        try {
            for (let i = 0; i < quotes.length; i++) {
                quotes[i].user = user().id;
                await pb.collection("quotes").create(quotes[i]);
            }
            setProgress({ value: 0, max: 0 });
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            setError(true);
            import.meta.env.DEV && console.warn("Quotes not created", error.message);
        }
    }

    return (
        <>
            <div class="prose mb-8">
                <h1>Izreke</h1>
            </div>

            <div class="text-right">
                <Show when={progress().max > 0}>
                    <progress class="progress w-56 ml-1" value={progress().value} max={progress().max}></progress>
                </Show>
                <button class="btn btn-sm btn-outline ml-1" onClick={() => { create_multiple_form.showModal(); }}>Dodaj više</button>
            </div>

            <Show when={error() === true}>
                <div role="alert" class="alert alert-error my-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Operacija nije uspjela; pokušajte ponovno.</span>
                </div>
            </Show>

            <CollectionEditor collection="quotes" display={[{ name: "content", label: "Izreka" }, { name: "author", label: "Autor" }]}>
                <form>
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">Izreka</span>
                        </label>
                        <input type="text" name="content" class="input input-bordered w-full" required="" minLength={3} maxLength={1000} />
                    </div>
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">Autor</span>
                        </label>
                        <input type="text" name="author" class="input input-bordered w-full" required="" minLength={3} maxLength={100} />
                    </div>
                    <FormButtons />
                </form>
            </CollectionEditor>

            <dialog id="create_multiple_form" class="modal">
                <div class="modal-box w-11/12 max-w-5xl">
                    <form method="dialog">
                        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <form onSubmit={submitForm}>
                        <div class="form-control w-full">
                            <label class="label">
                                <span class="label-text">Izreke</span>
                            </label>
                            <textarea name="quotes" class="textarea textarea-bordered" required="" rows={10}></textarea>
                        </div>
                        <FormButtons />
                    </form>
                </div>
            </dialog>
        </>
    );
}