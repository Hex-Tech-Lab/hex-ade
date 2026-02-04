import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const databaseUrl = process.env.DATABASE_URL!;

// Supabase client for client-side/edge operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Drizzle client for server-side operations
const queryClient = postgres(databaseUrl);
export const db = drizzle(queryClient, { schema });
