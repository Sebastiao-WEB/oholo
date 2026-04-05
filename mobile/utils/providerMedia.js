import { Directory, File, Paths } from 'expo-file-system';

/**
 * Copia imagem escolhida para armazenamento persistente (foto do documento de identificação).
 * @param {string} sourceUri
 * @param {number} userId
 * @returns {Promise<string>}
 */
export async function copyProviderDocumentPhoto(sourceUri, userId) {
  const dir = new Directory(Paths.document, 'oholo', 'provider', String(userId));
  dir.create({ intermediates: true, idempotent: true });
  const destFile = new File(dir, 'document.jpg');
  if (destFile.exists) {
    destFile.delete();
  }
  const srcFile = new File(sourceUri);
  srcFile.copy(destFile);
  return destFile.uri;
}

/**
 * @param {string} sourceUri
 * @param {number} userId
 * @returns {Promise<string>}
 */
export async function copyProviderLicensePhoto(sourceUri, userId) {
  const dir = new Directory(Paths.document, 'oholo', 'provider', String(userId));
  dir.create({ intermediates: true, idempotent: true });
  const destFile = new File(dir, 'license.jpg');
  if (destFile.exists) {
    destFile.delete();
  }
  const srcFile = new File(sourceUri);
  srcFile.copy(destFile);
  return destFile.uri;
}

/**
 * Foto do veículo (um ficheiro por id de viatura).
 * @param {string} sourceUri
 * @param {number} userId
 * @param {number} vehicleId
 * @returns {Promise<string>}
 */
export async function copyVehiclePhoto(sourceUri, userId, vehicleId) {
  const dir = new Directory(Paths.document, 'oholo', 'provider', String(userId), 'vehicles');
  dir.create({ intermediates: true, idempotent: true });
  const destFile = new File(dir, `${vehicleId}.jpg`);
  if (destFile.exists) {
    destFile.delete();
  }
  const srcFile = new File(sourceUri);
  srcFile.copy(destFile);
  return destFile.uri;
}
