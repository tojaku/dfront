import CollectionEditor from "../../components/CollectionEditor";

export default function SettingsSayings(props) {
    return (
        <>
            <h1 class="text-5xl font-bold">Izreke</h1>
            <CollectionEditor collection="sayings" display={[{ name: "content", label: "Izreka" }, { name: "author", label: "Autor" }]}>
                <form>
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">Izreka</span>
                        </label>
                        <input type="text" name="content" class="input input-bordered w-full" required="" minLength={3} maxLength={100} />
                    </div>
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">Autor</span>
                        </label>
                        <input type="text" name="author" class="input input-bordered w-full" required="" minLength={3} maxLength={100} />
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