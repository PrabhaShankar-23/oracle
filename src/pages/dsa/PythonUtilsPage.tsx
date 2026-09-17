import data from '../../content/generated/dsa-utils-python.json'
import type { UtilsToolkit } from '../../content/types'
import UtilsPage from './UtilsPage'

export default function PythonUtilsPage() {
  return <UtilsPage toolkit={data as UtilsToolkit} />
}
