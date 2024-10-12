import { createSignal, Show } from "solid-js";
import { useAuth } from "../components/AuthProvider";
import { pb } from "../services/pocketbase";
import { FormDataNormalize } from "../services/misc";
import FormButtons from "../components/FormButtons";

export default function Contact(props) {
    const user = useAuth();

    const [success, setSuccess] = createSignal(false);
    const [error, setError] = createSignal(false);

    async function submitForm(event) {
        try {
            event.preventDefault();
            setError(false);
            const formData = new FormData(event.target);
            let data = FormDataNormalize(formData);
            data.member = user() !== null ? true : false;
            const result = await pb.collection("contact").create(data);
            setSuccess(true);
        } catch (error) {
            setError(true);
            import.meta.env.DEV && console.warn("Contact message not saved", error.message);
        }
    }

    return (
        <>
            <Show when={success() === false}>
                <div class="prose mb-8">
                    <h1>Kontaktirajte nas</h1>
                </div>
                <form onSubmit={submitForm}>
                    <Show when={user() === null}>
                        <div class="form-control w-full">
                            <label class="label">
                                <span class="label-text">Ime</span>
                            </label>
                            <input type="text" name="name" class="input input-bordered w-full" required="" minLength={3} maxLength={100} />
                        </div>
                        <div class="form-control w-full">
                            <label class="label">
                                <span class="label-text">E-mail adresa</span>
                            </label>
                            <input type="email" name="email" class="input input-bordered w-full" required="" minLength={8} maxLength={100} />
                        </div>
                    </Show>
                    <Show when={user() !== null}>
                        <input type="hidden" name="name" value={user().name} />
                        <input type="hidden" name="email" value={user().email} />
                    </Show>
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">Poruka</span>
                        </label>
                        <textarea name="message" class="textarea textarea-bordered" required="" rows={10}></textarea>
                    </div>
                    <FormButtons />
                </form>
            </Show>

            <Show when={success() === true}>
                <div role="alert" class="alert alert-success">
                    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Vaša poruka je uspješno spremljena. Odgovorit ćemo vam u najkraćem mogućem roku. Hvala što ste nas kontaktirali.</span>
                </div>
            </Show>

            <Show when={error() === true}>
                <div role="alert" class="alert alert-error">
                    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Dogodila se greška prilikom spremanja poruke. Provjerite podatke i pokušajte ponovno.</span>
                </div>
            </Show>
        </>
    );
}