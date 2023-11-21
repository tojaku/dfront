import { createSignal, onMount } from "solid-js";
import { A } from "@solidjs/router";
import { logout } from "@directus/sdk";
import { directus } from "../../services/directus.js";
import { useAuth } from "../../components/AuthProvider.jsx";

export default function Signout() {
    const [user, setUser] = useAuth();

    const [signedin, setSignedin] = createSignal(null);

    onMount(async () => {
        if (user() !== null) {
            import.meta.env.DEV && console.log("Signing out user");
            
            //await directus.logout();
            await directus.request(logout());

            setUser(null);
        }
        setSignedin(false);
    });

    return (
        <>
            <Show when={signedin() === false}>
                <div class="hero min-h-[50vh] bg-base-200">
                    <div class="hero-content text-center">
                        <div class="max-w-xl">
                            <h1 class="text-5xl font-bold">Odjavljeni ste</h1>
                            <p class="py-6">Uspješno ste se odjavili, možete nastaviti na naslovnicu ili se možete ponovno prijaviti.</p>
                            <A class="btn btn-ghost mx-4" href="/user/signin">Prijava</A>
                            <A class="btn btn-primary" href="/">Naslovnica</A>
                        </div>
                    </div>
                </div>
            </Show>
        </>
    );
}