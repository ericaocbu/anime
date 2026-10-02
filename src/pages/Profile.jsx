import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useProfileFavorites } from "../hooks/useProfileFavorites";
import { useMyList } from "../hooks/useMyList";
import { useSearchAnime } from "../hooks/useSearch";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import AnimeProgress from "../components/anime/AnimeProgress";

import "../styles/profile.css";

function formatStatus(status) {
  switch (status) {
    case "watching":
      return "Watching";
    case "completed":
      return "Completed";
    case "planned":
      return "Planning";
    case "paused":
      return "Paused";
    case "dropped":
      return "Dropped";
    default:
      return "Planning";
  }
}

function AuthPanel() {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    if (mode === "signup") {
      const {
        data,
        error: signupError,
      } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signupError) {
        setError(signupError.message);
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError(
          "Account creation failed. Please try again."
        );
        setLoading(false);
        return;
      }

      if (data.session) {
        const { error: profileError } =
          await supabase
            .from("profiles")
            .insert({
              id: data.user.id,
              display_name:
                email.split("@")[0],
            });

        if (profileError) {
          console.error(
            "Profile creation failed:",
            profileError
          );
        }
      }

      if (!data.session) {
        setMessage(
          "Your account has been created. Check your email to confirm your account, then sign in."
        );
      }

      setLoading(false);
      return;
    }

    const {
      error: signinError,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signinError) {
      setError(signinError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
  }

  function toggleMode() {
    setMode((current) =>
      current === "signin"
        ? "signup"
        : "signin"
    );

    setError("");
    setMessage("");
  }

  return (
    <div className="profile__auth">
      <div className="profile__auth-intro">
        <p className="profile__eyebrow">
          YOUR ACCOUNT
        </p>

        <h1>
          {mode === "signin"
            ? "Welcome back"
            : "Create your account"}
        </h1>

        <p>
          {mode === "signin"
            ? "Sign in to access your anime library and keep your progress across devices."
            : "Create an account to save your anime library, progress, and ratings."}
        </p>
      </div>

      <form
        className="profile__auth-form"
        onSubmit={handleSubmit}
      >
        <label>
          Email

          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </label>

        <label>
          Password

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Enter your password"
            autoComplete={
              mode === "signup"
                ? "new-password"
                : "current-password"
            }
            minLength={6}
            required
          />
        </label>

        {error && (
          <p className="profile__auth-message profile__auth-message--error">
            {error}
          </p>
        )}

        {message && (
          <p className="profile__auth-message profile__auth-message--success">
            {message}
          </p>
        )}

        <button
          type="submit"
          className="profile__auth-submit"
          disabled={loading}
        >
          {loading
            ? "Please wait..."
            : mode === "signin"
            ? "Sign In"
            : "Create Account"}
        </button>
      </form>

      <div className="profile__auth-switch">
        <span>
          {mode === "signin"
            ? "Don't have an account?"
            : "Already have an account?"}
        </span>

        <button
          type="button"
          onClick={toggleMode}
        >
          {mode === "signin"
            ? "Create one"
            : "Sign in"}
        </button>
      </div>
    </div>
  );
}

function Profile() {
  const {
    user,
    loading: authLoading,
    signOut,
  } = useAuth();

  const {
    myList,
    loading: myListLoading,
  } = useMyList();

  const {
    favorites,
    loading: favoritesLoading,
    addFavorite,
    removeFavorite,
    reorderFavorites,
  } = useProfileFavorites();

  const [favoriteSearch, setFavoriteSearch] = useState("");
  const [showFavoritePicker, setShowFavoritePicker] =
    useState(false);

  const {
    data: favoriteSearchResults,
    isLoading: favoriteSearchLoading,
  } = useSearchAnime(favoriteSearch, 1);

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] =
    useState(true);

  const [displayName, setDisplayName] =
    useState("");

  const [username, setUsername] =
    useState("");

  const [isEditingProfile, setIsEditingProfile] =
    useState(false);

  const [profileSaving, setProfileSaving] =
    useState(false);

  const [profileMessage, setProfileMessage] =
    useState("");

  const [signingOut, setSigningOut] =
    useState(false);

  const [avatarFile, setAvatarFile] =
    useState(null);

  const [avatarPreview, setAvatarPreview] =
    useState(null);

  const [avatarSaving, setAvatarSaving] =
    useState(false);

  const [avatarMessage, setAvatarMessage] =
    useState("");

  function handleAvatarSelect(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setAvatarMessage(
        "Please choose an image file."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarMessage(
        "Profile pictures must be smaller than 5 MB."
      );
      return;
    }

    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }

    const previewUrl =
      URL.createObjectURL(file);

    setAvatarFile(file);
    setAvatarPreview(previewUrl);
    setAvatarMessage("");
  }

  async function handleAvatarUpload() {
    if (!user || !avatarFile) {
      return;
    }

    setAvatarSaving(true);
    setAvatarMessage("");

    try {
      const fileExtension =
        avatarFile.name
          .split(".")
          .pop()
          ?.toLowerCase() || "jpg";

      const filePath = `${user.id}/avatar-${Date.now()}.${fileExtension}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from("avatars")
        .upload(
          filePath,
          avatarFile,
          {
            cacheControl: "3600",
            upsert: false,
          }
        );

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const avatarUrl =
        publicUrlData.publicUrl;

      const {
        data,
        error: profileError,
      } = await supabase
        .from("profiles")
        .update({
          avatar_url: avatarUrl,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", user.id)
        .select(
          "id, username, display_name, avatar_url"
        )
        .single();

      if (profileError) {
        throw profileError;
      }

      setProfile(data);
      setAvatarFile(null);

      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }

      setAvatarPreview(null);
      setAvatarMessage("");
    } catch (error) {
      console.error(
        "Avatar upload failed:",
        error
      );

      setAvatarMessage(
        "Unable to upload your profile picture."
      );
    } finally {
      setAvatarSaving(false);
    }
  }

  async function handleAvatarRemove() {
    if (!user || !profile?.avatar_url) {
      return;
    }

    setAvatarSaving(true);
    setAvatarMessage("");

    try {
      const marker = "/avatars/";

      const markerIndex =
        profile.avatar_url.indexOf(marker);

      if (markerIndex === -1) {
        throw new Error(
          "Could not determine avatar file path."
        );
      }

      const filePath = decodeURIComponent(
        profile.avatar_url.slice(
          markerIndex + marker.length
        )
      );

      const {
        error: storageError,
      } = await supabase.storage
        .from("avatars")
        .remove([filePath]);

      if (storageError) {
        throw storageError;
      }

      const {
        data,
        error: profileError,
      } = await supabase
        .from("profiles")
        .update({
          avatar_url: null,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", user.id)
        .select(
          "id, username, display_name, avatar_url"
        )
        .single();

      if (profileError) {
        throw profileError;
      }

      setProfile(data);
      setAvatarFile(null);

      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }

      setAvatarPreview(null);
      setAvatarMessage("");
    } catch (error) {
      console.error(
        "Failed to remove avatar:",
        error
      );

      setAvatarMessage(
        "Unable to remove your profile picture."
      );
    } finally {
      setAvatarSaving(false);
    }
  }

  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setProfile(null);
        setProfileLoading(false);
        return;
      }

      setProfileLoading(true);

      const {
        data,
        error,
      } = await supabase
        .from("profiles")
        .select(
          "id, username, display_name, avatar_url"
        )
        .eq("id", user.id)
        .single();

      if (error) {
        console.error(
          "Failed to load profile:",
          error
        );

        setProfile(null);
        setProfileLoading(false);
        return;
      }

      setProfile(data);

      setDisplayName(
        data.display_name || ""
      );

      setUsername(
        data.username || ""
      );

      setProfileLoading(false);
    }

    loadProfile();
  }, [user]);

  async function handleSaveProfile(event) {
    event.preventDefault();

    if (!user) {
      return;
    }

    const trimmedDisplayName =
      displayName.trim();

    const trimmedUsername =
      username.trim().toLowerCase();

    if (!trimmedDisplayName) {
      setProfileMessage(
        "Please enter a display name."
      );
      return;
    }

    if (!trimmedUsername) {
      setProfileMessage(
        "Please enter a username."
      );
      return;
    }

    setProfileSaving(true);
    setProfileMessage("");

    const {
      data,
      error,
    } = await supabase
      .from("profiles")
      .update({
        display_name:
          trimmedDisplayName,

        username:
          trimmedUsername,

        updated_at:
          new Date().toISOString(),
      })
      .eq("id", user.id)
      .select(
        "id, username, display_name, avatar_url"
      )
      .single();

    if (error) {
      console.error(
        "Failed to update profile:",
        error
      );

      if (error.code === "23505") {
        setProfileMessage(
          "That username is already taken."
        );
      } else {
        setProfileMessage(
          "Unable to save your profile. Please try again."
        );
      }

      setProfileSaving(false);
      return;
    }

    setProfile(data);

    setDisplayName(
      data.display_name || ""
    );

    setUsername(
      data.username || ""
    );

    setIsEditingProfile(false);
    setProfileMessage("");
    setProfileSaving(false);
  }

  function handleCancelEdit() {
    setDisplayName(
      profile?.display_name || ""
    );

    setUsername(
      profile?.username || ""
    );

    setProfileMessage("");
    setAvatarMessage("");

    setAvatarFile(null);

    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarPreview(null);
    setIsEditingProfile(false);
  }

  const stats = useMemo(() => {
    return {
      watching: myList.filter(
        (anime) =>
          anime.listStatus === "watching"
      ).length,

      completed: myList.filter(
        (anime) =>
          anime.listStatus === "completed"
      ).length,

      planned: myList.filter(
        (anime) =>
          anime.listStatus === "planned"
      ).length,

      paused: myList.filter(
        (anime) =>
          anime.listStatus === "paused"
      ).length,

      dropped: myList.filter(
        (anime) =>
          anime.listStatus === "dropped"
      ).length,
    };
  }, [myList]);

  const currentlyWatching = useMemo(() => {
    return myList
      .filter(
        (anime) =>
          anime.listStatus === "watching" ||
          (anime.currentEpisode > 0 &&
            anime.listStatus !== "completed" &&
            anime.listStatus !== "dropped")
      )
      .sort(
        (a, b) =>
          new Date(
            b.updatedAt ||
              b.addedAt ||
              0
          ) -
          new Date(
            a.updatedAt ||
              a.addedAt ||
              0
          )
      )
      .slice(0, 4);
  }, [myList]);

  const recentlyUpdated = useMemo(() => {
    return [...myList]
      .sort(
        (a, b) =>
          new Date(
            b.updatedAt ||
              b.addedAt ||
              0
          ) -
          new Date(
            a.updatedAt ||
              a.addedAt ||
              0
          )
      )
      .slice(0, 6);
  }, [myList]);

  const totalEpisodesWatched =
    myList.reduce(
      (total, anime) =>
        total +
        Number(
          anime.currentEpisode || 0
        ),
      0
    );

  async function handleSignOut() {
    setSigningOut(true);

    try {
      await signOut();
    } catch (error) {
      console.error(
        "Sign out failed:",
        error
      );

      setSigningOut(false);
    }
  }

  if (authLoading) {
    return (
      <div className="profile">
        <div className="profile__loading">
          Loading profile...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile">
        <AuthPanel />
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="profile">
        <div className="profile__loading">
          Loading your profile...
        </div>
      </div>
    );
  }

  const profileName =
    profile?.display_name ||
    user.email?.split("@")[0] ||
    "User";

  const profileUsername =
    profile?.username
      ? `@${profile.username}`
      : null;

  const avatarLetter =
    profileName.charAt(0).toUpperCase() ||
    "U";

  return (
    <div className="profile">
      <section className="profile__hero">
        <div className="profile__avatar">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={`${profileName} profile`}
            />
          ) : (
            <span>
              {avatarLetter}
            </span>
          )}
        </div>

        <div className="profile__identity">
          <p className="profile__eyebrow">
            YOUR ANIME LIBRARY
          </p>

          <h1>{profileName}</h1>

          {profileUsername && (
            <p>{profileUsername}</p>
          )}
        </div>

        <div className="profile__hero-actions">
          <button
            type="button"
            className="profile__edit-button"
            onClick={() => {
              setDisplayName(
                profile?.display_name || ""
              );

              setUsername(
                profile?.username || ""
              );

              setProfileMessage("");
              setAvatarMessage("");
              setIsEditingProfile(true);
            }}
          >
            Edit Profile
          </button>

          <button
            type="button"
            className="profile__sign-out"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut
              ? "Signing out..."
              : "Sign Out"}
          </button>
        </div>
      </section>

      {isEditingProfile && (
        <section className="profile__edit-panel">
          <div className="profile__edit-header">
            <div>
              <p className="profile__eyebrow">
                PROFILE
              </p>

              <h2>Edit Profile</h2>
            </div>

            <button
              type="button"
              className="profile__edit-close"
              onClick={handleCancelEdit}
              aria-label="Close edit profile"
            >
              ×
            </button>
          </div>

          <form
            className="profile__edit-form"
            onSubmit={handleSaveProfile}
          >
            <div className="profile__avatar-editor">
              <div className="profile__avatar-editor-preview">
                {avatarPreview ||
                profile?.avatar_url ? (
                  <img
                    src={
                      avatarPreview ||
                      profile.avatar_url
                    }
                    alt="Profile preview"
                  />
                ) : (
                  <span>
                    {profileName
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}
              </div>

              <div className="profile__avatar-editor-content">
                <span className="profile__avatar-editor-label">
                  Profile Picture
                </span>

                <p>
                  Choose an image up to 5 MB.
                </p>

                <label className="profile__avatar-upload">
                  Choose Image

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarSelect}
                  />
                </label>

                {avatarFile && (
                  <button
                    type="button"
                    className="profile__avatar-save"
                    onClick={handleAvatarUpload}
                    disabled={avatarSaving}
                  >
                    {avatarSaving
                      ? "Uploading..."
                      : "Save Picture"}
                  </button>
                )}

                {profile?.avatar_url &&
                  !avatarFile && (
                    <button
                      type="button"
                      className="profile__avatar-remove"
                      onClick={
                        handleAvatarRemove
                      }
                      disabled={avatarSaving}
                    >
                      {avatarSaving
                        ? "Removing..."
                        : "Remove Picture"}
                    </button>
                  )}

                {avatarMessage && (
                  <p className="profile__edit-message">
                    {avatarMessage}
                  </p>
                )}
              </div>
            </div>

            <label>
              <span>Display Name</span>

              <input
                type="text"
                value={displayName}
                onChange={(event) =>
                  setDisplayName(
                    event.target.value
                  )
                }
                maxLength={50}
                placeholder="Your display name"
                required
              />
            </label>

            <label>
              <span>Username</span>

              <input
                type="text"
                value={username}
                onChange={(event) =>
                  setUsername(
                    event.target.value
                  )
                }
                maxLength={30}
                placeholder="Choose a username"
                required
              />
            </label>

            <p className="profile__edit-hint">
              Your username is unique to your
              account and will be displayed on
              your profile.
            </p>

            {profileMessage && (
              <p className="profile__edit-message">
                {profileMessage}
              </p>
            )}

            <div className="profile__edit-actions">
              <button
                type="button"
                className="profile__edit-cancel"
                onClick={handleCancelEdit}
                disabled={profileSaving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="profile__edit-save"
                disabled={profileSaving}
              >
                {profileSaving
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="profile__stats">
        <div className="profile__stat">
          <span>Watching</span>
          <strong>{stats.watching}</strong>
        </div>

        <div className="profile__stat">
          <span>Completed</span>
          <strong>{stats.completed}</strong>
        </div>

        <div className="profile__stat">
          <span>Planning</span>
          <strong>{stats.planned}</strong>
        </div>

        <div className="profile__stat">
          <span>Paused</span>
          <strong>{stats.paused}</strong>
        </div>

        <div className="profile__stat">
          <span>Dropped</span>
          <strong>{stats.dropped}</strong>
        </div>

        <div className="profile__stat">
          <span>Episodes Watched</span>
          <strong>{totalEpisodesWatched}</strong>
        </div>
      </section>

      {/* TOP 5 ANIME */}
      <section className="profile__section">
        <div className="profile__section-header">
          <div>
            <p className="profile__eyebrow">
              YOUR FAVORITES
            </p>

            <h2>Top 5 Anime</h2>

            <p>Your favorite anime, ranked.</p>
          </div>

          {favorites.length < 5 && (
            <button
              type="button"
              className="profile__section-action"
              onClick={() =>
                setShowFavoritePicker(
                  (current) => !current
                )
              }
            >
              {showFavoritePicker
                ? "Close"
                : "+ Add Favorite"}
            </button>
          )}
        </div>

        {showFavoritePicker &&
          favorites.length < 5 && (
            <div className="profile__favorite-picker">
              <div className="profile__favorite-search">
                <input
                  type="search"
                  value={favoriteSearch}
                  onChange={(event) =>
                    setFavoriteSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search anime..."
                  aria-label="Search anime to add to favorites"
                  autoFocus
                />
              </div>

              {favoriteSearchLoading &&
                favoriteSearch.trim() && (
                  <div className="profile__favorite-message">
                    Searching...
                  </div>
                )}

              {!favoriteSearchLoading &&
                favoriteSearch.trim() &&
                favoriteSearchResults?.data
                  ?.length === 0 && (
                  <div className="profile__favorite-message">
                    No anime found.
                  </div>
                )}

              {favoriteSearchResults?.data
                ?.length > 0 && (
                <div className="profile__favorite-results">
                  {favoriteSearchResults.data.map(
                    (anime) => {
                      const alreadyFavorite =
                        favorites.some(
                          (favorite) =>
                            favorite.id ===
                            anime.id
                        );

                      return (
                        <button
                          key={anime.id}
                          type="button"
                          className="profile__favorite-result"
                          disabled={
                            alreadyFavorite
                          }
                          onClick={async () => {
                            if (
                              alreadyFavorite
                            ) {
                              return;
                            }

                            await addFavorite(
                              anime
                            );

                            setFavoriteSearch(
                              ""
                            );

                            setShowFavoritePicker(
                              false
                            );
                          }}
                        >
                          {anime.image ? (
                            <img
                              src={anime.image}
                              alt=""
                              className="profile__favorite-result-image"
                            />
                          ) : (
                            <div className="profile__favorite-result-image profile__image-placeholder">
                              No Image
                            </div>
                          )}

                          <span className="profile__favorite-result-info">
                            <strong>
                              {anime.title}
                            </strong>

                            {anime.format && (
                              <span>
                                {anime.format}

                                {anime.seasonYear
                                  ? ` • ${anime.seasonYear}`
                                  : ""}
                              </span>
                            )}
                          </span>

                          <span className="profile__favorite-result-action">
                            {alreadyFavorite
                              ? "Added"
                              : "Add"}
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          )}

        {favoritesLoading ? (
          <div className="profile__favorite-message">
            Loading favorites...
          </div>
        ) : favorites.length > 0 ? (
          <div className="profile__favorites">
            {favorites.map(
              (anime, index) => (
                <article
                  key={anime.id}
                  className="profile__favorite-card"
                >
                  <div className="profile__favorite-rank">
                    {index + 1}
                  </div>

                  <Link
                    to={`/anime/${anime.id}`}
                    className="profile__favorite-link"
                  >
                    {anime.image ? (
                      <img
                        src={anime.image}
                        alt={anime.title}
                        className="profile__favorite-image"
                      />
                    ) : (
                      <div className="profile__favorite-image profile__image-placeholder">
                        No Image
                      </div>
                    )}

                    <div className="profile__favorite-content">
                      <h3>{anime.title}</h3>

                      {anime.format && (
                        <span className="profile__favorite-meta">
                          {anime.format}

                          {anime.seasonYear
                            ? ` • ${anime.seasonYear}`
                            : ""}
                        </span>
                      )}

                      {anime.score != null && (
                        <span className="profile__favorite-score">
                          ★{" "}
                          {anime.score.toFixed(
                            1
                          )}
                        </span>
                      )}
                    </div>
                  </Link>

                  <div className="profile__favorite-controls">
                    <button
                      type="button"
                      aria-label={`Move ${anime.title} up`}
                      disabled={index === 0}
                      onClick={async (event) => {
                        event.preventDefault();
                        event.stopPropagation();

                        if (index === 0) {
                          return;
                        }

                        const reordered = [...favorites];

                        [
                          reordered[index - 1],
                          reordered[index],
                        ] = [
                          reordered[index],
                          reordered[index - 1],
                        ];

                        await reorderFavorites(reordered);
                      }}
                    >
                      ↑
                    </button>

                    <button
                      type="button"
                      aria-label={`Move ${anime.title} down`}
                      disabled={
                        index === favorites.length - 1
                      }
                      onClick={async (event) => {
                        event.preventDefault();
                        event.stopPropagation();

                        if (index === favorites.length - 1) {
                          return;
                        }

                        const reordered = [...favorites];

                        [
                          reordered[index],
                          reordered[index + 1],
                        ] = [
                          reordered[index + 1],
                          reordered[index],
                        ];

                        await reorderFavorites(reordered);
                      }}
                    >
                      ↓
                    </button>

                    <button
                      type="button"
                      aria-label={`Remove ${anime.title} from favorites`}
                      onClick={async (event) => {
                        event.preventDefault();
                        event.stopPropagation();

                        await removeFavorite(anime.id);
                      }}
                    >
                      ×
                    </button>
                  </div>
                </article>
              )
            )}
          </div>
        ) : (
          <div className="profile__empty-state">
            <p>
              You haven't added any favorites yet.
            </p>

            <button
              type="button"
              onClick={() =>
                setShowFavoritePicker(true)
              }
            >
              Add your first favorite
            </button>
          </div>
        )}
      </section>

      {/* CURRENTLY WATCHING */}
      <section className="profile__section">
        <div className="profile__section-header">
          <div>
            <p className="profile__eyebrow">
              KEEP WATCHING
            </p>

            <h2>Currently Watching</h2>
          </div>

          <Link
            to="/my-list"
            className="profile__section-link"
          >
            View My List
          </Link>
        </div>

        {myListLoading ? (
          <div className="profile__empty">
            <p>Loading your library...</p>
          </div>
        ) : currentlyWatching.length > 0 ? (
          <div className="profile__watching-grid">
            {currentlyWatching.map(
              (anime) => (
                <Link
                  key={anime.id}
                  to={`/anime/${anime.id}`}
                  className="profile__watching-card"
                >
                  <div className="profile__watching-image">
                    {anime.image ? (
                      <img
                        src={anime.image}
                        alt={anime.title}
                      />
                    ) : (
                      <div className="profile__image-placeholder">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="profile__watching-content">
                    <div>
                      <span className="profile__status">
                        {formatStatus(
                          anime.listStatus
                        )}
                      </span>

                      <h3>{anime.title}</h3>
                    </div>

                    <AnimeProgress
                      currentEpisode={
                        Number(
                          anime.currentEpisode
                        ) || 0
                      }
                      totalEpisodes={
                        Number(
                          anime.episodes
                        ) || null
                      }
                    />
                  </div>
                </Link>
              )
            )}
          </div>
        ) : (
          <div className="profile__empty">
            <h3>Nothing here yet</h3>

            <p>
              Add an anime to your list and
              start tracking your progress.
            </p>

            <Link
              to="/discover"
              className="profile__button"
            >
              Explore Anime
            </Link>
          </div>
        )}
      </section>

      {/* RECENTLY ADDED */}
      <section className="profile__section">
        <div className="profile__section-header">
          <div>
            <p className="profile__eyebrow">
              YOUR LIBRARY
            </p>

            <h2>Recently Added</h2>
          </div>

          <Link
            to="/my-list"
            className="profile__section-link"
          >
            View All
          </Link>
        </div>

        {myListLoading ? (
          <div className="profile__empty">
            <p>Loading your library...</p>
          </div>
        ) : recentlyUpdated.length > 0 ? (
          <div className="profile__recent-list">
            {recentlyUpdated.map(
              (anime) => (
                <Link
                  key={anime.id}
                  to={`/anime/${anime.id}`}
                  className="profile__recent-item"
                >
                  <div className="profile__recent-image">
                    {anime.image ? (
                      <img
                        src={anime.image}
                        alt={anime.title}
                      />
                    ) : (
                      <div className="profile__image-placeholder">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="profile__recent-info">
                    <span className="profile__status">
                      {formatStatus(
                        anime.listStatus
                      )}
                    </span>

                    <h3>{anime.title}</h3>

                    <p>
                      {anime.currentEpisode
                        ? `Episode ${anime.currentEpisode}`
                        : "Not started"}
                    </p>
                  </div>

                  <span className="profile__arrow">
                    →
                  </span>
                </Link>
              )
            )}
          </div>
        ) : (
          <div className="profile__empty profile__empty--small">
            <p>Your library is empty.</p>

            <Link to="/discover">
              Start exploring →
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

export default Profile;