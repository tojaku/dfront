export default function Header() {
    const appName = import.meta.env.VITE_APP_NAME;

    return (
        <div class="navbar bg-slate-500 text-primary-content">
            <div class="navbar-start"></div>
            <div class="navbar-center">
                <button class="btn btn-ghost text-xl">{appName}</button>
            </div>
            <div class="navbar-end"></div>
        </div>
    );
}