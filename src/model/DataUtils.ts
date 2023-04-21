import { Readable } from "stream";

export const MyAudioContext = new AudioContext();

export function convertBufferToAudio(
    buffer: ArrayBuffer
): Promise<AudioBuffer> {
    return MyAudioContext.decodeAudioData(buffer);
}

export function convertBlobToObjectUrl(imageBlob: Blob): Promise<string> {
    const imageObjectURL = URL.createObjectURL(imageBlob);
    return Promise.resolve(imageObjectURL);
}

export function convertImageUrlToBase64(imageBlob: Blob): Promise<string> {
    return new Promise((onSuccess, onError) => {
        try {
            const reader = new FileReader();
            reader.onload = function () {
                onSuccess(this.result as string);
            };
            reader.readAsDataURL(imageBlob);
        } catch (e) {
            onError(e);
        }
    });
}

export function convertArrayToStream<T>(arr: Array<T>) {
    return Readable.from(arr);
}
