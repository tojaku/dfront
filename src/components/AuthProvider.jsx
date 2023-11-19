import { createSignal, createContext, useContext, onMount, onCleanup, createEffect } from "solid-js";
import { Navigate } from "@solidjs/router";
import { getCurrentUser } from "../services/directus.js";

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider(props) {
    const [user, setUser] = createSignal(null);

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

        import.meta.env.DEV && console.log("Starting user status update interval");
        interval = setInterval(async () => {
            await updateUser();
        }, 10000);
    });

    onCleanup(() => {
        import.meta.env.DEV && console.log("Clearing user status update interval");
        clearInterval(interval);
    });

    return (
        <AuthContext.Provider value={[user, setUser]}>{props.children}</AuthContext.Provider>
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
