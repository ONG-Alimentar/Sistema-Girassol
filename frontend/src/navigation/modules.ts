import type { SvgIconComponent } from '@mui/icons-material'
import Groups from '@mui/icons-material/Groups'
import ShoppingBasket from '@mui/icons-material/ShoppingBasket'
import Checkroom from '@mui/icons-material/Checkroom'
import EventNote from '@mui/icons-material/EventNote'
import Gavel from '@mui/icons-material/Gavel'
import Psychology from '@mui/icons-material/Psychology'
import Description from '@mui/icons-material/Description'
import VolunteerActivism from '@mui/icons-material/VolunteerActivism'
import ManageAccounts from '@mui/icons-material/ManageAccounts'
import type { Permission } from '../auth/permissions.ts'

export interface ModuleDef {
  /** Segmento da rota, relativo ao layout autenticado (ex.: 'familias'). */
  path: string
  /** Rótulo exibido no menu/drawer e nos cards da home. */
  label: string
  /** Permissão exigida; o módulo só aparece/navega para quem a possui. */
  permission: Permission
  /** Ícone (MUI) usado no drawer e nos cards de atalho. */
  icon: SvgIconComponent
}

/**
 * Fonte única dos módulos do app, consumida pelas rotas (AppRoutes),
 * pelo drawer (AppLayout) e pela grade de atalhos (DashboardPage).
 *
 * Jurídico e Psicológico ficam SEPARADOS de propósito: o RBAC isola esses
 * atendimentos (LGPD), então cada um só aparece para quem tem a permissão.
 * "Usuários" usa CONTA:CREATE — o único código do catálogo ligado a conta/admin
 * (ver docs/seguranca/rbac.md). PROJETO/FINANCEIRO ficam fora deste menu.
 */
export const MODULES: ModuleDef[] = [
  { path: 'familias', label: 'Famílias', permission: 'FAMILIA:READ', icon: Groups },
  { path: 'cestas', label: 'Cestas básicas', permission: 'CESTA:READ', icon: ShoppingBasket },
  { path: 'roupas', label: 'Doação de roupas', permission: 'ROUPA:READ', icon: Checkroom },
  { path: 'visitas', label: 'Registro de visitas', permission: 'VISITA:READ', icon: EventNote },
  { path: 'juridico', label: 'Jurídico', permission: 'JURIDICO:READ', icon: Gavel },
  { path: 'psicologico', label: 'Psicológico', permission: 'PSICOLOGICO:READ', icon: Psychology },
  { path: 'documentacao', label: 'Documentação', permission: 'DOCUMENTACAO:READ', icon: Description },
  { path: 'voluntarios', label: 'Equipe de voluntários', permission: 'VOL_EXTERNO:READ', icon: VolunteerActivism },
  { path: 'usuarios', label: 'Usuários', permission: 'CONTA:CREATE', icon: ManageAccounts },
]
