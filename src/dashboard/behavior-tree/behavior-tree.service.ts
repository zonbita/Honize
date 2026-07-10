import { Injectable } from '@nestjs/common';
import {
  BehaviorContext,
  BehaviorNode,
  BehaviorNodeResult,
  NodeStatus,
  defaultContext,
} from './behavior-tree.types';
import {
  behaviorAdvantages,
  behaviorApplications,
  behaviorLegend,
  behaviorLimitations,
  behaviorUseCases,
  dashboardBehaviorTree,
  nodeStatuses,
} from './behavior-tree.data';

@Injectable()
export class BehaviorTreeService {
  getAnalysisPage(context: Partial<BehaviorContext> = {}) {
    const ctx: BehaviorContext = { ...defaultContext, ...context };
    const treeResult = this.runTree(dashboardBehaviorTree, ctx);
    const flatNodes = this.flattenTree(treeResult);

    return {
      layout: 'dashboard',
      pageTitle: 'Phân tích Behavior Tree',
      activeNav: 'overview',
      behaviorContext: ctx,
      treeResult,
      flatNodes,
      legend: behaviorLegend,
      nodeStatuses,
      applications: behaviorApplications,
      advantages: behaviorAdvantages,
      limitations: behaviorLimitations,
      useCases: behaviorUseCases,
    };
  }

  flattenTree(
    node: BehaviorNodeResult,
    depth = 0,
  ): Array<BehaviorNodeResult & { depth: number }> {
    const rows: Array<BehaviorNodeResult & { depth: number }> = [
      { ...node, depth },
    ];
    for (const child of node.children ?? []) {
      rows.push(...this.flattenTree(child, depth + 1));
    }
    return rows;
  }

  runTree(node: BehaviorNode, ctx: BehaviorContext): BehaviorNodeResult {
    const children = node.children ?? [];
    let status: NodeStatus = 'idle';
    let message: string | undefined;
    let childResults: BehaviorNodeResult[] | undefined;

    switch (node.type) {
      case 'root':
      case 'sequence': {
        childResults = [];
        status = 'success';
        for (const child of children) {
          const result = this.runTree(child, ctx);
          childResults.push(result);
          if (result.status === 'failure') {
            status = 'failure';
            break;
          }
          if (result.status === 'running') status = 'running';
        }
        break;
      }
      case 'selector': {
        childResults = children.map((child) => this.runTree(child, ctx));
        const successChild = childResults.find((r) => r.status === 'success');
        status = successChild ? 'success' : 'failure';
        break;
      }
      case 'condition': {
        const passed = node.evaluate?.(ctx) ?? false;
        status = passed ? 'success' : 'failure';
        message = passed ? 'Điều kiện đạt' : 'Điều kiện chưa đạt';
        break;
      }
      case 'action': {
        if (node.evaluate && !node.evaluate(ctx)) {
          status = 'failure';
          message = 'Không áp dụng cho trạng thái hiện tại';
        } else {
          status = 'success';
          message = node.action?.(ctx);
        }
        break;
      }
    }

    return {
      id: node.id,
      label: node.label,
      type: node.type,
      status,
      message,
      children: childResults,
    };
  }
}
