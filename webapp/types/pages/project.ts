export interface ProjectDocumentItem {
  Url?: string;
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
