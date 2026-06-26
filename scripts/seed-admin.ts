import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"
import * as dotenv from "dotenv"
import { resolve } from "path"

dotenv.config({ path: resolve(__dirname, "../.env.local") })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function main() {
  const email    = "admin@mediship.com"
  const username = "superadmin"
  const password = "Admin@12345"
  const fullName = "Platform Super Admin"

  const passwordHash = await bcrypt.hash(password, 12)

  // Upsert so re-running is safe
  const { data, error } = await supabase
    .from("users")
    .upsert(
      {
        username,
        email,
        password_hash: passwordHash,
        full_name: fullName,
        platform_role: "platform_super_admin",
        company_id: null,
        role: null,
        is_active: true,
      },
      { onConflict: "email" }
    )
    .select("id, email, username, platform_role")
    .single()

  if (error) {
    console.error("Error seeding admin:", error.message)
    process.exit(1)
  }

  console.log("✓ Platform admin seeded:")
  console.log(`  Email:    ${data.email}`)
  console.log(`  Username: ${data.username}`)
  console.log(`  Password: ${password}`)
  console.log(`  Role:     ${data.platform_role}`)
}

main()
