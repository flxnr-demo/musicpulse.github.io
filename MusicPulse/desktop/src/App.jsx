import { useEffect, useState } from "react";
import "./App.css";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://doearrsajrfzlqsbrryt.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_DwxG0zK_VZRvC8S-dcw7xQ_C1fXujae";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


/* =========================================================
   DATA
========================================================= */

const tracks = [
  { number: 1, name: "MONTAGEM NAVISTRA", plays: 128492, growth: 24.8 },
  { number: 2, name: "SEM VEMPRA", plays: 94221, growth: 18.2 },
  { number: 3, name: "MONTAGEM ELTERA", plays: 71802, growth: 11.4 },
  { number: 4, name: "MONTAGEM ESTRELA", plays: 58391, growth: 9.7 },
  { number: 5, name: "FUNK CRIMINAL", plays: 41208, growth: 7.2 },
  { number: 6, name: "MONTAGEM LUNAR", plays: 36721, growth: 6.8 },
  { number: 7, name: "BAILE FUNK", plays: 29182, growth: 5.4 },
];

const platforms = [
  { name: "Spotify", plays: 183492, growth: 18.4 },
  { name: "YouTube", plays: 94821, growth: 22.1 },
  { name: "TikTok", plays: 281942, growth: 31.6 },
  { name: "Apple Music", plays: 37210, growth: 12.7 },
  { name: "SoundCloud", plays: 19384, growth: 8.9 },
  { name: "Instagram", plays: 12481, growth: 14.3 },
];

const chartData = {
  7: [42, 51, 47, 63, 58, 76, 91],
  30: [31, 44, 38, 55, 47, 67, 59, 76, 68, 83, 72, 91, 79, 96],
  90: [24, 31, 29, 38, 35, 44, 41, 52, 48, 61, 57, 69, 63, 77, 73, 88],
  365: [18, 22, 26, 24, 31, 36, 33, 42, 47, 44, 53, 58, 64, 61, 71, 78],
};

const navItems = [
  ["⌂", "Dashboard"],
  ["◉", "Artist Profile"],
  ["♫", "Tracks"],
  ["◒", "Analytics"],
  ["◎", "Platforms"],
  ["◇", "Releases"],
  ["⚙", "Settings"],
];


/* =========================================================
   HELPERS
========================================================= */

function formatNumber(number) {
  return new Intl.NumberFormat("en-US").format(number);
}


function getUserName(user) {
  return (
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.user_metadata?.preferred_username ||
    user?.user_metadata?.custom_claims?.global_name ||
    user?.email?.split("@")[0] ||
    "User"
  );
}


function getUserInitial(user) {
  const name = getUserName(user);

  return (
    name?.trim()?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "U"
  );
}


function getDiscordAvatar(user) {

  if (!user) {
    return null;
  }

  const metadata = user.user_metadata || {};

  const possibleAvatar =
    metadata.avatar_url ||
    metadata.avatar ||
    metadata.picture ||
    metadata.image_url ||
    metadata.avatarUrl ||
    metadata.custom_claims?.avatar_url ||
    null;

  if (
    typeof possibleAvatar === "string" &&
    possibleAvatar.startsWith("http")
  ) {
    return possibleAvatar;
  }

  return null;
}


/* =========================================================
   AVATAR COMPONENT
========================================================= */

function UserAvatar({
  user,
  size = "normal",
}) {

  const avatarUrl = getDiscordAvatar(user);

  const className =
    size === "big"
      ? "avatar big"
      : size === "settings"
        ? "settingsAvatar"
        : "avatar";


  if (avatarUrl) {

    return (
      <div className={className}>
        <img
          src={avatarUrl}
          alt="Discord avatar"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      </div>
    );

  }


  return (
    <div className={className}>
      {getUserInitial(user)}
    </div>
  );
}


/* =========================================================
   LOGIN SCREEN
========================================================= */

function LoginScreen() {

  const [registerMode, setRegisterMode] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");


  async function handleEmailAuth() {

    setMessage("");

    if (!email || !password) {
      setMessage("Enter your email and password.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {

      if (registerMode) {

        const { data, error } =
          await supabase.auth.signUp({
            email,
            password,
          });

        if (error) {
          throw error;
        }

        if (data.session) {

          setMessage(
            "Account created successfully."
          );

        } else {

          setMessage(
            "Account created. Check your email to confirm your account."
          );

        }

      } else {

        const { error } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (error) {
          throw error;
        }

      }

    } catch (error) {

      setMessage(error.message);

    } finally {

      setLoading(false);

    }
  }


  async function loginWithDiscord() {

    setMessage("");
    setLoading(true);

    try {

      const { error } =
        await supabase.auth.signInWithOAuth({

          provider: "discord",

          options: {

            redirectTo:
              "https://flxnr-demo.github.io/musicpulse.github.io/",
          },

        });

      if (error) {
        throw error;
      }

    } catch (error) {

      setMessage(error.message);
      setLoading(false);

    }
  }


  return (
    <div className="loginScreen">

      <div className="loginBox">

        <div className="loginLogo">

          <div className="loginLogoIcon">
            M
          </div>

          <div>

            <strong>
              MusicPulse
            </strong>

            <span>
              Music Analytics
            </span>

          </div>

        </div>


        <div className="loginHeader">

          <h1>
            {registerMode
              ? "Create your account"
              : "Welcome back"}
          </h1>

          <p>
            {registerMode
              ? "Create a MusicPulse account to continue."
              : "Sign in to continue to MusicPulse."}
          </p>

        </div>


        <button
          className="discordButton"
          onClick={loginWithDiscord}
          disabled={loading}
        >

          <span className="discordIcon">
            ◉
          </span>

          Continue with Discord

        </button>


        <div className="loginDivider">
          <span>OR</span>
        </div>


        <input
          className="loginInput"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
        />


        <input
          className="loginInput"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          onKeyDown={(event) => {

            if (event.key === "Enter") {
              handleEmailAuth();
            }

          }}
        />


        <button
          className="loginSubmit"
          onClick={handleEmailAuth}
          disabled={loading}
        >

          {loading
            ? "Please wait..."
            : registerMode
              ? "Create account"
              : "Login"}

        </button>


        {message && (

          <div className="loginMessage">
            {message}
          </div>

        )}


        <div className="loginSwitch">

          {registerMode
            ? "Already have an account?"
            : "Don't have an account?"}

          <button
            onClick={() => {

              setRegisterMode(!registerMode);
              setMessage("");

            }}
          >

            {registerMode
              ? "Login"
              : "Register"}

          </button>

        </div>


        <div className="loginFooter">
          MusicPulse · 2026
        </div>

      </div>

    </div>
  );
}


/* =========================================================
   STAT
========================================================= */

function Stat({
  title,
  value,
  change,
}) {

  return (
    <div className="statCard">

      <span className="statTitle">
        {title}
      </span>

      <strong className="statValue">
        {value}
      </strong>

      <span className="positive">
        ↗ {change}
      </span>

    </div>
  );
}


/* =========================================================
   TRACK
========================================================= */

function Track({
  track,
}) {

  return (
    <div className="track">

      <span className="trackNumber">
        {track.number}
      </span>

      <div className="cover">
        ♪
      </div>

      <div className="trackName">

        <strong>
          {track.name}
        </strong>

        <span>
          FLXNR
        </span>

      </div>

      <div className="trackStats">

        <strong>
          {formatNumber(track.plays)}
        </strong>

        <small>
          +{track.growth}%
        </small>

      </div>

    </div>
  );
}


/* =========================================================
   CHART
========================================================= */

function Chart({
  period,
}) {

  const values =
    chartData[period] || chartData[30];

  return (
    <div className="chartArea">

      <div className="chartGrid">

        <span>100K</span>
        <span>75K</span>
        <span>50K</span>
        <span>25K</span>
        <span>0</span>

      </div>

      <div className="chartBars">

        {values.map(
          (value, index) => (

            <div
              className="chartColumn"
              key={index}
            >

              <div
                className="bar"
                style={{
                  height: `${value}%`,
                }}
              />

            </div>

          )
        )}

      </div>

    </div>
  );
}


/* =========================================================
   SETTINGS
========================================================= */

function Settings({
  user,
  logout,
}) {

  const avatarUrl =
    getDiscordAvatar(user);

  const isDiscord =
    user?.app_metadata?.provider === "discord";


  return (
    <section className="settingsPage">

      <div className="settingsHeader">

        <div>

          <span className="eyebrow">
            ACCOUNT SETTINGS
          </span>

          <h2>
            Your account
          </h2>

          <p>
            Manage your MusicPulse account and connected profile.
          </p>

        </div>

      </div>


      <div className="settingsGrid">


        {/* PROFILE */}

        <div className="settingsCard">

          <div className="settingsCardHeader">

            <div>

              <h3>
                Profile
              </h3>

              <span>
                Your connected account
              </span>

            </div>

          </div>


          <div className="settingsProfile">

            <UserAvatar
              user={user}
              size="settings"
            />


            <div className="settingsProfileInfo">

              <strong>
                {getUserName(user)}
              </strong>

              <span>
                {isDiscord
                  ? "Connected with Discord"
                  : "MusicPulse account"}
              </span>

            </div>

          </div>

        </div>


        {/* ACCOUNT INFORMATION */}

        <div className="settingsCard">

          <div className="settingsCardHeader">

            <div>

              <h3>
                Account information
              </h3>

              <span>
                Your MusicPulse account details
              </span>

            </div>

          </div>


          <div className="settingsRows">


            <div className="settingsRow">

              <div>

                <span className="settingsLabel">
                  Username
                </span>

                <strong>
                  {getUserName(user)}
                </strong>

              </div>

            </div>


            <div className="settingsRow">

              <div>

                <span className="settingsLabel">
                  Email
                </span>

                <strong>
                  {user?.email || "Not available"}
                </strong>

              </div>

            </div>


            <div className="settingsRow">

              <div>

                <span className="settingsLabel">
                  Provider
                </span>

                <strong>
                  {isDiscord
                    ? "Discord"
                    : "Email"}
                </strong>

              </div>

            </div>


            <div className="settingsRow">

              <div>

                <span className="settingsLabel">
                  User ID
                </span>

                <strong className="settingsId">
                  {user?.id || "Not available"}
                </strong>

              </div>

            </div>


          </div>

        </div>


        {/* DISCORD */}

        {isDiscord && (

          <div className="settingsCard">

            <div className="settingsCardHeader">

              <div>

                <h3>
                  Discord connection
                </h3>

                <span>
                  Information received from Discord
                </span>

              </div>

              <div className="discordStatus">
                ● Connected
              </div>

            </div>


            <div className="discordConnection">

              <UserAvatar
                user={user}
                size="normal"
              />


              <div>

                <strong>
                  {getUserName(user)}
                </strong>

                <span>
                  Discord account connected
                </span>

              </div>

            </div>

          </div>

        )}


        {/* SESSION */}

        <div className="settingsCard dangerCard">

          <div className="settingsCardHeader">

            <div>

              <h3>
                Session
              </h3>

              <span>
                Manage your current MusicPulse session
              </span>

            </div>

          </div>


          <button
            className="settingsLogout"
            onClick={logout}
          >
            Log out
          </button>

        </div>


      </div>

    </section>
  );
}


/* =========================================================
   MAIN APP
========================================================= */

function App() {

  const [user, setUser] =
    useState(null);

  const [authLoading, setAuthLoading] =
    useState(true);

  const [page, setPage] =
    useState("Dashboard");

  const [period, setPeriod] =
    useState(30);

  const [search, setSearch] =
    useState("");


  /* =======================================================
     SUPABASE SESSION
  ======================================================= */

  useEffect(() => {

    let mounted = true;


    async function loadUser() {

      const {
        data,
      } =
        await supabase.auth.getUser();


      if (mounted) {

        setUser(
          data.user ?? null
        );

        setAuthLoading(false);

      }

    }


    loadUser();


    const {
      data: listener,
    } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {

          setUser(
            session?.user ?? null
          );

          setAuthLoading(false);

        }
      );


    return () => {

      mounted = false;

      listener.subscription.unsubscribe();

    };

  }, []);


  /* =======================================================
     LOGOUT
  ======================================================= */

  async function logout() {

    await supabase.auth.signOut();

    setUser(null);

    setPage("Dashboard");

  }


  /* =======================================================
     LOADING
  ======================================================= */

  if (authLoading) {

    return (
      <div className="authLoading">

        <div className="loadingLogo">
          M
        </div>

        <span>
          Loading MusicPulse...
        </span>

      </div>
    );

  }


  /* =======================================================
     LOGIN
  ======================================================= */

  if (!user) {

    return <LoginScreen />;

  }


  /* =======================================================
     FILTER
  ======================================================= */

  const filteredTracks =
    tracks.filter(
      (track) =>
        track.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );


  /* =======================================================
     DASHBOARD
  ======================================================= */

  return (

    <div className="app">


      {/* SIDEBAR */}

      <aside className="sidebar">


        <div className="brand">

          <div className="brandIcon">
            M
          </div>

          <div>

            <strong>
              MusicPulse
            </strong>

            <span>
              Music Analytics
            </span>

          </div>

        </div>


        <nav>

          {navItems.map(
            ([icon, name]) => (

              <button
                key={name}
                className={
                  `navItem ${
                    page === name
                      ? "active"
                      : ""
                  }`
                }
                onClick={() =>
                  setPage(name)
                }
              >

                <span className="navIcon">
                  {icon}
                </span>

                <span>
                  {name}
                </span>

              </button>

            )
          )}

        </nav>


        {/* SIDEBAR USER */}

        <div className="sidebarBottom">


          <div className="miniProfile">

            <UserAvatar
              user={user}
            />


            <div>

              <strong>
                {getUserName(user)}
              </strong>

              <span>

                {user.app_metadata?.provider === "discord"
                  ? "Discord account"
                  : "MusicPulse account"}

              </span>

            </div>

          </div>


          <button
            className="logoutButton"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </aside>


      {/* MAIN */}

      <main className="main">


        {/* TOPBAR */}

        <header className="topbar">


          <div>

            <h1>
              {page}
            </h1>

            <p>

              {page === "Dashboard"
                ? "Here's what's happening with your music."
                : page === "Settings"
                  ? "Manage your MusicPulse account."
                  : `MusicPulse analytics for ${page.toLowerCase()}.`}

            </p>

          </div>


          {/* TOP USER */}

          <div className="topUser">


            <div>

              <strong>
                {getUserName(user)}
              </strong>

              <span>

                {user.app_metadata?.provider === "discord"
                  ? "Discord"
                  : "Producer"}

              </span>

            </div>


            <UserAvatar
              user={user}
              size="big"
            />

          </div>


        </header>


        {/* =================================================
           DASHBOARD
        ================================================= */}

        {page === "Dashboard" && (

          <>


            <section className="scoreHero">

              <div>

                <span className="eyebrow">
                  MUSICPULSE SCORE
                </span>

                <div className="scoreNumber">
                  87<span>/100</span>
                </div>

                <p>
                  Your music is performing better than
                  <strong> 82% </strong>
                  of artists this month.
                </p>

              </div>


              <div className="scoreRing">

                <div>

                  <strong>
                    87
                  </strong>

                  <span>
                    Excellent
                  </span>

                </div>

              </div>

            </section>


            <section className="statsGrid">

              <Stat
                title="Total Plays"
                value="428.7K"
                change="+24.8% this month"
              />

              <Stat
                title="Followers"
                value="12.4K"
                change="+1,284 this month"
              />

              <Stat
                title="Monthly Listeners"
                value="84.2K"
                change="+18.6% this month"
              />

              <Stat
                title="Releases"
                value="27"
                change="+3 this year"
              />

            </section>


            <section className="panel">

              <div className="panelHeader">

                <div>

                  <h2>
                    Performance
                  </h2>

                  <span>
                    Streaming activity
                  </span>

                </div>


                <div className="periodButtons">

                  {[7, 30, 90, 365].map(
                    (value) => (

                      <button
                        key={value}
                        className={
                          period === value
                            ? "period active"
                            : "period"
                        }
                        onClick={() =>
                          setPeriod(value)
                        }
                      >

                        {value === 365
                          ? "1 year"
                          : `${value} days`}

                      </button>

                    )
                  )}

                </div>

              </div>


              <Chart
                period={period}
              />

            </section>


            <section className="contentGrid">


              <div className="panel">

                <div className="panelHeader">

                  <div>

                    <h2>
                      Top Tracks
                    </h2>

                    <span>
                      Best performing releases
                    </span>

                  </div>

                  <button
                    className="textButton"
                    onClick={() =>
                      setPage("Tracks")
                    }
                  >
                    View all →
                  </button>

                </div>


                <div className="trackList">

                  {tracks
                    .slice(0, 5)
                    .map(
                      (track) => (

                        <Track
                          key={track.number}
                          track={track}
                        />

                      )
                    )}

                </div>

              </div>


              <div className="panel">

                <div className="panelHeader">

                  <div>

                    <h2>
                      Platforms
                    </h2>

                    <span>
                      Current performance
                    </span>

                  </div>

                </div>


                <div className="platformList">

                  {platforms.map(
                    (platform) => (

                      <div
                        className="platform"
                        key={platform.name}
                      >

                        <div className="platformIcon">
                          {platform.name[0]}
                        </div>

                        <div className="platformName">

                          <strong>
                            {platform.name}
                          </strong>

                          <span>
                            {formatNumber(
                              platform.plays
                            )} plays
                          </span>

                        </div>

                        <small>
                          +{platform.growth}%
                        </small>

                      </div>

                    )
                  )}

                </div>

              </div>


            </section>

          </>

        )}


        {/* =================================================
           ARTIST PROFILE
        ================================================= */}

        {page === "Artist Profile" && (

          <section>

            <div className="profileHero">

              <div className="artistAvatar">
                F
              </div>

              <div>

                <span className="eyebrow">
                  VERIFIED ARTIST
                </span>

                <h2>
                  FLXNR
                </h2>

                <p>
                  Brazilian Funk / Phonk Producer
                </p>

                <div className="tags">

                  <span>
                    Brazilian Funk
                  </span>

                  <span>
                    Phonk
                  </span>

                  <span>
                    Electronic
                  </span>

                </div>

              </div>

            </div>


            <section className="statsGrid">

              <Stat
                title="Followers"
                value="12.4K"
                change="+1,284"
              />

              <Stat
                title="Monthly Plays"
                value="428.7K"
                change="+24.8%"
              />

              <Stat
                title="Tracks"
                value="27"
                change="+3"
              />

              <Stat
                title="MusicPulse Score"
                value="87"
                change="Excellent"
              />

            </section>

          </section>

        )}


        {/* =================================================
           TRACKS
        ================================================= */}

        {page === "Tracks" && (

          <section className="panel">

            <div className="panelHeader">

              <div>

                <h2>
                  All Tracks
                </h2>

                <span>
                  {filteredTracks.length} releases
                </span>

              </div>

              <button className="btn">
                + Add Release
              </button>

            </div>


            <div className="trackTools">

              <div className="searchBox">

                <span>
                  ⌕
                </span>

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search tracks..."
                />

              </div>


              <div className="periodButtons">

                {[7, 30, 90].map(
                  (value) => (

                    <button
                      key={value}
                      className={
                        period === value
                          ? "period active"
                          : "period"
                      }
                      onClick={() =>
                        setPeriod(value)
                      }
                    >
                      {value} days
                    </button>

                  )
                )}

              </div>

            </div>


            <div className="trackList">

              {filteredTracks.length > 0 ? (

                filteredTracks.map(
                  (track) => (

                    <Track
                      key={track.number}
                      track={track}
                    />

                  )
                )

              ) : (

                <div className="emptyState">

                  <strong>
                    No tracks found
                  </strong>

                  <span>
                    Try another search.
                  </span>

                </div>

              )}

            </div>

          </section>

        )}


        {/* =================================================
           ANALYTICS
        ================================================= */}

        {page === "Analytics" && (

          <>

            <section className="statsGrid">

              <Stat
                title="Streams"
                value="428.7K"
                change="+24.8%"
              />

              <Stat
                title="Listeners"
                value="84.2K"
                change="+18.6%"
              />

              <Stat
                title="Save Rate"
                value="8.42%"
                change="+2.1%"
              />

              <Stat
                title="Share Rate"
                value="4.17%"
                change="+1.3%"
              />

            </section>


            <section className="panel">

              <div className="panelHeader">

                <div>

                  <h2>
                    Growth Analytics
                  </h2>

                  <span>
                    Detailed streaming performance
                  </span>

                </div>


                <div className="periodButtons">

                  {[7, 30, 90, 365].map(
                    (value) => (

                      <button
                        key={value}
                        className={
                          period === value
                            ? "period active"
                            : "period"
                        }
                        onClick={() =>
                          setPeriod(value)
                        }
                      >

                        {value === 365
                          ? "1 year"
                          : `${value} days`}

                      </button>

                    )
                  )}

                </div>

              </div>


              <Chart
                period={period}
              />

            </section>


            <section className="analyticsCards">

              <div className="analyticsCard">

                <span>
                  Best Day
                </span>

                <strong>
                  Tuesday
                </strong>

                <small>
                  +38.2% streams
                </small>

              </div>


              <div className="analyticsCard">

                <span>
                  Best Platform
                </span>

                <strong>
                  TikTok
                </strong>

                <small>
                  281.9K plays
                </small>

              </div>


              <div className="analyticsCard">

                <span>
                  Fastest Growing
                </span>

                <strong>
                  YouTube
                </strong>

                <small>
                  +22.1%
                </small>

              </div>

            </section>

          </>

        )}


        {/* =================================================
           PLATFORMS
        ================================================= */}

        {page === "Platforms" && (

          <section className="platformGrid">

            {platforms.map(
              (platform) => (

                <div
                  className="platformCard"
                  key={platform.name}
                >

                  <div className="platformIcon huge">
                    {platform.name[0]}
                  </div>

                  <h2>
                    {platform.name}
                  </h2>

                  <strong>
                    {formatNumber(
                      platform.plays
                    )}
                  </strong>

                  <span>
                    plays
                  </span>

                  <small>
                    ↗ +{platform.growth}%
                  </small>

                </div>

              )
            )}

          </section>

        )}


        {/* =================================================
           RELEASES
        ================================================= */}

        {page === "Releases" && (

          <section className="releaseGrid">


            <div className="releaseCard">

              <div className="releaseCover">
                ♪
              </div>

              <div className="releaseInfo">

                <span className="eyebrow">
                  ALBUM
                </span>

                <h2>
                  MONTAGEM NAVISTRA
                </h2>

                <p>
                  Released July 29, 2026
                </p>

                <div className="releaseStatus">
                  ✓ Available on platforms
                </div>

              </div>

            </div>


            <div className="releaseCard">

              <div className="releaseCover">
                ♪
              </div>

              <div className="releaseInfo">

                <span className="eyebrow">
                  SINGLE
                </span>

                <h2>
                  SEM VEMPRA
                </h2>

                <p>
                  FLXNR
                </p>

                <div className="releaseStatus">
                  ✓ Available on platforms
                </div>

              </div>

            </div>


          </section>

        )}


        {/* =================================================
           SETTINGS
        ================================================= */}

        {page === "Settings" && (

          <Settings
            user={user}
            logout={logout}
          />

        )}


      </main>

    </div>

  );
}


export default App;