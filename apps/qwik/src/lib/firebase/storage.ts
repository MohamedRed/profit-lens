import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirebaseApp } from './client';

export const getStorageClient = () => {
  return getStorage(getFirebaseApp());
};

export const uploadFileAndGetUrl = async (path: string, file: Blob, contentType: string) => {
  const objectRef = ref(getStorageClient(), path);
  await uploadBytes(objectRef, file, {
    contentType,
    cacheControl: 'private, max-age=0, no-cache',
  });
  return await getDownloadURL(objectRef);
};
