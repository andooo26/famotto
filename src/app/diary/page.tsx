import Image from 'next/image'

export default function DiaryPage() {
    return (
        <div>
            <a href="https://google.com"/*設定画面へ*/><Image
                src="/images/image.png"
                alt=""
                width={100}
                height={100} />
            </a>
            <h1 className="text-red-500">Fammoto</h1>
        </div>
    )
}