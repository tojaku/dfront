import { createSignal, Show } from "solid-js";
import { A } from "@solidjs/router";
import { useAuth } from "../../components/AuthProvider";
import { pb } from "../../services/pocketbase";
import { FormDataNormalize } from "../../services/misc";
import FormButtons from "../../components/FormButtons";

export default function UserSignIn() {
    const user = useAuth();

    const [error, setError] = createSignal(false);

    async function submitForm(event) {
        try {
            event.preventDefault();
            setError(false);
            const formData = new FormData(event.target);
            const data = FormDataNormalize(formData);
            
            const result = await pb.collection("users").authWithPassword(data.email, data.password);
        } catch (error) {
            setError(true);
            import.meta.env.DEV && console.warn("User sign in failed", error.message);
        }
    }

    return (
        <>
            <Show when={user() === null}>
                <div class="prose mb-8">
                    <h1>Prijava korisnika</h1>
                </div>
                <form onSubmit={submitForm}>
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">E-mail adresa</span>
                        </label>
                        <input type="email" name="email" class="input input-bordered w-full" required="" minLength={8} maxLength={100} />
                    </div>
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">Zaporka</span>
                        </label>
                        <input type="password" name="password" class="input input-bordered w-full" required="" minLength={8} maxLength={100} />
                    </div>
                    <FormButtons />
                </form>
                <A class="btn btn-warning w-full mb-4" href="/user/resetpassword">Zaboravljena zaporka</A>
            </Show>

            <Show when={user() !== null}>
                <div class="hero min-h-[50vh] bg-base-200">
                    <div class="hero-content text-center">
                        <div class="max-w-xl">
                            <h1 class="text-5xl font-bold">Uspješno ste prijavljeni</h1>
                            <p class="py-6">Prijavljeni ste kao korisnik {user().name + " (" + user().email + ")"}. Ukoliko prepoznajete svoj korisnički račun možete nastaviti na naslovnicu. U protivnom se možete se odjaviti.</p>
                            <A class="btn btn-ghost mx-2" href="/user/signout">Odjava</A>
                            <A class="btn btn-primary" href="/">Naslovnica</A>
                        </div>
                    </div>
                </div>
            </Show>

            <Show when={error() === true}>
                <div role="alert" class="alert alert-error">
                    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Dogodila se greška prilikom prijave korisnika. Provjerite svoje korisničke podatke i pokušajte ponovno.</span>
                </div>
            </Show>
        </>
    );
}