import { createSignal, onMount, Show } from "solid-js";
import { A } from "@solidjs/router";
import { pb } from "../services/pocketbase";

export default function Footer(props) {
    const appName = import.meta.env.VITE_APP_NAME;

    const [privacyPolicy, setPrivacyPolicy] = createSignal(null);

    onMount(async () => {
        try {
            const result = await pb.collection("static").getFirstListItem("key='privacy_policy'");
            setPrivacyPolicy(result.content);
        } catch (error) {
            import.meta.env.DEV && console.warn("Privacy policy not loaded", error.message);
        }
    });

    return (
        <>
            <footer class="footer footer-center p-6 bg-base-200 text-base-content rounded">
                <nav class="grid grid-flow-col gap-4">
                    <A class="link link-hover" href="/contact">Kontakt</A>
                    <button class="link link-hover" onClick={() => { modal_privacy_policy.showModal() }}>Politika privatnosti i kolačića</button>
                </nav>
                <aside>
                    <p>Copyright © {new Date().getFullYear()}. {appName}</p>
                </aside>
            </footer>

            <dialog id="modal_privacy_policy" class="modal">
                <div class="modal-box w-11/12 max-w-5xl">
                    <form method="dialog">
                        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <Show when={privacyPolicy() !== null} fallback={<div>Sadržaj ne može biti učitan.</div>}>
                        <div class="prose w-fit max-w-none py-4" innerHTML={privacyPolicy()} />
                    </Show>
                </div>
            </dialog>
        </>
    );
}