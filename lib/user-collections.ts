import { createClient } from "@/lib/supabase/server";

export type UserCollection = {
  id: string;
  title: string;
  skillIds: string[];
  createdAt: string;
  updatedAt: string;
};

type UserCollectionRow = {
  id: string;
  title: string;
  skill_ids: string[] | null;
  created_at: string;
  updated_at: string;
};

function normalizeCollection(row: UserCollectionRow): UserCollection {
  return {
    id: row.id,
    title: row.title,
    skillIds: Array.isArray(row.skill_ids) ? row.skill_ids : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getAuthedUser() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return { supabase, user: data.user };
}

export async function readUserCollections() {
  const { supabase, user } = await getAuthedUser();

  if (!user) {
    return { user: null, collections: [] as UserCollection[] };
  }

  const { data, error } = await supabase
    .from("user_collections")
    .select("id,title,skill_ids,created_at,updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return {
    user,
    collections: (data ?? []).map((row) => normalizeCollection(row as UserCollectionRow)),
  };
}

export async function createUserCollection(input: { title: string; skillIds?: string[] }) {
  const { supabase, user } = await getAuthedUser();

  if (!user) {
    return { user: null, collection: null as UserCollection | null };
  }

  const { data, error } = await supabase
    .from("user_collections")
    .insert({
      user_id: user.id,
      title: input.title.trim(),
      skill_ids: input.skillIds ?? [],
    })
    .select("id,title,skill_ids,created_at,updated_at")
    .single();

  if (error) {
    throw error;
  }

  return {
    user,
    collection: normalizeCollection(data as UserCollectionRow),
  };
}