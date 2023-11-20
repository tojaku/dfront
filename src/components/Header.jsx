import { A } from "@solidjs/router";
import { useAuth } from "./AuthProvider";

export default function Header() {
    const appName = import.meta.env.VITE_APP_NAME;
    const adminUrl = import.meta.env.VITE_DIRECTUS_URL;

    const [user, setUser] = useAuth();

    return (
        <div class="flex flex-wrap navbar bg-base-200">
            <div class="flex-none">
                <A href="/" class="btn btn-ghost text-xl uppercase">{appName}</A>
            </div>
            <div class="flex-auto justify-end">
                <Show when={user() === null}>
                    <A class="btn btn-outline mx-2" href="/user/signin">Prijava</A>
                </Show>
                <Show when={user() !== null}>
                    <A class="btn btn-outline mx-2" href={adminUrl}>Administracija</A>
                    <A class="btn btn-outline" href="/user/signout">Odjava</A>
                </Show>
            </div>
        </div>
    );
}