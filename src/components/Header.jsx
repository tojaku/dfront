import { Show } from "solid-js";
import { A } from "@solidjs/router";
import { userStore } from "../services/directus";

export default function Header() {
    const appName = import.meta.env.VITE_APP_NAME;
    const adminUrl = import.meta.env.VITE_DIRECTUS_URL;

    const [user, setUser] = userStore();

    return (
        <div class="flex flex-wrap navbar bg-base-200">
            <div class="flex-none">
                <A href="/" class="btn btn-ghost text-xl uppercase">{appName}</A>
            </div>
            <div class="flex-auto justify-end">
                <Show when={user() === null}>
                    <A class="btn btn-outline" href="/user/signin">Prijava</A>
                </Show>
                <Show when={user() !== null}>
                    <A class="btn btn-outline mr-2" href="/panels/list">Ploče</A>
                    <A class="btn btn-outline mr-2" href={`${adminUrl}/admin/content/panels/+`} target="_blank">Nova ploča</A>
                    <A class="btn btn-outline mr-2" href={adminUrl} target="_blank">Administracija</A>
                    <A class="btn btn-outline" href="/user/signout">Odjava</A>
                </Show>
            </div>
        </div>
    );
}