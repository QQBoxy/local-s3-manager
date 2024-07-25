/* eslint-disable no-undef */
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import express from 'express';
import serverless from 'serverless-http';
import * as path from 'path';
import Joi from 'joi';
import { RResult } from './common/response.js';

const S3_Bucket = process.env.S3_Bucket;

const app = express();

let s3Options = {};

if (process.env.IS_OFFLINE) {
  s3Options = {
    forcePathStyle: true,
    credentials: {
      accessKeyId: "S3RVER",
      secretAccessKey: "S3RVER",
    },
    endpoint: "http://localhost:4569",
  };
}

const s3Client = new S3Client(s3Options);

app.use(express.json());
app.use(express.static("dist"));

/**
 * @api {post} /api/presigned-upload Create Pre-Signed Upload URL
 * @apiVersion 0.0.1
 * @apiName Pre-Signed Upload
 * @apiGroup Local S3 Manager
 * @apiDescription This API is used to create Pre-Signed Upload URL
 * @apiHeader {String} ContentType=application/json ContentType
 * @apiBody {String} keypath AWS S3 key path
 * @apiError (400) VALIDATION_ERROR Parameter validation error.
 * @apiError (500) SERVER_ERROR Unknown server error.
 * @apiSampleRequest http://localhost:3000/api/presigned-upload
 */
app.post("/api/presigned-upload", async function (req, res) {
  try {
    // Joi schema
    const schema = Joi.object({
      // Example keypath
      // 20221227143202393/FaceScan.xml
      // 20221227143202393/extra/ct/dcm/CT_0001.dcm
      keypath: Joi.string()
        .custom((value, helpers) => {
          let directory = value;
          const rootPath = path.parse(directory).root;
          if (rootPath) directory = directory.slice(rootPath.length);
          const isDirPath = !/[<>:"|?*]/.test(directory);
          if (!isDirPath) {
            return helpers.error('any.invalid');
          }
          return value;
        })
        .required(),
    });
    // Joi validation
    const { error, value } = schema.validate(req.body);
    // Validation error
    if (error) {
      throw {
        statusCode: 400,
        errorCode: 'VALIDATION_ERROR',
        data: error,
      }
    }
    // 建立取得物件指令
    const command = new PutObjectCommand({
      Bucket: S3_Bucket,
      Key: value.keypath,
    });
    // Get sign url
    const signature = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    // Result
    res.json(RResult(200, {
      url: signature
    }));
  } catch (error) {
    console.log(error);
    res.json(RResult(
      error?.statusCode || 500,
      {
        errorCode: error?.errorCode || "SERVER_ERROR",
        error: error?.error,
        data: error?.data,
      }
    ));
  }
});

/**
 * @api {get} /api/files Get File List
 * @apiVersion 0.0.1
 * @apiName Get File List
 * @apiGroup Local S3 Manager
 * @apiDescription This API is used to Get File List
 * @apiHeader {String} ContentType=application/json ContentType
 * @apiQuery {String} prefix AWS S3 prefix
 * @apiError (400) VALIDATION_ERROR Parameter validation error.
 * @apiError (500) SERVER_ERROR Unknown server error.
 * @apiSampleRequest http://localhost:3000/api/files
 */
app.get("/api/files", async function (req, res) {
  try {
    // Joi schema
    const schema = Joi.object({
      prefix: Joi.string()
        .custom((value, helpers) => {
          let directory = value;
          const rootPath = path.parse(directory).root;
          if (rootPath) directory = directory.slice(rootPath.length);
          const isDirPath = !/[<>:"|?*]/.test(directory);
          if (!isDirPath) {
            return helpers.error('any.invalid');
          }
          return value;
        }),
    });
    // Joi validation
    const { error, value } = schema.validate(req.query);
    // Validation error
    if (error) {
      throw {
        statusCode: 400,
        errorCode: 'VALIDATION_ERROR',
        data: error,
      }
    }
    const prefix = value.prefix || "";
    // 取得檔案清單
    const CommonPrefixes = [];
    const Contents = [];
    let truncated = true;
    let continuationToken;
    while (truncated) {
      const response = await s3Client.send(new ListObjectsV2Command({
        Bucket: S3_Bucket,
        ...(prefix ? {
          Prefix: prefix,
        } : {}),
        MaxKeys: 1000,
        ContinuationToken: continuationToken,
        OptionalObjectAttributes: ["Contents"],
      }));
      if (response.Contents && response.Contents.length) {
        for (let { Key } of response.Contents) {
          if (Key.indexOf(prefix, "") === 0) {
            const str = Key.substring(prefix.length);
            const index = str.indexOf("/");
            if (index === -1) {
              Contents.push(str);
            } else {
              const dir = str.substring(0, index + 1);
              if (CommonPrefixes.indexOf(dir) === -1) {
                CommonPrefixes.push(dir);
              }
            }
          }
        }
      }
      continuationToken = response.NextContinuationToken;
      truncated = response.IsTruncated;
    };
    // Result
    res.json(RResult(200, {
      CommonPrefixes,
      Contents,
    }));
  } catch (error) {
    console.log(error);
    res.json(RResult(
      error?.statusCode || 500,
      {
        errorCode: error?.errorCode || "SERVER_ERROR",
        error: error?.error,
        data: error?.data,
      }
    ));
  }
});

/**
 * @api {delete} /api/files Delete Files
 * @apiVersion 0.0.1
 * @apiName Delete Files
 * @apiGroup Local S3 Manager
 * @apiDescription This API is used to Delete File or Directory
 * @apiHeader {String} ContentType=application/json ContentType
 * @apiBody {String} keypath AWS S3 file or directory path
 * @apiError (400) VALIDATION_ERROR Parameter validation error.
 * @apiError (500) SERVER_ERROR Unknown server error.
 * @apiSampleRequest http://localhost:3000/api/files
 */
app.delete("/api/files", async function (req, res) {
  try {
    // Joi schema
    const schema = Joi.object({
      keypath: Joi.string()
        .custom((value, helpers) => {
          let directory = value;
          const rootPath = path.parse(directory).root;
          if (rootPath) directory = directory.slice(rootPath.length);
          const isDirPath = !/[<>:"|?*]/.test(directory);
          if (!isDirPath) {
            return helpers.error('any.invalid');
          }
          return value;
        }).required(),
    });
    // Joi validation
    const { error, value } = schema.validate(req.query);
    // Validation error
    if (error) {
      throw {
        statusCode: 400,
        errorCode: 'VALIDATION_ERROR',
        data: error,
      }
    }
    const isFolder = value.keypath.endsWith("/");
    if (isFolder) {
      // 取得檔案清單
      let truncated = true;
      let continuationToken;
      while (truncated) {
        const response = await s3Client.send(new ListObjectsV2Command({
          Bucket: S3_Bucket,
          Prefix: value.keypath,
          MaxKeys: 100,
          ContinuationToken: continuationToken,
          OptionalObjectAttributes: ["Contents"],
        }));
        if (response.Contents && response.Contents.length) {
          await s3Client.send(new DeleteObjectsCommand({
            Bucket: S3_Bucket,
            Delete: {
              Objects: response.Contents.map(({ Key }) => ({ Key })),
              Quiet: true
            }
          }));
        }
        continuationToken = response.NextContinuationToken;
        truncated = response.IsTruncated;
      }
    } else {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: S3_Bucket,
        Key: value.keypath,
      }));
    }
    res.json(RResult(200, {
      message: "Deleted successfully",
    }));
  } catch (error) {
    console.log(error);
    res.json(RResult(
      error?.statusCode || 500,
      {
        errorCode: error?.errorCode || "SERVER_ERROR",
        error: error?.error,
        data: error?.data,
      }
    ));
  }
});

export const handler = serverless(app);
