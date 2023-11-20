export default function Header() {
    const appName = import.meta.env.VITE_APP_NAME;

    return (
        <div class="navbar bg-primary text-primary-content">
            <div class="navbar-start"></div>
            <div class="navbar-center">
                <button class="btn btn-ghost text-xl uppercase">{appName}</button>
            </div>
            <div class="navbar-end"></div>
        </div>
    );
}