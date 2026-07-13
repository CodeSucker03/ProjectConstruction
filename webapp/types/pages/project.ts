export interface ProjectDocumentItem {
  FileId: string;
  Filename: string;
  MimeType: string;
  CreateBy?: string;
  CreateDate?: string;
  CreateTime?: string;
}

export interface ProjectDocumentModel {
  DocumentList: ProjectDocumentItem[];
}
