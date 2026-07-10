export type NodeStatus = 'success' | 'failure' | 'running' | 'idle';
export type NodeType = 'root' | 'selector' | 'sequence' | 'condition' | 'action';

export interface BehaviorContext {
  hasArticlesToProcess: boolean;
  articleStatus: 'draft' | 'published' | 'scheduled' | null;
  hasEnoughContent: boolean;
  seoScoreReached: boolean;
  hasUrlToOptimize: boolean;
  slugValid: boolean;
  metaComplete: boolean;
  indexRedirectOk: boolean;
}

export interface BehaviorNodeResult {
  id: string;
  label: string;
  type: NodeType;
  status: NodeStatus;
  message?: string;
  children?: BehaviorNodeResult[];
}

export interface BehaviorNode {
  id: string;
  label: string;
  type: NodeType;
  children?: BehaviorNode[];
  evaluate?: (ctx: BehaviorContext) => boolean;
  action?: (ctx: BehaviorContext) => string;
}

export const defaultContext: BehaviorContext = {
  hasArticlesToProcess: true,
  articleStatus: 'draft',
  hasEnoughContent: true,
  seoScoreReached: false,
  hasUrlToOptimize: true,
  slugValid: true,
  metaComplete: false,
  indexRedirectOk: true,
};
