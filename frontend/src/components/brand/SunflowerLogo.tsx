import { useId } from 'react'

/**
 * Logo do Sistema Girassol (girassol estilizado dos wireframes): pétalas
 * amarelas em volta de um miolo marrom. SVG puro para escalar sem perda e
 * herdar as cores da identidade.
 */
export function SunflowerLogo({ size = 96, title = 'Sistema Girassol' }: { size?: number; title?: string }) {
  const PETALS = 16
  const PETAL = '#F2B705'
  const PETAL_EDGE = '#E0A100'
  const CENTER = '#5B3A21'
  const HALO = '#FFFFFF'
  const glowId = `sunflower-center-glow-${useId()}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <defs>
        <filter id={glowId} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      <g transform="translate(50 50)">
        {/* Halo branco (fiel ao wireframe): cópia maior de cada pétala/miolo
            desenhada atrás das formas reais, sobrando como contorno — destaca
            o girassol mesmo sobre o fundo amarelo do header. */}
        {Array.from({ length: PETALS }).map((_, i) => (
          <ellipse
            key={`halo-${i}`}
            cx="0"
            cy="-30"
            rx="9"
            ry="18.5"
            fill={HALO}
            transform={`rotate(${(360 / PETALS) * i})`}
          />
        ))}
        <circle cx="0" cy="0" r="20.5" fill={HALO} />

        {Array.from({ length: PETALS }).map((_, i) => (
          <ellipse
            key={i}
            cx="0"
            cy="-30"
            rx="7"
            ry="16"
            fill={PETAL}
            stroke={PETAL_EDGE}
            strokeWidth="1"
            transform={`rotate(${(360 / PETALS) * i})`}
          />
        ))}

        {/* Glow branco atrás do miolo, suavizado por blur — destaca o centro. */}
        <circle cx="0" cy="0" r="20" fill={HALO} filter={`url(#${glowId})`} />
        <circle cx="0" cy="0" r="18" fill={CENTER} />
      </g>
    </svg>
  )
}
