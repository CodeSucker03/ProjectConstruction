import type { ApprovalHistoryItem, ProjectStepItem } from "../types/pages/main";

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
  Step?: string;
}

export interface StateModel {
  Step: string;
  isApproveStage: boolean;
  isCreateStage: boolean;
  isEditInitStage: boolean;
  isRoleAssignStage: boolean;
  isContractorStage: boolean;
  enableButton: boolean;
}

export interface StaffItem {
  id: string;
  name: string;
  currentLoads: number;
}

export interface StaffPool {
  tkdd: StaffItem[];
  xdcb: StaffItem[];
  qlcl: StaffItem[];
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
  Step: "0",
  isApproveStage: false,
  isCreateStage: false,
  isEditInitStage: false,
  isRoleAssignStage: false,
  isContractorStage: false,
  enableButton: false,
};

export const mockStaffPool: StaffPool = {
  tkdd: [
    { id: "", name: "-- Chọn cán bộ phòng TKDD --", currentLoads: 0 },
    { id: "NV001", name: "Trần Văn Hùng", currentLoads: 2 },
    { id: "NV002", name: "Lê Thị Thảo", currentLoads: 5 },
    { id: "KHAC", name: "Khác (Nhập tay thông tin)", currentLoads: 0 },
  ],
  xdcb: [
    { id: "", name: "-- Chọn cán bộ phòng XDCB --", currentLoads: 0 },
    { id: "NV003", name: "Phạm Minh Hoàng", currentLoads: 1 },
    { id: "NV004", name: "Nguyễn Hoàng Nam", currentLoads: 3 },
    { id: "KHAC", name: "Khác (Nhập tay thông tin)", currentLoads: 0 },
  ],
  qlcl: [
    { id: "", name: "-- Chọn cán bộ bộ phận QLCL --", currentLoads: 0 },
    { id: "NV005", name: "Đặng Thúy Hà", currentLoads: 0 },
    { id: "KHAC", name: "Khác (Nhập tay thông tin)", currentLoads: 0 },
  ],
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
    {
      StepId: "01",
      BranchId: "003",
      Status: "2",
      PlanStart: "2026-07-01",
      StartStatus: "1",
      Deadline: "2026-07-03",
      StepName: "Tìm kiếm địa điểm",
      StatusText: "Hoàn thành",
    },
    {
      StepId: "02",
      BranchId: "003",
      Status: "2",
      PlanStart: "2026-07-03",
      StartStatus: "1",
      Deadline: "2026-07-07",
      StepName: "Thẩm định địa điểm",
      StatusText: "Hoàn thành",
    },
    {
      StepId: "03",
      BranchId: "003",
      Status: "2",
      PlanStart: "2026-07-07",
      StartStatus: "1",
      Deadline: "2026-07-14",
      StepName: "Đàm phán",
      StatusText: "Hoàn thành",
    },
    {
      StepId: "04",
      BranchId: "003",
      Status: "1",
      PlanStart: "2026-07-14",
      StartStatus: "1",
      Deadline: "2026-07-21",
      StepName: "Trình duyệt địa điểm",
      StatusText: "Đang thực hiện",
    },
    {
      StepId: "05",
      BranchId: "003",
      Status: "0",
      PlanStart: "2026-07-21",
      StartStatus: "0",
      Deadline: "2026-07-25",
      StepName: "Ký hợp đồng thuê địa điểm",
      StatusText: "Chưa bắt đầu",
    },
    {
      StepId: "06",
      BranchId: "003",
      Status: "0",
      PlanStart: "2026-07-26",
      StartStatus: "0",
      Deadline: "2026-07-28",
      StepName: "Thông báo triển khai HĐ",
      StatusText: "Chưa bắt đầu",
    },
    {
      StepId: "07",
      BranchId: "003",
      Status: "0",
      PlanStart: "2026-07-29",
      StartStatus: "0",
      Deadline: "2026-08-05",
      StepName: "Xin cấp phép NHNN",
      StatusText: "Chưa bắt đầu",
    },
    {
      StepId: "08",
      BranchId: "003",
      Status: "0",
      PlanStart: "2026-08-06",
      StartStatus: "0",
      Deadline: "2026-08-12",
      StepName: "Khảo sát",
      StatusText: "Chưa bắt đầu",
    },
    {
      StepId: "09",
      BranchId: "003",
      Status: "0",
      PlanStart: "2026-08-13",
      StartStatus: "0",
      Deadline: "2026-08-17",
      StepName: "Lựa chọn nhà thầu",
      StatusText: "Chưa bắt đầu",
    },
    {
      StepId: "10",
      BranchId: "003",
      Status: "0",
      PlanStart: "2026-08-18",
      StartStatus: "0",
      Deadline: "2026-08-24",
      StepName: "Thiết kế sơ bộ",
      StatusText: "Chưa bắt đầu",
    },
    {
      StepId: "11",
      BranchId: "003",
      Status: "0",
      PlanStart: "2026-08-25",
      StartStatus: "0",
      Deadline: "2026-09-03",
      StepName: "Thiết kế chi tiết kiến trúc",
      StatusText: "Chưa bắt đầu",
    },
    {
      StepId: "12",
      BranchId: "003",
      Status: "0",
      PlanStart: "2026-09-04",
      StartStatus: "0",
      Deadline: "2026-09-10",
      StepName: "Thiết kế chi tiết điện mạng",
      StatusText: "Chưa bắt đầu",
    },
    {
      StepId: "13",
      BranchId: "003",
      Status: "0",
      PlanStart: "2026-09-11",
      StartStatus: "0",
      Deadline: "2026-09-17",
      StepName: "Lập dự toán",
      StatusText: "Chưa bắt đầu",
    },
    {
      StepId: "14",
      BranchId: "003",
      Status: "0",
      PlanStart: "2026-09-18",
      StartStatus: "0",
      Deadline: "2026-09-22",
      StepName: "Tạm ứng cho nhà thầu",
      StatusText: "Chưa bắt đầu",
    },
    {
      StepId: "15",
      BranchId: "003",
      Status: "0",
      PlanStart: "2026-09-23",
      StartStatus: "0",
      Deadline: "2026-09-28",
      StepName: "Ký HĐ/PLHĐ XDCB",
      StatusText: "Chưa bắt đầu",
    },
    {
      StepId: "16",
      BranchId: "003",
      Status: "0",
      PlanStart: "2026-09-29",
      StartStatus: "0",
      Deadline: "2026-10-20",
      StepName: "Thi công, giám sát, nghiệm thu, bàn giao",
      StatusText: "Chưa bắt đầu",
    },
    {
      StepId: "17",
      BranchId: "003",
      Status: "0",
      PlanStart: "2026-10-21",
      StartStatus: "0",
      Deadline: "2026-10-28",
      StepName: "Nghiệm thu",
      StatusText: "Chưa bắt đầu",
    },
    {
      StepId: "18",
      BranchId: "003",
      Status: "0",
      PlanStart: "2026-10-29",
      StartStatus: "0",
      Deadline: "2026-11-05",
      StepName: "Quyết toán",
      StatusText: "Chưa bắt đầu",
    },
  ],
};

export const mockStepPool = {
  availableSteps: [
    { StepId: "01", StepName: "Tìm kiếm địa điểm" },
    { StepId: "02", StepName: "Thẩm định địa điểm" },
    { StepId: "03", StepName: "Đàm phán" },
    { StepId: "04", StepName: "Trình duyệt địa điểm" },
    { StepId: "05", StepName: "Ký hợp đồng thuê địa điểm" },
    { StepId: "06", StepName: "Thông báo triển khai HĐ" },
    { StepId: "07", StepName: "Xin cấp phép NHNN" },
    { StepId: "08", StepName: "Khảo sát" },
    { StepId: "09", StepName: "Lựa chọn nhà thầu" },
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
