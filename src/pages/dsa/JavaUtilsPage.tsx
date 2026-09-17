import data from '../../content/generated/dsa-utils-java.json'
import type { UtilsToolkit } from '../../content/types'
import UtilsPage from './UtilsPage'

export default function JavaUtilsPage() {
  return <UtilsPage toolkit={data as UtilsToolkit} />
}
