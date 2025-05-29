import type React from "react"

interface DefaultAvatarProps {
  size?: number
  className?: string
}

const DefaultAvatar: React.FC<DefaultAvatarProps> = ({ size = 112, className = "" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 112 112"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Círculo de fondo */}
      <circle cx="56" cy="56" r="56" fill="#E5E7EB" />

      {/* Silueta de persona */}
      <path
        d="M56 56C63.732 56 70 49.732 70 42C70 34.268 63.732 28 56 28C48.268 28 42 34.268 42 42C42 49.732 48.268 56 56 56Z"
        fill="#9CA3AF"
      />

      <path
        d="M28 84C28 70.745 38.745 60 52 60H60C73.255 60 84 70.745 84 84V88C84 90.209 82.209 92 80 92H32C29.791 92 28 90.209 28 88V84Z"
        fill="#9CA3AF"
      />
    </svg>
  )
}

export default DefaultAvatar