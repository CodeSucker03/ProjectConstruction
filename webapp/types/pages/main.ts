export interface ProjectFormData {
  Status?: string;
  ProjType: string;
  loaiCongTrinhKhac?: string;

  ConstructionContractor: string;
  AirConditioningContractor: string;
  ElecNetCamContractor: string;
  InteriorContractor: string;

  BankName: string;
  tenNganHangKhac?: string;

  Region: string;
  regionKhac?: string;

  UnitType: string;
  loaiHinhDonViKhac?: string;

  BookId: string;
  BranchId: string;
  BranchName: string;
  Area: string;
  areaKhac?: string;

  Budget: number | null;
  PlanStart: string;
  PlanType: string;
  planTypeKhac?: string;
  Waers: string;
  Step?: string;
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
}

export interface StepListPayload {
  StepList: ProjectStepItem[];
}
