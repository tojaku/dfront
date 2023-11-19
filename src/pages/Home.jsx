import { A } from "@solidjs/router";

export default function Home() {
    return (
        <>
            <A class="btn btn-primary mx-4" href="/user/signin">Prijava</A>
            <A class="btn btn-primary" href="/user/signout">Odjava</A>
        </>
    );
}