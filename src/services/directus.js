import { createDirectus, authentication, rest, readMe, refresh } from '@directus/sdk';

//export const directus = createDirectus(import.meta.env.VITE_DIRECTUS_URL).with(authentication("cookie", { credentials: "include" })).with(rest());
export const directus = createDirectus(import.meta.env.VITE_DIRECTUS_URL).with(rest({ credentials: "include" }));

export async function getCurrentUser() {
    try {
        import.meta.env.DEV && console.log("Getting current user data");

        //await directus.refresh();
        const result = await directus.request(refresh("cookie"));
        import.meta.env.DEV && console.log("Refresh result", result);

        const user = await directus.request(readMe());
        import.meta.env.DEV && console.log("User found", user.email);
        return user;
    } catch (error) {
        import.meta.env.DEV && console.warn("User not found", error);
        return null;
    }
}