import { Router, Route, Navigate } from "@solidjs/router";
import { AuthorizedBoundary, AuthProvider } from "./components/AuthProvider";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Error from "./pages/Error";
import Home from "./pages/Home";
import UserSignIn from "./pages/user/SignIn";
import UserResetPassword from "./pages/user/ResetPassword";
import UserSignUp from "./pages/user/SignUp";
import UserSignOut from "./pages/user/SignOut";
import UserData from "./pages/user/Data";
import Contact from "./pages/Contact";
import PanelsList from "./pages/panels/List";
import PanelsView from "./pages/panels/View";
import SettingsNews from "./pages/settings/News";
import SettingsQuotes from "./pages/settings/Quotes";
import SettingsTimers from "./pages/settings/Timers";
import SettingsBirthdays from "./pages/settings/Birthdays";
import SettingsPanels from "./pages/settings/Panels";

import "./App.css";

// "start": "npx http-server ./dist",

export default function App(props) {
    const selfSignUp = Boolean(import.meta.env.VITE_SELF_SIGNUP);

    return (
        <AuthProvider>
            <Router>
                <Route path="/" component={DefaultLayout}>
                    <Route path="/" component={Home} />
                    <Route path="/contact" component={Contact} />
                    <Route path="/error" component={Error} />
                    <Route path="/user">
                        <Route path="/signin" component={UserSignIn} />
                        <Route path="/resetpassword" component={UserResetPassword} />
                        {selfSignUp === true && <Route path="/signup" component={UserSignUp} />}
                        <Route path="/signout" component={UserSignOut} />
                        <Route path="/data" component={() => <AuthorizedBoundary><UserData /></AuthorizedBoundary>} />
                    </Route>
                    <Route path="/panels">
                        <Route path="/list" component={() => <AuthorizedBoundary><PanelsList /></AuthorizedBoundary>} />
                    </Route>
                    <Route path="/settings">
                        <Route path="/news" component={() => <AuthorizedBoundary><SettingsNews /></AuthorizedBoundary>} />
                        <Route path="/quotes" component={() => <AuthorizedBoundary><SettingsQuotes /></AuthorizedBoundary>} />
                        <Route path="/timers" component={() => <AuthorizedBoundary><SettingsTimers /></AuthorizedBoundary>} />
                        <Route path="/birthdays" component={() => <AuthorizedBoundary><SettingsBirthdays /></AuthorizedBoundary>} />
                        <Route path="/panels" component={() => <AuthorizedBoundary><SettingsPanels /></AuthorizedBoundary>} />
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