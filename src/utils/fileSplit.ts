import * as mm from 'music-metadata';
export const splitFile = async (fileBuffer: Buffer, chunkSize: number) => {
  const chunks: Buffer[] = [];
  const chunkDuration: number[] = [];
  const totalChunks = Math.ceil(fileBuffer.length / chunkSize);

  // Extract the metadata (assuming it's at the beginning of the fileBuffer)
  const metadataSize = 100; // Replace this with the actual size of your metadata
  const metadata = fileBuffer.slice(0, metadataSize);

  // Offset to track the position of metadata while splitting
  let metadataOffset = 0;

  for (let i = 0; i < totalChunks; i++) {
    const start = metadataOffset;
    let end = start + chunkSize;

    // If we're on the last chunk, adjust the end to prevent overflow
    if (end > fileBuffer.length) {
      end = fileBuffer.length;
    }

    const chunkData = fileBuffer.slice(start, end);

    // Create a new Buffer to store the metadata along with the chunk data
    const chunkWithMetadata = Buffer.concat([metadata, chunkData]);
    const durationMetadata = await mm.parseBuffer(chunkData, 'audio/mpeg', {
      duration: true,
    });
    const duration = durationMetadata.format.duration || 0;
    chunks.push(chunkWithMetadata);
    chunkDuration.push(duration);

    // Update metadata offset for the next chunk
    metadataOffset += chunkData.length;
  }

  return {
    chunkDuration: chunkDuration,
    bigFile: fileBuffer,
    chunks: chunks,
  };
};
