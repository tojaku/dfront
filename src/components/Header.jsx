import { Show } from "solid-js";
import { A } from "@solidjs/router";
import { useAuth } from "./AuthProvider";

export default function Header(props) {
    const appName = import.meta.env.VITE_APP_NAME;

    const user = useAuth();

    return (
        <div class="flex flex-wrap navbar bg-base-200">
            <div class="flex-none">
                <A href="/" class="btn btn-ghost text-xl uppercase">{appName}</A>
            </div>
            <div class="flex-1 justify-end flex flex-wrap gap-1">
                <Show when={user() === null}>
                    <A class="btn btn-outline" href="/user/signin">Prijava</A>
                </Show>
                <Show when={user() !== null}>
                    <A class="btn btn-outline btn-secondary" href="/panels/list">Izbor ploče za prikaz</A>
                    <A class="btn btn-outline btn-primary" href="/settings/news">Novosti</A>
                    <A class="btn btn-outline btn-primary" href="/settings/sayings">Izreke</A>
                    <A class="btn btn-outline btn-primary" href="/settings/timers">Brojači</A>
                    <A class="btn btn-outline btn-primary" href="/settings/birthdays">Rođendani</A>
                    <A class="btn btn-outline btn-primary" href="/settings/panels">Ploče</A>
                    <A class="btn btn-outline btn-primary" href="/settings/user">Korisnik</A>
                    <A class="btn btn-outline" href="/user/signout">Odjava</A>
                </Show>
            </div>
        </div>
    );
}