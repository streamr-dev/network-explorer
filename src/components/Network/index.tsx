import React, { useEffect, useMemo } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useController } from '../../contexts/Controller'
import TopologyList from './TopologyList'
import envs from '../../utils/envs'
import { ActiveRoute, ConnectionsMode } from '../../types'
import { useStore } from '../../hooks/useStore'

const NodeConnectionsLoader = () => {
  const { showConnections: connectionMode } = useStore()

  const { loadTopology, resetTopology } = useController()

  const showConnections = !!(connectionMode === ConnectionsMode.Always)

  useEffect(() => {
    loadTopology({
      showConnections,
    })

    return () => {
      resetTopology()
    }
  }, [loadTopology, resetTopology, showConnections])

  return null
}

type NodeProps = {
  id: string
}

const ActiveRouteSetter = () => {
  const { setActiveRoute } = useStore()

  useEffect(() => {
    setActiveRoute(ActiveRoute.Network)
  }, [setActiveRoute])

  return null
}

const ActiveNodeSetter = ({ id }: NodeProps) => {
  const { setActiveNodeId } = useStore()

  useEffect(() => {
    setActiveNodeId(id)

    return () => setActiveNodeId(undefined)
  }, [id, setActiveNodeId])

  return null
}

const envSet = new Set(Object.keys(envs))

type EnvProps = {
  env: string
}

const NetworkSetter = ({ env: nextEnv }: EnvProps) => {
  const { env } = useStore()
  const { changeEnv } = useController()
  const navigate = useNavigate()

  useEffect(() => {
    if (!!nextEnv && nextEnv !== env && envSet.has(nextEnv)) {
      changeEnv(nextEnv)
    }

    navigate('/', { replace: true })
  }, [nextEnv, env, navigate, changeEnv])

  return null
}

export function Network() {
  const { nodeId: encodedNodeId = '' } = useParams<{ nodeId: string }>()

  const nodeId = useMemo(() => decodeURIComponent(encodedNodeId), [encodedNodeId])

  const { search } = useLocation()
  const queryParams = new URLSearchParams(search)
  const nextEnv = queryParams.get('network')

  if (nextEnv) {
    return <NetworkSetter env={nextEnv} />
  }

  return (
    <>
      <ActiveRouteSetter />
      <NodeConnectionsLoader />
      <ActiveNodeSetter id={nodeId} />
      {!!nodeId && <TopologyList id={nodeId} key={nodeId} />}
    </>
  )
}
