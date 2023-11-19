import { createDirectus, authentication, rest, readMe } from '@directus/sdk';

export const directus = createDirectus(import.meta.env.VITE_DIRECTUS_URL).with(authentication("cookie", { credentials: "include" })).with(rest());

export async function getCurrentUser() {
    try {
        import.meta.env.DEV && console.log("Getting current user data");
        await directus.refresh();
        const user = await directus.request(readMe());
        import.meta.env.DEV && console.log("User found", user.id, user.email);
        return user;
    } catch (error) {
        import.meta.env.DEV && console.warn("User not found");
        return null;
    }
}