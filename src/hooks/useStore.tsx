/**
 * @todo It's a placeholder. Remove it once we get the build back
 * on its feet.
 */

import { ActiveRoute, ActiveView, ConnectionsMode, OperatorNode, Stream, Topology } from '../types'

const activeNode: OperatorNode | undefined = undefined

const activeRoute = ActiveRoute.Network as ActiveRoute

const activeView = ActiveView.Map as ActiveView

function setActiveView(..._: any[]) {}

const env = 'mainnet'

const showConnections = ConnectionsMode.Auto as ConnectionsMode

const streamId: string | undefined = undefined

const topology: Topology = {}

const visibleNodes: OperatorNode[] = []

function toggleShowConnections() {}

const store = {}

const nodes: OperatorNode[] = []

function updateLocations(..._: any[]) {}

function setTrackers(..._: any[]) {}

function setNodes(..._: any[]) {}

function setTopology(..._: any[]) {}

function setStream(..._: any[]) {}

function resetStore(..._: any[]) {}

function setActiveRoute(..._: any[]) {}

function setActiveNodeId(..._: any[]) {}

const stream: Stream | undefined = undefined

export function useStore() {
  return {
    stream,
    activeNode,
    activeRoute,
    activeView,
    env,
    nodes,
    resetStore,
    setActiveNodeId,
    setActiveRoute,
    setActiveView,
    setNodes,
    setStream,
    setTopology,
    setTrackers,
    showConnections,
    store,
    streamId,
    toggleShowConnections,
    topology,
    updateLocations,
    visibleNodes,
  }
}
