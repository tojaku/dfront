import { createEffect, createSignal, For, Show } from "solid-js"
import CollectionEditor from "../../components/CollectionEditor";
import CollectionSelector from "../../components/CollectionSelector";
import { pb } from "../../services/pocketbase";

export default function SettingsPanels(props) {
    const [selected, setSelected] = createSignal(null);
    const [news, setNews] = createSignal([]);
    const [sayings, setSayings] = createSignal([]);
    const [timers, setTimers] = createSignal([]);

    createEffect(async () => {
        setNews([]);
        setSayings([]);
        setTimers([]);

        if (selected() === null) return;
        try {
            relatedLoad("news", setNews);
            relatedLoad("sayings", setSayings);
            relatedLoad("timers", setTimers);
            import.meta.env.DEV && console.log("[createEffect] Related items loaded");
        } catch (error) {
            import.meta.env.DEV && console.warn("[createEffect]", error.message);
        }
    });

    async function relatedLoad(collection, setter) {
        for (let i = 0; i < selected()[collection].length; i++) {
            const element = selected()[collection][i];
            const result = await pb.collection(collection).getOne(element);
            setter((old) => [...old, result]);
        }
    }

    function relatedRemove(source, id) {
        setSelected((old) => {
            const fresh = JSON.parse(JSON.stringify(old));
            fresh[source] = fresh[source].filter(element => element != id);
            return fresh;
        });
    }

    function relatedSelected(collection, item) {
        if (!selected()[collection].includes(item.id)) {
            setSelected((old) => {
                const fresh = JSON.parse(JSON.stringify(old));
                fresh[collection].push(item.id);
                return fresh;
            });
        }
    }

    return (
        <>
            <div class="prose mb-8">
                <h1>Ploče</h1>
            </div>

            <CollectionEditor collection="panels" display={[{ name: "title", label: "Naslov" }]} selected={[selected, setSelected]}>
                <form>
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">Naslov</span>
                        </label>
                        <input type="text" name="title" class="input input-bordered w-full" required="" minLength={3} maxLength={100} />
                    </div>
                    <div class="flex flex-nowrap gap-2 w-full my-4">
                        <div class="flex-1 form-control w-full">
                            <label class="label">
                                <span class="label-text">Pozadinska boja</span>
                            </label>
                            <input type="color" name="background_color" class="input input-bordered w-full" required="" value="#000000" />
                        </div>
                        <div class="flex-1 form-control w-full">
                            <label class="label">
                                <span class="label-text">Boja teksta</span>
                            </label>
                            <input type="color" name="font_color" class="input input-bordered w-full" required="" value="#000000" />
                        </div>
                    </div>
                    <div class="flex flex-nowrap gap-2 w-full my-4">
                        <div class="flex-1 form-control w-full">
                            <label class="label">
                                <span class="label-text">Vrijeme prikaza sadržaja (sek)</span>
                            </label>
                            <input type="number" name="cycle_duration" class="input input-bordered w-full" required="" min={10} max={600} />
                        </div>
                        <label class="flex-1 form-control w-full max-w-xs">
                            <div class="label">
                                <span class="label-text">Prikaži rođendane</span>
                            </div>
                            <select name="display_birthdays" class="select select-bordered">
                                <option value="true">Da</option>
                                <option value="false">Ne</option>
                            </select>
                        </label>
                    </div>

                    <div class="flex flex-nowrap gap-2 w-full my-4">
                        <input class="flex-1 btn w-full" type="submit" value="Potvrdi" />
                        <input class="flex-1 btn w-full" type="reset" value="Poništi" />
                    </div>
                </form>

                <Show when={selected() !== null}>
                    <div role="tablist" class="tabs tabs-lifted">
                        <input type="radio" name="relations_tabs" role="tab" class="tab" aria-label="Novosti" checked="" />
                        <div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6">
                            <RelatedList items={news()} display="title" collection="news" remove={relatedRemove} />
                            <RelatedSelect collection="news" display="title" selected={(item) => relatedSelected("news", item)} />
                        </div>
                        <input
                            type="radio" name="relations_tabs" role="tab" class="tab" aria-label="Izreke" />
                        <div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6">
                            <RelatedList items={sayings()} display="content" collection="sayings" remove={relatedRemove} />
                            <RelatedSelect collection="sayings" display="content" selected={(item) => relatedSelected("sayings", item)} />
                        </div>
                        <input type="radio" name="relations_tabs" role="tab" class="tab" aria-label="Brojači" />
                        <div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6">
                            <RelatedList items={timers()} display="title" collection="timers" remove={relatedRemove} />
                            <RelatedSelect collection="timers" display="title" selected={(item) => relatedSelected("timers", item)} />
                        </div>
                    </div>
                </Show>
            </CollectionEditor>
        </>
    );
}

function RelatedList(props) {
    return (
        <div class="prose">
            <ul>
                <For each={props.items} fallback={<div class="text-[0.6em] uppercase">Nema stavaka</div>}>
                    {(item, i) => (
                        <li>
                            <div class="inline-block mr-2">{item[props.display]}</div>
                            <button class="btn btn-sm btn-outline btn-error" onClick={() => props.remove(props.collection, item.id)}>Ukloni</button>
                        </li>
                    )}
                </For>
            </ul>
        </div>
    );
}

function RelatedSelect(props) {
    const [modalId] = createSignal("modal_" + Math.random().toString(36).substring(2, 12));
    let ref;

    function itemSelected(item) {
        props.selected(item);
        ref.close();
    }

    return (
        <>
            <button class="btn w-full my-2" onClick={() => { ref.showModal() }}>Poveži</button>
            <dialog id={modalId()} ref={ref} class="modal">
                <div class="modal-box w-11/12 max-w-5xl">
                    <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => { ref.close() }}>✕</button>
                    <CollectionSelector collection={props.collection} display={props.display} selected={itemSelected} />
                </div>
            </dialog>
        </>
    );
}