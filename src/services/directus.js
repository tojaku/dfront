import { createDirectus, rest, readMe, refresh } from '@directus/sdk';

export const directus = createDirectus(import.meta.env.VITE_DIRECTUS_URL).with(rest({ credentials: "include" }));

export async function getCurrentUser() {
    try {
        const user = await directus.request(readMe({ ...await getAccessToken() }));
        import.meta.env.DEV && console.log("User signed in", user.email);
        return user;
    } catch (error) {
        import.meta.env.DEV && console.warn("User NOT signed in");
        return null;
    }
}

export async function getAccessToken() {
    try {
        const result = await directus.request(refresh("cookie"));
        import.meta.env.DEV && console.log("Fetched access token");
        return { access_token: result.access_token };
    } catch (error) {
        import.meta.env.DEV && console.warn("Did NOT fetch access token");
        return null;
    }
}