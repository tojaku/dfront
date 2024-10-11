export default function FormButtons(props) {
    return (
        <div class="flex flex-nowrap gap-2 w-full my-4">
            <input class="flex-1 btn btn-success w-full" type="submit" value="Potvrdi" />
            <input class="flex-1 btn btn-error w-full" type="reset" value="Poništi" />
        </div>
    );
}