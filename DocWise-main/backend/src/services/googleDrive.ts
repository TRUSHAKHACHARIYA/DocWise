import { google, drive_v3 } from 'googleapis';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

function getOAuth2Client() {
  return new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI,
  );
}

export function getGoogleAuthUrl(state: string): string {
  const oauth2 = getOAuth2Client();
  return oauth2.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
    state,
  });
}

export async function exchangeCode(code: string) {
  const oauth2 = getOAuth2Client();
  const { tokens } = await oauth2.getToken(code);
  return {
    accessToken: tokens.access_token!,
    refreshToken: tokens.refresh_token!,
    expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
    scope: tokens.scope || SCOPES.join(' '),
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  expiresAt: Date | null;
}> {
  const oauth2 = getOAuth2Client();
  oauth2.setCredentials({ refresh_token: refreshToken });
  const { token } = await oauth2.getAccessToken();
  // Approximate expiry from refresh (1 hour from now)
  return {
    accessToken: token!,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  };
}

async function getDriveClient(accessToken: string, refreshToken: string): Promise<drive_v3.Drive> {
  const oauth2 = getOAuth2Client();
  oauth2.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  return google.drive({ version: 'v3', auth: oauth2 });
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  modifiedTime: string;
  webViewLink?: string;
}

export async function listDocuments(
  accessToken: string,
  refreshToken: string,
  pageToken?: string,
  pageSize: number = 100,
): Promise<{ files: GoogleDriveFile[]; nextPageToken?: string }> {
  const drive = await getDriveClient(accessToken, refreshToken);

  const res = await drive.files.list({
    q: "mimeType='application/pdf' or mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document' or mimeType='text/plain'",
    fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime, webViewLink)',
    pageSize,
    pageToken,
    orderBy: 'modifiedTime desc',
  });

  return {
    files: (res.data.files || []) as GoogleDriveFile[],
    nextPageToken: res.data.nextPageToken || undefined,
  };
}

export async function downloadFile(
  accessToken: string,
  refreshToken: string,
  fileId: string,
): Promise<Buffer> {
  const drive = await getDriveClient(accessToken, refreshToken);

  const res = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'arraybuffer' },
  );

  return Buffer.from(res.data as ArrayBuffer);
}

export async function getFileMetadata(
  accessToken: string,
  refreshToken: string,
  fileId: string,
): Promise<GoogleDriveFile> {
  const drive = await getDriveClient(accessToken, refreshToken);

  const res = await drive.files.get({
    fileId,
    fields: 'id, name, mimeType, size, modifiedTime, webViewLink',
  });

  return res.data as GoogleDriveFile;
}
