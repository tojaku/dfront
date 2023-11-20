export default function Home() {
    const appName = import.meta.env.VITE_APP_NAME;
    const adminUrl = import.meta.env.VITE_DIRECTUS_URL;

    return (
        <div class="hero min-h-[50vh] bg-base-200">
            <div class="hero-content text-center">
                <div class="max-w-xl">
                    <h1 class="text-5xl font-bold text-sky-600">Dobro došli</h1>
                    <p class="text-xl py-6">
                        Dobro došli na aplikaciju <span class="text-orange-400">{appName}</span>. Mogućnosti za rad s aplikacijom nalaze se u gornjem dijelu stranice.
                        Ukoliko želite pristupiti sučelju za upravljanje, to možete učiniti na sljedećoj <a class="link text-sky-600 hover:text-sky-400" href={adminUrl} target="_blank">vezi</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}