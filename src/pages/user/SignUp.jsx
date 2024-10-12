import { createSignal, Show } from "solid-js";
import { A } from "@solidjs/router";
import { pb } from "../../services/pocketbase";
import { FormDataNormalize } from "../../services/misc";
import FormButtons from "../../components/FormButtons";

export default function UserSignUp() {
    const [error, setError] = createSignal(false);
    const [success, setSuccess] = createSignal(false);

    async function submitForm(event) {
        setError(false);
        setSuccess(false);
        try {
            event.preventDefault();
            setError(false);
            const formData = new FormData(event.target);
            let data = FormDataNormalize(formData);
            data.username = data.email.split("@")[0] + Date.now();

            if (data.password !== data.passwordConfirm) {
                setError(true);
                return;
            }
            const result = await pb.collection("users").create(data);
            await pb.collection("users").requestVerification(data.email);
            setSuccess(true);
        } catch (error) {
            setError(true);
            import.meta.env.DEV && console.warn("User sign up failed", error.message);
        }
    }

    return (
        <>
            <Show when={success() === false}>
                <div class="prose mb-8">
                    <h1>Registracija korisnika</h1>
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
                            <span class="label-text">Ime</span>
                        </label>
                        <input type="text" name="name" class="input input-bordered w-full" required="" minLength={3} maxLength={100} />
                    </div>
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">Zaporka</span>
                        </label>
                        <input type="password" name="password" class="input input-bordered w-full" required="" minLength={8} maxLength={100} />
                    </div>
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">Potvrda zaporke</span>
                        </label>
                        <input type="password" name="passwordConfirm" class="input input-bordered w-full" required="" minLength={8} maxLength={100} />
                    </div>
                    <FormButtons />
                </form>
            </Show>

            <Show when={success() == true}>
                <div class="hero min-h-[50vh] bg-base-200">
                    <div class="hero-content text-center">
                        <div class="max-w-xl">
                            <h1 class="text-5xl font-bold">Uspješno ste registrirani</h1>
                            <p class="py-6">Na upisanu e-mail adresu biste trebali primiti poruku s uputom za potvrdu. Morate izvršiti potvrdu kako biste se mogli prijaviti.</p>
                            <A class="btn btn-ghost mx-2" href="/user/signin">Prijava</A>
                            <A class="btn btn-primary" href="/">Naslovnica</A>
                        </div>
                    </div>
                </div>
            </Show>

            <Show when={error() === true}>
                <div role="alert" class="alert alert-error">
                    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Dogodila se greška prilikom registracije korisnika. Provjerite svoje korisničke podatke i pokušajte ponovno.</span>
                </div>
            </Show>
        </>
    );
}