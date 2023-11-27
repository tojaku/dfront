import { Routes, Route, Navigate, Outlet } from "@solidjs/router";
import { AuthorizationBoundary } from "./components/AuthBoundary.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Error from "./pages/Error.jsx";
import Home from "./pages/Home.jsx";
import Signin from "./pages/user/Signin.jsx";
import Signout from "./pages/user/Signout.jsx";
import Contact from "./pages/Contact.jsx";
import PanelsList from "./pages/panels/List.jsx";
import PanelsView from "./pages/panels/View.jsx";

import "./App.css";

// "start": "npx http-server ./dist",

export default function App() {
    return (
        <AuthorizationBoundary>
            <Routes>
                <Route path="/" element={
                    <>
                        <Header />
                        <div class="container mx-auto px-4 py-8 min-h-[70vh]"><Outlet /></div>
                        <Footer />
                    </>
                }>
                    <Route path="/" component={Home} />
                    <Route path="/contact" component={Contact} />
                    <Route path="/error" component={Error} />
                    <Route path="/user">
                        <Route path="/signin" component={Signin} />
                        <Route path="/signout" component={Signout} />
                    </Route>
                    <Route path="/panels">
                        <Route path="/list" component={PanelsList} />
                    </Route>
                    <Route
                        path="*"
                        element={<Navigate href="/error" state={{ error: { title: "404", message: "Tražena stranica ne postoji." } }} />}
                    />
                </Route>
                <Route path="/panels/:id" component={PanelsView} />
            </Routes>
        </AuthorizationBoundary>
    )
}