export default function Footer() {
    const appName = import.meta.env.VITE_APP_NAME;

    return (
        <footer class="footer footer-center p-4 bg-neutral text-neutral-content">
            <aside>
                <p>Copyright © {new Date().getFullYear()}. {appName}</p>
            </aside>
        </footer>
    );
}