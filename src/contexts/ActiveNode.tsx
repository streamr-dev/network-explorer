import React, { ReactNode, createContext, useContext, useMemo } from 'react'
import { OperatorNode } from '../types'
import { useNodesQuery } from '../utils'
import { useParams } from 'react-router-dom'

const ActiveNodeContext = createContext<OperatorNode | null>(null)

export function useActiveNode() {
  return useContext(ActiveNodeContext)
}

interface ActiveContextProviderProps {
  children?: ReactNode
}

export function ActiveContextProvider(props: ActiveContextProviderProps) {
  const { data: nodes } = useNodesQuery({})

  const { nodeId: activeNodeId = null } = useParams<{ nodeId: string }>()

  const value = useMemo(
    function findActiveNodeById() {
      if (!nodes || !activeNodeId) {
        return null
      }

      return nodes.find(({ id }) => id === activeNodeId) || null
    },
    [activeNodeId, nodes],
  )

  return <ActiveNodeContext.Provider {...props} value={value} />
}
