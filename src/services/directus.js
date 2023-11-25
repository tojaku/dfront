import { createSignal } from 'solid-js';
import { createDirectus, refresh, readMe, rest } from '@directus/sdk';
import { login, logout, readItems, createItems } from '@directus/sdk';

export const directus = createDirectus(import.meta.env.VITE_DIRECTUS_URL).with(rest({ credentials: "include" }));

//// USER STORE

const [user, setUser] = createSignal(null);
export function userStore() {
    return [user, setUser];
}

///// AUTHENTICATION

const tokenStorage = {
    value: null,
    expires: 0
};

export async function updateUser() {
    try {
        const currentUser = await directus.request(readMe({ access_token: await getAccessToken() }));
        import.meta.env.DEV && console.log("[getUserObject] OK", currentUser.id);
        setUser(currentUser);
        return currentUser;
    } catch (error) {
        import.meta.env.DEV && console.warn("[getUserObject] User not signed in");
        setUser(null);
        return null;
    }
}

export async function getAccessToken() {
    try {
        if (tokenStorage.expires < (Date.now() + 60000)) {
            const result = await directus.request(refresh("cookie"));
            tokenStorage.value = result.access_token;
            tokenStorage.expires = Date.now() + result.expires;
            import.meta.env.DEV && console.log("[getAccessToken] Token refreshed");
        };
        import.meta.env.DEV && console.log("[getAccessToken] OK");
        return tokenStorage.value;
    } catch (error) {
        import.meta.env.DEV && console.warn("[getAccessToken] Error getting access token");
        return null;
    }
}

export async function signin(email, password) {
    try {
        const result = await directus.request(login(email, password, { mode: "cookie" }));
        tokenStorage.value = result.access_token;
        tokenStorage.expires = Date.now() + result.expires;
        await updateUser();
        import.meta.env.DEV && console.log("[signin] OK");
        return true;
    } catch (error) {
        import.meta.env.DEV && console.warn("[signin] Error signing in");
        throw error;
    }
}

export async function signout() {
    try {
        tokenStorage.value = null;
        tokenStorage.expires = 0;
        await updateUser();
        await directus.request(logout());
        setUser(null);
        import.meta.env.DEV && console.log("[signout] OK");
    } catch (error) {
        import.meta.env.DEV && console.warn("[signout] Error signing out");
        // throw error;
    }
}

///// COMMON OPERATIONS

export async function getItems(collection, query, withCredentials = true) {
    try {
        let newQuery = {};
        withCredentials && (newQuery = { access_token: await getAccessToken() });
        newQuery = { ...newQuery, ...query };
        const result = await directus.request(readItems(collection, newQuery));
        import.meta.env.DEV && console.log("[getItems] OK", collection);
        return result;
    } catch (error) {
        import.meta.env.DEV && console.warn("[getItems] Error reading items", collection);
        throw error;
    }
}

export async function saveItems(collection, items, query, withCredentials = true) {
    try {
        let newQuery = {};
        withCredentials && (newQuery = { access_token: await getAccessToken() });
        newQuery = { ...newQuery, ...query };
        const result = await directus.request(createItems(collection, items, newQuery));
        import.meta.env.DEV && console.log("[saveItems] OK", collection);
        return result;
    } catch (error) {
        import.meta.env.DEV && console.warn("[saveItems] Error reading items", collection);
        throw error;
    }
}