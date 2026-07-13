import BaseController from "./Base.controller";

/**
 * @namespace sphinx.project.controller
 */
export default class NotFound extends BaseController {
  public override onInit(): void {}

  public onPressed() {
    this.getRouter().navTo("RouteMain");
  }

  public override onExit(): void | undefined {
    this.getGlobalModel().setProperty("/MessageTitle", "");
    this.getGlobalModel().setProperty("/MessageDescription", "");
  }
}
