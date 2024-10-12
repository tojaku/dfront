import { createSignal, Show } from "solid-js";
import { A } from "@solidjs/router";
import { pb } from "../../services/pocketbase";
import { FormDataNormalize } from "../../services/misc";
import FormButtons from "../../components/FormButtons";

export default function UserResetPassword() {
    const [success, setSuccess] = createSignal(false);

    async function submitForm(event) {
        setSuccess(false);
        try {
            event.preventDefault();
            const formData = new FormData(event.target);
            const data = FormDataNormalize(formData);
            await pb.collection("users").requestPasswordReset(data.email);
            setSuccess(true);
        } catch (error) {
            import.meta.env.DEV && console.warn("Password reset request failed", error.message);
        }
    }

    return (
        <>
            <div class="prose mb-8">
                <h1>Zaboravljena zaporka</h1>
            </div>

            <Show when={success() === false}>
                <form onSubmit={submitForm}>
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">E-mail adresa</span>
                        </label>
                        <input type="email" name="email" class="input input-bordered w-full" required="" minLength={8} maxLength={100} />
                    </div>
                    <FormButtons />
                </form>
            </Show>

            <Show when={success() == true}>
                <div class="hero min-h-[50vh] bg-base-200">
                    <div class="hero-content text-center">
                        <div class="max-w-xl">
                            <h1 class="text-5xl font-bold">Zahtjev za promjenom uspješan</h1>
                            <p class="py-6">Na upisanu e-mail adresu biste trebali primiti poruku s poveznicom za promjenu zaporke. Provjerite sve svoje mape ukoliko isprva ne vidite poruku.</p>
                            <A class="btn btn-ghost mx-2" href="/user/signin">Prijava</A>
                            <A class="btn btn-primary" href="/">Naslovnica</A>
                        </div>
                    </div>
                </div>
            </Show>
        </>
    );
}