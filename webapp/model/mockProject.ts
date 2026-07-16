import type { ApprovalHistoryItem, ProjectStepItem } from "../types/pages/main";
import type { ProjectDocumentModel } from "../types/pages/project";

export interface ProjectInitialData {
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
  Status?: string;
  Step?: number;
}

export interface StateModel {
  Step: number;
  isApproveStage: boolean;
  isCreateStage: boolean;
  isEditInitStage: boolean;
  isRoleAssignStage: boolean;
  isContractorStage: boolean;
  enableButton: boolean;
}

export interface AssignRoleItem {
  selectedKey: string;
  manualId: string;
  manualName: string;
  manualEmail: string;
}

export interface AssignData {
  tkdd: AssignRoleItem;
  giamsat: AssignRoleItem;
  kienTruc: AssignRoleItem;
  dienMang: AssignRoleItem;
  duToan: AssignRoleItem;
  quyetToan: AssignRoleItem;
  nhnn: AssignRoleItem;
}

export const mockProjectInitialData: ProjectInitialData = {
  ProjType: "",
  loaiCongTrinhKhac: "",
  ConstructionContractor: "",
  AirConditioningContractor: "",
  ElecNetCamContractor: "",
  InteriorContractor: "",
  BankName: "",
  tenNganHangKhac: "",
  Region: "",
  regionKhac: "",
  UnitType: "",
  loaiHinhDonViKhac: "",
  BookId: "",
  BranchId: "",
  BranchName: "",
  Area: "",
  areaKhac: "",
  Budget: null,
  PlanStart: "",
  PlanType: "",
  planTypeKhac: "",
  Waers: "VND",
};

export const mockStateModel: StateModel = {
  Step: 0,
  isApproveStage: false,
  isCreateStage: false,
  isEditInitStage: false,
  isRoleAssignStage: false,
  isContractorStage: false,
  enableButton: false,
};

export const mockAssignData: AssignData = {
  tkdd: { selectedKey: "", manualId: "", manualName: "", manualEmail: "" },
  giamsat: { selectedKey: "", manualId: "", manualName: "", manualEmail: "" },
  kienTruc: { selectedKey: "", manualId: "", manualName: "", manualEmail: "" },
  dienMang: { selectedKey: "", manualId: "", manualName: "", manualEmail: "" },
  duToan: { selectedKey: "", manualId: "", manualName: "", manualEmail: "" },
  quyetToan: { selectedKey: "", manualId: "", manualName: "", manualEmail: "" },
  nhnn: { selectedKey: "", manualId: "", manualName: "", manualEmail: "" },
};

export const mockWorkflowData = {
  userRole: "APPROVER" as const,
  history: [
    {
      approverName: "Nguyễn Văn A (Khởi tạo)",
      comment: "Hồ sơ dự án cải tạo mặt bằng phòng giao dịch chuẩn bị cho quý 3.",
      timestamp: "08/07/2026 09:00",
      action: "Khởi tạo thành công",
    },
  ],
  workItemId: "",
  status: null,
};

export const mockApprovalHistoryData = {
  rows: [
    {
      Uname: "Nguyễn Văn A",
      ChangeDate: "2026-07-01",
      ChangeTime: "09:15",
      VersionNo: "01",
      CommentText: "Khởi tạo hồ sơ thành công",
    },
    {
      Uname: "Lê Thị B",
      ChangeDate: "2026-07-02",
      ChangeTime: "14:20",
      VersionNo: "02",
      CommentText: "Phê duyệt",
    },
    {
      Uname: "Trần Văn C",
      ChangeDate: "2026-07-03",
      ChangeTime: "10:00",
      VersionNo: "03",
      CommentText: "Yêu cầu sửa lại phần Ngân sách",
    },
    {
      Uname: "Phạm Thị D",
      ChangeDate: "2026-07-05",
      ChangeTime: "16:45",
      VersionNo: "04",
      CommentText: "Bổ sung thông tin nhà thầu",
    },
  ] as ApprovalHistoryItem[],
};

export const mockProjectSteps: { StepList: ProjectStepItem[] } = {
  StepList: [
    // {
    //   StepId: "01",
    //   BranchId: "003",
    //   Status: "2",
    //   PlanStart: "2026-07-01",
    //   StartStatus: "1",
    //   Deadline: "2026-07-03",
    //   StepName: "Tìm kiếm địa điểm",
    //   StatusText: "Hoàn thành",
    // },
    // {
    //   StepId: "02",
    //   BranchId: "003",
    //   Status: "2",
    //   PlanStart: "2026-07-03",
    //   StartStatus: "1",
    //   Deadline: "2026-07-07",
    //   StepName: "Thẩm định địa điểm",
    //   StatusText: "Hoàn thành",
    // },
    // {
    //   StepId: "03",
    //   BranchId: "003",
    //   Status: "2",
    //   PlanStart: "2026-07-07",
    //   StartStatus: "1",
    //   Deadline: "2026-07-14",
    //   StepName: "Đàm phán",
    //   StatusText: "Hoàn thành",
    // },
    // {
    //   StepId: "04",
    //   BranchId: "003",
    //   Status: "1",
    //   PlanStart: "2026-07-14",
    //   StartStatus: "1",
    //   Deadline: "2026-07-21",
    //   StepName: "Trình duyệt địa điểm",
    //   StatusText: "Đang thực hiện",
    // },
    // {
    //   StepId: "05",
    //   BranchId: "003",
    //   Status: "0",
    //   PlanStart: "2026-07-21",
    //   StartStatus: "0",
    //   Deadline: "2026-07-25",
    //   StepName: "Ký hợp đồng thuê địa điểm",
    //   StatusText: "Chưa bắt đầu",
    // },
    // {
    //   StepId: "06",
    //   BranchId: "003",
    //   Status: "0",
    //   PlanStart: "2026-07-26",
    //   StartStatus: "0",
    //   Deadline: "2026-07-28",
    //   StepName: "Thông báo triển khai HĐ",
    //   StatusText: "Chưa bắt đầu",
    // },
    // {
    //   StepId: "07",
    //   BranchId: "003",
    //   Status: "0",
    //   PlanStart: "2026-07-29",
    //   StartStatus: "0",
    //   Deadline: "2026-08-05",
    //   StepName: "Xin cấp phép NHNN",
    //   StatusText: "Chưa bắt đầu",
    // },
    // {
    
  ],
};

export const mockStepPool = {
  availableSteps: [
    { StepId: "1", StepName: "Tìm kiếm địa điểm" },
    { StepId: "2", StepName: "Thẩm định địa điểm" },
    { StepId: "3", StepName: "Đàm phán" },
    { StepId: "4", StepName: "Trình duyệt địa điểm" },
    { StepId: "5", StepName: "Ký hợp đồng thuê địa điểm" },
    { StepId: "6", StepName: "Thông báo triển khai HĐ" },
    { StepId: "7", StepName: "Xin cấp phép NHNN" },
    { StepId: "8", StepName: "Khảo sát" },
    { StepId: "9", StepName: "Lựa chọn nhà thầu" },
    { StepId: "10", StepName: "Thiết kế sơ bộ" },
    { StepId: "11", StepName: "Thiết kế chi tiết kiến trúc" },
    { StepId: "12", StepName: "Thiết kế chi tiết điện mạng" },
    { StepId: "13", StepName: "Lập dự toán" },
    { StepId: "14", StepName: "Tạm ứng cho nhà thầu" },
    { StepId: "15", StepName: "Ký HĐ/PLHĐ XDCB" },
    { StepId: "16", StepName: "Thi công, giám sát, nghiệm thu, bàn giao" },
    { StepId: "17", StepName: "Nghiệm thu" },
    { StepId: "18", StepName: "Quyết toán" },
  ],
};

export const mockProjectDocumentData: ProjectDocumentModel = {
  DocumentList: [
    // {
    //   FileId: "doc_001",
    //   Filename: "to_trinh_van_ban.pdf",
    //   MimeType: "application/pdf",
    //   CreateBy: "Nguyễn Văn A",
    //   CreateDate: "2026-07-01",
    //   CreateTime: "09:15:00",
    // },
  ],
};
