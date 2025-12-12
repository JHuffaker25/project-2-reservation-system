import { Spinner } from "@/components/ui/spinner"

export default function Loader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center h-screen bg-force-dark/40">
      <Spinner className="size-8" />
    </div>
  )
}
