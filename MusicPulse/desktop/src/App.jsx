import React, { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

export default function App() {
    const [active, setActive] = useState("Home");
    const [user, setUser] = useState(null);

    const [authOpen, setAuthOpen] = useState(false);
    const [registerMode, setRegisterMode] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const [profileOpen, setProfileOpen] = useState(false);
    const [nameOpen, setNameOpen] = useState(false);
    const [newName, setNewName] = useState("");

    useEffect(() => {
        loadUser();

        const {
            data: { subscription }
        } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user || null);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    async function loadUser() {
        const {
            data: { user }
        } = await supabase.auth.getUser();

        setUser(user || null);
    }

    function openLogin() {
        setRegisterMode(false);
        setMessage("");
        setEmail("");
        setPassword("");
        setAuthOpen(true);
    }

    function openRegister() {
        setRegisterMode(true);
        setMessage("");
        setEmail("");
        setPassword("");
        setAuthOpen(true);
    }

    function closeAuth() {
        if (!loading) {
            setAuthOpen(false);
        }
    }

    async function handleAuth() {
        if (!email || !password) {
            setMessage("Enter your email and password.");
            return;
        }

        if (password.length < 6) {
            setMessage("Password must contain at least 6 characters.");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            if (registerMode) {
                const { data, error } =
                    await supabase.auth.signUp({
                        email,
                        password,
                        options: {
                            data: {
                                custom_name:
                                    email.split("@")[0]
                            }
                        }
                    });

                if (error) throw error;

                if (data.session) {
                    setUser(data.user);
                    setMessage("Account created!");
                    setTimeout(() => {
                        setAuthOpen(false);
                    }, 700);
                } else {
                    setMessage(
                        "Account created. Check your email to confirm it."
                    );
                }
            } else {
                const { data, error } =
                    await supabase.auth.signInWithPassword({
                        email,
                        password
                    });

                if (error) throw error;

                setUser(data.user);
                setMessage("Logged in successfully!");

                setTimeout(() => {
                    setAuthOpen(false);
                }, 500);
            }
        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    }

    async function logout() {
        await supabase.auth.signOut();

        setUser(null);
        setProfileOpen(false);
        setActive("Home");
    }

    async function saveName() {
        const name = newName.trim();

        if (!name) return;

        const { data, error } =
            await supabase.auth.updateUser({
                data: {
                    custom_name: name
                }
            });

        if (error) {
            alert(error.message);
            return;
        }

        setUser(data.user);
        setNameOpen(false);
        setNewName("");
    }

    function getName() {
        return (
            user?.user_metadata?.custom_name ||
            user?.user_metadata?.full_name ||
            user?.user_metadata?.name ||
            user?.email?.split("@")[0] ||
            "User"
        );
    }

    function getAvatar() {
        return user?.user_metadata?.avatar_url || null;
    }

    function openNameEditor() {
        setNewName(getName());
        setNameOpen(true);
        setProfileOpen(false);
    }

    return (
        <div className="app">

            <aside className="sidebar">

                <div className="brand">
                    <div className="brand-icon">
                        M
                    </div>

                    <span>
                        Music
                        <span className="red">
                            Pulse
                        </span>
                    </span>
                </div>

                <nav>

                    <button
                        className={
                            active === "Home"
                                ? "nav active"
                                : "nav"
                        }
                        onClick={() =>
                            setActive("Home")
                        }
                    >
                        <span>⌂</span>
                        Home
                    </button>

                    <button
                        className={
                            active === "Music"
                                ? "nav active"
                                : "nav"
                        }
                        onClick={() =>
                            setActive("Music")
                        }
                    >
                        <span>♫</span>
                        My Music
                    </button>

                    <button
                        className={
                            active === "Downloads"
                                ? "nav active"
                                : "nav"
                        }
                        onClick={() =>
                            setActive("Downloads")
                        }
                    >
                        <span>↓</span>
                        Downloads
                    </button>

                    <button
                        className={
                            active === "Settings"
                                ? "nav active"
                                : "nav"
                        }
                        onClick={() =>
                            setActive("Settings")
                        }
                    >
                        <span>⚙</span>
                        Settings
                    </button>

                </nav>

                <div className="sidebar-bottom">
                    <div className="version">
                        MusicPulse v1.0.0
                    </div>
                </div>

            </aside>


            <main className="content">

                <header className="topbar">

                    <div>
                        <h1>{active}</h1>

                        <p>
                            {active === "Home"
                                ? "Welcome back to MusicPulse."
                                : `Manage your ${active.toLowerCase()}.`}
                        </p>
                    </div>


                    <div className="profile-area">

                        <button
                            className="profile"
                            onClick={() =>
                                setProfileOpen(!profileOpen)
                            }
                        >

                            <div className="avatar">
                                {getAvatar() ? (
                                    <img
                                        src={getAvatar()}
                                        alt="avatar"
                                    />
                                ) : (
                                    "👤"
                                )}
                            </div>

                            <div className="profile-text">

                                <strong>
                                    {getName()}
                                </strong>

                                <small>
                                    {user
                                        ? user.email
                                        : "Not logged in"}
                                </small>

                            </div>

                        </button>


                        {profileOpen && (

                            <div className="profile-menu">

                                {user ? (

                                    <>
                                        <div className="profile-menu-header">
                                            <strong>
                                                {getName()}
                                            </strong>

                                            <small>
                                                {user.email}
                                            </small>
                                        </div>

                                        <button
                                            onClick={openNameEditor}
                                        >
                                            ✏️ Change name
                                        </button>

                                        <button
                                            onClick={() =>
                                                setActive("Settings")
                                            }
                                        >
                                            ⚙ Settings
                                        </button>

                                        <button
                                            className="logout"
                                            onClick={logout}
                                        >
                                            🚪 Logout
                                        </button>
                                    </>

                                ) : (

                                    <>
                                        <button
                                            onClick={openLogin}
                                        >
                                            🔐 Login
                                        </button>

                                        <button
                                            onClick={openRegister}
                                        >
                                            📝 Create account
                                        </button>
                                    </>

                                )}

                            </div>

                        )}

                    </div>

                </header>


                {active === "Home" && (

                    <section className="home">

                        <div className="hero">

                            <div className="hero-glow"></div>

                            <span className="badge">
                                MUSIC SOFTWARE
                            </span>

                            <h2>
                                Your music.
                                <br />
                                <span className="red">
                                    Your pulse.
                                </span>
                            </h2>

                            <p>
                                MusicPulse gives you one place
                                to manage, organize and
                                experience your music.
                            </p>

                            <div className="hero-buttons">

                                <button
                                    className="primary"
                                    onClick={() =>
                                        setActive("Music")
                                    }
                                >
                                    Open My Music
                                </button>

                                <button
                                    className="secondary"
                                    onClick={() =>
                                        setActive("Downloads")
                                    }
                                >
                                    Downloads
                                </button>

                            </div>

                        </div>


                        <div className="cards">

                            <div className="card">
                                <div className="card-icon">
                                    ♫
                                </div>

                                <h3>
                                    My Music
                                </h3>

                                <p>
                                    Manage your music
                                    collection directly
                                    from the application.
                                </p>

                                <button
                                    onClick={() =>
                                        setActive("Music")
                                    }
                                >
                                    Open →
                                </button>
                            </div>


                            <div className="card">
                                <div className="card-icon">
                                    ↓
                                </div>

                                <h3>
                                    Downloads
                                </h3>

                                <p>
                                    Download the latest
                                    MusicPulse releases.
                                </p>

                                <button
                                    onClick={() =>
                                        setActive("Downloads")
                                    }
                                >
                                    View →
                                </button>
                            </div>


                            <div className="card">
                                <div className="card-icon">
                                    ⚙
                                </div>

                                <h3>
                                    Settings
                                </h3>

                                <p>
                                    Configure your
                                    MusicPulse account
                                    and application.
                                </p>

                                <button
                                    onClick={() =>
                                        setActive("Settings")
                                    }
                                >
                                    Open →
                                </button>
                            </div>

                        </div>

                    </section>

                )}


                {active === "Music" && (

                    <section className="page">

                        <div className="empty">

                            <div className="empty-icon">
                                ♫
                            </div>

                            <h2>
                                My Music
                            </h2>

                            <p>
                                Your music library will
                                appear here.
                            </p>

                            <button className="primary">
                                Add Music
                            </button>

                        </div>

                    </section>

                )}


                {active === "Downloads" && (

                    <section className="page">

                        <div className="download-box">

                            <span className="badge">
                                LATEST RELEASE
                            </span>

                            <h2>
                                MusicPulse 1.0.0
                            </h2>

                            <p>
                                Download the latest
                                version for your computer.
                            </p>

                            <div className="download-buttons">

                                <button
                                    className="primary"
                                    onClick={() =>
                                        window.open(
                                            "https://github.com/flxnr-demo/musicpulse.github.io/releases/download/v1.0.0/MusicPulse-1.0.0-arm64.dmg"
                                        )
                                    }
                                >
                                     Mac
                                </button>

                                <button
                                    className="secondary"
                                    onClick={() =>
                                        window.open(
                                            "https://github.com/flxnr-demo/musicpulse.github.io/releases/download/v1.0.0/MusicPulse-Setup-1.0.0-x64.exe"
                                        )
                                    }
                                >
                                    ▣ Windows
                                </button>

                            </div>

                        </div>

                    </section>

                )}


                {active === "Settings" && (

                    <section className="page">

                        <div className="settings">

                            <div className="setting">

                                <div>
                                    <strong>
                                        Account
                                    </strong>

                                    <p>
                                        {user
                                            ? `Logged in as ${user.email}`
                                            : "You are not logged in."}
                                    </p>
                                </div>

                                {user ? (
                                    <button
                                        className="secondary"
                                        onClick={logout}
                                    >
                                        Logout
                                    </button>
                                ) : (
                                    <button
                                        className="primary"
                                        onClick={openLogin}
                                    >
                                        Login
                                    </button>
                                )}

                            </div>


                            {user && (

                                <div className="setting">

                                    <div>
                                        <strong>
                                            Profile
                                        </strong>

                                        <p>
                                            Name: {getName()}
                                        </p>
                                    </div>

                                    <button
                                        className="secondary"
                                        onClick={openNameEditor}
                                    >
                                        Change
                                    </button>

                                </div>

                            )}


                            <div className="setting">

                                <div>
                                    <strong>
                                        Appearance
                                    </strong>

                                    <p>
                                        MusicPulse currently
                                        uses the dark interface.
                                    </p>
                                </div>

                                <span className="status">
                                    Dark
                                </span>

                            </div>


                            <div className="setting">

                                <div>
                                    <strong>
                                        Version
                                    </strong>

                                    <p>
                                        Installed application version.
                                    </p>
                                </div>

                                <span className="version-tag">
                                    1.0.0
                                </span>

                            </div>

                        </div>

                    </section>

                )}

            </main>


            {authOpen && (

                <div className="modal-overlay">

                    <div className="auth-modal">

                        <button
                            className="close-modal"
                            onClick={closeAuth}
                        >
                            ×
                        </button>

                        <div className="modal-icon">
                            🔐
                        </div>

                        <h2>
                            {registerMode
                                ? "Create account"
                                : "Welcome back"}
                        </h2>

                        <p>
                            {registerMode
                                ? "Create your MusicPulse account."
                                : "Sign in to your MusicPulse account."}
                        </p>

                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleAuth();
                                }
                            }}
                        />

                        <button
                            className="primary auth-submit"
                            onClick={handleAuth}
                            disabled={loading}
                        >
                            {loading
                                ? "Please wait..."
                                : registerMode
                                    ? "Register"
                                    : "Login"}
                        </button>

                        {message && (
                            <div className="auth-message">
                                {message}
                            </div>
                        )}

                        <div className="auth-switch">

                            <span>
                                {registerMode
                                    ? "Already have an account?"
                                    : "Don't have an account?"}
                            </span>

                            <button
                                onClick={() =>
                                    setRegisterMode(
                                        !registerMode
                                    )
                                }
                            >
                                {registerMode
                                    ? "Login"
                                    : "Register"}
                            </button>

                        </div>

                    </div>

                </div>

            )}


            {nameOpen && (

                <div className="modal-overlay">

                    <div className="auth-modal">

                        <button
                            className="close-modal"
                            onClick={() =>
                                setNameOpen(false)
                            }
                        >
                            ×
                        </button>

                        <div className="modal-icon">
                            ✏️
                        </div>

                        <h2>
                            Change name
                        </h2>

                        <p>
                            Choose your MusicPulse profile name.
                        </p>

                        <input
                            type="text"
                            maxLength={32}
                            placeholder="Your name"
                            value={newName}
                            onChange={(e) =>
                                setNewName(e.target.value)
                            }
                        />

                        <button
                            className="primary"
                            onClick={saveName}
                        >
                            Save
                        </button>

                    </div>

                </div>

            )}

        </div>
    );
}