import { createSignal, For } from "solid-js"
import CollectionEditor from "../../components/CollectionEditor";
import { pb } from "../../services/pocketbase";

export default function SettingsPanels(props) {
    const [news, setNews] = createSignal([]);
    const [sayings, setSayings] = createSignal([]);
    const [timers, setTimers] = createSignal([]);

    async function setSelectedItem(item) {
        setNews([]);
        setSayings([]);
        setTimers([]);

        try {
            for (let index = 0; index < item.news.length; index++) {
                const element = item.news[index];
                const result = await pb.collection("news").getOne(element);
                setNews((old) => [...old, result]);
            }

            for (let index = 0; index < item.sayings.length; index++) {
                const element = item.sayings[index];
                const result = await pb.collection("sayings").getOne(element);
                setSayings((old) => [...old, result]);
            }

            for (let index = 0; index < item.timers.length; index++) {
                const element = item.timers[index];
                const result = await pb.collection("timers").getOne(element);
                setTimers((old) => [...old, result]);
            }

            import.meta.env.DEV && console.log("[setSelectedItem] Related items loaded");
        } catch (error) {
            import.meta.env.DEV && console.warn("[setSelectedItem]", error.message);
        }
    }

    return (
        <>
            <div class="prose mb-8">
                <h1>Ploče</h1>
            </div>

            <CollectionEditor collection="panels" display={[{ name: "title", label: "Naslov" }]} selectedItem={setSelectedItem}>
                <form>
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">Naslov</span>
                        </label>
                        <input type="text" name="title" class="input input-bordered w-full" required="" minLength={3} maxLength={100} />
                    </div>
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">Pozadinska boja</span>
                        </label>
                        <input type="color" name="background_color" class="input input-bordered w-full" required="" value="#000000" />
                    </div>
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">Boja teksta</span>
                        </label>
                        <input type="color" name="font_color" class="input input-bordered w-full" required="" value="#000000" />
                    </div>
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">Vrijeme prikaza sadržaja (sek)</span>
                        </label>
                        <input type="number" name="cycle_duration" class="input input-bordered w-full" required="" min={10} max={600} />
                    </div>
                    <label class="form-control w-full max-w-xs">
                        <div class="label">
                            <span class="label-text">Prikaži rođendane</span>
                        </div>
                        <select name="display_birthdays" class="select select-bordered">
                            <option value="true">Da</option>
                            <option value="false">Ne</option>
                        </select>
                    </label>

                    <div class="flex flex-nowrap gap-2 w-full my-4">
                        <input class="flex-1 btn w-full" type="submit" value="Potvrdi" />
                        <input class="flex-1 btn w-full" type="reset" value="Poništi" />
                    </div>
                </form>

                <div role="tablist" class="tabs tabs-lifted">
                    <input type="radio" name="relations_tabs" role="tab" class="tab" aria-label="Novosti" checked="" />
                    <div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6">
                        <ul>
                            <For each={news()}>
                                {(item, i) => (
                                    <li>{item.title}</li>
                                )}
                            </For>
                        </ul>
                    </div>

                    <input
                        type="radio" name="relations_tabs" role="tab" class="tab" aria-label="Izreke" />
                    <div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6">
                        <ul>
                            <For each={sayings()}>
                                {(item, i) => (
                                    <li>{item.content}</li>
                                )}
                            </For>
                        </ul>
                    </div>

                    <input type="radio" name="relations_tabs" role="tab" class="tab" aria-label="Brojači" />
                    <div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6">
                        <ul>
                            <For each={timers()}>
                                {(item, i) => (
                                    <li>{item.title}</li>
                                )}
                            </For>
                        </ul>
                    </div>
                </div>
            </CollectionEditor>
        </>
    );
}