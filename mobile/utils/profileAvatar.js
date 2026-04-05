import { Directory, File, Paths } from 'expo-file-system';

function documentRootUri() {
  return Paths.document.uri;
}

/**
 * Copia a imagem escolhida para armazenamento persistente e devolve o URI (file://).
 */
export async function copyPickedAvatarToPersistent(sourceUri, userId) {
  const avatarsDir = new Directory(Paths.document, 'oholo', 'avatars');
  avatarsDir.create({ intermediates: true, idempotent: true });

  const destFile = new File(avatarsDir, `${userId}.jpg`);
  if (destFile.exists) {
    destFile.delete();
  }

  const srcFile = new File(sourceUri);
  srcFile.copy(destFile);
  return destFile.uri;
}

export async function deleteLocalAvatarFile(uri) {
  if (!uri || typeof uri !== 'string') {
    return;
  }
  const root = documentRootUri();
  if (!root || !uri.startsWith(root)) {
    return;
  }
  try {
    const f = new File(uri);
    if (f.exists) {
      f.delete();
    }
  } catch {
    /* ignore */
  }
}

export async function avatarFileExists(uri) {
  if (!uri || typeof uri !== 'string') {
    return false;
  }
  try {
    return new File(uri).exists;
  } catch {
    return false;
  }
}
