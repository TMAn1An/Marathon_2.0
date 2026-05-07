export function formatCurrency(value, currency = 'BDT') {
  const number = Number(value)
  if (Number.isNaN(number)) return value
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(number)
}

export function formatDate(value, opts = { dateStyle: 'medium' }) {
  if (!value) return '—'
  try {
    return new Intl.DateTimeFormat('en-GB', opts).format(new Date(value))
  } catch {
    return value
  }
}

export function formatDateTime(value) {
  return formatDate(value, { dateStyle: 'medium', timeStyle: 'short' })
}

export function statusBadgeClass(status) {
  const base = 'pill '
  switch (status) {
    case 'confirmed':
    case 'completed':
    case 'sent':
      return base + 'bg-emerald-100 text-emerald-800'
    case 'reserved':
    case 'pending':
    case 'pending_payment':
    case 'queued':
      return base + 'bg-amber-100 text-amber-800'
    case 'failed':
    case 'cancelled':
      return base + 'bg-rose-100 text-rose-700'
    default:
      return base + 'bg-ink-100 text-ink-700'
  }
}
