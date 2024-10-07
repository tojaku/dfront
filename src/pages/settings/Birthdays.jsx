import CollectionEditor from "../../components/CollectionEditor";

export default function SettingsBirthdays(props) {
    return (
        <>
            <h1 class="text-5xl font-bold">Rođendani</h1>
            <CollectionEditor collection="birthdays" display={[{ name: "name", label: "Ime" }, { name: "group", label: "Grupa" }]}>
                <form>
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">Ime</span>
                        </label>
                        <input type="text" name="name" class="input input-bordered w-full" required="" minLength={3} maxLength={100} />
                    </div>
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">Grupa</span>
                        </label>
                        <input type="text" name="group" class="input input-bordered w-full" required="" minLength={3} maxLength={100} />
                    </div>
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">Dan</span>
                        </label>
                        <input type="number" name="day" class="input input-bordered w-full" required="" min={1} max={31} />
                    </div>
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">Mjesec</span>
                        </label>
                        <input type="number" name="month" class="input input-bordered w-full" required="" min={1} max={12} />
                    </div>
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">Godina</span>
                        </label>
                        <input type="number" name="year" class="input input-bordered w-full" required="" min={1900} max={2100} />
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