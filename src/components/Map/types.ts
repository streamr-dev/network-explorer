import Supercluster from 'supercluster'

export type NodeId = number

export type NodeProperties = {
  nodeId: NodeId,
  cluster: boolean,
  cluster_id?: number,
  point_count: number,
  point_count_abbreviated: string,
}

export type SuperClusterType = Supercluster<NodeProperties, Supercluster.AnyProps>

export type ClusterPointFeature =
  | Supercluster.PointFeature<NodeProperties>
  | Supercluster.PointFeature<Supercluster.ClusterProperties & Supercluster.AnyProps>

export type NodeConnection = [NodeId, NodeId]

export type ClusterConnection = {
  sourceId: string | number | undefined,
  targetId: string | number | undefined,
  source: [number, number]
  target: [number, number]
}
