import React, { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import "./App.css";

const AVATAR_BUCKET = "avatars";

export default function App() {
    const [active, setActive] = useState("Home");
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [authOpen, setAuthOpen] = useState(false);
    const [registerMode, setRegisterMode] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [authMessage, setAuthMessage] = useState("");

    const [profileOpen, setProfileOpen] = useState(false);

    const [name, setName] = useState("");
    const [nameMessage, setNameMessage] = useState("");

    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("");
    const [avatarMessage, setAvatarMessage] = useState("");

    useEffect(() => {
        let mounted = true;

        supabase.auth.getUser().then(({ data }) => {
            if (mounted) {
                setUser(data.user || null);
                setLoading(false);
            }
        });

        const {
            data: { subscription }
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
            setLoading(false);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const displayName =
        user?.user_metadata?.custom_name ||
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        user?.email?.split("@")[0] ||
        "User";

    const avatarUrl = user?.user_metadata?.avatar_url || "";

    function openLogin() {
        setProfileOpen(false);
        setAuthMessage("");
        setAuthOpen(true);
    }

    function closeLogin() {
        setAuthOpen(false);
        setAuthMessage("");
    }

    function switchAuth() {
        setRegisterMode((value) => !value);
        setAuthMessage("");
    }

    async function submitAuth(event) {
        event.preventDefault();

        if (!email || !password) {
            setAuthMessage("Enter your email and password.");
            return;
        }

        if (password.length < 6) {
            setAuthMessage("Password must contain at least 6 characters.");
            return;
        }

        setAuthMessage("Please wait...");

        try {
            if (registerMode) {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password
                });

                if (error) throw error;

                if (data.session) {
                    setAuthMessage("Account created successfully.");
                    setTimeout(() => setAuthOpen(false), 600);
                } else {
                    setAuthMessage(
                        "Account created. Check your email to confirm your account."
                    );
                }
            } else {
                const { error } =
                    await supabase.auth.signInWithPassword({
                        email,
                        password
                    });

                if (error) throw error;

                setAuthMessage("Logged in successfully.");
                setTimeout(() => setAuthOpen(false), 600);
            }
        } catch (error) {
            setAuthMessage(error.message || "Authentication failed.");
        }
    }

    async function loginWithDiscord() {
        setAuthMessage("Connecting to Discord...");

        const { error } = await supabase.auth.signInWithOAuth({
            provider: "discord",
            options: {
                redirectTo: window.location.origin
            }
        });

        if (error) {
            setAuthMessage(error.message);
        }
    }

    async function logout() {
        await supabase.auth.signOut();
        setProfileOpen(false);
        setActive("Home");
    }

    function openProfile() {
        if (!user) {
            openLogin();
            return;
        }

        setName(displayName);
        setNameMessage("");
        setAvatarFile(null);
        setAvatarPreview("");
        setAvatarMessage("");
        setProfileOpen(true);
    }

    async function saveName() {
        const newName = name.trim();

        if (!newName) {
            setNameMessage("Enter a name.");
            return;
        }

        if (newName.length > 32) {
            setNameMessage("Name is too long.");
            return;
        }

        setNameMessage("Saving...");

        const { error } = await supabase.auth.updateUser({
            data: {
                custom_name: newName
            }
        });

        if (error) {
            setNameMessage(error.message);
            return;
        }

        setNameMessage("Name updated.");
    }

    function selectAvatar(event) {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
            setAvatarMessage("Use PNG, JPG or WebP.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setAvatarMessage("Maximum file size is 5 MB.");
            return;
        }

        setAvatarFile(file);
        setAvatarMessage("");

        const reader = new FileReader();

        reader.onload = () => {
            setAvatarPreview(reader.result);
        };

        reader.readAsDataURL(file);
    }

    async function saveAvatar() {
        if (!avatarFile || !user) return;

        setAvatarMessage("Uploading...");

        try {
            const extension =
                avatarFile.name.split(".").pop()?.toLowerCase() || "png";

            const path = `${user.id}/avatar.${extension}`;

            const { error: uploadError } = await supabase.storage
                .from(AVATAR_BUCKET)
                .upload(path, avatarFile, {
                    upsert: true,
                    contentType: avatarFile.type,
                    cacheControl: "3600"
                });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from(AVATAR_BUCKET)
                .getPublicUrl(path);

            const finalUrl = `${data.publicUrl}?t=${Date.now()}`;

            const { error: updateError } =
                await supabase.auth.updateUser({
                    data: {
                        avatar_url: finalUrl
                    }
                });

            if (updateError) throw updateError;

            setAvatarMessage("Avatar updated.");
            setAvatarPreview("");
            setAvatarFile(null);
        } catch (error) {
            setAvatarMessage(
                error.message || "Avatar upload failed."
            );
        }
    }

    function renderHome() {
        return (
            <section className="page-content">
                <div className="hero">
                    <div className="hero-glow" />

                    <span className="badge">
                        MUSIC SOFTWARE
                    </span>

                    <h2>
                        Your music.
                        <br />
                        <span className="red">Your pulse.</span>
                    </h2>

                    <p>
                        MusicPulse gives you one place to manage,
                        organize and experience your music.
                    </p>

                    <div className="hero-buttons">
                        <button
                            className="primary"
                            onClick={() => setActive("Music")}
                        >
                            Open My Music
                        </button>

                        <button
                            className="secondary"
                            onClick={() => setActive("Downloads")}
                        >
                            Downloads
                        </button>
                    </div>
                </div>

                <div className="cards">
                    <div className="card">
                        <div className="card-icon">♫</div>
                        <h3>My Music</h3>
                        <p>
                            Manage your music collection directly
                            from MusicPulse.
                        </p>
                        <button onClick={() => setActive("Music")}>
                            Open →
                        </button>
                    </div>

                    <div className="card">
                        <div className="card-icon">↓</div>
                        <h3>Downloads</h3>
                        <p>
                            Download the latest MusicPulse desktop
                            releases.
                        </p>
                        <button onClick={() => setActive("Downloads")}>
                            View →
                        </button>
                    </div>

                    <div className="card">
                        <div className="card-icon">⚙</div>
                        <h3>Settings</h3>
                        <p>
                            Configure your account and application.
                        </p>
                        <button onClick={() => setActive("Settings")}>
                            Open →
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    function renderMusic() {
        return (
            <section className="page-content">
                <div className="empty">
                    <div className="empty-icon">♫</div>
                    <h2>My Music</h2>
                    <p>Your music library will appear here.</p>

                    <button className="primary">
                        Add Music
                    </button>
                </div>
            </section>
        );
    }

    function renderDownloads() {
        return (
            <section className="page-content">
                <div className="download-box">
                    <span className="badge">
                        LATEST RELEASE
                    </span>

                    <h2>MusicPulse 1.0.0</h2>

                    <p>
                        Download the latest version for your computer.
                    </p>

                    <div className="download-buttons">
                        <button className="primary">
                             Mac
                        </button>

                        <button className="secondary">
                            ▣ Windows
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    function renderSettings() {
        return (
            <section className="page-content">
                <div className="settings">

                    <div className="setting">
                        <div>
                            <strong>Account</strong>
                            <p>
                                {user
                                    ? `Logged in as ${user.email}`
                                    : "You are not logged in."}
                            </p>
                        </div>

                        {!user ? (
                            <button
                                className="secondary"
                                onClick={openLogin}
                            >
                                Login
                            </button>
                        ) : (
                            <span className="status success-status">
                                Connected
                            </span>
                        )}
                    </div>

                    {user && (
                        <>
                            <div className="setting setting-column">
                                <div>
                                    <strong>Profile name</strong>
                                    <p>
                                        Change the name displayed
                                        in MusicPulse.
                                    </p>
                                </div>

                                <div className="setting-input-row">
                                    <input
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        maxLength={32}
                                        placeholder="Your name"
                                    />

                                    <button
                                        className="primary small-button"
                                        onClick={saveName}
                                    >
                                        Save
                                    </button>
                                </div>

                                {nameMessage && (
                                    <span className="message">
                                        {nameMessage}
                                    </span>
                                )}
                            </div>

                            <div className="setting setting-column">
                                <div>
                                    <strong>Avatar</strong>
                                    <p>
                                        Upload a PNG, JPG or WebP
                                        profile picture.
                                    </p>
                                </div>

                                <div className="avatar-settings">
                                    <div className="settings-avatar">
                                        {avatarPreview || avatarUrl ? (
                                            <img
                                                src={
                                                    avatarPreview ||
                                                    avatarUrl
                                                }
                                                alt="Avatar"
                                            />
                                        ) : (
                                            "👤"
                                        )}
                                    </div>

                                    <label className="secondary upload-button">
                                        Choose image
                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp"
                                            onChange={selectAvatar}
                                            hidden
                                        />
                                    </label>

                                    <button
                                        className="primary"
                                        disabled={!avatarFile}
                                        onClick={saveAvatar}
                                    >
                                        Save avatar
                                    </button>
                                </div>

                                {avatarMessage && (
                                    <span className="message">
                                        {avatarMessage}
                                    </span>
                                )}
                            </div>

                            <div className="setting">
                                <div>
                                    <strong>Session</strong>
                                    <p>
                                        Sign out of your MusicPulse
                                        account.
                                    </p>
                                </div>

                                <button
                                    className="danger"
                                    onClick={logout}
                                >
                                    Logout
                                </button>
                            </div>
                        </>
                    )}

                    <div className="setting">
                        <div>
                            <strong>Appearance</strong>
                            <p>
                                MusicPulse currently uses the dark
                                interface.
                            </p>
                        </div>

                        <span className="status">
                            Dark
                        </span>
                    </div>

                    <div className="setting">
                        <div>
                            <strong>Version</strong>
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
        );
    }

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-logo">
                    Music<span>Pulse</span>
                </div>
                <div className="loading-text">
                    Loading...
                </div>
            </div>
        );
    }

    return (
        <div className="app">

            <aside className="sidebar">
                <div className="brand">
                    <div className="brand-icon">M</div>

                    <span>
                        Music<span className="red">Pulse</span>
                    </span>
                </div>

                <nav>
                    {["Home", "Music", "Downloads", "Settings"].map(
                        (item) => (
                            <button
                                key={item}
                                className={
                                    active === item
                                        ? "nav active"
                                        : "nav"
                                }
                                onClick={() => setActive(item)}
                            >
                                <span>
                                    {item === "Home"
                                        ? "⌂"
                                        : item === "Music"
                                        ? "♫"
                                        : item === "Downloads"
                                        ? "↓"
                                        : "⚙"}
                                </span>

                                {item === "Music"
                                    ? "My Music"
                                    : item}
                            </button>
                        )
                    )}
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

                    <button
                        className="profile"
                        onClick={openProfile}
                    >
                        <div className="avatar">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt="Avatar"
                                />
                            ) : (
                                "👤"
                            )}
                        </div>

                        <div className="profile-text">
                            <strong>
                                {user ? displayName : "User"}
                            </strong>

                            <small>
                                {user
                                    ? user.email
                                    : "Not logged in"}
                            </small>
                        </div>
                    </button>
                </header>

                {active === "Home" && renderHome()}
                {active === "Music" && renderMusic()}
                {active === "Downloads" && renderDownloads()}
                {active === "Settings" && renderSettings()}
            </main>

            {profileOpen && user && (
                <div
                    className="overlay"
                    onClick={() => setProfileOpen(false)}
                >
                    <div
                        className="profile-panel"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="close"
                            onClick={() => setProfileOpen(false)}
                        >
                            ×
                        </button>

                        <div className="profile-large-avatar">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt="Profile"
                                />
                            ) : (
                                "👤"
                            )}
                        </div>

                        <h2>{displayName}</h2>

                        <p>{user.email}</p>

                        <button
                            className="primary full"
                            onClick={() => {
                                setProfileOpen(false);
                                setActive("Settings");
                            }}
                        >
                            ⚙ Account settings
                        </button>

                        <button
                            className="danger full"
                            onClick={logout}
                        >
                            🚪 Logout
                        </button>
                    </div>
                </div>
            )}

            {authOpen && (
                <div
                    className="overlay"
                    onClick={closeLogin}
                >
                    <div
                        className="auth-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="close"
                            onClick={closeLogin}
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

                        <form onSubmit={submitAuth}>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                autoComplete="email"
                            />

                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                autoComplete={
                                    registerMode
                                        ? "new-password"
                                        : "current-password"
                                }
                            />

                            <button
                                className="primary full"
                                type="submit"
                            >
                                {registerMode
                                    ? "Register"
                                    : "Login"}
                            </button>
                        </form>

                        <div className="separator">
                            <span>OR</span>
                        </div>

                        <button
                            className="discord-button"
                            onClick={loginWithDiscord}
                        >
                            ◈ Continue with Discord
                        </button>

                        {authMessage && (
                            <div className="auth-message">
                                {authMessage}
                            </div>
                        )}

                        <div className="switch">
                            <span>
                                {registerMode
                                    ? "Already have an account?"
                                    : "Don't have an account?"}
                            </span>

                            <button onClick={switchAuth}>
                                {registerMode
                                    ? "Login"
                                    : "Register"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
EOFcat > src/App.jsx <<'EOF'
