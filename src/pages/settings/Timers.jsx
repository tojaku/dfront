import CollectionEditor from "../../components/CollectionEditor";

export default function SettingsTimers(props) {
    return (
        <>
            <div class="prose mb-8">
                <h1>Brojači</h1>
            </div>

            <CollectionEditor collection="timers" display={[{ name: "title", label: "Naslov" }, { name: "end_message", label: "Poruka" }, { name: "goal_time", label: "Datum i vrijeme" }]}>
                <form>
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">Naslov</span>
                        </label>
                        <input type="text" name="title" class="input input-bordered w-full" required="" minLength={3} maxLength={100} />
                    </div>
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">Poruka</span>
                        </label>
                        <input type="text" name="end_message" class="input input-bordered w-full" required="" minLength={3} maxLength={100} />
                    </div>
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">Datum i vrijeme</span>
                        </label>
                        <input type="datetime-local" name="goal_time" class="input input-bordered w-full" required="" />
                    </div>

                    <div class="flex flex-nowrap gap-2 w-full my-4">
                        <input class="flex-1 btn w-full" type="submit" value="Potvrdi" />
                        <input class="flex-1 btn w-full" type="reset" value="Poništi" />
                    </div>
                </form>
            </CollectionEditor>
        </>
    );
}