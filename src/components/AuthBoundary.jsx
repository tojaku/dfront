import { createSignal, onMount, onCleanup, Show } from "solid-js";
import { Navigate, useNavigate } from "@solidjs/router";
import { updateUser, userStore } from "../services/directus.js";

export function AuthorizationBoundary(props) {
    const [loading, setLoading] = createSignal(true);

    let interval = null;

    onMount(async () => {
        await updateUser();
        setLoading(false);

        import.meta.env.DEV && console.log("[onMount] Starting interval");
        interval = setInterval(async () => {
            await updateUser();
        }, 300000);
    });

    onCleanup(() => {
        import.meta.env.DEV && console.log("[onCleanup] Clearing interval");
        clearInterval(interval);
    });

    return (
        <Show when={!loading()}>
            {props.children}
        </Show>
    );
}

const unauthorizedMessage = { error: { title: "401", message: "Pristup traženoj stranici nije dozvoljen." } };

export function AuthorizedBoundary(props) {
    const [user, setUser] = userStore();
    return user() !== null ? props.children : <Navigate href="/error" state={unauthorizedMessage} />;
}

export function PublicBoundary(props) {
    const [user, setUser] = userStore();
    return user() === null ? props.children : <Navigate href="/error" state={unauthorizedMessage} />;
}

export function isAuthorized() {
    const [user, setUser] = userStore();
    if (user() === null) {
        const navigate = useNavigate();
        navigate("/error", { state: unauthorizedMessage });
        return false;
    }
    return true;
}

export function isPublic() {
    const [user, setUser] = userStore();
    if (user() !== null) {
        const navigate = useNavigate();
        navigate("/error", { state: unauthorizedMessage });
        return false;
    }
    return true;
}