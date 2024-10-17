import { createSignal, Show } from "solid-js";
import CollectionEditor from "../../components/CollectionEditor";
import { pb } from "../../services/pocketbase";
import { FormDataNormalize } from "../../services/misc";
import { useAuth } from "../../components/AuthProvider";
import FormButtons from "../../components/FormButtons";
import * as XLSX from "xlsx";

export default function SettingsBirthdays(props) {
    const user = useAuth();

    const [error, setError] = createSignal(false);
    const [progress, setProgress] = createSignal({ value: 0, max: 0 });

    async function deleteAll() {
        const isConfirmed = window.confirm("Jeste li sigurni da želite izbrisati sve unose?");
        if (!isConfirmed) return;

        setError(false);
        try {
            const result = await pb.collection("birthdays").getFullList({
                fields: "id",
            });
            setProgress({ value: 0, max: result.length });
            for (let i = 0; i < result.length; i++) {
                await pb.collection("birthdays").delete(result[i].id);
                setProgress({ value: i + 1, max: result.length });
            }
            setProgress({ value: 0, max: 0 });
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            setError(true);
            import.meta.env.DEV && console.warn("Birthdays not deleted", error.message);
        }
    }

    async function uploadBirthdays(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = FormDataNormalize(formData);

        upload_form.close();
        setError(false);
        try {
            let file = await data.file.arrayBuffer();
            let workbook = XLSX.read(file);

            let items = [];
            workbook.SheetNames.forEach((element, i) => {
                let classNumber = parseInt(element[0]);
                let classLabel = element[2];
                let sheet = workbook.Sheets[element];
                let row = 3;
                while (true) {
                    let surname = sheet["B" + row] ? sheet["B" + row].v : "";
                    let name = sheet["C" + row] ? sheet["C" + row].v : "";
                    let dobStr = sheet["D" + row] ? sheet["D" + row].v : "";
                    if (name === "") {
                        break;
                    } else {
                        let day = parseInt(dobStr.substring(0, 2));
                        let month = parseInt(dobStr.substring(3, 5));
                        let year = parseInt(dobStr.substring(6, 10));
                        // let dob = new Date(year, month-1, day, 0, 0, 0, 0)
                        items.push({ day, month, year, name: `${name} ${surname}`, group: `${classNumber}.${classLabel}`, user: user().id });
                        row++;
                    }
                }
            });

            setProgress({ value: 0, max: items.length });
            for (let i = 0; i < items.length; i++) {
                await pb.collection("birthdays").create(items[i]);
                setProgress({ value: i + 1, max: items.length });
            }
            setProgress({ value: 0, max: 0 });
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            setError(true);
            import.meta.env.DEV && console.warn("Birthdays not created", error.message);
        }
    }

    return (
        <>
            <div class="prose mb-8">
                <h1>Rođendani</h1>
            </div>

            <div class="text-right">
                <Show when={progress().max > 0}>
                    <progress class="progress w-56 ml-1" value={progress().value} max={progress().max}></progress>
                </Show>
                <button class="btn btn-sm btn-outline btn-error ml-1" onClick={deleteAll}>Obriši sve</button>
                <button class="btn btn-sm btn-outline ml-1" onClick={() => { upload_form.showModal(); }}>Učitaj iz datoteke</button>
            </div>

            <Show when={error() === true}>
                <div role="alert" class="alert alert-error my-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Operacija nije uspjela; pokušajte ponovno.</span>
                </div>
            </Show>

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
                    <FormButtons />
                </form>
            </CollectionEditor>

            <dialog id="upload_form" class="modal">
                <div class="modal-box w-11/12 max-w-5xl">
                    <form method="dialog">
                        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <form onSubmit={uploadBirthdays}>
                        <input type="file" name="file" class="file-input file-input-bordered w-full max-w-xs" accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />
                        <FormButtons />
                    </form>
                </div>
            </dialog>
        </>
    );
}