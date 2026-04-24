export const RESOURCEOS_ROLES = {
  admin: "admin",
  executive: "executive",
  operationsController: "operations_controller",
  fieldAgent: "field_agent",
  commercialSourcing: "commercial_sourcing",
  finance: "finance",
} as const;

export type ResourceOSRole =
  (typeof RESOURCEOS_ROLES)[keyof typeof RESOURCEOS_ROLES];

export type RoleAccess = {
  canViewExecutiveDashboard: boolean;
  canViewCommercial: boolean;
  canViewOperations: boolean;
  canViewFieldTasks: boolean;
  canViewFinance: boolean;
  canViewAdmin: boolean;
  canApprove: boolean;
  canUploadEvidence: boolean;
};

export function getRoleAccess(roleKey?: string | null): RoleAccess {
  switch (roleKey) {
    case RESOURCEOS_ROLES.admin:
      return {
        canViewExecutiveDashboard: true,
        canViewCommercial: true,
        canViewOperations: true,
        canViewFieldTasks: true,
        canViewFinance: true,
        canViewAdmin: true,
        canApprove: true,
        canUploadEvidence: true,
      };

    case RESOURCEOS_ROLES.executive:
      return {
        canViewExecutiveDashboard: true,
        canViewCommercial: true,
        canViewOperations: true,
        canViewFieldTasks: true,
        canViewFinance: true,
        canViewAdmin: false,
        canApprove: true,
        canUploadEvidence: true,
      };

    case RESOURCEOS_ROLES.operationsController:
      return {
        canViewExecutiveDashboard: false,
        canViewCommercial: false,
        canViewOperations: true,
        canViewFieldTasks: true,
        canViewFinance: false,
        canViewAdmin: false,
        canApprove: true,
        canUploadEvidence: true,
      };

    case RESOURCEOS_ROLES.fieldAgent:
      return {
        canViewExecutiveDashboard: false,
        canViewCommercial: false,
        canViewOperations: false,
        canViewFieldTasks: true,
        canViewFinance: false,
        canViewAdmin: false,
        canApprove: false,
        canUploadEvidence: true,
      };

    case RESOURCEOS_ROLES.commercialSourcing:
      return {
        canViewExecutiveDashboard: false,
        canViewCommercial: true,
        canViewOperations: false,
        canViewFieldTasks: false,
        canViewFinance: false,
        canViewAdmin: false,
        canApprove: false,
        canUploadEvidence: true,
      };

    case RESOURCEOS_ROLES.finance:
      return {
        canViewExecutiveDashboard: false,
        canViewCommercial: false,
        canViewOperations: false,
        canViewFieldTasks: false,
        canViewFinance: true,
        canViewAdmin: false,
        canApprove: true,
        canUploadEvidence: true,
      };

    default:
      return {
        canViewExecutiveDashboard: false,
        canViewCommercial: false,
        canViewOperations: false,
        canViewFieldTasks: false,
        canViewFinance: false,
        canViewAdmin: false,
        canApprove: false,
        canUploadEvidence: false,
      };
  }
}

export function roleCanAccessPath(roleKey: string | null | undefined, pathname: string) {
  const access = getRoleAccess(roleKey);

  if (pathname.startsWith("/admin")) return access.canViewAdmin;
  if (pathname.startsWith("/field")) return access.canViewFieldTasks;
  if (pathname.startsWith("/finance-handoff")) return access.canViewFinance || access.canViewExecutiveDashboard;
  if (pathname.startsWith("/approval-queue")) return access.canApprove || access.canViewExecutiveDashboard;
  if (pathname.startsWith("/opportunity-intake")) return access.canViewCommercial || access.canViewExecutiveDashboard;
  if (pathname.startsWith("/route-economics")) return access.canViewCommercial || access.canViewExecutiveDashboard;
  if (pathname.startsWith("/dispatch-control")) return access.canViewOperations || access.canViewExecutiveDashboard;
  if (pathname.startsWith("/reconciliation")) return access.canViewOperations || access.canViewFinance || access.canViewExecutiveDashboard;
  if (pathname.startsWith("/execution-readiness")) return access.canViewOperations || access.canViewExecutiveDashboard;
  if (pathname.startsWith("/exceptions")) return access.canViewOperations || access.canViewFinance || access.canViewExecutiveDashboard;
  if (pathname.startsWith("/golden-path")) return access.canViewExecutiveDashboard || access.canViewOperations;

  return true;
  }
