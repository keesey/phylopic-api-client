export const readBlob = async (blob: Blob) => new Promise<string>((resolve, reject) => {
    try {
        const reader = new FileReader();
        reader.onabort = reader.onerror = reject;
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsBinaryString(blob);
    } catch (e) {
        reject(e);
    }
});
export default readBlob;