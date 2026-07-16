import type ResourceBundle from "sap/base/i18n/ResourceBundle";
import type Control from "sap/ui/core/Control";
import UI5Element from "sap/ui/core/Element";
import Controller from "sap/ui/core/mvc/Controller";
import type View from "sap/ui/core/mvc/View";
import syncStyleClass from "sap/ui/core/syncStyleClass";
import UIComponent from "sap/ui/core/UIComponent";
import JSONModel from "sap/ui/model/json/JSONModel";
import Model from "sap/ui/model/Model";
import type ODataModel from "sap/ui/model/odata/v2/ODataModel";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import type Component from "../Component";

import type Input from "sap/m/Input";
import type TextArea from "sap/m/TextArea";
import type MultiInput from "sap/m/MultiInput";
import type DatePicker from "sap/m/DatePicker";
import type Select from "sap/m/Select";
import type TimePicker from "sap/m/TimePicker";
import type ComboBox from "sap/m/ComboBox";
import type MultiComboBox from "sap/m/MultiComboBox";
import type PropertyBinding from "sap/ui/model/PropertyBinding";
import type SimpleType from "sap/ui/model/SimpleType";
import Formatter from "../utils/Formatter";
import type { Dict } from "../types/utils";
import type {
  BindingContextInfoTarget,
  CompositeBindingInfo,
} from "../types/control";

const formControlTypes = [
  "sap.m.Input",
  "sap.m.TextArea",
  "sap.m.DatePicker",
  "sap.m.Select",
  "sap.m.RadioButtonGroup",
  "sap.m.CheckBox",
  "sap.m.ComboBox",
] as const;

type FormControlType = (typeof formControlTypes)[number];

/**
 * @namespace sphinx.project.controller
 */
export default class Base extends Controller {
  public formatter = Formatter;
  public dataType = {};
  private csrfToken: string | null;

  protected getRouter() {
    return UIComponent.getRouterFor(this);
  }

  protected getModel<T = JSONModel>(name?: string) {
    return this.getView()?.getModel(name) as T;
  }

  protected setModel(model: Model, name?: string) {
    this.getView()?.setModel(model, name);
  }

  protected getGlobalModel() {
    return this.getComponentModel("global");
  }

  protected getControlById<T = UI5Element>(id: string) {
    return this.getView()?.byId(id) as T;
  }

  protected getControlId<T = string>(control: UI5Element): T;
  // eslint-disable-next-line no-dupe-class-members
  protected getControlId<T = string | null>(control?: UI5Element): T;
  // eslint-disable-next-line no-dupe-class-members
  protected getControlId<T = string | null>(control?: UI5Element) {
    if (!control) return null;
    return this.getView()?.getLocalId(control.getId()) as T;
  }

  protected reload() {
    // eslint-disable-next-line fiori-custom/sap-no-location-reload
    window.location.reload();
  }

  protected getResourceBundle() {
    const resourceModel = <ResourceModel>this.getComponent().getModel("i18n");
    return <ResourceBundle>resourceModel.getResourceBundle();
  }

  protected getBundleText(i18nKey: string, placeholders?: string[]) {
    return this.getResourceBundle().getText(i18nKey, placeholders) || i18nKey;
  }

  protected getComponent() {
    return this.getOwnerComponent() as Component;
  }

  protected getComponentModel<T = ODataModel>(name?: string) {
    return this.getComponent().getModel(name) as T;
  }

  protected setComponentModel(model: Model, name?: string) {
    this.getComponent().setModel(model, name);
  }

  protected getMetadataLoaded() {
    return this.getComponentModel().metadataLoaded();
  }

  protected attachControl(control: Control) {
    const view = <View>this.getView();

    const styleClass = this.getComponent().getContentDensityClass();

    syncStyleClass(styleClass, view, control);

    view.addDependent(control);
  }

  protected async loadView<T extends Control>(viewName: string) {
    const fragment = <Promise<T>>this.loadFragment({
      name: `${this.getAppID()}.view.fragments.${viewName}`,
    });

    fragment
      .then((control) => {
        this.attachControl(control);
      })
      .catch((error) => {
        console.log(error);
      });

    return fragment;
  }

  protected getAppID() {
    return <string>this.getComponent().getManifestEntry("/sap.app/id");
  }

  protected getControlName<T extends Control>(control: T): string {
    return control.getMetadata().getName();
  }

  protected isControl<T extends Control>(
    control: unknown,
    name: string,
  ): control is T {
    return this.getControlName(<Control>control) === name;
  }

  protected displayTarget(options: {
    target: string;
    title?: string;
    description?: string;
  }) {
    const { target, title, description } = options;

    void this.getRouter().getTargets()?.display(target);
  }

  /**
   * Get all form controls (Input, Select, DatePicker, etc.)
   * that belong to a specific FieldGroupId.
   *
   * - Searches inside the given container (or whole view if none).
   * - Filters only valid form controls (based on given types).
   * - Filters out invisible controls.
   *
   * @param props.groupId  One or more FieldGroupId values to match.
   * @param props.container Optional control to search inside.
   * @param props.types Optional allowed control types (defaults to all form controls).
   */
  protected getFormControlsByFieldGroup<T extends Control>(props: {
    groupId: string | string[];
    container?: Control;
    types?: readonly FormControlType[];
  }) {
    const { groupId, container, types = formControlTypes } = props;

    // If no container specified then use the entire View
    const _container = container ?? this.getView();

    if (!_container) return [];

    return _container.getControlsByFieldGroupId(groupId).filter((control) => {
      // Check if control is one of the allowed types
      const isFormControl = types.some((type) => this.isControl(control, type));

      const isVisible = control.getVisible();

      return isFormControl && isVisible;
    }) as T[];
  }

  protected getBindingContextInfo<C extends Control, T extends Dict = Dict>(
    source: C,
  ) {
    let bindingInfo = <CompositeBindingInfo>{
      parts: [],
    };

    switch (true) {
      case this.isControl<Input>(source, "sap.m.Input"):
      case this.isControl<TextArea>(source, "sap.m.TextArea"): {
        bindingInfo = source.getBindingInfo("value");

        break;
      }
      case this.isControl<MultiInput>(source, "sap.m.MultiInput"): {
        bindingInfo = source.getBindingInfo("tokens");

        break;
      }
      case this.isControl<DatePicker>(source, "sap.m.DatePicker"):
      case this.isControl<TimePicker>(source, "sap.m.TimePicker"): {
        bindingInfo = source.getBindingInfo("value");

        break;
      }
      case this.isControl<Select>(source, "sap.m.Select"):
      case this.isControl<ComboBox>(source, "sap.m.ComboBox"): {
        bindingInfo = source.getBindingInfo("selectedKey");

        break;
      }
      case this.isControl<MultiComboBox>(source, "sap.m.MultiComboBox"): {
        bindingInfo = source.getBindingInfo("selectedKeys");

        break;
      }
    }

    bindingInfo = bindingInfo || {
      parts: [],
    };

    const binding = bindingInfo.binding;
    const context = binding?.getContext();
    const model = <JSONModel>context?.getModel();
    const path = bindingInfo.parts?.[0]?.path || "";
    const modelName = bindingInfo.parts?.[0]?.model || "";

    const tooltipBinding = <PropertyBinding>source.getBinding("tooltip");

    const value: BindingContextInfoTarget<C, T> = {
      name: binding?.getPath() ?? path ?? "", // Property name (alt: getBindingPath)
      path: context?.getPath() ?? "", // Value binding path
      processor: context?.getModel(), // Binding model
      bindingType: <SimpleType>binding?.getType?.(), // Input data type,
      data: context?.getObject() as T, // Binding object value
      binding,
      model,
      modelName,
      label:
        <string>tooltipBinding?.getValue() || source.getTooltip_Text() || "",
      control: source,
      get target() {
        const path = this.path;
        const name = this.name;

        return `${path}${path === "/" ? "" : "/"}${name}`;
      },
    };

    return value;
  }

  protected callFunctionImport<T>(
    functionName: string,
    options: { params?: Dict; model?: string } = {},
  ) {
    const { params, model } = options;
    const oDataModel = this.getModel<ODataModel>(model);
    return new Promise<T>((resolve, reject) => {
      oDataModel.callFunction(functionName, {
        method: "GET",
        urlParameters: params,
        success: resolve,
        error: reject,
      });
    });
  }

  protected getMineType = (fileName: string): string => {
    const extension = fileName.split(".").pop()?.toLocaleLowerCase();
    switch (extension) {
      case "pdf":
        return "application/pdf";
      case "doc":
        return "application/msword";
      case "docx":
        return "application/vnd.openxmlformats-officedocment.wordprocessingml.doctument";
      case "xls":
        return "application/vnd.ms-excel";
      case "xlsx":
        return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      case "jpeg":
        return "image/jpeg";
      case "jpg":
        return "image/jpg";
      case "png":
        return "image/pjpeg";
      case "ppt":
        return "application/vnd.ms-powerpoint";
      case "pptx":
        return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
      case "txt":
        return "text/plain";
      case "xml":
        return "text/xl";
      case "zip":
        return "application/x-zip-compressed";
      case "zip1":
        return "application/zip";
      case "rar":
      case "7z":
      default:
        return "application/octet-stream";
    }
  };

  protected _download(url: string): Promise<{ blob: Blob; fileName: string }> {
    return new Promise((resolve, reject) => {
      void $.ajax({
        url,
        method: "GET",
        xhrFields: { responseType: "blob" },
      })
        .done((result, _textStatus, jqXHR) => {
          const disposition = jqXHR.getResponseHeader("content-disposition");
          const serverFileName =
            disposition?.split("filename=")[1]?.replace(/[";]/g, "")?.trim() ||
            "";

          resolve({ blob: result, fileName: serverFileName });
        })
        .fail(reject);
    });
  }

  protected downloadFile(
    sPath: string,
    fileName: string,
    oBusy: Control | null = null,
  ) {
    this._download(sPath)
      .then(({ blob, fileName: serverFileName }) => {
        var url = window.URL.createObjectURL(blob);
        var link = document.createElement("a");
        link.href = url;

        if (fileName) {
          link.setAttribute("download", fileName);
        }

        // ✅ ưu tiên fileName truyền vào, fallback về server filename
        link.setAttribute("download", fileName || serverFileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((error: any) => {
        console.log("Download error", error);
      })
      .finally(() => {
        oBusy?.setBusy(false);
      });
  }

  // protected downloadFile(
  //   Path: string,
  //   fileName: string | null = null,
  //   Busy: Control | null = null,
  // ) {
  //   this.download(Path)
  //     .then((blob: Blob) => {
  //       let url = window.URL.createObjectURL(blob);
  //       let link = document.createElement("a");
  //       link.href = url;
  //       link.style.display = "none";

  //       if (fileName) {
  //         link.setAttribute("download", fileName);
  //       }

  //       document.body.appendChild(link);
  //       link.click();
  //       document.body.removeChild(link);
  //     })
  //     .catch((error: any) => {
  //       console.error(error);
  //     })
  //     .finally(() => {
  //       Busy?.setBusy(false);
  //     });
  // }

  protected async uploadFile(
    sUploadUrl: string,
    oFile: File,
    branchId: string,
    step: string,
  ): Promise<any> {
    await this.fetchCsrfToken();

    return new Promise((resolve, reject) => {
      if (!oFile) {
        resolve({});
        return;
      }

      const reader = new FileReader();
      const fileName = oFile.name;
      const contentType = this.getMineType(fileName);

      reader.onload = (event: ProgressEvent<FileReader>) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;

        // const slug = `${magms}|${fileName}`;
        const slug = `${branchId}|${step}|${fileName}`;

        var oHeaders: Record<string, string> = {
          "Content-Type": contentType,
          "x-csrf-token": <string>this.csrfToken,
          slug: encodeURIComponent(slug),
        };
        const blob = new Blob([arrayBuffer], { type: contentType });
        void $.ajax({
          url: `/sap/opu/odata/sap/ZODATA_CONG_TRINH_VPB_SRV${sUploadUrl}`,
          method: "POST",
          headers: oHeaders,
          data: blob,
          processData: false,
          success: (data, textStatus, jqXHR) => {
            const objectKey = jqXHR.getResponseHeader("object-key");
            resolve(data);
          },
          error: (error: any) => {
            reject(error);
          },
        });
      };
      reader.onerror = (error: any) => {
        reject(error);
      };
      reader.readAsArrayBuffer(oFile);
    });
  }

  private async fetchCsrfToken() {
    const response = await fetch(
      "/sap/opu/odata/sap/ZODATA_CONG_TRINH_VPB_SRV" + "/",
      {
        method: "GET",
        headers: {
          "x-csrf-token": "Fetch",
        },
        credentials: "include",
      },
    );
    if (!response.ok) {
      throw new Error("No token");
    }
    this.csrfToken = response.headers.get("x-csrf-token");
    if (!this.csrfToken) {
      throw new Error("CSRF token dont exist in response");
    }
  }

  protected async uploadFileScanner(
    sUploadUrl: string,
    oFile: File,
  ): Promise<any> {
    await this.fetchCsrfToken();

    return new Promise((resolve, reject) => {
      if (!oFile) {
        resolve({});
        return;
      }

      const reader = new FileReader();
      const fileName = oFile.name;
      const contentType = this.getMineType(fileName);

      reader.onload = (event: ProgressEvent<FileReader>) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;

        const oHeaders: Record<string, string> = {
          "Content-Type": contentType,
          "x-csrf-token": <string>this.csrfToken,
        };

        const blob = new Blob([arrayBuffer], { type: contentType });

        void $.ajax({
          url: `/sap/opu/odata/sap/ZODATA_CONG_TRINH_VPB_SRV${sUploadUrl}`,
          method: "POST",
          headers: oHeaders,
          data: blob,
          processData: false,
          success: (data: Document, textStatus, jqXHR) => {
            const objectKey =
              jqXHR.getResponseHeader("object-key") ??
              this.parseODataEntityKey(data);

            const properties = this.parseODataEntry(data);

            resolve({ objectKey, ...properties });
          },
          error: (error: any) => {
            reject(error);
          },
        });
      };
      reader.onerror = (error: any) => {
        reject(error);
      };
      reader.readAsArrayBuffer(oFile);
    });
  }

  /**
   * Parses an OData Atom <entry> XML document into a plain object,
   * e.g. { BranchId: "1", BranchName: "Chi nhánh Hà Nội", ... }
   */
  protected parseODataEntry(xmlDoc: Document): Record<string, string> {
    const ns = {
      m: `http://schemas.microsoft.com/ado/2007/08/dataservices/metadata`,
      d: `http://schemas.microsoft.com/ado/2007/08/dataservices`,
    };

    const result: Record<string, string> = {};

    const propertiesNode = xmlDoc.getElementsByTagNameNS(ns.m, "properties")[0];
    if (propertiesNode) {
      Array.from(propertiesNode.children).forEach((node) => {
        // node.localName strips the "d:" prefix, e.g. "BranchId"
        result[node.localName] = node.textContent ?? "";
      });
    }

    return result;
  }

  /**
   * Extracts the entity key from the Atom <id> element, e.g. "1" from
   * ".../ProjUploadSet('1')"
   */
  protected parseODataEntityKey(xmlDoc: Document): string | null {
    const idNode = xmlDoc.getElementsByTagName("id")[0];
    if (!idNode?.textContent) return null;

    const match = idNode.textContent.match(/\('([^']+)'\)$/);
    return match ? match[1] : null;
  }

  protected async download(url: string): Promise<Blob> {
    return fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        // add Csrf token or auth header if needed
        // x-csrf-token
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status : ${response.status}`);
        }
        return response.blob();
      })
      .then((blob) => {
        return blob;
      })
      .catch((err) => {
        throw err;
      });
  }
}
