import { Show } from "solid-js";
import { A } from "@solidjs/router";
import { useAuth } from "./AuthProvider";

export default function Header() {
    const appName = import.meta.env.VITE_APP_NAME;

    const user = useAuth();

    // TODO wire up 'settings' 
    return (
        <div class="flex flex-wrap navbar bg-base-200">
            <div class="flex-none">
                <A href="/" class="btn btn-ghost text-xl uppercase">{appName}</A>
            </div>
            <div class="flex-auto justify-end">
                <Show when={user() === null}>
                    <A class="btn btn-outline mr-2" href="/user/signin">Prijava</A>
                </Show>
                <Show when={user() !== null}>
                    <A class="btn btn-outline mr-2" href="/panels/list">Ploče</A>
                    <A class="btn btn-outline mr-2" href="/">Postavke</A>
                    <A class="btn btn-outline" href="/user/signout">Odjava</A>
                </Show>
            </div>
        </div>
    );
}