import CollectionEditor from "../../components/CollectionEditor";
import FormButtons from "../../components/FormButtons";

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

                    <FormButtons />
                </form>
            </CollectionEditor>
        </>
    );
}