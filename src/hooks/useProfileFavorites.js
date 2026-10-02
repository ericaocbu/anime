import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export function useProfileFavorites() {
  const { user } = useAuth();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("profile_favorites")
      .select(
        `
          id,
          anime_id,
          anime_data,
          position,
          created_at,
          updated_at
        `
      )
      .eq("user_id", user.id)
      .order("position", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Failed to load profile favorites:",
        error
      );

      setFavorites([]);
      setLoading(false);
      return;
    }

    const normalizedFavorites = (data || []).map(
      (item) => ({
        ...(item.anime_data || {}),
        id: item.anime_id,
        favoriteId: item.id,
        position: item.position,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      })
    );

    setFavorites(normalizedFavorites);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  async function addFavorite(anime) {
    if (!user || favorites.length >= 5) {
      return;
    }

    const alreadyExists = favorites.some(
      (favorite) => favorite.id === anime.id
    );

    if (alreadyExists) {
      return;
    }

    const nextPosition = favorites.length + 1;

    const { data, error } = await supabase
      .from("profile_favorites")
      .insert({
        user_id: user.id,
        anime_id: anime.id,
        anime_data: anime,
        position: nextPosition,
      })
      .select()
      .single();

    if (error) {
      console.error(
        "Failed to add profile favorite:",
        error
      );
      return;
    }

    const newFavorite = {
      ...(data.anime_data || anime),
      id: data.anime_id,
      favoriteId: data.id,
      position: data.position,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    setFavorites((current) => [
      ...current,
      newFavorite,
    ]);
  }

  async function removeFavorite(animeId) {
    if (!user) {
      return;
    }

    const favorite = favorites.find(
      (item) => item.id === animeId
    );

    if (!favorite) {
      return;
    }

    const { error } = await supabase
      .from("profile_favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("anime_id", animeId);

    if (error) {
      console.error(
        "Failed to remove profile favorite:",
        error
      );
      return;
    }

    const remaining = favorites
      .filter((item) => item.id !== animeId)
      .map((item, index) => ({
        ...item,
        position: index + 1,
      }));

    if (remaining.length > 0) {
      const { error: reorderError } =
        await supabase.rpc(
          "reorder_profile_favorites",
          {
            favorite_ids: remaining.map(
              (item) => item.favoriteId
            ),
          }
        );

      if (reorderError) {
        console.error(
          "Failed to reorder remaining favorites:",
          reorderError
        );

        await loadFavorites();
        return;
      }
    }

    setFavorites(remaining);
  }

  async function reorderFavorites(
    reorderedFavorites
  ) {
    if (!user || reorderedFavorites.length === 0) {
      return;
    }

    const favoriteIds =
      reorderedFavorites.map(
        (favorite) => favorite.favoriteId
      );

    const { error } = await supabase.rpc(
      "reorder_profile_favorites",
      {
        favorite_ids: favoriteIds,
      }
    );

    if (error) {
      console.error(
        "Failed to reorder favorites:",
        error
      );

      await loadFavorites();
      return;
    }

    const updatedFavorites =
      reorderedFavorites.map(
        (favorite, index) => ({
          ...favorite,
          position: index + 1,
        })
      );

    setFavorites(updatedFavorites);
  }

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    reorderFavorites,
    refreshFavorites: loadFavorites,
  };
}