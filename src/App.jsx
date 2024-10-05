import { Router, Route, Navigate } from "@solidjs/router";
import { AuthorizedBoundary, AuthProvider } from "./components/AuthProvider";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Error from "./pages/Error";
import Home from "./pages/Home";
import Signin from "./pages/user/Signin";
import Signout from "./pages/user/Signout";
import Contact from "./pages/Contact";
import PanelsList from "./pages/panels/List";
import PanelsView from "./pages/panels/View";

import "./App.css";

// "start": "npx http-server ./dist",

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <Route path="/" component={DefaultLayout}>
                    <Route path="/" component={Home} />
                    <Route path="/contact" component={Contact} />
                    <Route path="/error" component={Error} />
                    <Route path="/user">
                        <Route path="/signin" component={Signin} />
                        <Route path="/signout" component={Signout} />
                    </Route>
                    <Route path="/panels">
                        <Route path="/list" component={() => <AuthorizedBoundary><PanelsList /></AuthorizedBoundary>} />
                    </Route>
                    <Route path="*" component={NotFound} />
                </Route>
                <Route path="/panels/:id" component={PanelsView} />
            </Router>
        </AuthProvider>
    )
}

function DefaultLayout(props) {
    return (
        <>
            <Header />
            <div class="container mx-auto px-4 py-8 min-h-[70vh]">{props.children}</div>
            <Footer />
        </>
    );
}

function NotFound() {
    return (
        <Navigate href="/error" state={{ error: { title: "404", message: "Tražena stranica ne postoji." } }} />
    );
}