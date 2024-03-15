/**
 * @todo It's a placeholder. Remove it once we get the build back
 * on its feet.
 */

import { ActiveView, ConnectionsMode, Topology } from '../contexts/Store'
import { OperatorNode } from '../types'

const activeNode: OperatorNode | undefined = undefined

const activeView = ActiveView.Map as ActiveView

const env = 'mainnet'

const showConnections = ConnectionsMode.Always as ConnectionsMode

const streamId: string | undefined = undefined

const topology: Topology = {}

const visibleNodes: OperatorNode[] = []

function toggleShowConnections() {}

const store = {}

export function useStore() {
  return {
    activeNode,
    activeView,
    env,
    showConnections,
    store,
    streamId,
    toggleShowConnections,
    topology,
    visibleNodes,
  }
}
