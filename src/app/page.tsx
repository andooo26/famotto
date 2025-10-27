import { auth, signOut } from "@/auth"
 
export default async function HomePage() {
  const session = await auth()
  
  return (
    <div>
      <h1>Famotto へようこそ！</h1>
      
      {session?.user && (
        <div>
          <p>ログイン成功</p>
        </div>
      )}
      
      <form
        action={async () => {
          "use server"
          await signOut()
        }}
      >
        <button type="submit">
          ログアウト
        </button>
      </form>
    </div>
  )
} 
