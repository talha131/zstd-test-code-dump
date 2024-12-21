import { decompress, Decompress } from "fzstd";
import fs from "fs";

function isValidZstdData(data: Uint8Array): boolean {
  if (data.length < 4) {
    console.log("isValidZstdData", data.length, "return false");
    return false;
  }

  // Log the first 4 bytes in hexadecimal
  console.log("First 4 bytes:", 
    "0x" + data[0].toString(16).padStart(2, '0'),
    "0x" + data[1].toString(16).padStart(2, '0'),
    "0x" + data[2].toString(16).padStart(2, '0'),
    "0x" + data[3].toString(16).padStart(2, '0')
  );

  const isLittleEndian = (
    data[0] === 0x28 && data[1] === 0xb5 && data[2] === 0x2f && data[3] === 0xfd
  );
  
  const isBigEndian = (
    data[0] === 0xfd && data[1] === 0x2f && data[2] === 0xb5 && data[3] === 0x28
  );

  return isLittleEndian || isBigEndian;

  /*

  //  ZSTD_MAGIC_NUMBER = 0xFD2FB528;
  const isValid = (
    data[0] === 0xfd && data[1] === 0x2f && data[2] === 0xb5 && data[3] === 0x28
  );
  
  console.log("Expected:", "0xfd", "0x2f", "0xb5", "0x28");
  console.log("IsValid:", isValid);
  
  return isValid;

    */
}

function decompressFileSimple(inputPath: string, outputPath: string) {
  try {
    // Read the compressed file
    const compressedData = fs.readFileSync(inputPath);

    // Convert to Uint8Array if it's not already
    const compressedArray = new Uint8Array(compressedData);

    const isValid = isValidZstdData(compressedArray);
    console.log("File is valid Zstd:", isValid);

    // Decompress the data
    const decompressedData = decompress(compressedArray);

    // Write the decompressed data to a file
    fs.writeFileSync(outputPath, decompressedData);

    console.log("File successfully decompressed!");
    console.log("Original size:", compressedData.length, "bytes");
    console.log("Decompressed size:", decompressedData.length, "bytes");
  } catch (error) {
    console.error("Error decompressing file:", error);
  }
}

function decompressFile(inputPath: string, outputPath: string) {
  try {
    const compressedData = fs.readFileSync(inputPath);
    const compressedArray = new Uint8Array(compressedData);

    const isValid = isValidZstdData(compressedArray);
    console.log("File is valid Zstd:", isValid);

    let totalSize = 0;

    const writeStream = fs.createWriteStream(outputPath);

    const stream = new Decompress((chunk, isLast) => {
      writeStream.write(Buffer.from(chunk));
      totalSize += chunk.length;
      
      if (isLast) {
        writeStream.end();
        console.log("File successfully decompressed!");
        console.log("Original size:", compressedData.length, "bytes");
        console.log("Decompressed size:", totalSize, "bytes");
      }
    });

    const chunkSize = 16 * 1024;
    for (let i = 0; i < compressedArray.length; i += chunkSize) {
      const chunk = compressedArray.slice(i, i + chunkSize);
      const isLastChunk = (i + chunkSize) >= compressedArray.length;
      stream.push(chunk, isLastChunk);
    }

  } catch (error) {
    console.error("Error decompressing file:", error);
  }
}
// Use the function
decompressFile(
  "dist/dance_yorokobi_mai_woman.bmp.zst",
  "dist/dance_yorokobi_mai_woman.bmp"
);

