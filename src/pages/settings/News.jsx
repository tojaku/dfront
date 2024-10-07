import CollectionEditor from "../../components/CollectionEditor";

export default function SettingsNews(props) {
    return (
        <>
            <div class="prose mb-8">
                <h1>Novosti</h1>
            </div>

            <CollectionEditor collection="news" display={[{ name: "title", label: "Naslov" }]}>
                <form>
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">Naslov</span>
                        </label>
                        <input type="text" name="title" class="input input-bordered w-full" required="" minLength={3} maxLength={100} />
                    </div>
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">Sadržaj</span>
                        </label>
                        <textarea name="content" class="textarea textarea-bordered" required="" rows={10}></textarea>
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