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
  switch (status) {
    case 'confirmed':
    case 'completed':
    case 'sent':
      return 'badge-green'
    case 'reserved':
    case 'pending':
    case 'pending_payment':
    case 'queued':
      return 'badge-amber'
    case 'failed':
    case 'cancelled':
      return 'badge-red'
    default:
      return 'badge-slate'
  }
}
