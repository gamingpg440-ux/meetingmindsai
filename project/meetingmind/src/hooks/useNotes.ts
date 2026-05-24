import { supabase } from "../lib/supabase";
import groq from "../lib/groq";
import type { Note } from "../types";
import { useAuthContext } from "../context/useAuthContext";

interface SummaryResult {
  title: string;
  summary: string;
  action_items: string[];
}

export function useNotes() {
  const { user } = useAuthContext();

  const saveNote = async (transcript: string): Promise<Note> => {
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("notes")
      .insert({
        user_id: user.id,
        raw_transcript: transcript,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const getAllNotes = async (): Promise<Note[]> => {
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  };

  const getNoteById = async (id: string): Promise<Note | null> => {
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data;
  };

  const updateNote = async (
    id: string,
    updates: Partial<Note>,
  ): Promise<Note> => {
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("notes")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteNote = async (id: string): Promise<void> => {
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;
  };

  const summariseTranscript = async (
    transcript: string,
  ): Promise<SummaryResult> => {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1000,
      messages: [
        {
          role: "system",
          content:
            "You are a meeting notes assistant. Analyse the transcript and return ONLY a valid JSON object (no markdown, no preamble) with three fields: title (string, short meeting title), summary (string, 2-3 sentence summary of key points), action_items (array of strings, each item is a concrete task mentioned)",
        },
        { role: "user", content: transcript },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("No response from AI");

    try {
      return JSON.parse(content);
    } catch {
      throw new Error("Failed to parse AI response");
    }
  };

  return {
    saveNote,
    getAllNotes,
    getNoteById,
    updateNote,
    deleteNote,
    summariseTranscript,
  };
}
