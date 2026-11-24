import type { ComponentType } from 'react'
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
import Badge from '@mui/icons-material/Badge'
import Key from '@mui/icons-material/Key'
import type { Permission } from '../auth/permissions.ts'
import { FamiliasPage } from '../pages/familias/FamiliasPage'
import { CestasPage } from '../pages/cestas/CestasPage'
import { RoupasPage } from '../pages/roupas/RoupasPage'
import { UsuariosPage } from '../pages/admin/UsuariosPage'
import { CargosPage } from '../pages/admin/CargosPage'
import { PermissoesPage } from '../pages/admin/PermissoesPage'

export interface ModuleDef {
  path: string
  label: string
  permission: Permission
  icon: SvgIconComponent
  component?: ComponentType
}

export const MODULES: ModuleDef[] = [
  { path: 'familias', label: 'Famílias', permission: 'FAMILIA:READ', icon: Groups, component: FamiliasPage },
  { path: 'cestas', label: 'Cestas básicas', permission: 'CESTA:READ', icon: ShoppingBasket, component: CestasPage },
  { path: 'roupas', label: 'Doação de roupas', permission: 'ROUPA:READ', icon: Checkroom, component: RoupasPage },
  { path: 'visitas', label: 'Registro de visitas', permission: 'VISITA:READ', icon: EventNote },
  { path: 'juridico', label: 'Jurídico', permission: 'JURIDICO:READ', icon: Gavel },
  { path: 'psicologico', label: 'Psicológico', permission: 'PSICOLOGICO:READ', icon: Psychology },
  { path: 'documentacao', label: 'Documentação', permission: 'DOCUMENTACAO:READ', icon: Description },
  { path: 'voluntarios', label: 'Equipe de voluntários', permission: 'VOL_EXTERNO:READ', icon: VolunteerActivism },
  { path: 'admin/usuarios', label: 'Usuários', permission: 'USUARIO:READ', icon: ManageAccounts, component: UsuariosPage },
  { path: 'admin/cargos', label: 'Cargos', permission: 'CARGO:READ', icon: Badge, component: CargosPage },
  { path: 'admin/permissoes', label: 'Permissões', permission: 'PERMISSAO:READ', icon: Key, component: PermissoesPage },
]
