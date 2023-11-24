import { Routes, Route, Navigate } from "@solidjs/router";
import { AuthProvider } from "./components/AuthProvider.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Error from "./pages/Error.jsx";
import Home from "./pages/Home.jsx";
import Signin from "./pages/user/Signin.jsx";
import Signout from "./pages/user/Signout.jsx";
import Contact from "./pages/Contact.jsx";
import List from "./pages/panels/List.jsx";

import "./App.css";

export default function App() {
    return (
        <AuthProvider>
            <Header />
            <div class="container mx-auto px-4 py-8 min-h-[70vh]">
                <Routes>
                    <Route path="/" component={Home} />
                    <Route path="/contact" component={Contact} />
                    <Route path="/error" component={Error} />
                    <Route path="/user">
                        <Route path="/signin" component={Signin} />
                        <Route path="/signout" component={Signout} />
                    </Route>
                    <Route path="/panels">
                        <Route path="/list" component={List} />
                    </Route>
                    <Route
                        path="*"
                        element={<Navigate href="/error" state={{ error: { title: "404", message: "Tražena stranica ne postoji." } }} />}
                    />
                </Routes>
            </div>
            <Footer />
        </AuthProvider>
    )
}