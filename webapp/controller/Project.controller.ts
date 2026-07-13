import MessageBox from "sap/m/MessageBox";

import type {
  Route$MatchedEvent,
  Route$PatternMatchedEvent,
} from "sap/ui/core/routing/Route";
import type Router from "sap/ui/core/routing/Router";

import JSONModel from "sap/ui/model/json/JSONModel";
import type ODataModel from "sap/ui/model/odata/v2/ODataModel";
import type Table from "sap/ui/table/Table";
import Base from "./Base.controller";

import {
  mockProjectSteps,
  mockProjectInitialData,
  mockStateModel,
  mockStaffPool,
  mockAssignData,
  mockWorkflowData,
  mockApprovalHistoryData,
  mockStepPool,
} from "../model/mockProject";

import type { Button$PressEvent } from "sap/m/Button";
import type { Select$ChangeEvent } from "sap/m/Select";
import MessageToast from "sap/m/MessageToast";
import Filter from "sap/ui/model/Filter";
import type Dialog from "sap/m/Dialog";
import type UploadSetItem from "sap/m/upload/UploadSetItem";
import type { UploadSet$BeforeItemRemovedEvent } from "sap/m/upload/UploadSet";
import type {
  DetailRouteArgs,
  ProjectFormData,
  ProjectStepItem,
  WorkflowData,
} from "../types/pages/main";
import type {
  ODataError,
  ODataErrorResponse,
  ODataResponse,
} from "../types/odata";

/**
 * @namespace sphinx.project.controller
 */

export default class Project extends Base {
  private router: Router;
  private branchId: string;
  private stepTable: Table;
  private workItemId: string;
  private detailProjectStepDialog: Dialog;

  public override onInit(): void {
    this.router = this.getRouter();

    this.stepTable = this.getControlById("tableSteps");

    let oModel = new JSONModel(mockProjectInitialData);
    this.setModel(oModel, "projectInitForm");

    // Model for Project State (Buttons)
    // Status 2 = Assign Role step
    // Status 3 = Send Contract Vendor step
    let stateModel = { ...mockStateModel };

    this.setModel(new JSONModel(stateModel), "ProjectModel");

    // NEW: Workflow state model to simulate user permissions and logs
    let workflowData = { ...mockWorkflowData } as WorkflowData;

    // 2. Mock Pool dữ liệu nhân sự kèm Số lượng công trình đang xử lý (currentLoads)
    let oStaffPool = { ...mockStaffPool };

    // 3. Khởi tạo cấu trúc lưu trữ dữ liệu Phân công đầu ra
    let oAssignData = { ...mockAssignData };

    this.setModel(new JSONModel(oStaffPool), "staffPool");
    this.setModel(new JSONModel(oAssignData), "assignData");

    this.setModel(new JSONModel(workflowData), "workflowData");

    let stepTableModel = {
      selectedIndices: [],
    };
    this.setModel(new JSONModel(stepTableModel), "stepTableModel");

    // Mock History data
    let approvalHistoryData = { ...mockApprovalHistoryData };
    this.setModel(new JSONModel(approvalHistoryData), "approvalHistory");

    let projectSteps = { ...mockProjectSteps };
    this.setModel(new JSONModel(projectSteps), "project");

    this.setModel(new JSONModel(mockStepPool), "stepPool");

    //Default Route
    this.router
      .getRoute("RouteProject")
      ?.attachPatternMatched(this.onProductMatched);

    //Default Route End
    this.router
      .getRoute("RouteEditInit")
      ?.attachPatternMatched(this.onEditInitMatched);

    this.router
      .getRoute("RouteProjectCreate")
      ?.attachPatternMatched(this.onCreateMatched);

    this.router
      .getRoute("RouteContractor")
      ?.attachPatternMatched(this.onContractorMatched);
    this.router
      .getRoute("RouteRoleAssignment")
      ?.attachPatternMatched(this.onRoleAssignMatched);

    this.router
      .getRoute("RouteApproval")
      ?.attachPatternMatched(this.onApprovalMatched);
  }

  //#region Route
  // Create Route doesnt Fetch
  private onCreateMatched = (onCreateMatched: Route$PatternMatchedEvent) => {
    let stateModel = this.getModel("ProjectModel");
    if (stateModel) {
      stateModel.setProperty("/Step", "0");
      stateModel.setProperty("/isCreateStage", true);
    }
  };

  private onApprovalMatched = (
    onApprovalMatched: Route$PatternMatchedEvent,
  ) => {
    this.loadMetaData(onApprovalMatched);

    let stateModel = this.getModel("ProjectModel");
    if (stateModel) {
      stateModel.setProperty("/isApproveStage", true);
      stateModel.setProperty("/isCreateStage", false);
    }
  };

  private onContractorMatched = (onMatched: Route$PatternMatchedEvent) => {
    this.loadMetaData(onMatched);

    let stateModel = this.getModel("ProjectModel");
    if (stateModel) {
      stateModel.setProperty("/isContractorStage", true);
    }
  };

  private onRoleAssignMatched = (
    onRoleAssignMatched: Route$PatternMatchedEvent,
  ) => {
    this.loadMetaData(onRoleAssignMatched);

    let stateModel = this.getModel("ProjectModel");
    if (stateModel) {
      stateModel.setProperty("/isRoleAssignStage", true);
    }
  };

  private onEditInitMatched = (Event: Route$PatternMatchedEvent) => {
    this.loadMetaData(Event);

    let stateModel = this.getModel("ProjectModel");
    if (stateModel) {
      stateModel.setProperty("/Step", "0");
      stateModel.setProperty("/isEditInitStage", true);
    }
  };

  private onProductMatched = (Event: Route$PatternMatchedEvent) => {
    let stateModel = this.getModel("ProjectModel");
    if (stateModel) {
      stateModel.setProperty("/isCreateStage", false);
    }
    this.loadMetaData(Event);
  };

  private loadMetaData(Event: Route$PatternMatchedEvent) {
    this.getMetadataLoaded()
      .then(() => {
        const args = <DetailRouteArgs>Event.getParameter("arguments");
        const sBranchId = args?.branchId;

        if (sBranchId) {
          this.loadProject(sBranchId);
        }

        // Load workflow data for the project
        const oWorkflowModel = this.getModel("workflowData");

        const sWorkItemId = args?.workItemId;

        if (sWorkItemId) {
          oWorkflowModel.setProperty("/workItemId", sWorkItemId );
          this.workItemId = sWorkItemId;
          console.log(oWorkflowModel.getData());
        }

        console.log(oWorkflowModel.getData());
      })
      .catch((error) => {
        MessageBox.error(error);
        console.log(error);
      })
      .finally(() => {
        // loading off
      });
  }

  //#region onSubmit

  // Submit Init Project (Khởi tạo hồ sơ du an)
  public onSubmitProject() {
    this.getView()?.setBusy(true);
    let oModel = this.getModel("projectInitForm");
    let oData = <ProjectFormData>oModel.getData();

    console.log(oData);

    // Thực hiện kiểm tra bắt buộc (Mandatory check) các trường dữ liệu cốt lõi nếu cần
    // if (!oData.ProjType || !oData.BankName || !oData.BookId || !oData.BranchId || !oData.PlanStart) {
    //   MessageBox.error("Vui lòng điền đầy đủ tất cả các trường thông tin bắt buộc!");
    //   this.getView()?.setBusy(false);
    //   return;
    // }

    const {
      loaiCongTrinhKhac,
      tenNganHangKhac,
      loaiHinhDonViKhac,
      regionKhac,
      areaKhac,
      planTypeKhac,
      ...payload
    } = oData;

    if (payload.ProjType === "KHAC") {
      payload.ProjType = loaiCongTrinhKhac || "";
    }
    if (payload.BankName === "KHAC") {
      payload.BankName = tenNganHangKhac || "";
    }
    if (payload.UnitType === "KHAC") {
      payload.UnitType = loaiHinhDonViKhac || "";
    }
    if (payload.Region === "KHAC") {
      payload.Region = regionKhac || "";
    }
    if (payload.Area === "KHAC") {
      payload.Area = areaKhac || "";
    }
    if (payload.PlanType === "KHAC") {
      payload.PlanType = planTypeKhac || "";
    }

    console.log(payload);

    const oDataModel = this.getModel<ODataModel>();
    oDataModel.setUseBatch(false);
    oDataModel.create("/ProjectSet", payload, {
      success: (response: ODataResponse) => {
        console.log(response);

        // Navigate
        // this.router.navTo("RouteProject", {
        //   branchId: payload.BranchId,
        // });

        // Start process
        oDataModel.create(
          "/StartProcessSet",
          {
            BranchId: payload.BranchId,
          },
          {
            success: () => {
              MessageBox.success("Hồ sơ dự án đã được khởi tạo thành công!");
            },
            error: (error: any) => {
              console.log(error);

              const oResponse = JSON.parse(error.responseText);
              const message = oResponse.error.message.value || "Request Failed";

              MessageBox.error(message);
            },
          },
        );

        this.getView()?.setBusy(false);
      },
      error: (error: ODataError) => {
        this.getView()?.setBusy(false);

        MessageBox.error(error as string);
      },
    });
  }

  // Step 1 Approve / Reject / Back author
  public onPressAction(event: Button$PressEvent) {
    const button = event.getSource();
    const actionData = button.data("buttonData") as string;

    const oDataModel = this.getModel<ODataModel>();

    MessageBox.confirm("Xác nhận", {
      actions: ["Xác nhận", "Huỷ"],
      emphasizedAction: "Xác nhận",
      onClose: (action: string) => {
        if (action === "Xác nhận") {
          oDataModel.create(
            "/ProcessExecuteSet",
            {
              Wild: this.workItemId,
              Action: actionData,
              BranchId: this.branchId,
            },
            {
              success: () => {
                MessageBox.success("");
                button.setEnabled(false);
              },
              error: (error: ODataErrorResponse) => {
                console.log(error);
              },
            },
          );
        }
      },
    });
  }

  // Step 2: Assign Users Submit
  public async onActionAssignSubmit(): Promise<void> {
    this.getView()?.setBusy(true);

    try {
      const assignData = this.getModel("assignData")?.getData();
      const oDataModel = this.getModel<ODataModel>();

      oDataModel.setUseBatch(false);

      let payload = {
        dienMang:
          assignData.dienMang.selectedKey === "KHAC"
            ? {
                id: assignData.dienMang.manualId,
                name: assignData.dienMang.manualName,
                email: assignData.dienMang.manualEmail,
              }
            : {
                id: assignData.dienMang.selectedKey,
              },

        duToan:
          assignData.duToan.selectedKey === "KHAC"
            ? {
                id: assignData.duToan.manualId,
                name: assignData.duToan.manualName,
                email: assignData.duToan.manualEmail,
              }
            : {
                id: assignData.duToan.selectedKey,
              },

        quyetToan:
          assignData.quyetToan.selectedKey === "KHAC"
            ? {
                id: assignData.quyetToan.manualId,
                name: assignData.quyetToan.manualName,
                email: assignData.quyetToan.manualEmail,
              }
            : {
                id: assignData.quyetToan.selectedKey,
              },

        nhnn:
          assignData.nhnn.selectedKey === "KHAC"
            ? {
                id: assignData.nhnn.manualId,
                name: assignData.nhnn.manualName,
                email: assignData.nhnn.manualEmail,
              }
            : {
                id: assignData.nhnn.selectedKey,
              },

        tkdd:
          assignData.tkdd.selectedKey === "KHAC"
            ? {
                id: assignData.tkdd.manualId,
                name: assignData.tkdd.manualName,
                email: assignData.tkdd.manualEmail,
              }
            : {
                id: assignData.tkdd.selectedKey,
              },

        giamsat:
          assignData.giamsat.selectedKey === "KHAC"
            ? {
                id: assignData.giamsat.manualId,
                name: assignData.giamsat.manualName,
                email: assignData.giamsat.manualEmail,
              }
            : {
                id: assignData.giamsat.selectedKey,
              },

        kienTruc:
          assignData.kienTruc.selectedKey === "KHAC"
            ? {
                id: assignData.kienTruc.manualId,
                name: assignData.kienTruc.manualName,
                email: assignData.kienTruc.manualEmail,
              }
            : {
                id: assignData.kienTruc.selectedKey,
              },
      };

      await new Promise<void>((resolve, reject) => {
        oDataModel.create("/AssignSet", payload, {
          success: () => resolve(),
          error: reject,
        });
      });

      // Temporary workflow
      let workFlow = { BranchId: this.branchId };

      oDataModel.create("/StartProcessSet", workFlow, {
        success: (response: ODataResponse) => {
          console.log(response);

          this.getView()?.setBusy(false);
          MessageBox.success("Đã gửi thông tin nhà thầu thành công!");
        },
        error: (error: ODataError) => {
          this.getView()?.setBusy(false);

          MessageBox.error(error as string);
        },
      });
    } catch (e) {
      MessageBox.error((e as Error).message);
    } finally {
      this.getView()?.setBusy(false);
    }
  }

  // Step 3: Send Contract
  public onActionSendContractor() {
    const projectModel = this.getModel("projectInitForm");
    const data = <ProjectFormData>projectModel?.getData();

    if (!data) {
      MessageBox.error("Không có thông tin dự án!");
      return;
    }

    // const payload = {
    //   BranchId: this.branchId || data.BranchId,
    //   ConstructionContractor: data.ConstructionContractor || "",
    //   AirConditioningContractor: data.AirConditioningContractor || "",
    //   ElecNetCamContractor: data.ElecNetCamContractor || "",
    //   InteriorContractor: data.InteriorContractor || "",
    // };
    const payload = data;

    const oDataModel = this.getModel<ODataModel>();
    oDataModel.setUseBatch(false);
    oDataModel.create("/ProjectSet", payload, {
      success: (response: ODataResponse) => {
        console.log(response);

        this.getView()?.setBusy(false);
        MessageBox.success("Đã gửi thông tin nhà thầu thành công!");
      },
      error: (error: ODataError) => {
        this.getView()?.setBusy(false);

        MessageBox.error(error as string);
      },
    });
  }

  // Step 4-5: Approve/Reject/Back
  public onApproveProject() {}

  public onRejectProject() {}

  public onReassignProject() {}

  //#endregion onSubmit

  //#region Fetch data
  private loadProject(BranchId: string) {
    const projectInitModel = this.getModel("projectInitForm");
    const oDataModel = this.getModel<ODataModel>();

    oDataModel.setUseBatch(false);
    oDataModel.read(`/ProjectSet('${BranchId}')`, {
      success: (response: ODataResponse<ProjectFormData>) => {
        const updates: Record<string, string> = {};

        const allowedRegion = ["", "1", "2", "KHAC"];
        if (response.Region && !allowedRegion.includes(response.Region)) {
          updates.Region = "KHAC";
          updates.regionKhac = response.Region;
        } else {
          updates.regionKhac = "";
        }

        const allowedArea = [
          "",
          "1",
          "1B",
          "2",
          "3",
          "4",
          "5",
          "6",
          "6B",
          "7",
          "8",
          "8B",
          "9",
          "10",
          "11",
          "KHAC",
        ];
        if (response.Area && !allowedArea.includes(response.Area)) {
          updates.Area = "KHAC";
          updates.areaKhac = response.Area;
        } else {
          updates.areaKhac = "";
        }

        const allowedPlanType = ["", "1", "2", "KHAC"];
        if (response.PlanType && !allowedPlanType.includes(response.PlanType)) {
          updates.PlanType = "KHAC";
          updates.planTypeKhac = response.PlanType;
        } else {
          updates.planTypeKhac = "";
        }

        const allowedProjType = [
          "",
          "DI_DOI",
          "MO_MOI",
          "THUE_THEM",
          "CAI_TAO",
          "KHAC",
        ];
        if (response.ProjType && !allowedProjType.includes(response.ProjType)) {
          updates.ProjType = "KHAC";
          updates.loaiCongTrinhKhac = response.ProjType;
        } else {
          updates.loaiCongTrinhKhac = "";
        }

        const allowedUnitType = ["", "CN", "PGD", "HO", "KHAC"];
        if (response.UnitType && !allowedUnitType.includes(response.UnitType)) {
          updates.UnitType = "KHAC";
          updates.loaiHinhDonViKhac = response.UnitType;
        } else {
          updates.loaiHinhDonViKhac = "";
        }

        const allowedBankName = ["", "VPBANK", "GPBANK", "KHAC"];
        if (response.BankName && !allowedBankName.includes(response.BankName)) {
          updates.BankName = "KHAC";
          updates.tenNganHangKhac = response.BankName;
        } else {
          updates.tenNganHangKhac = "";
        }

        projectInitModel?.setProperty("/", {
          ...response,
          ...updates,
        });
        this.branchId = response.BranchId;

        this.getModel("ProjectModel")?.setProperty(
          "/Step",
          response.Step || "0",
        );
      },
      error: (error: ODataError) => {
        MessageBox.error(error.message || "Error Please try again later");
      },
    });
  }

  public readContractors(branchId: string) {
    const projectInitModel = this.getModel("projectInitForm");
    const oDataModel = this.getModel<ODataModel>();

    oDataModel.setUseBatch(false);
    oDataModel.read(`/ProjectSet('${branchId}')`, {
      success: (response: ODataResponse<ProjectFormData>) => {
        projectInitModel?.setProperty(
          "/ConstructionContractor",
          response.ConstructionContractor || "",
        );
        projectInitModel?.setProperty(
          "/AirConditioningContractor",
          response.AirConditioningContractor || "",
        );
        projectInitModel?.setProperty(
          "/ElecNetCamContractor",
          response.ElecNetCamContractor || "",
        );
        projectInitModel?.setProperty(
          "/InteriorContractor",
          response.InteriorContractor || "",
        );
      },
      error: (error: ODataError) => {
        MessageBox.error(error.message || "Failed to load contractors");
      },
    });
  }

  //#region StepsAction

  public onRowSelectionChange() {
    const selectedIndices = this.stepTable.getSelectedIndices();
    console.log(selectedIndices);

    const tableModel = this.getModel<JSONModel>("stepTableModel");

    tableModel.setProperty("/selectedIndices", [...selectedIndices]);
    console.log(tableModel.getProperty("/selectedIndices"));
  }

  public onAddStepFromPool(oEvent: Select$ChangeEvent) {
    const select = oEvent.getSource();
    const selectedKey = select.getSelectedKey();

    if (!selectedKey) {
      return;
    }

    const projectModel = this.getModel("project");
    const stepPoolModel = this.getModel("stepPool");
    const data = projectModel?.getData() as
      { StepList?: ProjectStepItem[] } | undefined;

    const poolData = stepPoolModel?.getData() as
      { availableSteps?: { StepId: string; StepName: string }[] } | undefined;

    const currentList = data?.StepList || [];
    const pool = poolData?.availableSteps || [];

    if (currentList.some((step) => step.StepId === selectedKey)) {
      MessageBox.warning("Bước này đã tồn tại trong danh sách.");
      select.setSelectedKey("");
      return;
    }

    const selectedStep = pool.find((step) => step.StepId === selectedKey);
    if (!selectedStep) {
      select.setSelectedKey("");
      return;
    }

    const newStep: ProjectStepItem = {
      StepId: selectedStep.StepId,
      BranchId: this.branchId || "",
      Status: "0",
      PlanStart: "",
      StartStatus: "0",
      Deadline: "",
      StepName: selectedStep.StepName,
      StatusText: "Chưa bắt đầu",
    };

    projectModel?.setProperty("/StepList", [...currentList, newStep]);
    select.setSelectedKey("");
  }

  public onDeleteStep() {
    const projectModel = this.getModel("project");
    const data = projectModel?.getData() as
      { StepList?: ProjectStepItem[] } | undefined;
    const currentList = data?.StepList || [];

    const indices = this.stepTable.getSelectedIndices();
    if (!indices.length) {
      MessageBox.warning("Vui lòng chọn bước cần xóa.");
      return;
    }

    const item = <ProjectStepItem>(
      this.stepTable.getContextByIndex(indices[0])?.getObject()
    );
    if (!item) {
      MessageBox.error("Không xác định được bước được chọn.");
      return;
    }

    MessageBox.confirm(
      `Bạn có muốn xóa bước "${item.StepName || item.StepId}"?`,
      {
        actions: [MessageBox.Action.DELETE, MessageBox.Action.CANCEL],
        emphasizedAction: MessageBox.Action.DELETE,
        onClose: (action: unknown) => {
          if (action === MessageBox.Action.DELETE) {
            const updatedList = currentList.filter(
              (step) => step.StepId !== item.StepId,
            );
            projectModel?.setProperty("/StepList", updatedList);
            this.stepTable.clearSelection();
            MessageToast.show("Xóa bước thành công.");
          }
        },
      },
    );
  }

  public onPressStep(oEvent: any) {
    const ctx = oEvent.getSource().getBindingContext("project");
    const step = ctx?.getObject();
    MessageBox.information(`Bước: ${step?.StepName || step?.StepId}`);

    this.branchId = step?.BranchId || "";

    // this.router.navTo("RouteStepDetail", {
    //   branchId: this.branchId,
    // });
  }

  public onSaveStep(event: Button$PressEvent) {
    const control = event.getSource();
    const dialog = <Dialog>control.getParent();

    const formModel = <JSONModel>dialog.getModel("projectStepDetail");
    const formData = formModel?.getData() as ProjectStepItem | undefined;

    if (!formData) {
      MessageBox.error("Không có dữ liệu bước để lưu.");
      return;
    }

    const selectedIndices = this.stepTable.getSelectedIndices();
    if (!selectedIndices.length) {
      MessageBox.warning("Vui lòng chọn bước cần lưu.");
      return;
    }

    const selectedItem = <ProjectStepItem>(
      this.stepTable.getContextByIndex(selectedIndices[0])?.getObject()
    );

    if (!selectedItem) {
      MessageBox.error("Không thể xác định bước đang chọn.");
      return;
    }

    const projectModel = this.getModel("project");
    const projectData = projectModel?.getData() as
      { StepList?: ProjectStepItem[]; BranchId?: string } | undefined;
    const currentList = projectData?.StepList || [];

    const updatedList = currentList.map((step) =>
      step.StepId === formData.StepId ? { ...step, ...formData } : step,
    );

    const payload = {
      BranchId: projectData?.BranchId || this.branchId || "",
      StepList: updatedList,
    };

    console.log("Saved step payload:", payload);

    projectModel?.setProperty("/StepList", updatedList);

    dialog.close();
  }

  public async onOpenStepDialog() {
    try {
      if (!this.detailProjectStepDialog) {
        this.detailProjectStepDialog =
          await this.loadView<Dialog>("ProjectStepDetail");
      }

      const selectedIndices = this.stepTable.getSelectedIndices();
      if (!selectedIndices.length) {
        MessageBox.warning("Vui lòng chọn 1 bước để xem chi tiết.");
        return;
      }

      const SelectedItem = <ProjectStepItem>(
        this.stepTable.getContextByIndex(selectedIndices[0])?.getObject()
      );

      const form = {
        ...SelectedItem,
      };
      console.log(form);

      this.detailProjectStepDialog.setModel(
        new JSONModel(form),
        "projectStepDetail",
      );
      this.detailProjectStepDialog.open();
    } catch (error) {
      console.log(error);
    }
  }

  public onCloseStepDialog() {
    this.detailProjectStepDialog?.close();
  }

  public loadProjectSteps(branchId: string, modelName = "project"): void {
    const oDataModel = this.getModel<ODataModel>();
    oDataModel.setUseBatch(false);

    oDataModel.read("/ProjectStepSet", {
      filters: [new Filter("BranchId", "EQ", branchId)],
      success: (
        response: ODataResponse<
          ProjectStepItem[] | { results: ProjectStepItem[] }
        >,
      ) => {
        const steps = Array.isArray(response) ? response : response.results;
        this.getModel(modelName)?.setProperty("/StepList", steps || []);
      },
      error: (error: ODataError) => {
        MessageBox.error(error.message || "Failed to load project steps");
      },
    });
  }

  //#region  validation
  // 1. Validation định dạng mã book: VNxxxxxxx
  public onValidateMaBook(oEvent: any) {
    let oInput = oEvent.getSource();
    let sValue = oInput.getValue();
    let regex = /^VN\d{8}$/; // Ví dụ mẫu kiểm tra VN + 8 ký tự số

    if (!regex.test(sValue)) {
      oInput.setValueState("Warning");
      oInput.setValueStateText(
        "Mã book chưa đúng định dạng (Yêu cầu: VN và 8 số tiếp theo, không thừa/thiếu ký tự)",
      );
    } else {
      oInput.setValueState("None");
      // TODO: Gửi request kiểm tra trùng lặp trên hệ thống (Duplicate Warning)
    }
  }

  // Tự động điền (Auto-fill) khi nhập Mã CN/PGD (3 chữ)
  public onBranchCodeChange(oEvent: any) {
    let oInput = oEvent.getSource();
    let sValue = oInput.getValue();

    if (sValue.length !== 3) {
      oInput.setValueState("Warning");
      oInput.setValueStateText("Mã CN phải có độ dài đúng 3 chữ số");
      return;
    } else {
      oInput.setValueState("None");
    }

    // Giả lập Logic: Hệ thống tự check với database để fill thông tin
    // Ở thực tế bạn gọi OData/REST API đến master data đơn vị ở đây
    if (sValue === "001") {
      let oModel = this.getModel("projectInitForm");
      oModel?.setProperty(
        "/BranchName",
        "Chi nhánh Hà Nội - Phòng Giao Dịch Số 1",
      );
      oModel?.setProperty("/Region", "MB");
      oModel?.setProperty("/UnitType", "PGD");
      MessageBox.information(
        "Hệ thống tự động điền thông tin dựa trên Mã đơn vị 001.",
      );
    }
  }
  //#endregion validation

  //#region Header formatter
  public formatHeaderTitle(isCreateStage: boolean, branchName: string): string {
    return isCreateStage ? "Khởi tạo Hồ sơ Dự án" : branchName;
  }

  public formatHeaderSubtitle(isCreateStage: boolean, bookId: string): string {
    return isCreateStage ? "" : `Mã Book: ${bookId}`;
  }

  public getStatusText(statusKey: string): string {
    const map: Record<string, string> = {
      "1": "Chờ Duyệt",
      "2": "Đã Duyệt",
    };
    return map[statusKey] ?? statusKey;
  }

  public getState(statusKey: string): string {
    const map: Record<string, string> = {
      "1": "Warning",
      "2": "Success",
    };
    return map[statusKey] ?? statusKey;
  }
  //#endregion Header formatter

  //#region upload FILE

  public async uploadFileZ9(item: UploadSetItem) {
    //   const File = item.getFileObject() as Blob;
    //   if (!File) {
    //     return;
    //   }
    //   try {
    //     if (!this.csrfToken) {
    //       await this.fetchCsrfToken();
    //     }
    //     const fileName = item.getFileName();
    //     const contentType = this.getMineType(fileName);
    //     // check url for workitemid
    //     const url = window.location.href;
    //     const workItemId = url.split("WorkitemId=")[1] || "";
    //     const slug = `${this.Magms}|3|${workItemId}|${fileName}`;
    //     const arrayBuffer: ArrayBuffer = await new Promise((resolve, reject) => {
    //       const reader = new FileReader();
    //       reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
    //       reader.onerror = reject;
    //       reader.readAsArrayBuffer(File);
    //     });
    //     const blob = new Blob([arrayBuffer], { type: contentType });
    //     let response = await fetch(`${this.servicePath}/AttachmentFileSet`, {
    //       method: "POST",
    //       headers: {
    //         "Content-type": contentType,
    //         "x-csrf-token": this.csrfToken as string,
    //         slug: encodeURIComponent(slug),
    //         "X-Requested-With": "XMLHttpRequest",
    //       },
    //       body: blob,
    //       credentials: "include",
    //     });
    //     if (response.status === 403) {
    //       // Expired token
    //       await this.fetchCsrfToken();
    //       response = await fetch(`${this.servicePath}/AttachmentFileSet`, {
    //         method: "POST",
    //         headers: {
    //           "Content-type": contentType,
    //           "x-csrf-token": this.csrfToken as string,
    //           slug: encodeURIComponent(slug),
    //           "X-Requested-With": "XMLHttpRequest",
    //         },
    //         body: blob,
    //         credentials: "include",
    //       });
    //     }
    //     if (!response.ok) {
    //       const text = await response.text();
    //       MessageBox.error(text);
    //     }
    //     const objectKey = response.headers.get("obeject-key");
    //     MessageBox.success("file success");
    //     this.getListFileZ9();
    //   } catch (error) {
    //     MessageBox.error(error as string);
    //   }
  }

  private async fetchCsrfToken() {
    //   const response = await fetch(this.servicePath + "/", {
    //     method: "GET",
    //     headers: {
    //       "x-csrf-token": "Fetch",
    //     },
    //     credentials: "include",
    //   });
    //   if (!response.ok) {
    //     throw new Error("No token");
    //   }
    //   this.csrfToken = response.headers.get("x-csrf-token");
    //   if (!this.csrfToken) {
    //     throw new Error("CSRF token dont exist in response");
    //   }
  }

  public getListFileZ9() {
    //   this.getComponentModel("PRZ9").setUseBatch(false);
    //   const model = this.getModel("detailPRZ9");
    //   const filters = [
    //     new Filter("Magms", FilterOperator.EQ, this.Magms),
    //     new Filter("Manhomcv", FilterOperator.EQ, "3"),
    //   ];
    //   this.getComponentModel("PRZ9").read("/AttachmentListSet", {
    //     filters: filters,
    //     success: (odata: ODataResponse<any>) => {
    //       model.setProperty("listFileZ9", odata.results);
    //     },
    //     error: () => {},
    //   });
  }

  public onDownLoadFilePRZ9(event: JQuery.ClickEvent) {
    //   const clickeItem = $(event.target);
    //   const itemId = clickeItem.attr("id");
    //   if (itemId?.includes("Button")) {
    //     return;
    //   }
    //   let currentItemId = <string>$(event.currentTarget).attr("id");
    //   if (currentItemId.endsWith("-listItem")) {
    //     currentItemId = currentItemId.slice(0, -"-listItem".length);
    //   }
    //   const clickedItem = UI5Element.getElementById(currentItemId) as UploadSetItem;
    //   if (clickeItem) {
    //     const fileKey = <string>clickedItem.data("objectKeyDataZ9");
    //     if (fileKey) {
    //       const Path = `/sap/opu/odata/sap/ZODATA_MSTT_SP9_SRV/AttachmentFileSet(Magms='${this.Magms}',ObjectKey='${fileKey}', Manhomcv='3')/$value`;
    //       downloadFile(Path);
    //     }
    //   }
  }

  public onItemDeleteFileZ9(event: UploadSet$BeforeItemRemovedEvent) {
    //   event.preventDefault();
    //   const item = event.getParameter("item") as UploadSetItem;
    //   const FileName = item.getFileName();
    //   const uploadSet = this.getControlById<UploadSet>("fileZ9");
    //   const objectKey = item.data("objectKeyDataZ9") as string;
    //   const Path = `/AttachmentFileSet(Magms='${this.Magms}',ObjectKey='${objectKey}', Manhomcv='3', Wiid='')`;
    //   this.getComponentModel("PRZ9").setUseBatch(false);
    //   this.getComponentModel("PRZ9").remove(Path, {
    //     success: () => {
    //       uploadSet.removeItem(item);
    //     },
    //     error: (errorL: ODataError) => {},
    //   });
  }
}
