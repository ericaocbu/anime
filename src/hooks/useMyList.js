import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export function useMyList() {
  const { user } = useAuth();

  const [myList, setMyList] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMyList = useCallback(async () => {
    if (!user) {
      setMyList([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const {
      data,
      error,
    } = await supabase
      .from("anime_list")
      .select(
        `
          id,
          anime_id,
          anime_data,
          list_status,
          current_episode,
          user_rating,
          added_at,
          updated_at
        `
      )
      .eq("user_id", user.id)
      .order("updated_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Failed to load anime list:",
        error
      );

      setMyList([]);
      setLoading(false);
      return;
    }

    const normalizedList = (data || []).map(
      (item) => ({
        ...(item.anime_data || {}),

        id: item.anime_id,

        listStatus: item.list_status,

        currentEpisode:
          item.current_episode || 0,

        userRating:
          item.user_rating ?? null,

        addedAt: item.added_at,

        updatedAt: item.updated_at,
      })
    );

    setMyList(normalizedList);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadMyList();
  }, [loadMyList]);

  async function addAnime(anime) {
    if (!user) {
      return;
    }

    const {
      data,
      error,
    } = await supabase
      .from("anime_list")
      .insert({
        user_id: user.id,
        anime_id: anime.id,
        anime_data: anime,
        list_status: "planned",
        current_episode: 0,
        user_rating: null,
      })
      .select()
      .single();

    if (error) {
      console.error(
        "Failed to add anime:",
        error
      );

      return;
    }

    const newAnime = {
      ...(data.anime_data || anime),

      id: data.anime_id,

      listStatus: data.list_status,

      currentEpisode:
        data.current_episode || 0,

      userRating:
        data.user_rating ?? null,

      addedAt: data.added_at,

      updatedAt: data.updated_at,
    };

    setMyList((current) => [
      ...current,
      newAnime,
    ]);
  }

  async function updateAnime(id, updates) {
    if (!user) {
      return;
    }

    const databaseUpdates = {};

    if (
      Object.prototype.hasOwnProperty.call(
        updates,
        "listStatus"
      )
    ) {
      databaseUpdates.list_status =
        updates.listStatus;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        updates,
        "currentEpisode"
      )
    ) {
      databaseUpdates.current_episode =
        Number(updates.currentEpisode) || 0;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        updates,
        "userRating"
      )
    ) {
      databaseUpdates.user_rating =
        updates.userRating;
    }

    if (Object.keys(databaseUpdates).length === 0) {
      return;
    }

    const {
      data,
      error,
    } = await supabase
      .from("anime_list")
      .update(databaseUpdates)
      .eq("user_id", user.id)
      .eq("anime_id", id)
      .select()
      .single();

    if (error) {
      console.error(
        "Failed to update anime:",
        error
      );

      return;
    }

    setMyList((current) =>
      current.map((anime) =>
        anime.id === id
          ? {
              ...anime,

              listStatus:
                data.list_status,

              currentEpisode:
                data.current_episode || 0,

              userRating:
                data.user_rating ?? null,

              updatedAt:
                data.updated_at,
            }
          : anime
      )
    );
  }

  async function removeAnime(id) {
    if (!user) {
      return;
    }

    const {
      error,
    } = await supabase
      .from("anime_list")
      .delete()
      .eq("user_id", user.id)
      .eq("anime_id", id);

    if (error) {
      console.error(
        "Failed to remove anime:",
        error
      );

      return;
    }

    setMyList((current) =>
      current.filter(
        (anime) => anime.id !== id
      )
    );
  }

  function getAnimeFromList(id) {
    return myList.find(
      (item) => item.id === id
    );
  }

  function isAnimeInList(id) {
    return myList.some(
      (item) => item.id === id
    );
  }

  return {
    myList,
    loading,
    addAnime,
    updateAnime,
    removeAnime,
    getAnimeFromList,
    isAnimeInList,
    refreshMyList: loadMyList,
  };
}