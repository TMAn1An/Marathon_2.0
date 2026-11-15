import { usePageTitle } from '../hooks/usePageTitle'

/** Route wrapper that sets the document title. */
export default function Page({ title, children }) {
  usePageTitle(title)
  return children
}
