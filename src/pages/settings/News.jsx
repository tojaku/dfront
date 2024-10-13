import { onMount } from "solid-js";
import CollectionEditor from "../../components/CollectionEditor";
import FormButtons from "../../components/FormButtons";
import Quill from "quill";
import "quill/dist/quill.snow.css";

export default function SettingsNews(props) {
    let quillContainer;
    let quillTextarea;

    onMount(() => {
        const quill = new Quill(quillContainer, {
            theme: "snow",
            modules: {
                toolbar: [
                    [{ header: [1, 2, false] }],
                    ["bold", "italic", "underline"],
                    ["image", "code-block"]
                ]
            }
        });
        quill.on("text-change", () => {
            quillTextarea.value = quill.root.innerHTML;
        });
        const observer = new MutationObserver(() => {
            quillContainer.innerHTML = quillTextarea.value;
            console.log("updated");
            
        });
        observer.observe(quillTextarea, {
            attributes: true,
            childList: true,
            subtree: true,
            characterData: true
        })
    });

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
                        <div ref={quillContainer} class="quill-editor h-60"></div>
                        <textarea name="content" ref={quillTextarea}></textarea>
                    </div>
                    <FormButtons />
                </form>
            </CollectionEditor>
        </>
    );
}