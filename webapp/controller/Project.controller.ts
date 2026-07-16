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
  mockAssignData,
  mockWorkflowData,
  mockApprovalHistoryData,
  mockStepPool,
  mockProjectDocumentData,
  type AssignData,
} from "../model/mockProject";

import type { Button$PressEvent } from "sap/m/Button";
import type { Select$ChangeEvent } from "sap/m/Select";
import MessageToast from "sap/m/MessageToast";
import Filter from "sap/ui/model/Filter";
import Dialog from "sap/m/Dialog";
import type UploadSetItem from "sap/m/upload/UploadSetItem";
import type {
  UploadSet$AfterItemAddedEvent,
  UploadSet$BeforeItemAddedEvent,
  UploadSet$BeforeItemRemovedEvent,
} from "sap/m/upload/UploadSet";
import type {
  DetailRouteArgs,
  CommentItem,
  StepCommentItem,
  StepDocumentItem,
  EmployeeItem,
  ErrorCustom,
  ProjectFormData,
  ProjectStepItem,
  WorkflowData,
} from "../types/pages/main";
import type {
  ProjectDocumentItem,
  ProjectDocumentModel,
} from "../types/pages/project";
import type {
  ODataError,
  ODataErrorResponse,
  ODataResponse,
  ODataResponses,
} from "../types/odata";
import FilterOperator from "sap/ui/model/FilterOperator";

import type UploadSet from "sap/m/upload/UploadSet";
import type { UploadSetItem$OpenPressedEvent } from "sap/m/upload/UploadSetItem";
import { DialogType } from "sap/m/library";
import { ValueState } from "sap/ui/core/library";
import VBox from "sap/m/VBox";
import TextArea from "sap/m/TextArea";
import type { InputBase$ChangeEvent } from "sap/m/InputBase";
import Button from "sap/m/Button";
import type { FileUploader$ChangeEvent } from "sap/ui/unified/FileUploader";
import type DatePicker from "sap/m/DatePicker";
import type { FeedInput$PostEvent } from "sap/m/FeedInput";

/**
 * @namespace sphinx.project.controller
 */

export default class Project extends Base {
  private router: Router;
  private branchId: string;
  private stepTable: Table;
  private workItemId: string;
  private detailProjectStepDialog: Dialog;
  private step: number;
  private isCreatingStep: boolean = false;
  private departmentId: string | undefined;
  private commentDialog: Dialog;

  public override onInit(): void {
    this.router = this.getRouter();

    this.stepTable = this.getControlById("tableSteps");

    let oModel = new JSONModel(mockProjectInitialData);
    this.setModel(oModel, "projectInitForm");

    // Model for Project State (Buttons)
    // Status 2 = Assign Role step
    // Status 3 = Send Contract Vendor step
    let stateModel = { ...mockStateModel };

    this.setModel(new JSONModel(stateModel), "ProjectStageModel");

    // NEW: Workflow state model to simulate user permissions and logs
    let workflowData = { ...mockWorkflowData } as WorkflowData;

    // 2. Mock Pool dữ liệu nhân sự kèm Số lượng công trình đang xử lý (ProjectCount)
    // Replaced with OData call in loadAllDeptStaff()

    // 3. Khởi tạo cấu trúc lưu trữ dữ liệu Phân công đầu ra
    let oAssignData = { ...mockAssignData };

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

    let projectDocumentModel = {
      ...mockProjectDocumentData,
    } as ProjectDocumentModel;
    this.setModel(new JSONModel(projectDocumentModel), "PrjDocumentInit");

    let oStaffPool = {
      tkdd: [],
      xdcb: [],
      qlcl: [],
    };
    this.setModel(new JSONModel(oStaffPool), "staffPool");

    this.router
      .getRoute("RouteProject")
      ?.attachPatternMatched(this.onDetailMatched);

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
  public override onExit(): void | undefined {
    const projectInitForm = this.getModel("projectInitForm");
    if (projectInitForm) {
      projectInitForm.setProperty("/", { ...mockProjectInitialData });
    }

    const projectModel = this.getModel("ProjectStageModel");
    if (projectModel) {
      projectModel.setProperty("/", { ...mockStateModel });
    }

    const assignData = this.getModel("assignData");
    if (assignData) {
      assignData.setProperty("/", { ...mockAssignData });
    }

    const workflowData = this.getModel("workflowData");
    if (workflowData) {
      workflowData.setProperty("/", { ...mockWorkflowData });
    }

    const stepTableModel = this.getModel("stepTableModel");
    if (stepTableModel) {
      stepTableModel.setProperty("/selectedIndices", []);
    }

    const approvalHistory = this.getModel("approvalHistory");
    if (approvalHistory) {
      approvalHistory.setProperty("/", { ...mockApprovalHistoryData });
    }

    const project = this.getModel("project");
    if (project) {
      project.setProperty("/StepList", []);
    }

    const prjDocumentInit = this.getModel("PrjDocumentInit");
    if (prjDocumentInit) {
      prjDocumentInit.setProperty("/", { ...mockProjectDocumentData });
    }

    const staffPool = this.getModel("staffPool");
    if (staffPool) {
      staffPool.setProperty("/", { tkdd: [], xdcb: [], qlcl: [] });
    }
  }
  private onCreateMatched = (onCreateMatched: Route$PatternMatchedEvent) => {
    let stateModel = this.getModel("ProjectStageModel");
    if (stateModel) {
      stateModel.setProperty("/Step", 0);
      stateModel.setProperty("/isCreateStage", true);
    }
  };

  private onApprovalMatched = (
    onApprovalMatched: Route$PatternMatchedEvent,
  ) => {
    this.loadMetaData(onApprovalMatched);

    let stateModel = this.getModel("ProjectStageModel");
    if (stateModel) {
      stateModel.setProperty("/isApproveStage", true);
      stateModel.setProperty("/isCreateStage", false);
    }
  };

  private onContractorMatched = (onMatched: Route$PatternMatchedEvent) => {
    this.loadMetaData(onMatched);

    let stateModel = this.getModel("ProjectStageModel");
    if (stateModel) {
      stateModel.setProperty("/isContractorStage", true);
    }
  };

  private onRoleAssignMatched = (
    onRoleAssignMatched: Route$PatternMatchedEvent,
  ) => {
    const args = <DetailRouteArgs>onRoleAssignMatched.getParameter("arguments");
    const sBranchId = args?.branchId;
    this.departmentId = args?.departmentId;

    this.loadProject(sBranchId)
      .then(() => {
        this.loadDept(this.departmentId || "");

        let stateModel = this.getModel("ProjectStageModel");
        if (stateModel) {
          stateModel.setProperty("/isRoleAssignStage", true);
        }
      })
      .catch((err) => {
        MessageBox.error(err.message || "Failed to load role assignment data");
      });
  };
  private onEditInitMatched = (Event: Route$PatternMatchedEvent) => {
    this.loadMetaData(Event);

    let stateModel = this.getModel("ProjectStageModel");
    if (stateModel) {
      stateModel.setProperty("/Step", 0);
      stateModel.setProperty("/isEditInitStage", true);
    }
  };

  private onDetailMatched = (Event: Route$PatternMatchedEvent) => {
    let stateModel = this.getModel("ProjectStageModel");
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

        // Load workflow data for the project
        const oWorkflowModel = this.getModel("workflowData");

        const sWorkItemId = args?.workItemId;

        if (sWorkItemId) {
          oWorkflowModel.setProperty("/workItemId", sWorkItemId);
          this.workItemId = sWorkItemId;
          console.log(oWorkflowModel.getData());
        }

        if (sBranchId) {
          return this.loadProject(sBranchId);
        }
      })
      .then(() => {
        this.getListFileProjInit();
        if (this.step > 1) {
          this.loadProjectSteps(this.branchId);
        }
        if (this.step > 5) {
          this.loadAllDeptStaff();
        }
        if (this.step > 5) {
          this.loadAssignments();
        }
      })
      .catch((error) => {
        MessageBox.error(error);
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
            error: (error: ODataError) => {
              const oResponse = JSON.parse(
                error.responseText || "",
              ) as ErrorCustom;
              const message = oResponse.error.message.value || "Request Failed";

              MessageBox.error(message);
            },
          },
        );

        this.getView()?.setBusy(false);
      },
      error: (error: ODataError) => {
        const oResponse = JSON.parse(error.responseText || "") as ErrorCustom;
        const message = oResponse.error.message.value || "Request Failed";

        MessageBox.error(message);

        this.getView()?.setBusy(false);
      },
    });
  }

  public onChangeValue(event: InputBase$ChangeEvent) {
    const input = this.getControlById<TextArea>("inputPheDuyet");
    const value = event.getSource().getValue();

    if (!value) {
      input.setValueState("Error");
      input.setValueStateText("Yêu cầu nhập ý kiến");
    } else {
      input.setValueState("None");
    }
  }

  // Step 1 Approve / Reject / Back author
  public onPressApprovalStage(event: Button$PressEvent) {
    this.getView()?.setBusy(true);
    const button = event.getSource();
    const actionData = button.data("buttonData") as string;

    const oDataModel = this.getModel<ODataModel>();

    if (actionData === "B" || actionData === "N") {
      if (!this.commentDialog) {
        this.commentDialog = new Dialog({
          contentWidth: "600px",
          contentHeight: "200px",
          type: DialogType.Message,
          state: ValueState.Information,
          title: "Ý kiến",
          content: new VBox({
            items: [
              new TextArea({
                id: this.createId("inputPheDuyet"),
                placeholder: "Nhập ý kiến",
                liveChange: this.onChangeValue.bind(this),
                width: "100%",
                height: "150px",
              }),
            ],
          }),
          beginButton: new Button({
            text: "Gửi",
            type: "Emphasized",
            press: () => {
              const input = this.getControlById<TextArea>("inputPheDuyet");
              const comment = input.getValue();
              if (
                comment === "" &&
                (actionData === "N" || actionData === "B")
              ) {
                input.setValueState("Error");
                input.setValueStateText("this field is required!");
                return;
              }
              oDataModel.create(
                "/ProcessExecuteSet",
                {
                  WiId: this.workItemId,
                  Action: actionData,
                  BranchId: this.branchId,
                  Comment: comment,
                },
                {
                  success: async () => {
                    MessageBox.success("Thành công");
                    await this.loadProject(this.branchId);
                    this.getView()?.setBusy(false);
                    button.setEnabled(false);
                  },
                  error: (error: ODataError) => {
                    const oResponse = JSON.parse(
                      error.responseText || "",
                    ) as ErrorCustom;
                    const message =
                      oResponse.error.message.value || "Request Failed";

                    MessageBox.error(message);
                    this.getView()?.setBusy(false);
                  },
                },
              );

              this.commentDialog.close();
            },
          }),

          endButton: new Button({
            text: "Huỷ",
            type: "Default",
            press: () => {
              const input = this.getControlById<TextArea>("inputPheDuyet");
              this.commentDialog.close();
              input.setValue("");
              input.setValueState("None");
            },
          }),
        });
      }
      this.getView()?.setBusy(false);
      this.commentDialog.open();
    } else {
      MessageBox.confirm("Xác nhận Phê duyệt", {
        actions: ["Xác nhận", "Huỷ"],
        emphasizedAction: "Xác nhận",
        onClose: (action: string) => {
          if (action === "Xác nhận") {
            oDataModel.create(
              "/ProcessExecuteSet",
              {
                WiId: this.workItemId,
                Action: actionData,
                BranchId: this.branchId,
              },
              {
                success: () => {
                  MessageBox.success("Phê duyệt thành công");
                  this.getView()?.setBusy(false);
                  button.setEnabled(false);
                },
                error: (error: ODataErrorResponse) => {
                  this.getView()?.setBusy(false);
                  console.log(error);
                },
              },
            );
          }
        },
      });
      this.getView()?.setBusy(false);
    }
  }

  // Step 2: Assign Users Submit
  public onActionAssignSubmit() {
    this.getView()?.setBusy(true);

    const assignData = this.getModel("assignData")?.getData() as AssignData;
    const oDataModel = this.getModel<ODataModel>();

    oDataModel.setUseBatch(false);

    const roleMap = [
      { key: "tkdd", assignId: "1" },
      { key: "giamsat", assignId: "2" },
      { key: "kienTruc", assignId: "3" },
      { key: "dienMang", assignId: "4" },
      { key: "duToan", assignId: "5" },
      { key: "quyetToan", assignId: "6" },
      { key: "nhnn", assignId: "7" },
    ];

    console.log(assignData);

    const assignList = roleMap
      .map((role) => {
        const roleData = (assignData as any)?.[role.key];
        if (!roleData || !roleData.selectedKey) {
          return null;
        }

        const uname =
          roleData.selectedKey === "KHAC"
            ? roleData.manualId
            : roleData.selectedKey;

        if (!uname) {
          return null;
        }

        return {
          BranchId: this.branchId,
          StepId: this.step.toString() || "",
          Uname: uname,
          AssignId: role.assignId,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    const payload = {
      BranchId: this.branchId,
      AssignList: assignList,
    };

    console.log("Assign payload:", payload);

    oDataModel.create("/AssignHeaderSet", payload, {
      success: () => {
        MessageBox.confirm("Xác nhận", {
          actions: ["Xác nhận", "Huỷ"],
          emphasizedAction: "Xác nhận",
          onClose: (action: string) => {
            if (action === "Xác nhận") {
              oDataModel.create(
                "/ProcessExecuteSet",
                {
                  WiId: this.workItemId,
                  Action: "Y",
                  BranchId: this.branchId,
                },
                {
                  success: (response: ODataResponse) => {
                    console.log(response);
                    this.getView()?.setBusy(false);
                    MessageBox.success("Đã phân công thành công!");
                  },
                  error: (error: ODataError) => {
                    const oResponse = JSON.parse(
                      error.responseText || "",
                    ) as ErrorCustom;
                    const message =
                      oResponse.error?.message?.value || "Request Failed";
                    MessageBox.error(message);
                    this.getView()?.setBusy(false);
                  },
                },
              );
            }
          },
        });
      },
      error: (error: ODataError) => {
        const oResponse = JSON.parse(error.responseText || "{}") as ErrorCustom;
        const message = oResponse.error?.message?.value || "Request Failed";
        MessageBox.error(message);
        this.getView()?.setBusy(false);
      },
    });
  }

  // Step 3: Send Contract
  public onActionSendContractor() {
    this.getView()?.setBusy(true);
    const projectModel = this.getModel("projectInitForm");
    const data = <ProjectFormData>projectModel?.getData();

    if (!data) {
      MessageBox.error("Không có thông tin dự án!");
      return;
    }
    // Destructure data
    const {
      areaKhac,
      regionKhac,
      planTypeKhac,
      tenNganHangKhac,
      loaiCongTrinhKhac,
      loaiHinhDonViKhac,
      Status,
      Step,
      ...payload
    } = data;

    const oDataModel = this.getModel<ODataModel>();
    oDataModel.setUseBatch(false);
    MessageBox.confirm("Xác nhận", {
      actions: ["Xác nhận", "Huỷ"],
      emphasizedAction: "Xác nhận",
      onClose: (action: string) => {
        if (action === "Xác nhận") {
          oDataModel.create("/ProjectSet", payload, {
            success: (response: ODataResponse) => {
              console.log(response);

              oDataModel.create(
                "/ProcessExecuteSet",
                {
                  WiId: this.workItemId,
                  Action: "Y",
                  BranchId: this.branchId,
                },
                {
                  success: async (response: ODataResponse) => {
                    console.log(response);
                    await this.loadProject(this.branchId);
                    this.getView()?.setBusy(false);
                    MessageBox.success("Đã gửi thông tin nhà thầu thành công!");
                  },
                  error: (error: ODataError) => {
                    this.getView()?.setBusy(false);

                    MessageBox.error(error as string);
                  },
                },
              );
            },
            error: (error: ODataError) => {
              this.getView()?.setBusy(false);

              MessageBox.error(error as string);
            },
          });
        }
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
    return new Promise((resolve, reject) => {
      const projectInitModel = this.getModel("projectInitForm");
      const oDataModel = this.getModel<ODataModel>();

      oDataModel.setUseBatch(false);
      oDataModel.read(`/ProjectSet('${BranchId}')`, {
        success: (response: ODataResponse<ProjectFormData>) => {
          const updates = this.matchProjectResponseToDisplay(response);
          const { objectkey, mimetype, ...responseClean } = response as any;

          projectInitModel?.setProperty("/", {
            ...responseClean,
            ...updates,
          });
          this.branchId = response.BranchId;

          this.getModel("ProjectStageModel")?.setProperty(
            "/Step",
            parseInt(response.Step?.toString() || "0", 10) || 0,
          );

          console.log(this.getModel("ProjectStageModel").getData());

          this.step = response.Step || 0;
          resolve(true);
        },
        error: (error: ODataError) => {
          reject(error);
        },
      });
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

  private loadDept(deptId: string) {
    const oDataModel = this.getModel<ODataModel>();
    oDataModel.setUseBatch(false);

    oDataModel.read("/EmployeesSet", {
      filters: [new Filter("Department", "EQ", deptId)],
      success: (response: ODataResponses<EmployeeItem[]>) => {
        const employees = Array.isArray(response) ? response : response.results;

        this.saveAssignData(employees, deptId);
      },
      error: (error: ODataError) => {
        MessageBox.error(error.message || "Failed to load employees");
      },
    });
  }

  private saveAssignData(payload: EmployeeItem[], deptId: string) {
    const khacItem: EmployeeItem = {
      Id: "KHAC",
      Name: "Khác (Nhập tay thông tin)",
      Uname: "KHAC",
      Mail: "",
      Department: deptId,
      CbqlId: "",
      LdId: "",
      ProjectCount: "0",
    };

    let staffPoolData: {
      tkdd?: EmployeeItem[];
      xdcb?: EmployeeItem[];
      qlcl?: EmployeeItem[];
    } = {};
    switch (deptId) {
      case "1":
        staffPoolData = {
          tkdd: [khacItem, ...payload],
        };
        break;
      case "2":
        staffPoolData = {
          xdcb: [khacItem, ...payload],
        };
        break;
      case "3":
        staffPoolData = {
          qlcl: [khacItem, ...payload],
        };
        break;
      default:
        break;
    }

    this.getModel("staffPool")?.setProperty("/", staffPoolData);
    console.log(this.getModel("staffPool")?.getProperty("/"));
  }

  public loadAllDeptStaff() {
    const oDataModel = this.getModel<ODataModel>();
    oDataModel.setUseBatch(false);

    this.loadDept("1");

    this.loadDept("2");

    this.loadDept("3");
  }

  public loadAssignments() {
    const oDataModel = this.getModel<ODataModel>();
    oDataModel.setUseBatch(false);

    oDataModel.read("/EmpAssignSet", {
      filters: [new Filter("BranchId", FilterOperator.EQ, this.branchId)],
      success: (response: ODataResponses<any[]>) => {
        const assignments = Array.isArray(response)
          ? response
          : response.results;
        const assignData = this.getModel("assignData")?.getData();
        if (!assignData) return;

        const assignIdToRole: Record<string, keyof typeof assignData> = {
          "1": "tkdd",
          "2": "giamsat",
          "3": "kienTruc",
          "4": "dienMang",
          "5": "duToan",
          "6": "quyetToan",
          "7": "nhnn",
        };

        assignments.forEach((item: any) => {
          const roleKey = assignIdToRole[item.AssignId];
          if (roleKey && item.Uname) {
            assignData[roleKey].selectedKey = item.Uname;
          }
        });

        this.getModel("assignData")?.setProperty("/", { ...assignData });
      },
      error: (error: ODataError) => {
        console.log("Failed to load assignments", error);
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
      Status: "1",
      PlanStart: "",
      StartStatus: "1",
      Deadline: "",
      StepName: selectedStep.StepName,
    };

    projectModel?.setProperty("/StepList", [...currentList, newStep]);
    select.setSelectedKey("");
  }

  public onStepSelected(oEvent: Select$ChangeEvent) {
    const select = oEvent.getSource();
    const selectedKey = select.getSelectedKey();

    if (!selectedKey) {
      return;
    }

    const stepPoolModel = this.getModel("stepPool");
    const poolData = stepPoolModel?.getData() as
      { availableSteps?: { StepId: string; StepName: string }[] } | undefined;

    const selectedStep = poolData?.availableSteps?.find(
      (step) => step.StepId === selectedKey,
    );

    console.log(selectedStep, selectedStep?.StepName);
    if (selectedStep) {
      const dialog = select.getParent() as Dialog;
      const model = dialog.getModel("projectStepDetail") as JSONModel;
      model.setProperty("/StepName", selectedStep.StepName);
    }
  }

  public onDeleteStep() {
    this.getView()?.setBusy(true);
    const projectModel = this.getModel("project");
    const data = projectModel?.getData() as
      { StepList?: ProjectStepItem[] } | undefined;
    const currentList = data?.StepList || [];

    const indices = this.stepTable.getSelectedIndices();
    if (!indices.length) {
      MessageBox.warning("Vui lòng chọn bước cần xóa.");
      this.getView()?.setBusy(false);
      return;
    }

    const item = <ProjectStepItem>(
      this.stepTable.getContextByIndex(indices[0])?.getObject()
    );
    if (!item) {
      MessageBox.error("Không xác định được bước được chọn.");
      this.getView()?.setBusy(false);
      return;
    }

    MessageBox.confirm(
      `Bạn có muốn xóa bước "${item.StepName || item.StepId}"?`,
      {
        actions: [MessageBox.Action.DELETE, MessageBox.Action.CANCEL],
        emphasizedAction: MessageBox.Action.DELETE,
        onClose: (action: unknown) => {
          if (action === MessageBox.Action.DELETE) {
            const updatedList = currentList.map((step) =>
              step.StepId === item.StepId
                ? { ...step, DeletedFlag: "X" }
                : step,
            );

            const payload = this.sanitizeStepPayload(updatedList, true);

            const oDataModel = this.getModel<ODataModel>();
            oDataModel.setUseBatch(false);

            oDataModel.create("/ProjectHeaderSet", payload, {
              success: () => {
                projectModel?.setProperty("/StepList", updatedList);
                this.stepTable.clearSelection();
                this.getView()?.setBusy(false);
                MessageBox.success("Xóa bước thành công.");
                this.loadProjectSteps(this.branchId);
              },
              error: (error: ODataError) => {
                const oResponse = JSON.parse(
                  error.responseText || "",
                ) as ErrorCustom;
                const message =
                  oResponse.error.message.value || "Request Failed";

                MessageBox.error(message);

                this.getView()?.setBusy(false);
              },
            });
          }
        },
      },
    );
  }

  private sanitizeStepPayload(
    stepList: ProjectStepItem[],
    isDelete = false,
  ): { BranchId: string; StepList: ProjectStepItem[] } {
    const sanitized = stepList.map((step) => {
      const base: any = {
        BranchId: step.BranchId,
        StepId: step.StepId,
        Status: step.Status,
        PlanStart: step.PlanStart,
        StartStatus: step.StartStatus,
        Deadline: step.Deadline,
      };

      if (isDelete && step.DeletedFlag === "X") {
        base.DeletedFlag = "X";
      }

      return base;
    });

    return {
      BranchId: this.branchId,
      StepList: sanitized,
    };
  }

  public onPressStep(oEvent: any) {
    // const ctx = oEvent.getSource().getBindingContext("project");
    // const step = ctx?.getObject();
    // MessageBox.information(`Bước: ${step?.StepName || step?.StepId}`);
    // this.branchId = step?.BranchId || "";
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

    if (!formData.StepId) {
      MessageBox.error("Vui lòng chọn bước.");
      return;
    }

    const oDataModel = this.getModel<ODataModel>();
    oDataModel.setUseBatch(false);

    const projectModel = this.getModel("project");
    const projectData = projectModel?.getData() as
      { StepList?: ProjectStepItem[]; BranchId?: string } | undefined;
    const currentList = projectData?.StepList || [];

    let updatedList: ProjectStepItem[];

    if (this.isCreatingStep) {
      const exists = currentList.some(
        (step) => step.StepId === formData.StepId,
      );
      if (exists) {
        MessageBox.error("Bước này đã tồn tại trong danh sách.");
        return;
      }

      const newStep: ProjectStepItem = {
        BranchId: this.branchId,
        StepId: formData.StepId,
        Status: formData.Status || "0",
        PlanStart: formData.PlanStart || "",
        StartStatus: formData.StartStatus || "0",
        Deadline: formData.Deadline || "",
        StepName: formData.StepName || "",
      };

      updatedList = [...currentList, newStep];
    } else {
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

      updatedList = currentList.map((step) =>
        step.StepId === selectedItem.StepId ? { ...step, ...formData } : step,
      );
    }

    const payload = this.sanitizeStepPayload(updatedList, false);

    console.log(payload);

    oDataModel.create("/ProjectHeaderSet", payload, {
      success: () => {
        this.loadProjectSteps(this.branchId);
        dialog.close();
        this.stepTable.clearSelection();
        MessageBox.success(
          this.isCreatingStep
            ? "Tạo bước thành công!"
            : "Cập nhật bước thành công!",
        );
      },
      error: (error: ODataError) => {
        const oResponse = JSON.parse(error.responseText || "") as ErrorCustom;
        const message = oResponse.error.message.value || "Request Failed";

        MessageBox.error(message);

        this.getView()?.setBusy(false);
      },
    });
  }
  public async openCreateStepDialog() {
    this.isCreatingStep = true;
    try {
      if (!this.detailProjectStepDialog) {
        this.detailProjectStepDialog =
          await this.loadView<Dialog>("ProjectStepDetail");
      }

      const form = {
        BranchId: this.branchId,
        StepId: "1",
        Status: "1",
        PlanStart: "",
        StartStatus: "1",
        Deadline: "",
      };

      this.detailProjectStepDialog.setModel(
        new JSONModel(form),
        "projectStepDetail",
      );
      this.detailProjectStepDialog.open();
    } catch (error) {
      console.log(error);
    }
  }

  public async onEditStepDialog() {
    this.isCreatingStep = false;
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
        comments: [],
        stepDocuments: [],
      };

      const model = new JSONModel(form);
      this.detailProjectStepDialog.setModel(model, "projectStepDetail");

      if (SelectedItem.BranchId && SelectedItem.StepId) {
        this.loadStepComments(SelectedItem.BranchId, SelectedItem.StepId);
        this.loadStepDocuments(
          SelectedItem.BranchId,
          SelectedItem.StepId,
          model,
        );
      }

      this.detailProjectStepDialog.open();
    } catch (error) {
      console.log(error);
    }
  }

  private loadStepComments(branchId: string, stepId: string) {
    const oDataModel = this.getModel<ODataModel>();
    oDataModel.setUseBatch(false);

    oDataModel.read("/CommentSet", {
      filters: [
        new Filter("BranchId", FilterOperator.EQ, branchId),
        new Filter("StepId", FilterOperator.EQ, stepId),
      ],
      success: (response: ODataResponses<CommentItem[]>) => {
        const mapped: StepCommentItem[] = response.results.map(
          (c: CommentItem) => ({
            Author: c.CreateBy || "",
            Date: c.CreateDate || "",
            Text: c.Content || "",
          }),
        );

        const model = <JSONModel>(
          this.detailProjectStepDialog.getModel("projectStepDetail")
        );
        model?.setProperty("/comments", mapped);
      },
      error: (error: ODataError) => {
        const oResponse = JSON.parse(error.responseText || "") as ErrorCustom;
        const message = oResponse.error.message.value || "Request Failed";

        MessageBox.error(message);

        this.getView()?.setBusy(false);
      },
    });
  }

  private loadStepDocuments(
    branchId: string,
    stepId: string,
    model: JSONModel,
  ) {
    const oDataModel = this.getModel<ODataModel>();
    oDataModel.setUseBatch(false);

    oDataModel.read("/ProjectFileListSet", {
      filters: [
        new Filter("BranchId", FilterOperator.EQ, branchId),
        new Filter("StepId", FilterOperator.EQ, stepId),
      ],
      success: (response: ODataResponses<any[]>) => {
        const docs = Array.isArray(response) ? response : response.results;
        const mapped = docs.map((d: any) => ({
          FileName: d.Filename || "",
          Url: `/sap/opu/odata/sap/ZODATA_CONG_TRINH_VPB_SRV/ProjectFileSet(BranchId='${branchId}',StepId='${stepId}',FileId='${d.FileId}')/$value`,
          Mimetype: d.MimeType || "",
          CreateBy: d.CreateBy || "",
          CreateDate: d.CreateDate || "",
          CreateTime: d.CreateTime || "",
        }));

        model.setProperty("/stepDocuments", mapped);
      },
      error: (error: ODataError) => {
        const oResponse = JSON.parse(error.responseText || "") as ErrorCustom;
        const message = oResponse.error.message.value || "Request Failed";

        MessageBox.error(message);

        this.getView()?.setBusy(false);
      },
    });
  }

  public onPost(event: FeedInput$PostEvent) {
    const text = event.getParameter("value");
    if (!text) {
      return;
    }

    const model = this.detailProjectStepDialog.getModel(
      "projectStepDetail",
    ) as JSONModel;
    const data = model.getData() as ProjectStepItem & { BranchId?: string };

    if (!data.BranchId || !data.StepId) {
      MessageBox.error("Thiếu thông tin BranchId hoặc StepId.");
      return;
    }

    const oDataModel = this.getModel<ODataModel>();
    oDataModel.setUseBatch(false);

    const payload = {
      StepId: data.StepId,
      Content: text,
      BranchId: data.BranchId,
    };

    oDataModel.create("/CommentSet", payload, {
      success: () => {
        this.loadStepComments(data.BranchId, data.StepId);
      },
      error: (error: ODataError) => {
        const oResponse = JSON.parse(error.responseText || "") as ErrorCustom;
        const message = oResponse.error.message.value || "Request Failed";

        MessageBox.error(message);

        this.getView()?.setBusy(false);
      },
    });
  }

  public onCloseStepDialog() {
    this.detailProjectStepDialog?.close();
    this.detailProjectStepDialog.setModel(null, "projectStepDetail");
  }

  public loadProjectSteps(branchId: string, modelName = "project"): void {
    const oDataModel = this.getModel<ODataModel>();
    oDataModel.setUseBatch(false);

    oDataModel.read("/ProjectStepSet", {
      filters: [new Filter("BranchId", "EQ", branchId)],
      success: (response: ODataResponses<ProjectStepItem[]>) => {
        this.getModel(modelName)?.setProperty(
          "/StepList",
          response.results || [],
        );
      },
      error: (error: ODataError) => {
        const oResponse = JSON.parse(error.responseText || "") as ErrorCustom;
        const message = oResponse.error.message.value || "Request Failed";

        MessageBox.error(message);

        this.getView()?.setBusy(false);
      },
    });
  }

  //#endregion StepsAction

  //#region  validation
  // 1. Validation định dạng mã book: VNxxxxxxx
  public onValidateMaBook(oEvent: any) {
    let oInput = oEvent.getSource();
    let sValue = oInput.getValue();
    let regex = /^VN\d{7}$/; // Ví dụ mẫu kiểm tra VN + 8 ký tự số

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

  public formatDate(sDate: string): string {
    if (!sDate || sDate.length !== 8) {
      return "";
    }

    return `${sDate.substring(0, 4)}-${sDate.substring(4, 6)}-${sDate.substring(6, 8)}`;
  }

  private matchProjectResponseToDisplay(response: ProjectFormData) {
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

    return updates;
  }

  public formatStepName(stepId: string): string {
    const stepPool = this.getModel("stepPool")?.getData() as
      { availableSteps?: { StepId: string; StepName: string }[] } | undefined;
    const step = stepPool?.availableSteps?.find((s) => s.StepId === stepId);
    return step?.StepName || stepId;
  }

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

  public formatStepStartStatus(statusKey: string): {
    text: string;
    state: string;
  } {
    const map: Record<string, { text: string; state: string }> = {
      "1": { text: "Triển khai sớm hơn kế hoạch", state: "Success" },
      "2": { text: "Triển khai đúng kế hoạch", state: "Information" },
      "3": { text: "Triển khai trễ kế hoạch", state: "Warning" },
    };
    return map[statusKey] ?? { text: statusKey, state: "None" };
  }

  public formatStepStartStatusText(statusKey: string): string {
    return this.formatStepStartStatus(statusKey).text;
  }

  public formatStepStartStatusState(statusKey: string): string {
    return this.formatStepStartStatus(statusKey).state;
  }

  public formatStepStatus(statusKey: string): { text: string; state: string } {
    const map: Record<string, { text: string; state: string }> = {
      "1": { text: "Chưa triển khai", state: "Warning" },
      "2": { text: "Đang triển khai", state: "Information" },
      "3": { text: "Hoàn thành", state: "Success" },
    };
    return map[statusKey] ?? { text: statusKey, state: "None" };
  }

  public formatStepStatusText(statusKey: string): string {
    return this.formatStepStatus(statusKey).text;
  }

  public formatStepStatusState(statusKey: string): string {
    return this.formatStepStatus(statusKey).state;
  }

  public getState(statusKey: string): string {
    const map: Record<string, string> = {
      "1": "Warning",
      "2": "Success",
    };
    return map[statusKey] ?? statusKey;
  }

  public formatSectionVisible(step: string, section: string): boolean {
    if (step === "0" && section === "ScanTool") {
      return true;
    }
    return false;
  }
  //#endregion Header formatter

  //#region FileHadler

  public async UploadScanFile(event: FileUploader$ChangeEvent) {
    const files = event.getParameter("files");
    const uploader = event.getSource();

    if (!files || files.length === 0) {
      return;
    }

    const file = files[0] as File;
    uploader.setBusy(true);

    try {
      await this.uploadFileScanner("/ProjUploadSet", file).then(
        (response: ODataResponse<ProjectFormData>) => {
          const projectModel = this.getModel("projectInitForm");
          response.PlanStart = this.formatDate(response.PlanStart);

          if (projectModel) {
            const updates = this.matchProjectResponseToDisplay(response);
            const {
              objectKey,
              Mimetype,
              CreatedDate,
              CreatedBy,
              Status,
              AirConditioningContractor,
              ConstructionContractor,
              ElecNetCamContractor,
              InteriorContractor,
              ...responseClean
            } = response as any;

            projectModel.setProperty("/", {
              ...responseClean,
              ...updates,
            });

            console.log("Project model updated:", projectModel.getData());
          }
        },
      );
      MessageBox.success("Doc file thành công");
    } catch (error) {
      MessageBox.error("Doc file thất bại");
    } finally {
      uploader.setBusy(false);
      uploader.clear();
    }
  }

  public onBeforeItemAdded(event: UploadSet$BeforeItemAddedEvent) {
    event.preventDefault();
    const uploadUrl = "/ProjectFileSet";
    const uploadSet = event.getSource();
    const item = <UploadSetItem>event.getParameter("item");
    const file = <File>item?.getFileObject();

    if (!this.branchId) {
      this.branchId = this.getModel("projectInitForm")?.getProperty(
        "/BranchId",
      ) as string;
    }

    if (!this.step) {
      this.step = 0;
    }
    if (file) {
      uploadSet.setBusy(true);
      console.log(this.branchId, this.step);
      this.uploadFile(uploadUrl, file, this.branchId, this.step.toString())
        .then((response: ODataResponse<unknown>) => {
          this.getListFileProjInit();
        })
        .catch((error: any) => {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(error.responseText, "text/xml");
          const mgserr = xmlDoc.querySelector("message")?.textContent as string;
          MessageBox.error(mgserr);
        })
        .finally(() => {
          uploadSet.setBusy(false);
        });
    }
  }

  public getListFileProjInit() {
    const oDataModel = this.getModel<ODataModel>();
    oDataModel.setUseBatch(false);
    const model = this.getModel("PrjDocumentInit");

    const filters = [
      new Filter("BranchId", FilterOperator.EQ, this.branchId),
      new Filter("StepId", FilterOperator.EQ, this.step.toString()),
    ];

    oDataModel.read("/ProjectFileListSet", {
      filters: filters,
      success: (odata: ODataResponses<ProjectDocumentItem[]>) => {
        const attachments = odata.results.map((item: ProjectDocumentItem) => {
          let Url = `/sap/opu/odata/sap/ZODATA_CONG_TRINH_VPB_SRV/ProjectFileSet(BranchId='${this.branchId}',StepId='${this.step}',FileId='${item.FileId}')/$value`;
          return { ...item, Url };
        });
        model.setProperty("/DocumentList", attachments);
      },
      error: () => {},
    });
  }

  public onOpenPressed(event: UploadSetItem$OpenPressedEvent) {
    event?.preventDefault();

    const item = event.getSource();

    const context = item?.getBindingContext("PrjDocumentInit");
    const parent = item?.getParent() as UploadSet;
    const fileName = context?.getProperty("Filename") as string;
    const fileKey = item.data("FileId") as string;

    const Path = `/sap/opu/odata/sap/ZODATA_CONG_TRINH_VPB_SRV/ProjectFileSet(BranchId='${this.branchId}',StepId='${this.step.toString()}',FileId='${fileKey}')/$value`;
    console.log(Path);

    this.downloadFile(Path, fileName, parent);
  }

  public onItemDeleteFileZ9(event: UploadSet$BeforeItemRemovedEvent) {
    event.preventDefault();
    const item = event.getParameter("item") as UploadSetItem;
    const FileName = item.getFileName();

    const uploadSet = this.getControlById<UploadSet>("UploadSetProj");
    const FileId = item.data("FileId") as string;

    const Path = `/sap/opu/odata/sap/ZODATA_CONG_TRINH_VPB_SRV/ProjectFileSet(BranchId='${this.branchId}',FileId='${FileId}',StepId='${this.step}')`;

    const oDataModel = this.getModel<ODataModel>();
    oDataModel.setUseBatch(false);
    oDataModel.remove(Path, {
      success: () => {
        uploadSet.removeItem(item);
      },
      error: (errorL: ODataError) => {},
    });
  }

  //#endregion FileHadler
}
