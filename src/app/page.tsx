import { auth, signOut } from "@/auth"
import Link from 'next/link'
import Image from "next/image";
export default async function HomePage() {
  const session = await auth()

  return (
    <div>
      <div>
        <h1>Famotto</h1>
      </div>
      <div className="diary">
      </div>
      <div>

      </div>
    </div>

  )
} 
