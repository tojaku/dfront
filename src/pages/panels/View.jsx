import { onMount, onCleanup, createSignal, Show, For } from "solid-js";
import { useParams } from "@solidjs/router";
import CountdownTimer from "../../components/CountdownTimer";
import { pb } from "../../services/pocketbase";

export default function PanelsView(props) {
    const params = useParams();

    const [item, setItem] = createSignal(null);
    const [error, setError] = createSignal(false);
    const [time, setTime] = createSignal({});

    const [dailySchedule, setDailySchedule] = createSignal(null);
    const [dailyScheduleData, setDailyScheduleData] = createSignal(null);

    const [quotes, setQuotes] = createSignal([]);
    const [nextQuote, setNextQuote] = createSignal(0);
    const [news, setNews] = createSignal([]);
    const [nextNews, setNextNews] = createSignal(0);
    const [timers, setTimers] = createSignal([]);
    const [birthdays, setBirthdays] = createSignal([]);

    let timer = null;
    let tick = 1;

    onMount(async () => {
        timer = setInterval(() => {
            const now = new Date();
            const locale = "hr-HR";
            setTime({
                date: now.toLocaleDateString(locale),
                time: now.toLocaleTimeString(locale),
                day: now.toLocaleDateString(locale, { weekday: "long" })
            });

            if (tick % item().cycle_duration === 0) {
                setNextQuote(current => nextIndex(current, quotes()));
                //setNextNews(current => nextIndex(current, news()));
            }

            if (dailySchedule() !== null) {
                setDailyScheduleData(dataFromDailySchedule(dailySchedule(), now));
            }

            tick += 1;
        }, 1000);

        try {
            const panelId = params.id;
            const result1 = await pb.collection("panels").getOne(panelId, {
                expand: "news,quotes,timers",
            });
            setItem(result1);
            import.meta.env.DEV && console.log("Panel loaded", result1);

            if (item().daily_schedule !== null && item().daily_schedule !== "") setDailySchedule(parseDailySchedule(item().daily_schedule));
            if (item().expand.quotes) setQuotes(item().expand.quotes);
            if (item().expand.news) setNews(item().expand.news);
            if (item().expand.timers) setTimers(item().expand.timers);

            if (item().display_birthdays === true) {
                const now = new Date();
                const result2 = await pb.collection("birthdays").getList(1, 100, {
                    filter: `day=${now.getDate()} && month=${now.getMonth() + 1}`,
                });
                setBirthdays(result2.items);
                import.meta.env.DEV && console.log("Birthdays loaded", result2.items.length);
            }
        } catch (error) {
            setError(true);
            import.meta.env.DEV && console.warn("Panel not loaded", error.message);
        }
    });

    function parseDailySchedule(text) {
        const lines = text.trim().split("\n");
        const result = [];
        let currentGroup = null;
        lines.forEach((line) => {
            line = line.trim();
            if (line.startsWith("#")) {
                currentGroup = { group: line.slice(1).trim(), entries: [] };
                result.push(currentGroup);
            } else {
                const [label, time] = line.split(',');
                if (currentGroup) {
                    currentGroup.entries.push({ label: label.trim(), time: time.trim() });
                }
            }
        });
        return result;
    }

    function dataFromDailySchedule(array, now) {
        const lastEntryExtensionMinutes = 5;
        for (const item of array) {
            const entries = item.entries;
            for (let i = 0; i < entries.length; i++) {
                const currentEntry = entries[i];
                const nextEntry = entries[i + 1] || null;
                // Parse current entry time
                const [startHours, startMinutes] = currentEntry.time.split(":").map(Number);
                const hourStart = new Date();
                hourStart.setHours(startHours, startMinutes, 0, 0);
                // Determine hourEnd (based on next entry or extend by a given number of minutes for the last entry)
                let hourEnd;
                if (nextEntry) {
                    const [nextHours, nextMinutes] = nextEntry.time.split(":").map(Number);
                    hourEnd = new Date();
                    hourEnd.setHours(nextHours, nextMinutes, 0, 0);
                } else {
                    hourEnd = new Date(hourStart.getTime() + lastEntryExtensionMinutes * 60 * 1000); // Extend last entry
                }
                // Check if current time is within the hour
                if (now >= hourStart && now < hourEnd) {
                    const remainingMin = Math.round((hourEnd - now) / (1000 * 60)); // Calculate remaining minutes
                    return {
                        title: item.group,
                        label: currentEntry.label,
                        remaining: remainingMin
                    };
                }
            }
        }
        // If no match is found, return null
        return null;
    }

    onCleanup(() => {
        clearInterval(timer);
    });

    function nextIndex(current, array) {
        const maxIndex = array.length - 1;
        if (current >= maxIndex) {
            return 0;
        } else {
            return current + 1;
        }
    }

    return (
        <Show when={item() !== null}>
            <div style={`background-color: ${item().background_color}; color: ${item().font_color}; font-family: "Quicksand", sans-serif;`} class="min-h-screen">
                <div class="min-h-screen flex flex-col">
                    <div class="flex-none flex flex-row items-center"> {/* Row 1 */}
                        <div class="flex-none p-2">
                            <Show when={item().logo !== null && item().logo !== ""}>
                                <img class="h-44" src={`${import.meta.env.VITE_BACKEND}/api/files/${item().collectionId}/${item().id}/${item().logo}`} alt="Logo" />
                            </Show>
                        </div>
                        <div class="flex-1"><h1 class="text-5xl text-center">{item().title}</h1></div>
                        <Show when={dailyScheduleData() !== null}>
                            <div class="flex-none p-2 pr-8 text-center">
                                <h2 class="text-3xl">{dailyScheduleData().label}</h2>
                                <h2 class="text-2xl font-bold">{dailyScheduleData().title}</h2>
                                <h2 class="text-2xl">{dailyScheduleData().remaining} min do kraja</h2>
                            </div>
                        </Show>
                        <div class="flex-none p-2 pr-8 text-center">
                            <h3 class="text-3xl capitalize font-bold">{time().day}</h3>
                            <h3 class="text-2xl">{time().date}</h3>
                            <h2 class="text-3xl">{time().time}</h2>
                        </div>
                    </div>
                    <Show when={quotes().length > 0}>
                        <div class="flex-none flex justify-center px-4"> {/* Row 2 (optional) */}
                            <div class="flex flex-row gap-2">
                                <div class="flex-none text-2xl">
                                    <svg style={`fill: ${item().font_color};`} class="inline-block" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path d="M448 296c0 66.3-53.7 120-120 120h-8c-17.7 0-32-14.3-32-32s14.3-32 32-32h8c30.9 0 56-25.1 56-56v-8H320c-35.3 0-64-28.7-64-64V160c0-35.3 28.7-64 64-64h64c35.3 0 64 28.7 64 64v32 32 72zm-256 0c0 66.3-53.7 120-120 120H64c-17.7 0-32-14.3-32-32s14.3-32 32-32h8c30.9 0 56-25.1 56-56v-8H64c-35.3 0-64-28.7-64-64V160c0-35.3 28.7-64 64-64h64c35.3 0 64 28.7 64 64v32 32 72z" /></svg>
                                </div>
                                <div class="flex-1 text-center">
                                    <span class="text-3xl">{quotes()[nextQuote()].content}</span>
                                    <span class="text-lg italic ml-2">{quotes()[nextQuote()].author}</span>
                                </div>
                                <div class="flex-none text-2xl">
                                    <svg style={`fill: ${item().font_color};`} class="inline-block" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path d="M448 296c0 66.3-53.7 120-120 120h-8c-17.7 0-32-14.3-32-32s14.3-32 32-32h8c30.9 0 56-25.1 56-56v-8H320c-35.3 0-64-28.7-64-64V160c0-35.3 28.7-64 64-64h64c35.3 0 64 28.7 64 64v32 32 72zm-256 0c0 66.3-53.7 120-120 120H64c-17.7 0-32-14.3-32-32s14.3-32 32-32h8c30.9 0 56-25.1 56-56v-8H64c-35.3 0-64-28.7-64-64V160c0-35.3 28.7-64 64-64h64c35.3 0 64 28.7 64 64v32 32 72z" /></svg>
                                </div>
                            </div>
                        </div>
                    </Show>
                    <div class="flex-1 flex flex-row"> {/* Row 3 */}
                        <Show when={birthdays().length > 0}>
                            <div class="flex-1 flex flex-col items-center justify-center text-center p-4"> {/* Row 3 - Column 1 (optional) */}
                                <div class="text-6xl mb-6">
                                    <svg style={`fill: ${item().font_color};`} xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path d="M86.4 5.5L61.8 47.6C58 54.1 56 61.6 56 69.2V72c0 22.1 17.9 40 40 40s40-17.9 40-40V69.2c0-7.6-2-15-5.8-21.6L105.6 5.5C103.6 2.1 100 0 96 0s-7.6 2.1-9.6 5.5zm128 0L189.8 47.6c-3.8 6.5-5.8 14-5.8 21.6V72c0 22.1 17.9 40 40 40s40-17.9 40-40V69.2c0-7.6-2-15-5.8-21.6L233.6 5.5C231.6 2.1 228 0 224 0s-7.6 2.1-9.6 5.5zM317.8 47.6c-3.8 6.5-5.8 14-5.8 21.6V72c0 22.1 17.9 40 40 40s40-17.9 40-40V69.2c0-7.6-2-15-5.8-21.6L361.6 5.5C359.6 2.1 356 0 352 0s-7.6 2.1-9.6 5.5L317.8 47.6zM128 176c0-17.7-14.3-32-32-32s-32 14.3-32 32v48c-35.3 0-64 28.7-64 64v71c8.3 5.2 18.1 9 28.8 9c13.5 0 27.2-6.1 38.4-13.4c5.4-3.5 9.9-7.1 13-9.7c1.5-1.3 2.7-2.4 3.5-3.1c.4-.4 .7-.6 .8-.8l.1-.1 0 0 0 0s0 0 0 0s0 0 0 0c3.1-3.2 7.4-4.9 11.9-4.8s8.6 2.1 11.6 5.4l0 0 0 0 .1 .1c.1 .1 .4 .4 .7 .7c.7 .7 1.7 1.7 3.1 3c2.8 2.6 6.8 6.1 11.8 9.5c10.2 7.1 23 13.1 36.3 13.1s26.1-6 36.3-13.1c5-3.5 9-6.9 11.8-9.5c1.4-1.3 2.4-2.3 3.1-3c.3-.3 .6-.6 .7-.7l.1-.1c3-3.5 7.4-5.4 12-5.4s9 2 12 5.4l.1 .1c.1 .1 .4 .4 .7 .7c.7 .7 1.7 1.7 3.1 3c2.8 2.6 6.8 6.1 11.8 9.5c10.2 7.1 23 13.1 36.3 13.1s26.1-6 36.3-13.1c5-3.5 9-6.9 11.8-9.5c1.4-1.3 2.4-2.3 3.1-3c.3-.3 .6-.6 .7-.7l.1-.1c2.9-3.4 7.1-5.3 11.6-5.4s8.7 1.6 11.9 4.8l0 0 0 0 0 0 .1 .1c.2 .2 .4 .4 .8 .8c.8 .7 1.9 1.8 3.5 3.1c3.1 2.6 7.5 6.2 13 9.7c11.2 7.3 24.9 13.4 38.4 13.4c10.7 0 20.5-3.9 28.8-9V288c0-35.3-28.7-64-64-64V176c0-17.7-14.3-32-32-32s-32 14.3-32 32v48H256V176c0-17.7-14.3-32-32-32s-32 14.3-32 32v48H128V176zM448 394.6c-8.5 3.3-18.2 5.4-28.8 5.4c-22.5 0-42.4-9.9-55.8-18.6c-4.1-2.7-7.8-5.4-10.9-7.8c-2.8 2.4-6.1 5-9.8 7.5C329.8 390 310.6 400 288 400s-41.8-10-54.6-18.9c-3.5-2.4-6.7-4.9-9.4-7.2c-2.7 2.3-5.9 4.7-9.4 7.2C201.8 390 182.6 400 160 400s-41.8-10-54.6-18.9c-3.7-2.6-7-5.2-9.8-7.5c-3.1 2.4-6.8 5.1-10.9 7.8C71.2 390.1 51.3 400 28.8 400c-10.6 0-20.3-2.2-28.8-5.4V480c0 17.7 14.3 32 32 32H416c17.7 0 32-14.3 32-32V394.6z" /></svg>
                                </div>
                                <For each={birthdays()}>{(item, i) =>
                                    <div class="text-5xl mb-4">
                                        {item.name} iz {item.group}
                                    </div>
                                }</For>
                                <div class="text-2xl italic">Sretan rođendan!</div>
                            </div>
                        </Show>
                        <Show when={news().length > 0}>
                            <div class="flex-1 flex flex-col items-center justify-center p-4"> {/* Row 3 - Column 2 (optional) */}
                                <div class="card shadow-xl">
                                    <figure style={`background-color: ${item().font_color};`} class="text-4xl p-2">
                                        <svg style={`fill: ${item().background_color};`} xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path d="M0 64C0 46.3 14.3 32 32 32c229.8 0 416 186.2 416 416c0 17.7-14.3 32-32 32s-32-14.3-32-32C384 253.6 226.4 96 32 96C14.3 96 0 81.7 0 64zM0 416a64 64 0 1 1 128 0A64 64 0 1 1 0 416zM32 160c159.1 0 288 128.9 288 288c0 17.7-14.3 32-32 32s-32-14.3-32-32c0-123.7-100.3-224-224-224c-17.7 0-32-14.3-32-32s14.3-32 32-32z" /></svg>
                                    </figure>
                                    <div class="card-body p-4">
                                        <h2 class="card-title text-4xl">{news()[nextNews()].title}</h2>
                                        <div innerHTML={news()[nextNews()].content} class="prose text-2xl leading-relaxed" style={`color: ${item().font_color};`} />
                                    </div>
                                </div>
                            </div>
                        </Show>
                    </div>
                    <div class="flex-none flex flex-row items-end justify-end"> {/* Row 4 */}
                        <div class="flex-1 flex flex-row items-start justify-start gap-14 p-2">
                            <For each={timers()}>{(item, i) =>
                                <CountdownTimer data={item} />
                            }</For>
                        </div>
                        <div class="flex-none">
                            <div>
                                <svg style={`fill: ${item().font_color};`} class="h-28" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 792 792"><g>
                                    <g transform="translate(240,48) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(312,48) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(360,48) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(384,48) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(408,48) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(432,48) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(456,48) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(480,48) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(240,72) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(312,72) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(336,72) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(360,72) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(384,72) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(408,72) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(456,72) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(528,72) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(240,96) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(264,96) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(384,96) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(408,96) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(432,96) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(480,96) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(528,96) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(336,120) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(360,120) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(432,120) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(456,120) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(384,144) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(456,144) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(480,144) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(504,144) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(528,144) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(240,168) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(336,168) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(360,168) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(384,168) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(456,168) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(528,168) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(240,192) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(288,192) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(336,192) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(384,192) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(432,192) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(480,192) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(528,192) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(240,216) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(336,216) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(360,216) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(384,216) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(408,216) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(456,216) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(480,216) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(96,240) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(120,240) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(144,240) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(192,240) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(240,240) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(528,240) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(552,240) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(576,240) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(600,240) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(672,240) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(696,240) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(720,240) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(72,264) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(120,264) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(168,264) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(216,264) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(360,264) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(408,264) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(480,264) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(504,264) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(528,264) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(552,264) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(576,264) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(600,264) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(624,264) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(720,264) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(48,288) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(72,288) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(192,288) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(216,288) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(240,288) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(264,288) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(288,288) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(312,288) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(360,288) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(384,288) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(408,288) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(456,288) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(528,288) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(552,288) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(576,288) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(600,288) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(624,288) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(648,288) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(672,288) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(72,312) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(96,312) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(144,312) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(168,312) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(264,312) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(288,312) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(312,312) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(336,312) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(360,312) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(384,312) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(432,312) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(456,312) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(528,312) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(552,312) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(576,312) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(600,312) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(624,312) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(696,312) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(72,336) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(96,336) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(144,336) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(168,336) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(192,336) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(240,336) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(288,336) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(432,336) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(480,336) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(552,336) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(600,336) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(672,336) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(696,336) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(720,336) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(96,360) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(144,360) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(216,360) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(312,360) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(408,360) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(432,360) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(456,360) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(504,360) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(528,360) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(552,360) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(576,360) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(624,360) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(648,360) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(720,360) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(48,384) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(72,384) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(120,384) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(192,384) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(240,384) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(288,384) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(384,384) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(456,384) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(480,384) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(576,384) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(600,384) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(48,408) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(72,408) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(96,408) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(144,408) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(216,408) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(240,408) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(360,408) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(432,408) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(480,408) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(576,408) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(624,408) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(648,408) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(696,408) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(48,432) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(72,432) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(96,432) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(144,432) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(168,432) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(192,432) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(240,432) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(288,432) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(360,432) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(408,432) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(600,432) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(648,432) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(672,432) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(720,432) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(48,456) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(72,456) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(168,456) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(264,456) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(288,456) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(336,456) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(408,456) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(432,456) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(456,456) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(480,456) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(504,456) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(528,456) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(576,456) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(600,456) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(624,456) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(648,456) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(672,456) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(696,456) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(720,456) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(48,480) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(96,480) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(144,480) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(192,480) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(216,480) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(264,480) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(408,480) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(432,480) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(456,480) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(576,480) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(624,480) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(672,480) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(48,504) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(168,504) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(216,504) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(240,504) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(312,504) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(336,504) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(384,504) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(408,504) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(456,504) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(480,504) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(504,504) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(528,504) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(576,504) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(600,504) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(624,504) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(648,504) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(720,504) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(48,528) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(168,528) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(192,528) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(216,528) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(240,528) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(360,528) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(456,528) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(480,528) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(504,528) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(528,528) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(552,528) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(576,528) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(600,528) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(624,528) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(672,528) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(240,552) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(360,552) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(456,552) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(504,552) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(528,552) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(624,552) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(648,552) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(696,552) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(720,552) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(264,576) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(312,576) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(336,576) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(408,576) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(432,576) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(456,576) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(480,576) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(504,576) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(528,576) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(576,576) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(624,576) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(288,600) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(312,600) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(384,600) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(408,600) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(432,600) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(480,600) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(504,600) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(528,600) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(624,600) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(648,600) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(240,624) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(312,624) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(336,624) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(408,624) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(456,624) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(528,624) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(552,624) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(576,624) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(600,624) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(624,624) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(648,624) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(672,624) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(240,648) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(264,648) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(312,648) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(336,648) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(408,648) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(480,648) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(504,648) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(528,648) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(552,648) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(600,648) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(648,648) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(240,672) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(264,672) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(312,672) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(336,672) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(360,672) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(384,672) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(456,672) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(480,672) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(504,672) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(528,672) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(552,672) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(576,672) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(600,672) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(624,672) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(648,672) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(696,672) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(264,696) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(288,696) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(336,696) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(360,696) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(384,696) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(408,696) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(432,696) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(480,696) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(528,696) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(552,696) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(624,696) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(648,696) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(696,696) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(264,720) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(288,720) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(312,720) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(384,720) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(432,720) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(456,720) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(480,720) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(576,720) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(624,720) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(672,720) scale(4.12)"><rect width="6" height="6" /></g>
                                    <g transform="translate(48,48)"><g transform="scale(12)"><path d="M0,0v14h14V0H0z M12,12H2V2h10V12z" /></g></g>
                                    <g transform="translate(576,48)"><g transform="scale(12)"><path d="M0,0v14h14V0H0z M12,12H2V2h10V12z" /></g></g>
                                    <g transform="translate(48,576)"><g transform="scale(12)"><path d="M0,0v14h14V0H0z M12,12H2V2h10V12z" /></g></g>
                                    <g transform="translate(96,96)"><g transform="scale(12)"><rect width="6" height="6" /></g></g>
                                    <g transform="translate(624,96)"><g transform="scale(12)"><rect width="6" height="6" /></g></g>
                                    <g transform="translate(96,624)"><g transform="scale(12)"><rect width="6" height="6" /></g></g>
                                </g></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Show>
    );
}