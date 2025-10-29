import Image from 'next/image'

export default function DiaryPage() {
    return (
        <div>
            <a href="https://google.com"><Image
                src="/images/image.png"
                alt=""
                width={100}
                height={100} />
            </a>
        </div>
    )
}
