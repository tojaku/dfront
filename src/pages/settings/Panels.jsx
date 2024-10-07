import CollectionEditor from "../../components/CollectionEditor";

export default function SettingsPanels(props) {
    return (
        <>
            <div class="prose mb-8">
                <h1>Ploče</h1>
            </div>

            <CollectionEditor collection="panels" display={[{ name: "title", label: "Naslov" }]}>
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
            </CollectionEditor>
        </>
    );
}