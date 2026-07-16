export interface ProjectFormData {
  BranchId: string;

  ConstructionContractor: string;
  AirConditioningContractor: string;
  ElecNetCamContractor: string;
  InteriorContractor: string;

  BookId: string;
  BranchName: string;

  ProjType: string;
  loaiCongTrinhKhac?: string;

  BankName: string;
  tenNganHangKhac?: string;

  Region: string;
  regionKhac?: string;

  UnitType: string;
  loaiHinhDonViKhac?: string;

  Area: string;
  areaKhac?: string;

  Budget: number | null;

  Waers: string;

  PlanStart: string;
  PlanType: string;

  Step?: number;

  planTypeKhac?: string;
  Status?: string;
}

export interface ErrorCustom {
  error: {
    message: {
      value: string;
    };
  };
}

export interface ContractorData {
  nhaThauXayDung: string;
  nhaThauDieuHoa: string;
  nhaThauDienMang: string;
  nhaThauNoiThat: string;
}

export interface FieldValueHelpItem {
  FieldKey: string;
  FieldValue: string;
  FieldName: string;
}

export interface DetailRouteArgs {
  workItemId?: string;
  branchId: string;
  departmentId?: string;
}

export interface WorkflowHistoryItem {
  approverName: string;
  comment: string;
  timestamp: string;
  action: string;
}

export interface WorkflowData {
  userRole?: string;
  history?: WorkflowHistoryItem[];
  workItemId?: string;
  status?: string | null;
}

export interface EmployeeAssignPayload {
  BranchId: string;
  RoleType: string;
  EmployeeId: string;
  EmployeeName?: string;
  Email?: string;
}

export interface ApprovalHistoryItem {
  Uname: string;
  ChangeDate: string;
  ChangeTime: string;
  VersionNo: string;
  CommentText: string;
}

export interface ProjectStepItem {
  StepId: string;
  BranchId: string;
  Status: string;
  PlanStart: string;
  StartStatus: string;
  Deadline: string;
  StepName?: string;
  StatusText?: string;
  DeletedFlag?: string;
}

export interface StepListPayload {
  StepList: ProjectStepItem[];
}

export interface EmployeeItem {
  Id: string;
  Name: string;
  Uname: string;
  Mail: string;
  Department: string;
  CbqlId?: string;
  LdId?: string;
  ProjectCount: string;
}

export interface CommentItem {
  CmtId: string;
  CreateTime: string;
  StepId: string;
  BranchId: string;
  Content: string;
  CreateDate: string;
  CreateBy: string;
}

export interface StepCommentItem {
  Author: string;
  Date: string;
  Text: string;
}

export interface StepDocumentItem {
  FileName: string;
  Url: string;
  Mimetype: string;
  CreateBy: string;
  CreateDate: string;
  CreateTime: string;
}
