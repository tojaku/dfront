import { createSignal, createContext, useContext, onMount, onCleanup } from "solid-js";
import { Navigate } from "@solidjs/router";
import { getCurrentUser } from "../services/directus.js";

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider(props) {
    const [user, setUser] = createSignal(null);
    const [loading, setLoading] = createSignal(true);

    let interval = null;

    async function updateUser() {
        const currentUser = await getCurrentUser();
        if (user() === null && currentUser !== null) {
            setUser(currentUser);
        } else if (user() !== null && currentUser === null) {
            setUser(null);
        }
    }

    onMount(async () => {
        import.meta.env.DEV && console.log("Updating user status initially");
        await updateUser();
        setLoading(false);

        import.meta.env.DEV && console.log("Starting user status update interval");
        interval = setInterval(async () => {
            await updateUser();
        }, 60000);
    });

    onCleanup(() => {
        import.meta.env.DEV && console.log("Clearing user status update interval");
        clearInterval(interval);
    });

    return (
        <Show when={!loading()}>
            <AuthContext.Provider value={[user, setUser]}>{props.children}</AuthContext.Provider>
        </Show>
    );
}

export function Authorized(props) {
    const [user, setUser] = useAuth();
    return user() !== null ? props.children : unauthorized();
}

export function Public(props) {
    const [user, setUser] = useAuth();
    return user() === null ? props.children : unauthorized();
}

function unauthorized() {
    return <Navigate href="/error" state={{ error: { title: "401", message: "Pristup traženoj stranici nije dozvoljen." } }} />;
}
