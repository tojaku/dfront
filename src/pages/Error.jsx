import { useLocation } from "@solidjs/router";

export default function Error(props) {
    const location = useLocation();

    return (
        <div class="hero min-h-[50vh] bg-base-200">
            <div class="hero-content text-center">
                <div class="max-w-xl">
                    <h1 class="text-5xl font-bold text-orange-600">{location.state.error.title ?? "Greška"}</h1>
                    <p class="text-2xl py-6">{location.state.error.message}</p>
                </div>
            </div>
        </div>
    );
}