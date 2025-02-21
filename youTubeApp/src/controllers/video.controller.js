import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";

const publishAVideo = asyncHandler(async (req, res) => {
  // title and description from the request body
  // title and description are not empty
  // videoFile and thumbnail uploaded via req.files.
  // both video and thumbnail is need  else error 
  // Uploads the video file and thumbnail to Cloudinary.
  // video and thumbnail were successfully uploaded.
  // Store data new 
  // Checks if the video was successfully else error print
  // Return the uploded video details and api response

  const { title, description } = req.body;

  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const videoFileLocalPath = req.files?.videoFile[0].path;
  const thumbnailLocalPath = req.files?.thumbnail[0].path;

  if (!videoFileLocalPath) {
    throw new ApiError(400, "videoFileLocalPath is required");
  }

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "thumbnailLocalPath is required");
  }

  const videoFile = await uploadOnCloudinary(videoFileLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoFile) {
    throw new ApiError(400, "Video file not found");
  }

  if (!thumbnail) {
    throw new ApiError(400, "Thumbnail not found");
  }

  const video = await Video.create({
    title,
    description,
    duration: videoFile.duration,
    videoFile: {
      url: videoFile.url,
      public_id: videoFile.public_id,
    },
    thumbnail: {
      url: thumbnail.url,
      public_id: thumbnail.public_id,
    },
    owner: req.user?._id,
    isPublished: false,
  });

  const videoUploaded = await Video.findById(video._id);

  if (!videoUploaded) {
    throw new ApiError(500, "videoUpload failed please try again !!!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video uploaded successfully"));
});

const getAllVideos = asyncHandler(async (req, res) => {

const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    console.log(userId);
    const pipeline = [];

    if (query) {
        pipeline.push({
            $search: {
                index: "search-videos",
                text: {
                    query: query,
                    path: ["title", "description"]
                }
            }
        });
    }

    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid userId");
        }

        pipeline.push({
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        });
    }
    pipeline.push({ $match: { isPublished: true } });
    if (sortBy && sortType) {
        pipeline.push({
            $sort: {
                [sortBy]: sortType === "asc" ? 1 : -1
            }
        });
    } else {
        pipeline.push({ $sort: { createdAt: -1 } });
    }

    pipeline.push(
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            "avatar.url": 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$ownerDetails"
        }
    )

    const videoAggregate = Video.aggregate(pipeline);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    const video = await Video.aggregatePaginate(videoAggregate, options);

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Videos fetched successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {});

const updateVideo = asyncHandler(async (req, res) => {});

const deleteVideo = asyncHandler(async (req, res) => {});

const togglePublishStatus = asyncHandler(async (req, res) => {});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
