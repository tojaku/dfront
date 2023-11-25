import { createSignal, Show } from "solid-js";
import { userStore, saveItems } from "../services/directus.js";

export default function Contact() {
    const [user, setUser] = userStore();

    const [success, setSuccess] = createSignal(false);
    const [error, setError] = createSignal(false);

    async function formSubmit(event) {
        try {
            event.preventDefault();
            setError(false);
            const formData = new FormData(event.target);
            import.meta.env.DEV && console.log("[formSubmit]", formData);
            const withCredentials = user() !== null ? true : false;
            await saveItems("contact", [Object.fromEntries(formData.entries())], withCredentials);
            import.meta.env.DEV && console.log("[formSubmit] OK");
            setSuccess(true);
        } catch (error) {
            setError(true);
            import.meta.env.DEV && console.error(error);
        }
    }

    return (
        <>
            <Show when={success() === false}>
                <div class="prose mb-8">
                    <h1>Kontaktirajte nas</h1>
                </div>
                <form onSubmit={formSubmit}>
                    <Show when={user() === null}>
                        <div class="form-control w-full">
                            <label class="label">
                                <span class="label-text">Ime</span>
                            </label>
                            <input type="text" name="name" class="input input-bordered w-full" required="" minLength={8} maxLength={50} />
                        </div>
                        <div class="form-control w-full">
                            <label class="label">
                                <span class="label-text">E-mail adresa</span>
                            </label>
                            <input type="email" name="email" class="input input-bordered w-full" required="" minLength={8} maxLength={50} />
                        </div>
                    </Show>
                    <Show when={user() !== null}>
                        <input type="hidden" name="name" value={user().first_name + " " + user().last_name} />
                        <input type="hidden" name="email" value={user().email} />
                    </Show>
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">Poruka</span>
                        </label>
                        <textarea name="message" class="textarea textarea-bordered" required="" rows={10}></textarea>
                    </div>

                    <div class="flex flex-nowrap gap-2 w-full my-4">
                        <input class="flex-1 btn w-full" type="submit" value="Potvrdi" />
                        <input class="flex-1 btn w-full" type="reset" value="Poništi" />
                    </div>
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