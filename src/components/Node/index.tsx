import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useStore } from '../../contexts/Store'
import { useController } from '../../contexts/Controller'
import TopologyList from './TopologyList'

const NodeConnectionsLoader = () => {
  const { loadTopology, resetTopology } = useController()

  useEffect(() => {
    loadTopology()

    return () => {
      resetTopology()
    }
  }, [loadTopology, resetTopology])

  return null
}

type NodeProps = {
  id: string,
}

const SearchTextSetter = () => {
  const {
    updateSearch: updateSearchText,
    activeNode,
  } = useStore()

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

interface ParamTypes {
  nodeId: string,
}

export default () => {
  const { nodeId } = useParams<ParamTypes>()
  const { nodes } = useStore()

  if (!nodes || nodes.length < 1) {
    return null
  }

  return (
    <>
      <SearchTextSetter />
      <NodeConnectionsLoader />
      <ActiveNodeSetter id={nodeId} />
      {!!nodeId && (
        <TopologyList id={nodeId} />
      )}
    </>
  )
}
