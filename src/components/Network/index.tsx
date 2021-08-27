import React, { useEffect, useMemo } from 'react'
import { useParams, useHistory, useLocation } from 'react-router-dom'

import { useStore } from '../../contexts/Store'
import { useController } from '../../contexts/Controller'
import TopologyList from './TopologyList'
import envs from '../../utils/envs'

const NodeConnectionsLoader = () => {
  const { showConnections: connectionMode } = useStore()
  const { loadTopology, resetTopology } = useController()

  const showConnections = !!(connectionMode === 'always')

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

const SearchTextSetter = () => {
  const { updateSearch: updateSearchText, activeNode } = useStore()

  const activeNodeTitle = activeNode && activeNode.title

  useEffect(() => {
    updateSearchText(activeNodeTitle || '')
  }, [updateSearchText, activeNodeTitle])

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

const envSet = new Set((Object.keys(envs)))

type EnvProps = {
  env: string
}

const NetworkSetter = ({ env: nextEnv }: EnvProps) => {
  const { env } = useStore()
  const { changeEnv } = useController()
  const history = useHistory()

  useEffect(() => {
    if (!!nextEnv && nextEnv !== env && envSet.has(nextEnv)) {
      changeEnv(nextEnv)
    }

    history.replace('/')
  }, [nextEnv, env, history, changeEnv])

  return null
}

interface ParamTypes {
  nodeId: string
}

export default () => {
  const { nodeId: encodedNodeId } = useParams<ParamTypes>()
  const nodeId = useMemo(() => decodeURIComponent(encodedNodeId), [encodedNodeId])

  const { search } = useLocation()
  const queryParams = new URLSearchParams(search)
  const nextEnv = queryParams.get('network')

  if (nextEnv) {
    return (
      <NetworkSetter env={nextEnv} />
    )
  }

  return (
    <>
      <SearchTextSetter />
      <NodeConnectionsLoader />
      <ActiveNodeSetter id={nodeId} />
      {!!nodeId && <TopologyList id={nodeId} />}
    </>
  )
}
