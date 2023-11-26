import { onMount, onCleanup, createSignal, Show, For } from "solid-js";
import { useParams } from "@solidjs/router";
import { getItems } from "../../services/directus";

export default function PanelsView() {
    const adminUrl = import.meta.env.VITE_DIRECTUS_URL;

    const params = useParams();

    const [item, setItem] = createSignal(null);
    const [error, setError] = createSignal(false);

    const [time, setTime] = createSignal({});
    const [sayings, setSayings] = createSignal([]);
    const [news, setNews] = createSignal([]);
    const [timers, setTimers] = createSignal([]);
    const [birthdays, setBirthdays] = createSignal([]);

    let timer = null;

    onMount(async () => {
        timer = setInterval(() => {
            const now = new Date();
            const locale = "hr-HR";
            setTime({
                date: now.toLocaleDateString(locale),
                time: now.toLocaleTimeString(locale),
                day: now.toLocaleDateString(locale, { weekday: "long" })
            });
        }, 1000);

        try {
            const panelId = params.id;
            let result = await getItems("panels", {
                fields: "*.*.*",
                filter: {
                    "id": {
                        "_eq": panelId
                    },
                }
            });
            setItem(result[0]);

            if (item().display_birthdays === true) {
                const now = new Date();
                result = await getItems("birthdays", {
                    filter: {
                        "user_created": {
                            "_eq": "$CURRENT_USER"
                        },
                        "day(birthday)": {
                            "_eq": now.getDate()
                        },
                        "month(birthday)": {
                            "_eq": now.getMonth() + 1
                        }
                    }
                });
                setBirthdays(result);
            }

            setSayings(item().elements.filter((item) => item.collection === "sayings"));
            setNews(item().elements.filter((item) => item.collection === "news"));
            setTimers(item().elements.filter((item) => item.collection === "timers"));
            import.meta.env.DEV && console.log("[onMount] Data loaded");
        } catch (error) {
            setError(true);
            import.meta.env.DEV && console.error(error);
        }
    });

    onCleanup(() => {
        clearInterval(timer)
    });

    return (
        <Show when={item() !== null}>
            <div style={`background-color: ${item().background_color}; color: ${item().font_color}; font-family: "Quicksand", sans-serif;`} class="min-h-screen">
                <div class="min-h-screen max-h-screen flex flex-col">
                    <div class="flex-none flex flex-row items-center">
                        <div class="flex-none p-2">
                            <Show when={item().logo !== null}>
                                <img class="h-44" src={`${adminUrl}/assets/${item().logo.id}`} alt="Logo" />
                            </Show>
                        </div>
                        <div class="flex-1"><h1 class="text-6xl text-center">{item().title}</h1></div>
                        <div class="flex-none p-2 pr-8 text-center">
                            <h3 class="text-3xl capitalize font-bold">{time().day}</h3>
                            <h3 class="text-2xl">{time().date}</h3>
                            <h2 class="text-3xl">{time().time}</h2>
                        </div>
                    </div>
                    <div class="flex-1 flex flex-row p-4">
                        <Show when={sayings().length > 0}>
                            <div class="flex-1 flex flex-col items-center justify-center text-center p-4">
                                <div class="text-6xl mb-6">
                                    <svg class="inline-block" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path d="M448 296c0 66.3-53.7 120-120 120h-8c-17.7 0-32-14.3-32-32s14.3-32 32-32h8c30.9 0 56-25.1 56-56v-8H320c-35.3 0-64-28.7-64-64V160c0-35.3 28.7-64 64-64h64c35.3 0 64 28.7 64 64v32 32 72zm-256 0c0 66.3-53.7 120-120 120H64c-17.7 0-32-14.3-32-32s14.3-32 32-32h8c30.9 0 56-25.1 56-56v-8H64c-35.3 0-64-28.7-64-64V160c0-35.3 28.7-64 64-64h64c35.3 0 64 28.7 64 64v32 32 72z" /></svg>
                                </div>
                                <div class="text-4xl mb-4">{sayings()[0].item.content}</div>
                                <div class="text-2xl italic">{sayings()[0].item.author}</div>
                            </div>
                        </Show>
                        <Show when={birthdays().length > 0}>
                            <div class="flex-1 flex flex-col items-center justify-center text-center p-4">
                                <div class="text-6xl mb-6">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path d="M86.4 5.5L61.8 47.6C58 54.1 56 61.6 56 69.2V72c0 22.1 17.9 40 40 40s40-17.9 40-40V69.2c0-7.6-2-15-5.8-21.6L105.6 5.5C103.6 2.1 100 0 96 0s-7.6 2.1-9.6 5.5zm128 0L189.8 47.6c-3.8 6.5-5.8 14-5.8 21.6V72c0 22.1 17.9 40 40 40s40-17.9 40-40V69.2c0-7.6-2-15-5.8-21.6L233.6 5.5C231.6 2.1 228 0 224 0s-7.6 2.1-9.6 5.5zM317.8 47.6c-3.8 6.5-5.8 14-5.8 21.6V72c0 22.1 17.9 40 40 40s40-17.9 40-40V69.2c0-7.6-2-15-5.8-21.6L361.6 5.5C359.6 2.1 356 0 352 0s-7.6 2.1-9.6 5.5L317.8 47.6zM128 176c0-17.7-14.3-32-32-32s-32 14.3-32 32v48c-35.3 0-64 28.7-64 64v71c8.3 5.2 18.1 9 28.8 9c13.5 0 27.2-6.1 38.4-13.4c5.4-3.5 9.9-7.1 13-9.7c1.5-1.3 2.7-2.4 3.5-3.1c.4-.4 .7-.6 .8-.8l.1-.1 0 0 0 0s0 0 0 0s0 0 0 0c3.1-3.2 7.4-4.9 11.9-4.8s8.6 2.1 11.6 5.4l0 0 0 0 .1 .1c.1 .1 .4 .4 .7 .7c.7 .7 1.7 1.7 3.1 3c2.8 2.6 6.8 6.1 11.8 9.5c10.2 7.1 23 13.1 36.3 13.1s26.1-6 36.3-13.1c5-3.5 9-6.9 11.8-9.5c1.4-1.3 2.4-2.3 3.1-3c.3-.3 .6-.6 .7-.7l.1-.1c3-3.5 7.4-5.4 12-5.4s9 2 12 5.4l.1 .1c.1 .1 .4 .4 .7 .7c.7 .7 1.7 1.7 3.1 3c2.8 2.6 6.8 6.1 11.8 9.5c10.2 7.1 23 13.1 36.3 13.1s26.1-6 36.3-13.1c5-3.5 9-6.9 11.8-9.5c1.4-1.3 2.4-2.3 3.1-3c.3-.3 .6-.6 .7-.7l.1-.1c2.9-3.4 7.1-5.3 11.6-5.4s8.7 1.6 11.9 4.8l0 0 0 0 0 0 .1 .1c.2 .2 .4 .4 .8 .8c.8 .7 1.9 1.8 3.5 3.1c3.1 2.6 7.5 6.2 13 9.7c11.2 7.3 24.9 13.4 38.4 13.4c10.7 0 20.5-3.9 28.8-9V288c0-35.3-28.7-64-64-64V176c0-17.7-14.3-32-32-32s-32 14.3-32 32v48H256V176c0-17.7-14.3-32-32-32s-32 14.3-32 32v48H128V176zM448 394.6c-8.5 3.3-18.2 5.4-28.8 5.4c-22.5 0-42.4-9.9-55.8-18.6c-4.1-2.7-7.8-5.4-10.9-7.8c-2.8 2.4-6.1 5-9.8 7.5C329.8 390 310.6 400 288 400s-41.8-10-54.6-18.9c-3.5-2.4-6.7-4.9-9.4-7.2c-2.7 2.3-5.9 4.7-9.4 7.2C201.8 390 182.6 400 160 400s-41.8-10-54.6-18.9c-3.7-2.6-7-5.2-9.8-7.5c-3.1 2.4-6.8 5.1-10.9 7.8C71.2 390.1 51.3 400 28.8 400c-10.6 0-20.3-2.2-28.8-5.4V480c0 17.7 14.3 32 32 32H416c17.7 0 32-14.3 32-32V394.6z" /></svg>
                                </div>
                                <For each={birthdays()}>{(item, i) =>
                                    <div class="text-4xl mb-4">
                                        {item.name} iz {item.department}
                                    </div>
                                }</For>
                                <div class="text-2xl italic">Sretan rođendan!</div>
                            </div>
                        </Show>
                        <Show when={news().length > 0}>
                            <div class="flex-1 flex flex-col items-center justify-center p-4">
                                <div class="card shadow-xl">
                                    <figure style={`background-color: ${item().font_color};`} class="text-6xl p-6">
                                        <svg style={`fill: ${item().background_color};`} xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path d="M0 64C0 46.3 14.3 32 32 32c229.8 0 416 186.2 416 416c0 17.7-14.3 32-32 32s-32-14.3-32-32C384 253.6 226.4 96 32 96C14.3 96 0 81.7 0 64zM0 416a64 64 0 1 1 128 0A64 64 0 1 1 0 416zM32 160c159.1 0 288 128.9 288 288c0 17.7-14.3 32-32 32s-32-14.3-32-32c0-123.7-100.3-224-224-224c-17.7 0-32-14.3-32-32s14.3-32 32-32z" /></svg>
                                    </figure>
                                    <div class="card-body">
                                        <h2 class="card-title text-4xl">{news()[0].item.title}</h2>
                                        <div innerHTML={news()[0].item.content} class="prose text-xl" style={`color: ${item().font_color};`} />
                                    </div>
                                </div>
                            </div>
                        </Show>
                    </div>
                    <div class="flex-none flex flex-row">
                        <div class="flex-1 flex flex-row items-center justify-start">
                            <div class="mx-10">
                                <div>Naslov</div>
                                <div class="grid grid-flow-col gap-5 text-center auto-cols-max">
                                    <div class="flex flex-col">
                                        <span class="countdown font-mono text-6xl">
                                            <span style="--value:15;"></span>
                                        </span>
                                        dana
                                    </div>
                                    <div class="flex flex-col">
                                        <span class="countdown font-mono text-6xl">
                                            <span style="--value:10;"></span>
                                        </span>
                                        sati
                                    </div>
                                    <div class="flex flex-col">
                                        <span class="countdown font-mono text-6xl">
                                            <span style="--value:24;"></span>
                                        </span>
                                        minuta
                                    </div>
                                    <div class="flex flex-col">
                                        <span class="countdown font-mono text-6xl">
                                            <span style="--value:52;"></span>
                                        </span>
                                        sekundi
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="flex-none">
                            <img class="h-28" src="/qr.svg" alt="QR Code" />
                        </div>
                    </div>
                </div>
            </div>
        </Show>
    );
}