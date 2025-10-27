import { signIn } from "@/auth"
 
export default function LoginPage() {
  return (
    <div>
      <h1>Famottoにログイン</h1>
      <form
        action={async () => {
          "use server"
          await signIn("google")
        }}
      >
        <button type="submit">
          Google でサインイン
        </button>
      </form>
    </div>
  )
}
