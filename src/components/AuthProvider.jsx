import { createSignal, onMount, Show, createContext, useContext } from "solid-js";
import { Navigate, useNavigate } from "@solidjs/router";
import { pb } from "../services/pocketbase";

// context and helper
const AuthContext = createContext();
export function useAuth() {
    return useContext(AuthContext);
}

// provider
export function AuthProvider(props) {
    const [loading, setLoading] = createSignal(true);
    const [user, setUser] = createSignal(null);

    onMount(async () => {
        try {
            const result = await pb.collection("users").authRefresh();
            const userData = result.record;
            setUser(userData);
            import.meta.env.DEV && console.log("[onMount] Session active", userData);
        } catch (error) {
            setUser(null);
            import.meta.env.DEV && console.log("[onMount] No session");
        } finally {
            setLoading(false);
        }
    });

    pb.authStore.onChange((token, model) => {
        setUser(model);
    });

    return (
        <Show when={!loading()}>
            <AuthContext.Provider value={user}>{props.children}</AuthContext.Provider>
        </Show>
    );
}


// helpers
const unauthorizedMessage = { error: { title: "401", message: "Pristup traženoj stranici nije dozvoljen." } };

export function AuthorizedBoundary(props) {
    const user = useAuth();
    return user() !== null ? props.children : <Navigate href="/error" state={unauthorizedMessage} />;
}

export function PublicBoundary(props) {
    const user = useAuth();
    return user() === null ? props.children : <Navigate href="/error" state={unauthorizedMessage} />;
}

export function isAuthorized() {
    const user = useAuth();
    if (user() === null) {
        const navigate = useNavigate();
        navigate("/error", { state: unauthorizedMessage });
        return false;
    }
    return true;
}

export function isPublic() {
    const user = useAuth();
    if (user() !== null) {
        const navigate = useNavigate();
        navigate("/error", { state: unauthorizedMessage });
        return false;
    }
    return true;
}