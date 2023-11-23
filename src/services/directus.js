import { createDirectus, authentication, rest, readMe, refresh } from '@directus/sdk';

//export const directus = createDirectus(import.meta.env.VITE_DIRECTUS_URL).with(authentication("cookie", { credentials: "include" })).with(rest());
export const directus = createDirectus(import.meta.env.VITE_DIRECTUS_URL).with(rest({ credentials: "include" }));

export async function getCurrentUser() {
    try {
        import.meta.env.DEV && console.log("Getting current user data");
        //await directus.refresh();
        import.meta.env.DEV && console.log("Fetching and attaching access token to request");
        const token = await directus.request(refresh("cookie"));
        const user = await directus.request(readMe({ ...token }));
        import.meta.env.DEV && console.log("User signed in", user.email);
        return user;
    } catch (error) {
        import.meta.env.DEV && console.warn("User not signed in");
        return null;
    }
}