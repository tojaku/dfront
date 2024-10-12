import { createSignal, Show } from "solid-js";
import { useAuth } from "../../components/AuthProvider";
import FormButtons from "../../components/FormButtons";
import { pb } from "../../services/pocketbase";
import { FormDataNormalize } from "../../services/misc";

export default function UserData(props) {
    const user = useAuth();

    const [error, setError] = createSignal(false);
    const [success, setSuccess] = createSignal(false);

    async function submitData(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        let data = FormDataNormalize(formData);

        setError(false);
        setSuccess(false);
        try {
            await pb.collection("users").update(user().id, data);
            setSuccess(true);
        } catch (error) {
            setError(true);
            import.meta.env.DEV && console.warn("User data not updated", error.message);
        }
    }

    async function changePassword(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = FormDataNormalize(formData);

        if (data.password !== data.passwordConfirm) {
            setError(true);
            return;
        }

        setError(false);
        setSuccess(false);
        try {
            await pb.collection("users").update(user().id, data);
            setSuccess(true);
            alert("Zbog uspješne promjene zaporke bit ćete automatski odjavljeni.");
            setTimeout(() => {
                window.location = "/";
            }, 1000);
        } catch (error) {
            setError(true);
            import.meta.env.DEV && console.warn("Password not updated", error.message);
        }
    }

    return (
        <>
            <Show when={error() === true}>
                <div role="alert" class="alert alert-error">
                    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Dogodila se greška prilikom spremanja podataka. Provjerite podatke i pokušajte ponovno.</span>
                </div>
            </Show>

            <Show when={success() === true}>
                <div role="alert" class="alert alert-success">
                    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Podaci su uspješno spremljeni.</span>
                </div>
            </Show>

            <div class="form-control w-full">
                <label class="label">
                    <span class="label-text">E-mail adresa</span>
                    <span class="text-[0.6em] uppercase">Nije moguće promijeniti</span>
                </label>
                <input type="email" class="input input-bordered w-full" value={user().email} readonly="" />
            </div>

            <div class="h-6"></div>

            <form onSubmit={submitData}>
                <div class="form-control w-full">
                    <label class="label">
                        <span class="label-text">Korisničko ime</span>
                    </label>
                    <input type="text" name="username" class="input input-bordered w-full" value={user().username} required="" minLength={3} maxLength={100} />
                </div>
                <div class="form-control w-full">
                    <label class="label">
                        <span class="label-text">Ime</span>
                    </label>
                    <input type="text" name="name" class="input input-bordered w-full" value={user().name} required="" minLength={3} maxLength={100} />
                </div>
                <FormButtons />
            </form>

            <div class="h-6"></div>

            <form onSubmit={changePassword}>
                <div class="form-control w-full">
                    <label class="label">
                        <span class="label-text">Stara zaporka</span>
                    </label>
                    <input type="password" name="oldPassword" class="input input-bordered w-full" required="" minLength={8} maxLength={100} />
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
        </>
    );
}