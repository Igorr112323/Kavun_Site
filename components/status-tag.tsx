import { CONDITION_LABEL, STATUS_LABEL, cn } from '@/lib/utils'
import type { Condition, EquipmentStatus } from '@/lib/types'

const statusClass: Record<EquipmentStatus, string> = {
  in_stock: 'tag--stock',
  in_transit: 'tag--transit',
  on_order: 'tag--order',
  reserved: 'tag--reserved',
  sold: 'tag--sold',
}

export function StatusTag({ status, className }: { status: EquipmentStatus; className?: string }) {
  return <span className={cn('tag', statusClass[status], className)}>{STATUS_LABEL[status]}</span>
}

export function ConditionTag({ condition }: { condition: Condition }) {
  return <span className={cn('tag', condition === 'used' ? 'tag--order' : 'tag--checked')}>{condition === 'used' ? 'Б/У' : 'Новое'}</span>
}
