/* eslint-disable @typescript-eslint/no-var-requires */
// audio-optimizer.service.ts
import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { Readable } from 'stream';
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
import { exec } from 'child_process';
@Injectable()
export class AudioOptimizerService {
  constructor(private configService: ConfigService) {}
  /**
   * The function generates a unique identifier using the crypto module in TypeScript.
   * @returns The function `generateUniqueIdentifier` returns a Promise that resolves to a string.
   */
  async generateUniqueIdentifier(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      crypto.randomBytes(16, (err, buffer) => {
        if (err) {
          reject(err);
        } else {
          resolve(buffer.toString('hex'));
        }
      });
    });
  }

  /**
   * The `optimizeAudio` function takes an audio file buffer, saves it to a temporary location,
   * optimizes it based on the MIME type (MP3 files have their bitrate reduced, WAV files are converted
   * to FLAC), and returns the optimized audio file buffer.
   * @param {Buffer} fileBuffer - The `fileBuffer` parameter is a `Buffer` object that contains the
   * audio data to be optimized.
   * @returns The function `optimizeAudio` returns a Promise that resolves to a Buffer.
   */
  async optimizeAudio(fileBuffer: Buffer): Promise<Buffer> {
    const mimeType = 'audio/mpeg';
    const uniqueIdentifier = await this.generateUniqueIdentifier(); // Function to generate a unique identifier
    const tempDir = path.join(__dirname, 'temp');
    const tempFilePath = path.join(tempDir, `temp_${uniqueIdentifier}.mp3`); // Append unique identifier to temp file
    const optimizedDir = path.join(__dirname, 'optimized');
    const optimizedFilePath = path.join(
      optimizedDir,
      `optimized_${uniqueIdentifier}.mp3`,
    ); // Append unique identifier to optimized file

    try {
      // Create the temporary directory if it doesn't exist
      await fs.promises.mkdir(tempDir, { recursive: true });

      // Create the optimized directory if it doesn't exist
      await fs.promises.mkdir(optimizedDir, { recursive: true });

      // Create a Readable stream from the fileBuffer
      const fileStream = new Readable();
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      fileStream._read = () => {};
      fileStream.push(fileBuffer);
      fileStream.push(null);

      // Save the Readable stream to a temporary location
      const writeStream = fs.createWriteStream(tempFilePath);
      fileStream.pipe(writeStream);

      return new Promise((resolve, reject) => {
        writeStream.on('finish', () => {
          if (mimeType === 'audio/mpeg') {
            // For MP3 files, reduce the bitrate
            this.optimizeMP3(tempFilePath, optimizedFilePath).then(() => {
              fs.promises.readFile(optimizedFilePath).then((optimizedData) => {
                resolve(optimizedData);
              });
            });
          } else if (mimeType === 'audio/wav') {
            // For WAV files, convert to FLAC
            this.convertWAVtoFLAC(tempFilePath, optimizedFilePath).then(() => {
              fs.promises.readFile(optimizedFilePath).then((optimizedData) => {
                resolve(optimizedData);
              });
            });
          } else {
            reject(new Error('Unsupported audio format'));
          }
        });

        // Cleanup: Delete the temporary file in case of an error
        writeStream.on('error', (err) => {
          fs.promises
            .unlink(tempFilePath)
            .then(() => {
              reject(err);
            })
            .catch((unlinkErr) => {
              console.error('Error deleting temporary file:', unlinkErr);
              reject(err);
            });
        });
      });
    } catch (error) {
      console.error('Error optimizing audio:', error);
      throw error;
    }
  }

  private async executeCommand(command: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(stderr || error.message);
        } else {
          resolve();
        }
      });
    });
  }

  async optimizeMP3(
    inputFilePath: string,
    outputFilePath: string,
  ): Promise<void> {
    const optimalBitrate192K = this.configService.get(
      'audioOptimization.optimalBitrate192K',
    );
    const command = `${ffmpegPath} -i "${inputFilePath}" -c:a libmp3lame -b:a ${optimalBitrate192K} -f mp3 "${outputFilePath}"`;

    return this.executeCommand(command);
  }

  async convertWAVtoFLAC(
    inputFilePath: string,
    outputFilePath: string,
  ): Promise<void> {
    const command = `${ffmpegPath} -i "${inputFilePath}" -c:a flac "${outputFilePath}"`;

    return this.executeCommand(command);
  }
}
