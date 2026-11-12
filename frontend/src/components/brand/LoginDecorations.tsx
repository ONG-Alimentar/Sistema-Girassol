import { Box } from '@mui/material'

/**
 * Camada decorativa do fundo da tela de login (wireframe Login.png): pétalas de
 * girassol surgindo no canto inferior-direito + uma "colina" marrom na base.
 * Puramente estética — fica atrás do conteúdo (zIndex 0), não captura cliques e
 * é escondida de leitores de tela.
 */
const PETAL = '#F2B705'
const PETAL_EDGE = '#E0A100'
const BROWN = '#5B3A21'

export function LoginDecorations() {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {/* Pétalas no canto inferior-direito (metade visível, como no wireframe) */}
      <Box
        component="svg"
        viewBox="0 0 160 160"
        sx={{ position: 'absolute', right: -24, bottom: 96, width: 180, height: 180 }}
      >
        <g transform="translate(110 110)">
          {Array.from({ length: 12 }).map((_, i) => (
            <ellipse
              key={i}
              cx="0"
              cy="-34"
              rx="8"
              ry="18"
              fill={PETAL}
              stroke={PETAL_EDGE}
              strokeWidth="1"
              transform={`rotate(${(360 / 12) * i})`}
            />
          ))}
          <circle cx="0" cy="0" r="20" fill={BROWN} />
        </g>
      </Box>

      {/* Colina marrom na base, ocupando toda a largura */}
      <Box
        component="svg"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height: 180 }}
      >
        <path
          d="M0,120 C300,60 560,150 820,100 C1080,50 1300,110 1440,80 L1440,220 L0,220 Z"
          fill={BROWN}
        />
      </Box>
    </Box>
  )
}
