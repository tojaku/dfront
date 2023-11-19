export default function Footer() {
    const appName = import.meta.env.VITE_APP_NAME;

    return (
        <footer class="footer footer-center p-4 bg-base-300 text-base-content">
            <aside>
                <p>Copyright © {new Date().getFullYear()}. {appName}</p>
            </aside>
        </footer>
    );
}