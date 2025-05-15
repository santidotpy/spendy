import { createClient } from "@supabase/supabase-js";
import { env } from "~/env";
import { mediaBuckets } from "~/lib/supabase";

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_KEY);
console.log("supabase", env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_KEY);

const createIfNotExists = async (bucketName: string) => {
  console.log("bucketName", bucketName);
  const { data, error } = await supabase.storage.getBucket(bucketName);
  if (error || !data) {
    console.log(`Creating bucket: ${bucketName}`);
    await supabase.storage.createBucket(bucketName);
  } else {
    console.log(`Bucket ${bucketName} already exists.`);
  }
};

Object.entries(mediaBuckets).forEach(([_, bucketName]) => {
  void createIfNotExists(bucketName);
});